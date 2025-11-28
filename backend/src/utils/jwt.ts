import jwt from 'jsonwebtoken';
import { UserRole } from '../models';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: TokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(payload, jwtSecret, {
    expiresIn,
  });
};

export const verifyToken = (token: string): TokenPayload => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, jwtSecret) as TokenPayload;
};

