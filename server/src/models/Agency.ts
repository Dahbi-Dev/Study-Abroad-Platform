import mongoose, { Document, Schema } from 'mongoose';
import { DEFAULT_BRANDING, AGENCY_STATUS } from 'shared';
import { logger } from '@/utils/logger';
import slugify from 'slugify';

export interface IAgency extends Document {
  clientId: mongoose.Types.ObjectId;
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
  generateSubdomain(): string;
  updateMetrics(metric: keyof IAgency['metrics'], value: number): Promise<void>;
  isActive(): boolean;
}

const agencySchema = new Schema<IAgency>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Agency name is required'],
    trim: true,
    minlength: [2, 'Agency name must be at least 2 characters long'],
    maxlength: [100, 'Agency name cannot exceed 100 characters']
  },
  subdomain: {
    type: String,
    required: [true, 'Subdomain is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Subdomain must be at least 3 characters long'],
    maxlength: [20, 'Subdomain cannot exceed 20 characters'],
    validate: {
      validator: (subdomain: string) => {
        return /^[a-z0-9-]+$/.test(subdomain) && 
               !subdomain.startsWith('-') && 
               !subdomain.endsWith('-');
      },
      message: 'Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen'
    }
  },
  status: {
    type: String,
    enum: Object.values(AGENCY_STATUS),
    default: AGENCY_STATUS.ACTIVE
  },
  branding: {
    primaryColor: {
      type: String,
      default: DEFAULT_BRANDING.PRIMARY_COLOR,
      validate: {
        validator: (color: string) => /^#[0-9A-F]{6}$/i.test(color),
        message: 'Primary color must be a valid hex color'
      }
    },
    secondaryColor: {
      type: String,
      default: DEFAULT_BRANDING.SECONDARY_COLOR,
      validate: {
        validator: (color: string) => /^#[0-9A-F]{6}$/i.test(color),
        message: 'Secondary color must be a valid hex color'
      }
    },
    accentColor: {
      type: String,
      default: DEFAULT_BRANDING.ACCENT_COLOR,
      validate: {
        validator: (color: string) => /^#[0-9A-F]{6}$/i.test(color),
        message: 'Accent color must be a valid hex color'
      }
    },
    logo: {
      type: String,
      validate: {
        validator: function(url: string) {
          return !url || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        },
        message: 'Logo must be a valid image URL'
      }
    },
    favicon: {
      type: String,
      validate: {
        validator: function(url: string) {
          return !url || /^https?:\/\/.+\.(ico|png)$/i.test(url);
        },
        message: 'Favicon must be a valid .ico or .png URL'
      }
    },
    fonts: {
      primary: {
        type: String,
        default: DEFAULT_BRANDING.FONTS.PRIMARY
      },
      secondary: {
        type: String,
        default: DEFAULT_BRANDING.FONTS.SECONDARY
      }
    }
  },
  settings: {
    theme: {
      type: String,
      enum: ['modern', 'classic', 'minimal'],
      default: 'modern'
    },
    layout: {
      type: String,
      enum: ['sidebar', 'topbar', 'hybrid'],
      default: 'sidebar'
    },
    features: [{
      type: String,
      enum: [
        'blog', 
        'testimonials', 
        'gallery', 
        'contact_forms', 
        'live_chat', 
        'analytics', 
        'seo_tools',
        'social_media',
        'newsletter',
        'appointments'
      ]
    }],
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String
    }
  },
  metrics: {
    storageUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    bandwidthUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
    totalVisitors: {
      type: Number,
      default: 0,
      min: 0
    },
    totalLeads: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      validate: {
        validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        message: 'Please provide a valid contact email address'
      }
    },
    phone: String,
    address: String,
    city: String,
    country: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
agencySchema.index({ clientId: 1 });
agencySchema.index({ subdomain: 1 });
agencySchema.index({ status: 1 });
agencySchema.index({ createdAt: -1 });
agencySchema.index({ 'metrics.lastActive': -1 });

// Compound indexes
agencySchema.index({ clientId: 1, status: 1 });
agencySchema.index({ subdomain: 1, status: 1 });

// Pre-save middleware to generate subdomain if not provided
agencySchema.pre('save', function(next) {
  if (!this.subdomain && this.name) {
    this.subdomain = this.generateSubdomain();
  }
  next();
});

// Instance method to generate subdomain from name
agencySchema.methods.generateSubdomain = function(): string {
  return slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

// Instance method to update metrics
agencySchema.methods.updateMetrics = async function(
  metric: keyof IAgency['metrics'], 
  value: number
): Promise<void> {
  try {
    if (metric === 'lastActive') {
      this.metrics.lastActive = new Date();
    } else {
      this.metrics[metric] = value;
    }
    await this.save();
  } catch (error) {
    logger.error(`Error updating agency metric ${metric}:`, error);
  }
};

// Instance method to check if agency is active
agencySchema.methods.isActive = function(): boolean {
  return this.status === AGENCY_STATUS.ACTIVE;
};

// Static method to find by subdomain
agencySchema.statics.findBySubdomain = function(subdomain: string) {
  return this.findOne({ subdomain, status: AGENCY_STATUS.ACTIVE });
};

// Static method to find agencies with client info
agencySchema.statics.findWithClientInfo = function(query = {}) {
  return this.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'client'
      }
    },
    {
      $unwind: '$client'
    },
    {
      $project: {
        'client.password': 0
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

// Static method to get agencies by client with lead count
agencySchema.statics.findByClientWithStats = function(clientId: mongoose.Types.ObjectId) {
  return this.aggregate([
    { $match: { clientId } },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'agencyId',
        as: 'leads'
      }
    },
    {
      $addFields: {
        leadCount: { $size: '$leads' },
        recentLeads: {
          $size: {
            $filter: {
              input: '$leads',
              cond: {
                $gte: ['$$this.createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
              }
            }
          }
        }
      }
    },
    {
      $project: {
        leads: 0
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

// Virtual for full URL
agencySchema.virtual('url').get(function() {
  return `https://${this.subdomain}.yourdomain.com`;
});

// Virtual for admin URL
agencySchema.virtual('adminUrl').get(function() {
  return `https://admin-${this.subdomain}.yourdomain.com`;
});

// Virtual to check if storage is near limit
agencySchema.virtual('storagePercentage').get(function() {
  // This would need to be calculated based on client's resource limits
  // For now, we'll assume a 1GB default limit
  const limit = 1000; // 1GB in MB
  return Math.round((this.metrics.storageUsed / limit) * 100);
});

const Agency = mongoose.model<IAgency>('Agency', agencySchema);

export default Agency;