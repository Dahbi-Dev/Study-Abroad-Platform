import { z } from 'zod';

// Auth Validation Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Super Admin Validation Schemas
export const createSuperAdminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  permissions: z.array(z.string()).optional()
});

// Client Validation Schemas
export const createClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  resourceLimits: z.object({
    storage: z.number().min(100, 'Minimum storage is 100MB'),
    bandwidth: z.number().min(1000, 'Minimum bandwidth is 1GB'),
    agencies: z.number().min(1, 'Minimum agencies is 1')
  })
});

export const updateClientSchema = createClientSchema.partial().omit({ password: true });

// Agency Validation Schemas
export const createAgencySchema = z.object({
  name: z.string().min(2, 'Agency name must be at least 2 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(20, 'Subdomain must be at most 20 characters')
    .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Subdomain cannot start or end with a hyphen'),
  branding: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    logo: z.string().url().optional(),
    favicon: z.string().url().optional(),
    fonts: z.object({
      primary: z.string(),
      secondary: z.string()
    })
  }).optional(),
  contact: z.object({
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional()
  })
});

export const updateAgencySchema = createAgencySchema.partial();

export const updateAgencyBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  fonts: z.object({
    primary: z.string(),
    secondary: z.string()
  }).optional()
});

// Student Validation Schemas
export const createStudentSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().min(1, 'Nationality is required'),
    currentCountry: z.string().min(1, 'Current country is required'),
    currentCity: z.string().optional(),
    passportNumber: z.string().optional()
  }),
  academic: z.object({
    highestEducation: z.string().min(1, 'Highest education is required'),
    institution: z.string().optional(),
    gpa: z.number().min(0).max(4).optional(),
    graduationYear: z.number().min(1950).max(2030).optional(),
    fieldOfStudy: z.string().optional()
  }).optional(),
  interests: z.object({
    countries: z.array(z.string()).min(1, 'At least one country must be selected'),
    programs: z.array(z.string()).min(1, 'At least one program must be selected'),
    budget: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().length(3, 'Currency must be 3 characters')
    }),
    preferredStartDate: z.string().optional(),
    studyLevel: z.enum(['undergraduate', 'graduate', 'phd', 'certificate'])
  }),
  source: z.enum(['website', 'referral', 'social_media', 'advertisement', 'other']).optional(),
  tags: z.array(z.string()).optional()
});

export const updateStudentSchema = createStudentSchema.partial();

export const updateStudentStatusSchema = z.object({
  status: z.enum(['inquiry', 'consultation', 'application', 'accepted', 'enrolled', 'rejected', 'cancelled']),
  notes: z.string().optional()
});

// Form Validation Schemas
export const createFormSchema = z.object({
  name: z.string().min(1, 'Form name is required'),
  description: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'file', 'date', 'number']),
    label: z.string().min(1, 'Field label is required'),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    validation: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    conditional: z.object({
      dependsOn: z.string(),
      value: z.union([z.string(), z.array(z.string())])
    }).optional(),
    order: z.number()
  })).min(1, 'At least one field is required'),
  settings: z.object({
    emailNotifications: z.boolean(),
    notificationEmails: z.array(z.string().email()).optional(),
    redirectUrl: z.string().url().optional(),
    submitMessage: z.string(),
    allowMultipleSubmissions: z.boolean()
  })
});

export const updateFormSchema = createFormSchema.partial();

// Page Validation Schemas
export const createPageSchema = z.object({
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required'),
  content: z.object({
    type: z.literal('blocks'),
    blocks: z.array(z.object({
      id: z.string(),
      type: z.enum(['hero', 'text', 'image', 'gallery', 'video', 'testimonial', 'cta', 'form', 'country_grid', 'service_cards']),
      data: z.record(z.any()),
      style: z.record(z.any()).optional(),
      order: z.number()
    }))
  }),
  seoData: z.object({
    title: z.string().min(1, 'SEO title is required'),
    description: z.string().min(1, 'SEO description is required'),
    keywords: z.array(z.string()),
    ogImage: z.string().url().optional()
  }),
  isPublished: z.boolean()
});

export const updatePageSchema = createPageSchema.partial();

// Media Validation Schemas
export const uploadMediaSchema = z.object({
  folder: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional()
});

// Blog Post Validation Schemas
export const createBlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: z.string().url().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean(),
  seoData: z.object({
    title: z.string().min(1, 'SEO title is required'),
    description: z.string().min(1, 'SEO description is required'),
    keywords: z.array(z.string())
  })
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

// Pagination Validation Schema
export const paginationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  filters: z.record(z.any()).optional()
});

// Export validation helper function
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};