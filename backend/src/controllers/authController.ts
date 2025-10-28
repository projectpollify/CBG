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
          message: 'Email and password are required'
        };
        return res.status(400).json(error);
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      // Check user exists and password is correct
      if (!user || !await bcrypt.compare(password, user.password)) {
        const error: AuthError = {
          success: false,
          message: 'Invalid email or password'
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

      // Clean up any existing sessions for this user
      try {
        await prisma.session.deleteMany({
          where: { userId: user.id }
        });
      } catch (deleteError) {
        console.log('Session cleanup error (non-fatal):', deleteError);
      }

      // Create new session
      try {
        await prisma.session.create({
          data: {
            token,
            userId: user.id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        });
      } catch (createError) {
        console.log('Session creation error:', createError);
        // Continue anyway - token is still valid
      }

      // Update last login (optional tracking)
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Return success response (exclude password)
      const userResponse = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
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
   * Logout user (cleanup session)
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response) {
    try {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Delete the session from database
        await prisma.session.deleteMany({
          where: { token }
        });
      }
      
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
      // User info attached by auth middleware
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
          firstName: true,
          lastName: true,
          role: true,
          regionId: true,
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
        user: {
          ...user,
          name: `${user.firstName} ${user.lastName}`
        }
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
