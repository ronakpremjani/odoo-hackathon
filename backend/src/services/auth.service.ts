import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { AppError } from '../utils/appError';
import { IUser } from '../models/user.model';
import { config } from '../config/env';

export class AuthService {
  private readonly userRepository = new UserRepository();
  private readonly roleRepository = new RoleRepository();

  // Helper: Generate Access and Refresh Tokens
  private generateTokens(user: IUser, roleName: string) {
    const payload = {
      id: user.id || user._id,
      email: user.email,
      role: roleName,
    };

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRATION as any,
    });

    const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRATION as any,
    });

    return { accessToken, refreshToken };
  }

  // Register a new user
  async register(data: { name: string; email: string; password?: string; roleId: string }) {
    // 1. Verify role exists
    const role = await this.roleRepository.findById(data.roleId);
    if (!role) {
      throw AppError.badRequest('The assigned role does not exist');
    }

    // 2. Check if user already exists
    const existingUser = await this.userRepository.findOne({ email: data.email });
    if (existingUser) {
      throw AppError.badRequest('User with this email is already registered');
    }

    // 3. Create user
    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.roleId as any,
      isActive: true,
    });

    // 4. Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(newUser, role.name);

    // Save refresh token to database
    await this.userRepository.update(newUser.id, { refreshToken });

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return {
      user: { ...userResponse, role: { _id: role._id, name: role.name } },
      tokens: { accessToken, refreshToken },
    };
  }

  // Login a user
  async login(email: string, passwordAttempt: string) {
    // 1. Find user and select password
    const user = await this.userRepository.findOne({ email }, '+password +role');
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // 2. Verify password
    const isMatch = await user.comparePassword(passwordAttempt);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact support.');
    }

    // 3. Get Role name
    const role = await this.roleRepository.findById(user.role.toString());
    if (!role) {
      throw AppError.forbidden('User role not found');
    }

    // 4. Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user, role.name);

    // Save refresh token to database
    await this.userRepository.update(user.id, { refreshToken });

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return {
      user: { ...userResponse, role: { _id: role._id, name: role.name } },
      tokens: { accessToken, refreshToken },
    };
  }

  // Refresh token
  async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as any;
      
      const user = await this.userRepository.findOne({ _id: decoded.id }, '+refreshToken');
      if (!user || user.refreshToken !== token) {
        throw AppError.unauthorized('Invalid or revoked refresh token');
      }

      const role = await this.roleRepository.findById(user.role.toString());
      if (!role) {
        throw AppError.unauthorized('Role not found');
      }

      const { accessToken, refreshToken } = this.generateTokens(user, role.name);

      // Rotate refresh token
      await this.userRepository.update(user.id, { refreshToken });

      return { accessToken, refreshToken };
    } catch (err) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }
  }

  // Logout a user
  async logout(userId: string) {
    await this.userRepository.update(userId, { $unset: { refreshToken: 1 } } as any);
  }

  // Forgot password flow
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw AppError.notFound('No user found with that email address');
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save hash and expiration to user model
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    await this.userRepository.update(user.id, {
      passwordResetToken: hashedResetToken,
      passwordResetExpires: resetExpires,
    });

    // In a real application, we would send this link via mailer.
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log(`[PASSWORD RESET DEV ONLY] Reset Link: ${resetLink}`);

    return { resetToken, resetLink };
  }

  // Reset password flow
  async resetPassword(token: string, newPassword: string) {
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      passwordResetToken: hashedResetToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw AppError.badRequest('Reset token is invalid or has expired');
    }

    // Set new password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Save triggers 'pre save' password hashing hook
    await user.save();
  }

  // Get user profile
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    
    const role = await this.roleRepository.findById(user.role.toString());
    
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    
    return {
      ...userResponse,
      role: role ? { _id: role._id, name: role.name } : null,
    };
  }
}
