import jwt from 'jsonwebtoken';
import { JWTPayload } from 'shared';
import { logger } from '@/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export interface TokenPayload extends JWTPayload {
  iat?: number;
  exp?: number;
  type?: 'access' | 'refresh';
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JWTPayload): string => {
  try {
    const token = jwt.sign(
      { ...payload, type: 'access' },
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'study-abroad-saas',
        audience: 'saas-users'
      }
    );
    return token;
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<JWTPayload, 'permissions'>): string => {
  try {
    const token = jwt.sign(
      { 
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        type: 'refresh'
      },
      JWT_SECRET,
      { 
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'study-abroad-saas',
        audience: 'saas-users'
      }
    );
    return token;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload: JWTPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    agencyId: payload.agencyId
  });

  return { accessToken, refreshToken };
};

/**
 * Verify and decode token
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'study-abroad-saas',
      audience: 'saas-users'
    }) as TokenPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Token expired:', { token: token.substring(0, 20) + '...' });
      throw new Error('Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid token:', { token: token.substring(0, 20) + '...' });
      throw new Error('Invalid token');
    } else {
      logger.error('Token verification error:', error);
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode token without verification (for getting payload from expired tokens)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('Token decode error:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Create token for password reset (short-lived)
 */
export const generatePasswordResetToken = (userId: string, email: string): string => {
  try {
    const token = jwt.sign(
      { 
        userId,
        email,
        type: 'password_reset'
      },
      JWT_SECRET,
      { 
        expiresIn: '1h', // 1 hour for password reset
        issuer: 'study-abroad-saas',
        audience: 'password-reset'
      }
    );
    return token;
  } catch (error) {
    logger.error('Error generating password reset token:', error);
    throw new Error('Failed to generate password reset token');
  }
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string): { userId: string; email: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'study-abroad-saas',
      audience: 'password-reset'
    }) as any;
    
    if (decoded.type !== 'password_reset') {
      throw new Error('Invalid token type');
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Password reset token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid password reset token');
    } else {
      logger.error('Password reset token verification error:', error);
      throw new Error('Password reset token verification failed');
    }
  }
};