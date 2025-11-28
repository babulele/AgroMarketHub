import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, UserRole, VerificationStatus } from '../models';
import { generateToken, TokenPayload } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role, ...additionalFields } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone || !role) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user based on role
    const userData: any = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role,
    };

    // Add role-specific fields
    if (role === UserRole.FARMER) {
      userData.farmLocation = additionalFields.farmLocation;
      userData.verificationStatus = VerificationStatus.PENDING;
    } else if (role === UserRole.RIDER) {
      userData.vehicleType = additionalFields.vehicleType;
      userData.licenseNumber = additionalFields.licenseNumber;
      userData.isAvailable = true;
    } else if (role === UserRole.NGO || role === UserRole.COUNTY_OFFICER) {
      userData.organizationName = additionalFields.organizationName;
      userData.organizationType = additionalFields.organizationType;
    }

    const user = await User.create(userData);

    // Generate token
    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password').exec();
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate token
    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    const token = generateToken(tokenPayload);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          farmLocation: user.farmLocation,
          verificationStatus: user.verificationStatus,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get me error:', error);
    next(error);
  }
};

