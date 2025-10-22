// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MasterDataModule } from './master-data/master-data.module';
import { AssetsModule } from './assets/assets.module';
import { AssetLifecycleModule } from './asset-lifecycle/asset-lifecycle.module';
import { getEnvVar, getEnvVarNumber } from './config/config.utils';

@Module({
  imports: [
    // Tambahkan ConfigModule dengan konfigurasi global
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    // Konfigurasi Throttler untuk rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 detik
        limit: 50, // Maksimal 50 permintaan per menit
      },
    ]),

    // Konfigurasi ServeStatic untuk file uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Konfigurasi TypeORM dengan opsi yang lebih aman untuk production
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: getEnvVar('DB_HOST', 'localhost'),
      port: getEnvVarNumber('DB_PORT', 3306),
      username: getEnvVar('DB_USERNAME', 'root'),
      password: getEnvVar('DB_PASSWORD', ''),
      database: getEnvVar('DB_DATABASE', 'db_aset'),
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: process.env.NODE_ENV === 'development', // Hanya synchronize di development
      logging: process.env.NODE_ENV === 'development', // Logging query SQL di development
      autoLoadEntities: true,
    }),

    // Module-module aplikasi
    UsersModule,
    AuthModule,
    RolesModule,
    MasterDataModule,
    AssetsModule,
    AssetLifecycleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}