import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '@/utils/logger';

// Default rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.security('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    });
  }
});

// Strict rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    success: false,
    error: 'Too many login attempts, please try again in 15 minutes.'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    logger.security('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      body: { email: req.body.email } // Log email for security monitoring
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many login attempts, please try again in 15 minutes.'
    });
  }
});

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    success: false,
    error: 'Too many file uploads, please try again in a minute.'
  },
  handler: (req: Request, res: Response) => {
    logger.security('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many file uploads, please try again in a minute.'
    });
  }
});

// API key rate limiter (for external API access)
export const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 requests per minute for API users
  keyGenerator: (req: Request) => {
    // Use API key instead of IP for rate limiting
    return req.headers['x-api-key'] as string || req.ip;
  },
  message: {
    success: false,
    error: 'API rate limit exceeded. Please check your usage limits.'
  }
});

// Super admin endpoints - more lenient
export const superAdminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per window for super admin
  message: {
    success: false,
    error: 'Rate limit exceeded for admin operations.'
  }
});

// Agency-specific rate limiter
export const createAgencyRateLimiter = (maxRequests: number = 100) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: maxRequests,
    keyGenerator: (req: Request) => {
      // Rate limit by agency subdomain if available
      const subdomain = req.params.subdomain || req.get('host')?.split('.')[0];
      return subdomain ? `agency_${subdomain}_${req.ip}` : req.ip;
    },
    message: {
      success: false,
      error: 'Agency rate limit exceeded, please try again later.'
    }
  });
};