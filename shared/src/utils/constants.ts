// API Routes
export const API_ROUTES = {
  // Super Admin Routes
  SUPER_ADMIN: {
    AUTH: {
      LOGIN: '/api/superadmin/auth/login',
      LOGOUT: '/api/superadmin/auth/logout',
      REFRESH: '/api/superadmin/auth/refresh',
      ME: '/api/superadmin/auth/me'
    },
    CLIENTS: {
      LIST: '/api/superadmin/clients',
      CREATE: '/api/superadmin/clients',
      UPDATE: (id: string) => `/api/superadmin/clients/${id}`,
      DELETE: (id: string) => `/api/superadmin/clients/${id}`,
      GET: (id: string) => `/api/superadmin/clients/${id}`
    },
    AGENCIES: {
      LIST: '/api/superadmin/agencies',
      CREATE: '/api/superadmin/agencies',
      UPDATE: (id: string) => `/api/superadmin/agencies/${id}`,
      DELETE: (id: string) => `/api/superadmin/agencies/${id}`,
      GET: (id: string) => `/api/superadmin/agencies/${id}`
    },
    SYSTEM: {
      RESOURCES: '/api/superadmin/system/resources',
      ANALYTICS: '/api/superadmin/system/analytics',
      HEALTH: '/api/superadmin/system/health'
    }
  },

  // Client Routes
  CLIENT: {
    AUTH: {
      LOGIN: '/api/client/auth/login',
      LOGOUT: '/api/client/auth/logout',
      REFRESH: '/api/client/auth/refresh',
      REGISTER: '/api/client/auth/register',
      ME: '/api/client/auth/me'
    },
    AGENCIES: {
      LIST: '/api/client/agencies',
      CREATE: '/api/client/agencies',
      UPDATE: (id: string) => `/api/client/agencies/${id}`,
      UPDATE_BRANDING: (id: string) => `/api/client/agencies/${id}/branding`,
      UPDATE_SETTINGS: (id: string) => `/api/client/agencies/${id}/settings`,
      GET: (id: string) => `/api/client/agencies/${id}`
    }
  },

  // Agency Public Routes
  AGENCY_PUBLIC: {
    PAGES: (subdomain: string, slug: string) => `/api/${subdomain}/pages/${slug}`,
    POSTS: (subdomain: string) => `/api/${subdomain}/posts`,
    COUNTRIES: (subdomain: string) => `/api/${subdomain}/countries`,
    TESTIMONIALS: (subdomain: string) => `/api/${subdomain}/testimonials`,
    FORM_SUBMIT: (subdomain: string, formId: string) => `/api/${subdomain}/forms/${formId}/submit`,
    CONTACT: (subdomain: string) => `/api/${subdomain}/contact`
  },

  // Agency Admin Routes
  AGENCY_ADMIN: {
    AUTH: {
      LOGIN: (subdomain: string) => `/api/${subdomain}/admin/auth/login`,
      LOGOUT: (subdomain: string) => `/api/${subdomain}/admin/auth/logout`,
      ME: (subdomain: string) => `/api/${subdomain}/admin/auth/me`
    },
    PAGES: {
      LIST: (subdomain: string) => `/api/${subdomain}/admin/pages`,
      CREATE: (subdomain: string) => `/api/${subdomain}/admin/pages`,
      UPDATE: (subdomain: string, id: string) => `/api/${subdomain}/admin/pages/${id}`,
      DELETE: (subdomain: string, id: string) => `/api/${subdomain}/admin/pages/${id}`,
      GET: (subdomain: string, id: string) => `/api/${subdomain}/admin/pages/${id}`
    },
    STUDENTS: {
      LIST: (subdomain: string) => `/api/${subdomain}/admin/students`,
      CREATE: (subdomain: string) => `/api/${subdomain}/admin/students`,
      UPDATE: (subdomain: string, id: string) => `/api/${subdomain}/admin/students/${id}`,
      DELETE: (subdomain: string, id: string) => `/api/${subdomain}/admin/students/${id}`,
      GET: (subdomain: string, id: string) => `/api/${subdomain}/admin/students/${id}`,
      UPDATE_STATUS: (subdomain: string, id: string) => `/api/${subdomain}/admin/students/${id}/status`
    },
    FORMS: {
      LIST: (subdomain: string) => `/api/${subdomain}/admin/forms`,
      CREATE: (subdomain: string) => `/api/${subdomain}/admin/forms`,
      UPDATE: (subdomain: string, id: string) => `/api/${subdomain}/admin/forms/${id}`,
      DELETE: (subdomain: string, id: string) => `/api/${subdomain}/admin/forms/${id}`,
      GET: (subdomain: string, id: string) => `/api/${subdomain}/admin/forms/${id}`,
      SUBMISSIONS: (subdomain: string, id: string) => `/api/${subdomain}/admin/forms/${id}/submissions`
    },
    MEDIA: {
      LIST: (subdomain: string) => `/api/${subdomain}/admin/media`,
      UPLOAD: (subdomain: string) => `/api/${subdomain}/admin/media/upload`,
      DELETE: (subdomain: string, id: string) => `/api/${subdomain}/admin/media/${id}`
    },
    BLOG: {
      LIST: (subdomain: string) => `/api/${subdomain}/admin/blog`,
      CREATE: (subdomain: string) => `/api/${subdomain}/admin/blog`,
      UPDATE: (subdomain: string, id: string) => `/api/${subdomain}/admin/blog/${id}`,
      DELETE: (subdomain: string, id: string) => `/api/${subdomain}/admin/blog/${id}`,
      GET: (subdomain: string, id: string) => `/api/${subdomain}/admin/blog/${id}`
    }
  }
} as const;

// Default Resource Limits
export const DEFAULT_RESOURCE_LIMITS = {
  STORAGE: 1000, // 1GB in MB
  BANDWIDTH: 10000, // 10GB in MB
  AGENCIES: 5
} as const;

// Default Agency Branding
export const DEFAULT_BRANDING = {
  PRIMARY_COLOR: '#3B82F6',
  SECONDARY_COLOR: '#1E40AF',
  ACCENT_COLOR: '#F59E0B',
  FONTS: {
    PRIMARY: 'Inter',
    SECONDARY: 'Roboto'
  }
} as const;

// Content Block Types
export const CONTENT_BLOCK_TYPES = {
  HERO: 'hero',
  TEXT: 'text',
  IMAGE: 'image',
  GALLERY: 'gallery',
  VIDEO: 'video',
  TESTIMONIAL: 'testimonial',
  CTA: 'cta',
  FORM: 'form',
  COUNTRY_GRID: 'country_grid',
  SERVICE_CARDS: 'service_cards'
} as const;

// File Upload Limits
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// Cache Keys
export const CACHE_KEYS = {
  AGENCY_BRANDING: (subdomain: string) => `agency:branding:${subdomain}`,
  AGENCY_PAGES: (subdomain: string) => `agency:pages:${subdomain}`,
  SYSTEM_METRICS: 'system:metrics',
  USER_PERMISSIONS: (userId: string) => `user:permissions:${userId}`
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  // Client Events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',

  // Notification Events
  NEW_LEAD: 'new_lead',
  STATUS_UPDATE: 'status_update',
  FORM_SUBMISSION: 'form_submission',
  SYSTEM_ALERT: 'system_alert',
  
  // Real-time Updates
  ANALYTICS_UPDATE: 'analytics_update',
  RESOURCE_UPDATE: 'resource_update'
} as const;

// Countries and Study Destinations
export const STUDY_DESTINATIONS = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' }
] as const;

// Study Programs
export const STUDY_PROGRAMS = [
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Medicine',
  'Law',
  'Psychology',
  'Economics',
  'International Relations',
  'Environmental Science',
  'Data Science',
  'Artificial Intelligence',
  'Digital Marketing',
  'Graphic Design',
  'Architecture',
  'Nursing',
  'Pharmacy',
  'Dentistry',
  'Education',
  'Social Work',
  'Hospitality Management'
] as const;

// Education Levels
export const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate (PhD)',
  'Professional Degree'
] as const;

// Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'DKK', name: 'Danish Krone' }
] as const;

// Time Zones
export const TIME_ZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  DUPLICATE_EMAIL: 'Email already exists',
  DUPLICATE_SUBDOMAIN: 'Subdomain already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  SERVER_ERROR: 'Internal server error',
  RESOURCE_LIMIT_EXCEEDED: 'Resource limit exceeded',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_SENT: 'Email sent successfully',
  FILE_UPLOADED: 'File uploaded successfully'
} as const;