import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginRequest, LoginResponse, AuthError, JWTPayload } from '../../../shared/src';

const prisma = new PrismaClient();

export class AuthController {
  
  /**
   * Login user with email and password
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginRequest = req.body;

      // Basic validation
      if (!email || !password) {
        const error: AuthError = {
          success: false,
          message: 'Email and password are required',
          field: !email ? 'email' : 'password'
        };
        return res.status(400).json(error);
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        const error: AuthError = {
          success: false,
          message: 'Invalid email or password',
          field: 'email'
        };
        return res.status(401).json(error);
      }

      // Check if user is active
      if (!user.isActive) {
        const error: AuthError = {
          success: false,
          message: 'Account is disabled. Contact administrator.',
        };
        return res.status(401).json(error);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        const error: AuthError = {
          success: false,
          message: 'Invalid email or password',
          field: 'password'
        };
        return res.status(401).json(error);
      }

      // Generate JWT token
      const jwtPayload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET || 'cutting-board-guys-secret-2024',
        { expiresIn: '7d' }
      );

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Create session record
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Return success response (don't include password)
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      const response: LoginResponse = {
        success: true,
        user: userResponse,
        token,
        message: 'Login successful'
      };

      // Set JWT as httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json(response);

    } catch (error) {
      console.error('Login error:', error);
      const errorResponse: AuthError = {
        success: false,
        message: 'An error occurred during login'
      };
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Logout user and invalidate session
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response) {
    try {
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        // Remove session from database
        await prisma.session.deleteMany({
          where: { token }
        });
      }

      // Clear cookie
      res.clearCookie('token');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred during logout'
      });
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  static async me(req: Request, res: Response) {
    try {
      // User info should be attached by auth middleware
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          region: true,
          createdAt: true,
          updatedAt: true,
          lastLogin: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred'
      });
    }
  }
}
