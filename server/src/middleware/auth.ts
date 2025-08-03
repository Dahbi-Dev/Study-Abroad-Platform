import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, TokenPayload } from '@/utils/jwt';
import { unauthorizedError, forbiddenError } from '@/middleware/errorMiddleware';
import { USER_ROLES, PERMISSIONS } from 'shared';
import { logger } from '@/utils/logger';
import SuperAdmin from '@/models/SuperAdmin';
import Client from '@/models/Client';
import Agency from '@/models/Agency';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      agency?: any;
    }
  }
}

/**
 * Base authentication middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw unauthorizedError('Access token is required');
    }

    const decoded = verifyToken(token);
    
    // Verify user still exists and is active
    let user = null;
    switch (decoded.role) {
      case USER_ROLES.SUPER_ADMIN:
        user = await SuperAdmin.findById(decoded.userId);
        break;
      case USER_ROLES.CLIENT:
        user = await Client.findById(decoded.userId);
        if (user && user.status !== 'active') {
          throw unauthorizedError('Account is suspended or inactive');
        }
        break;
      default:
        // For agency users, we'll handle this in agency-specific middleware
        break;
    }

    if (!user && decoded.role !== USER_ROLES.AGENCY_ADMIN && 
        decoded.role !== USER_ROLES.AGENCY_EDITOR && 
        decoded.role !== USER_ROLES.AGENCY_VIEWER) {
      throw unauthorizedError('User not found or inactive');
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.auth('authenticate', req.body.email || 'unknown', false, (error as Error).message);
    next(error);
  }
};

/**
 * Super Admin only authentication
 */
export const authenticateSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authenticate(req, res, () => {});
    
    if (!req.user || req.user.role !== USER_ROLES.SUPER_ADMIN) {
      throw forbiddenError('Super admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Client authentication
 */
export const authenticateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authenticate(req, res, () => {});
    
    if (!req.user || req.user.role !== USER_ROLES.CLIENT) {
      throw forbiddenError('Client access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Agency authentication (for agency admin panels)
 */
export const authenticateAgency = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authenticate(req, res, () => {});
    
    const allowedRoles = [
      USER_ROLES.AGENCY_ADMIN,
      USER_ROLES.AGENCY_EDITOR,
      USER_ROLES.AGENCY_VIEWER
    ];

    if (!req.user || !allowedRoles.includes(req.user.role as any)) {
      throw forbiddenError('Agency access required');
    }

    // Verify agency exists and is active
    if (req.user.agencyId) {
      const agency = await Agency.findById(req.user.agencyId);
      if (!agency || !agency.isActive()) {
        throw forbiddenError('Agency not found or inactive');
      }
      req.agency = agency;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw unauthorizedError('Authentication required');
      }

      if (!req.user.permissions || !req.user.permissions.includes(permission)) {
        logger.security('Permission denied', {
          userId: req.user.userId,
          requiredPermission: permission,
          userPermissions: req.user.permissions,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        throw forbiddenError(`Permission required: ${permission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Multiple permissions authorization (user must have ALL permissions)
 */
export const requirePermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw unauthorizedError('Authentication required');
      }

      const hasAllPermissions = permissions.every(permission =>
        req.user?.permissions?.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.security('Multiple permissions denied', {
          userId: req.user.userId,
          requiredPermissions: permissions,
          userPermissions: req.user.permissions,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        throw forbiddenError(`Permissions required: ${permissions.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw unauthorizedError('Authentication required');
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.security('Role access denied', {
          userId: req.user.userId,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        throw forbiddenError(`Role required: ${allowedRoles.join(' or ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Agency subdomain validation middleware
 */
export const validateAgencySubdomain = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const subdomain = req.params.subdomain;
    
    if (!subdomain) {
      throw forbiddenError('Agency subdomain is required');
    }

    const agency = await Agency.findBySubdomain(subdomain);
    if (!agency) {
      throw forbiddenError('Agency not found or inactive');
    }

    req.agency = agency;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Resource ownership validation (for clients accessing their own resources)
 */
export const requireResourceOwnership = (resourceParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw unauthorizedError('Authentication required');
      }

      // Super admin can access any resource
      if (req.user.role === USER_ROLES.SUPER_ADMIN) {
        return next();
      }

      // For clients, check if they own the resource
      if (req.user.role === USER_ROLES.CLIENT) {
        const resourceId = req.params[resourceParam];
        
        // If accessing agencies, verify client ownership
        if (req.route.path.includes('agencies')) {
          const agency = await Agency.findById(resourceId);
          if (!agency || agency.clientId.toString() !== req.user.userId) {
            throw forbiddenError('Access denied to this resource');
          }
        }
      }

      // For agency users, check agency ownership
      if (req.user.agencyId) {
        const resourceAgencyId = req.params.agencyId || req.user.agencyId;
        if (resourceAgencyId !== req.user.agencyId) {
          throw forbiddenError('Access denied to this agency resource');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware (sets user if token is provided)
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch (error) {
        // Token is invalid or expired, but we continue without setting user
        logger.debug('Optional authentication failed:', (error as Error).message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};