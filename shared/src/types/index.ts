// User and Authentication Types
export interface SuperAdmin {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  status: 'active' | 'suspended' | 'inactive';
  resourceLimits: {
    storage: number; // in MB
    bandwidth: number; // in MB
    agencies: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Agency {
  _id: string;
  clientId: string;
  name: string;
  subdomain: string;
  status: 'active' | 'inactive' | 'suspended';
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
    favicon?: string;
    fonts: {
      primary: string;
      secondary: string;
    };
  };
  settings: {
    theme: 'modern' | 'classic' | 'minimal';
    layout: 'sidebar' | 'topbar' | 'hybrid';
    features: string[];
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    };
  };
  metrics: {
    storageUsed: number;
    bandwidthUsed: number;
    lastActive: Date;
    totalVisitors: number;
    totalLeads: number;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AgencyUser {
  _id: string;
  agencyId: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Student/Lead Management Types
export interface Student {
  _id: string;
  agencyId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    nationality: string;
    currentCountry: string;
    currentCity?: string;
    passportNumber?: string;
  };
  academic: {
    highestEducation: string;
    institution?: string;
    gpa?: number;
    graduationYear?: number;
    fieldOfStudy?: string;
  };
  interests: {
    countries: string[];
    programs: string[];
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    preferredStartDate?: Date;
    studyLevel: 'undergraduate' | 'graduate' | 'phd' | 'certificate';
  };
  status: 'inquiry' | 'consultation' | 'application' | 'accepted' | 'enrolled' | 'rejected' | 'cancelled';
  timeline: Array<{
    status: string;
    date: Date;
    notes?: string;
    updatedBy: string;
  }>;
  documents: Array<{
    name: string;
    url: string;
    type: 'transcript' | 'passport' | 'recommendation' | 'essay' | 'other';
    uploadedAt: Date;
    uploadedBy: string;
  }>;
  assignedTo?: string; // User ID
  tags: string[];
  notes: Array<{
    content: string;
    createdBy: string;
    createdAt: Date;
  }>;
  source: 'website' | 'referral' | 'social_media' | 'advertisement' | 'other';
  createdAt: Date;
  updatedAt: Date;
}

// Content Management Types
export interface Page {
  _id: string;
  agencyId: string;
  slug: string;
  title: string;
  content: {
    type: 'blocks';
    blocks: ContentBlock[];
  };
  seoData: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  isPublished: boolean;
  publishedAt?: Date;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentBlock {
  id: string;
  type: 'hero' | 'text' | 'image' | 'gallery' | 'video' | 'testimonial' | 'cta' | 'form' | 'country_grid' | 'service_cards';
  data: Record<string, any>;
  style?: Record<string, any>;
  order: number;
}

export interface BlogPost {
  _id: string;
  agencyId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  author: string;
  isPublished: boolean;
  publishedAt?: Date;
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Form Builder Types
export interface Form {
  _id: string;
  agencyId: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: {
    emailNotifications: boolean;
    notificationEmails: string[];
    redirectUrl?: string;
    submitMessage: string;
    allowMultipleSubmissions: boolean;
  };
  submissions: Array<{
    _id: string;
    data: Record<string, any>;
    submittedAt: Date;
    ip?: string;
    userAgent?: string;
    status: 'new' | 'read' | 'responded';
  }>;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // for select, checkbox, radio
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  conditional?: {
    dependsOn: string; // field id
    value: string | string[];
  };
  order: number;
}

// Media Management Types
export interface MediaFile {
  _id: string;
  agencyId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  folder?: string;
  alt?: string;
  caption?: string;
  uploadedBy: string;
  createdAt: Date;
}

// System Monitoring Types
export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  activeAgencies: number;
  totalRequests: number;
  responseTime: number;
}

export interface AgencyMetrics {
  agencyId: string;
  date: Date;
  visitors: {
    unique: number;
    total: number;
    bounceRate: number;
  };
  pageViews: number;
  leads: {
    total: number;
    conversion: number;
  };
  performance: {
    loadTime: number;
    uptime: number;
  };
  resources: {
    storageUsed: number;
    bandwidthUsed: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  agencyId?: string;
  permissions: string[];
}

// Utility Types
export interface FileUpload {
  file: File;
  folder?: string;
  alt?: string;
  caption?: string;
}

export interface NotificationData {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId?: string;
  agencyId?: string;
  createdAt: Date;
}

// Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT: 'client',
  AGENCY_ADMIN: 'admin',
  AGENCY_EDITOR: 'editor',
  AGENCY_VIEWER: 'viewer'
} as const;

export const AGENCY_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export const STUDENT_STATUS = {
  INQUIRY: 'inquiry',
  CONSULTATION: 'consultation',
  APPLICATION: 'application',
  ACCEPTED: 'accepted',
  ENROLLED: 'enrolled',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;

export const PERMISSIONS = {
  // Super Admin
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_AGENCIES: 'manage_agencies',
  VIEW_SYSTEM_METRICS: 'view_system_metrics',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  
  // Agency
  MANAGE_STUDENTS: 'manage_students',
  MANAGE_CONTENT: 'manage_content',
  MANAGE_FORMS: 'manage_forms',
  MANAGE_MEDIA: 'manage_media',
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_ANALYTICS: 'view_analytics'
} as const;