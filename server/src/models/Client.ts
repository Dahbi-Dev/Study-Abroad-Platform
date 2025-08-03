import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { USER_ROLES, DEFAULT_RESOURCE_LIMITS } from 'shared';
import { logger } from '@/utils/logger';

export interface IClient extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  status: 'active' | 'suspended' | 'inactive';
  resourceLimits: {
    storage: number;
    bandwidth: number;
    agencies: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
  isWithinResourceLimits(resource: 'storage' | 'bandwidth' | 'agencies', currentUsage: number): boolean;
}

const clientSchema = new Schema<IClient>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please provide a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(phone: string) {
        return !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone);
      },
      message: 'Please provide a valid phone number'
    }
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  resourceLimits: {
    storage: {
      type: Number,
      default: DEFAULT_RESOURCE_LIMITS.STORAGE,
      min: [100, 'Minimum storage limit is 100MB']
    },
    bandwidth: {
      type: Number,
      default: DEFAULT_RESOURCE_LIMITS.BANDWIDTH,
      min: [1000, 'Minimum bandwidth limit is 1GB']
    },
    agencies: {
      type: Number,
      default: DEFAULT_RESOURCE_LIMITS.AGENCIES,
      min: [1, 'Minimum agency limit is 1']
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ 'resourceLimits.agencies': 1 });

// Pre-save middleware to hash password
clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    logger.error('Error hashing client password:', error);
    next(error as Error);
  }
});

// Instance method to compare password
clientSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error('Error comparing client password:', error);
    return false;
  }
};

// Instance method to check resource limits
clientSchema.methods.isWithinResourceLimits = function(
  resource: 'storage' | 'bandwidth' | 'agencies', 
  currentUsage: number
): boolean {
  return currentUsage < this.resourceLimits[resource];
};

// Static method to find by email with password
clientSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Static method to get clients with agency count
clientSchema.statics.findWithAgencyCount = function(query = {}) {
  return this.aggregate([
    { $match: query },
    {
      $lookup: {
        from: 'agencies',
        localField: '_id',
        foreignField: 'clientId',
        as: 'agencies'
      }
    },
    {
      $addFields: {
        agencyCount: { $size: '$agencies' },
        isAtAgencyLimit: {
          $gte: [{ $size: '$agencies' }, '$resourceLimits.agencies']
        }
      }
    },
    {
      $project: {
        password: 0,
        agencies: 0
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

// Virtual for full display name
clientSchema.virtual('displayName').get(function() {
  return this.company ? `${this.name} (${this.company})` : this.name;
});

// Virtual to check if client is active
clientSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

const Client = mongoose.model<IClient>('Client', clientSchema);

export default Client;