// backend\src\auth\auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/user.entity'; // Import User entity if needed for types

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Validates a user based on username and password.
   * @param username The username to validate.
   * @param pass The password to compare.
   * @returns The user object without password if validation is successful, otherwise null.
   */
  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    console.log(`🔐 LocalStrategy validating: ${username}`);
    const user = await this.usersService.findOneByUsername(username); // Expects function to return user WITH password
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      console.log(`✅ User ${username} validated successfully.`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    console.log(`❌ User ${username} validation failed.`);
    return null;
  }

  /**
   * Logs in a user and returns a JWT access token along with user details.
   * @param user The user object (typically from validateUser).
   * @returns An object containing the access token and user details.
   */
  async login(user: Omit<User, 'password'>) {
    // Make sure all needed properties exist on the user object passed in
    if (!user || !user.id_user || !user.username || !user.email || !user.role) {
      console.error('❌ Invalid user object passed to login:', user);
      throw new Error('Invalid user data provided for login.');
    }
    console.log(
      `🚀 Login requested for user: ${user.username} (ID: ${user.id_user})`,
    );
    const payload = {
      username: user.username,
      sub: user.id_user, // 'sub' (subject) is standard JWT claim for user ID
      email: user.email,
      role: user.role,
      id_user: user.id_user, // Can include id_user again if needed elsewhere
    };
    console.log('🎫 Generating JWT payload:', payload);

    const token = this.jwtService.sign(payload, { expiresIn: '30m' }); // Set token duration

    // Return comprehensive user data without password
    const userForResponse = {
      id_user: user.id_user,
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
      status: user.status,
      nomor_telepon: user.nomor_telepon,
      role: user.role,
      foto_profil: user.foto_profil,
      // sessionInfo might be added by the controller if needed
    };

    console.log(`✅ Login successful for ${user.username}. Token generated.`);
    return {
      access_token: token,
      user: userForResponse,
    };
  }

  /**
   * Updates the profile data for the currently logged-in user.
   * @param userId The ID of the user to update.
   * @param updateProfileDto Data transfer object containing the fields to update.
   * @returns The updated user object (without password).
   */
  async updateProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Omit<User, 'password'>> {
    console.log(`🔄 Service: updateProfile called for userId: ${userId}`);
    // Log the received DTO safely (avoids logging sensitive data if any)
    console.log(
      '📄 DTO received:',
      JSON.stringify({ ...updateProfileDto, password: '***' }, null, 2),
    );

    // 1. Get current user data (make sure findOneById does NOT exclude password if needed later, but it seems okay here)
    const currentUser = await this.usersService.findOneById(userId); // Expects this to return user WITHOUT password
    if (!currentUser) {
      console.error(
        `❌ User with ID ${userId} not found during profile update.`,
      );
      throw new NotFoundException(`User dengan ID ${userId} tidak ditemukan`);
    }
    // Log only relevant info
    console.log('👤 Current user data fetched:', {
      id: currentUser.id_user,
      email: currentUser.email,
    });

    // 👇 ADDED LOGGING FOR EMAIL COMPARISON 👇
    console.log(
      `✉️ Comparing DTO email: "${updateProfileDto.email}" with Current email: "${currentUser.email}"`,
    );

    // 2. Check if email is being changed AND if the new email is already used by ANOTHER user
    if (
      updateProfileDto.email && // Check if email is provided in DTO
      updateProfileDto.email !== currentUser.email // Check if the email is DIFFERENT from the current one
    ) {
      console.log(
        `🚦 Email comparison result: DIFFERENT. Checking database for conflicts...`,
      );
      const existingEmailUser = await this.usersService.findOneByEmail(
        // Expects this to return user WITHOUT password
        updateProfileDto.email,
      );

      // Only throw error if the email exists AND belongs to a DIFFERENT user ID
      if (existingEmailUser && existingEmailUser.id_user !== userId) {
        console.error(
          `❌ Conflict! Email "${updateProfileDto.email}" already exists for user ID ${existingEmailUser.id_user}. Denying update.`,
        );
        throw new BadRequestException(
          'Email sudah digunakan oleh pengguna lain.', // Error originates here
        );
      }
      console.log(
        `✅ Email "${updateProfileDto.email}" is available or belongs to the current user.`,
      );
    } else {
      console.log(
        `🚦 Email comparison result: SAME or DTO email is missing/empty. Skipping database conflict check for email.`,
      );
    }

    // 3. Perform the update using the UserService
    //    usersService.update should handle partial updates correctly
    console.log(
      `💾 Calling usersService.update for userId: ${userId} with DTO...`,
    );
    // Ensure `usersService.update` returns the updated user WITHOUT the password
    const updatedUserResult = await this.usersService.update(
      userId,
      updateProfileDto, // Send the DTO as received (may contain photo path etc.)
    );
    console.log('✅ usersService.update finished successfully.');

    // 4. Return the updated user data (already without password from usersService.update)
    console.log('📤 Returning updated user data from service.');
    return updatedUserResult; // Directly return the result which should be Omit<User, 'password'>
  }

  /**
   * Changes the password for the currently logged-in user.
   * @param userId The ID of the user changing the password.
   * @param changePasswordDto DTO containing the old and new passwords.
   * @returns A success message.
   */
  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    console.log(`🔑 Service: changePassword called for userId: ${userId}`);
    const { password_lama, password_baru } = changePasswordDto;

    // Fetch user INCLUDING password for comparison
    const user = await this.usersService.findOneByIdWithPassword(userId);
    if (!user || !user.password) {
      // Also check if password field exists
      console.error(
        `❌ User with ID ${userId} not found or password missing during password change.`,
      );
      throw new NotFoundException(
        'User tidak ditemukan atau data tidak lengkap',
      );
    }

    // 1. Verify old password
    const isPasswordMatching = await bcrypt.compare(
      password_lama,
      user.password,
    );
    if (!isPasswordMatching) {
      console.warn(`❌ Incorrect old password attempt for user ID ${userId}.`);
      throw new BadRequestException('Password lama salah.');
    }
    console.log(`✅ Old password verified for user ID ${userId}.`);

    // 2. Hash the new password
    console.log(` Hashing new password for user ID ${userId}...`);
    const hashedPassword = await this.usersService.hashPassword(password_baru); // Use helper from UserService

    // 3. Update the password in the database via UserService
    console.log(
      `💾 Calling usersService.update to save new password hash for user ID ${userId}...`,
    );
    await this.usersService.update(userId, { password: hashedPassword });
    console.log(`✅ Password successfully changed for user ID ${userId}.`);

    return { message: 'Password berhasil diubah.' };
  }
}
