// src/common/guards/sliding-throttler.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

interface UserActivity {
  lastActivity: number;
  token: string;
  username: string;
}

interface UserSessionInfo {
  sessionExpiresAt: Date;
  timeRemaining: number;
  isNearTimeout: boolean;
}

@Injectable()
export class SlidingThrottlerGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(SlidingThrottlerGuard.name);

  // Cache untuk menyimpan aktivitas pengguna - ubah untuk mendukung multiple session
  private userActivityCache = new Map<number, UserActivity[]>();

  // Konfigurasi waktu
  private readonly INACTIVITY_TIMEOUT = 35 * 60 * 1000; //
  private readonly WARNING_THRESHOLD = 2 * 60 * 1000; // 2 menit sebelum timeout
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 menit
  private readonly MAX_SESSIONS_PER_USER = 3; // Maksimal 3 session per user

  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {
    // Setup interval untuk cleanup cache
    this.cleanupInterval = setInterval(
      () => this.cleanupCache(),
      this.CLEANUP_INTERVAL,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    // Skip guard untuk endpoint public (login, dll)
    if (this.isPublicEndpoint(context)) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      // Verifikasi token
      const payload = await this.jwtService.verifyAsync(token);

      // Logging untuk debugging
      this.logger.debug('JWT Payload:', payload);

      // Ambil ID user dari payload dengan fallback
      const userId = payload.sub || payload.id_user;

      if (!userId) {
        this.logger.error('Token payload does not contain user ID:', payload);
        throw new UnauthorizedException('Token tidak memiliki ID pengguna');
      }

      // Verifikasi user masih ada di database
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        this.userActivityCache.delete(userId);
        throw new UnauthorizedException('User tidak ditemukan');
      }

      // Ambil semua session pengguna atau buat array baru
      let userSessions = this.userActivityCache.get(userId) || [];

      // Filter session yang masih aktif
      const now = Date.now();
      userSessions = userSessions.filter(
        (session) => now - session.lastActivity <= this.INACTIVITY_TIMEOUT,
      );

      // Cek apakah token sudah ada di session
      const existingSessionIndex = userSessions.findIndex(
        (session) => session.token === token,
      );

      let currentSession: UserActivity;

      if (existingSessionIndex === -1) {
        // Token baru, tambahkan ke session
        if (userSessions.length >= this.MAX_SESSIONS_PER_USER) {
          // Hapus session yang paling lama
          userSessions.shift();
          this.logger.warn(
            `Max sessions reached for user ${userId} (${user.username}), removing oldest session`,
          );
        }

        currentSession = {
          lastActivity: now,
          token,
          username: user.username,
        };

        userSessions.push(currentSession);

        this.logger.log(
          `New session created for user ${userId} (${user.username}). Total sessions: ${userSessions.length}`,
        );
      } else {
        // Update existing session
        currentSession = userSessions[existingSessionIndex];
        currentSession.lastActivity = now;
      }

      // Simpan kembali session yang sudah diupdate
      this.userActivityCache.set(userId, userSessions);

      // Hitung waktu sejak aktivitas terakhir
      const timeSinceLastActivity = now - currentSession.lastActivity;

      // Cek apakah pengguna sudah tidak aktif
      if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
        // Pengguna tidak aktif, hapus dari cache dan tolak akses
        this.userActivityCache.delete(userId);
        this.logger.log(
          `Session expired due to inactivity for user ${userId} (${user.username})`,
        );
        throw new UnauthorizedException(
          'Sesi berakhir karena tidak ada aktivitas',
        );
      }

      // Tambahkan info waktu tersisa ke request
      this.addSessionInfoToRequest(request, payload, timeSinceLastActivity);

      return true;
    } catch (error) {
      // Hapus dari cache jika token tidak valid
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError'
      ) {
        try {
          const payload = this.jwtService.decode(token) as any;
          const userId = payload.sub || payload.id_user;
          if (userId) {
            this.userActivityCache.delete(userId);
          }
        } catch (decodeError) {
          this.logger.error('Error decoding token during cleanup', decodeError);
        }
      }

      this.logger.error('Authentication error', error);
      throw new UnauthorizedException('Sesi tidak valid atau telah berakhir');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  private isPublicEndpoint(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.route?.path || request.url;

    const publicPaths = ['/auth/login', '/auth/register', '/health'];
    return publicPaths.some((publicPath) => path.includes(publicPath));
  }

  private addSessionInfoToRequest(
    request: Request,
    payload: any,
    timeSinceLastActivity: number,
  ): void {
    const now = Date.now();
    const timeRemaining = Math.max(
      0,
      this.INACTIVITY_TIMEOUT - timeSinceLastActivity,
    );

    const sessionInfo: UserSessionInfo = {
      sessionExpiresAt: new Date(now + timeRemaining),
      timeRemaining,
      isNearTimeout: timeRemaining <= this.WARNING_THRESHOLD,
    };

    // Tambahkan session info ke user object
    request.user = payload;

    (request as any).sessionInfo = sessionInfo;
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, sessions] of this.userActivityCache.entries()) {
      // Filter session yang masih aktif
      const activeSessions = sessions.filter(
        (session) => now - session.lastActivity <= this.INACTIVITY_TIMEOUT,
      );

      if (activeSessions.length !== sessions.length) {
        this.userActivityCache.set(userId, activeSessions);
        cleanedCount += sessions.length - activeSessions.length;
      }

      // Hapus user jika tidak ada session aktif
      if (activeSessions.length === 0) {
        this.userActivityCache.delete(userId);
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // Method untuk force logout
  forceLogout(userId: number): boolean {
    const existed = this.userActivityCache.has(userId);
    this.userActivityCache.delete(userId);

    if (existed) {
      this.logger.log(`User ${userId} forcefully logged out`);
    }

    return existed;
  }

  // Method untuk menghapus semua session kecuali yang saat ini
  async clearUserSessions(
    userId: number,
    currentToken?: string,
  ): Promise<boolean> {
    const sessions = this.userActivityCache.get(userId);
    if (!sessions || sessions.length === 0) {
      return false;
    }

    if (currentToken) {
      // Filter session, hapus semua kecuali yang saat ini
      const updatedSessions = sessions.filter(
        (session) => session.token === currentToken,
      );
      this.userActivityCache.set(userId, updatedSessions);

      this.logger.log(
        `Cleared all sessions for user ${userId} except current. Sessions before: ${sessions.length}, after: ${updatedSessions.length}`,
      );
    } else {
      // Hapus semua session
      this.userActivityCache.delete(userId);
      this.logger.log(`Cleared all sessions for user ${userId}`);
    }

    return true;
  }

  // Method untuk mendapatkan status aktivitas pengguna
  getUserActivityStatus(userId: number): {
    isActive: boolean;
    timeRemaining: number;
    lastActivity: Date;
    username: string;
    sessionCount: number;
  } | null {
    const sessions = this.userActivityCache.get(userId);
    if (!sessions || sessions.length === 0) return null;

    // Ambil session yang paling baru
    const latestSession = sessions.reduce((latest, session) =>
      session.lastActivity > latest.lastActivity ? session : latest,
    );

    const now = Date.now();
    const timeSinceLastActivity = now - latestSession.lastActivity;
    const timeRemaining = Math.max(
      0,
      this.INACTIVITY_TIMEOUT - timeSinceLastActivity,
    );

    return {
      isActive: timeSinceLastActivity <= this.INACTIVITY_TIMEOUT,
      timeRemaining,
      lastActivity: new Date(latestSession.lastActivity),
      username: latestSession.username,
      sessionCount: sessions.length,
    };
  }

  // Method untuk mendapatkan statistik cache
  getCacheStats(): { totalUsers: number; activeSessions: number } {
    const now = Date.now();
    let activeSessions = 0;

    for (const sessions of this.userActivityCache.values()) {
      activeSessions += sessions.filter(
        (session) => now - session.lastActivity <= this.INACTIVITY_TIMEOUT,
      ).length;
    }

    return {
      totalUsers: this.userActivityCache.size,
      activeSessions,
    };
  }

  // Method untuk mendapatkan semua session aktif
  getActiveSessions(): Array<{
    userId: number;
    username: string;
    lastActivity: Date;
    timeRemaining: number;
    sessionCount: number;
  }> {
    const now = Date.now();
    const activeSessions: Array<{
      userId: number;
      username: string;
      lastActivity: Date;
      timeRemaining: number;
      sessionCount: number;
    }> = [];

    for (const [userId, sessions] of this.userActivityCache.entries()) {
      // Filter session yang masih aktif
      const activeUserSessions = sessions.filter(
        (session) => now - session.lastActivity <= this.INACTIVITY_TIMEOUT,
      );

      if (activeUserSessions.length > 0) {
        // Ambil session yang paling baru
        const latestSession = activeUserSessions.reduce((latest, session) =>
          session.lastActivity > latest.lastActivity ? session : latest,
        );

        activeSessions.push({
          userId,
          username: latestSession.username,
          lastActivity: new Date(latestSession.lastActivity),
          timeRemaining: Math.max(
            0,
            this.INACTIVITY_TIMEOUT - (now - latestSession.lastActivity),
          ),
          sessionCount: activeUserSessions.length,
        });
      }
    }

    return activeSessions;
  }

  // Method untuk mendapatkan informasi session user untuk frontend
  getUserSessionInfo(userId: number): {
    sessionExpiresAt: Date;
    timeRemaining: number;
    isNearTimeout: boolean;
    sessionCount: number;
  } | null {
    const sessions = this.userActivityCache.get(userId);
    if (!sessions || sessions.length === 0) return null;

    // Ambil session yang paling baru
    const latestSession = sessions.reduce((latest, session) =>
      session.lastActivity > latest.lastActivity ? session : latest,
    );

    const now = Date.now();
    const timeSinceLastActivity = now - latestSession.lastActivity;
    const timeRemaining = Math.max(
      0,
      this.INACTIVITY_TIMEOUT - timeSinceLastActivity,
    );

    return {
      sessionExpiresAt: new Date(now + timeRemaining),
      timeRemaining,
      isNearTimeout: timeRemaining <= this.WARNING_THRESHOLD,
      sessionCount: sessions.length,
    };
  }

  // Cleanup pada destroy
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
