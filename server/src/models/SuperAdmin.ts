import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { PERMISSIONS, USER_ROLES } from 'shared';
import { logger } from '@/utils/logger';

export interface ISuperAdmin extends Document {
  email: string;
  password: string;
  name: string;
  role: typeof USER_ROLES.SUPER_ADMIN;
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
}

const superAdminSchema = new Schema<ISuperAdmin>({
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
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  role: {
    type: String,
    default: USER_ROLES.SUPER_ADMIN,
    immutable: true
  },
  permissions: [{
    type: String,
    enum: Object.values(PERMISSIONS)
  }],
  lastLogin: {
    type: Date
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
superAdminSchema.index({ email: 1 });
superAdminSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
superAdminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    logger.error('Error hashing password:', error);
    next(error as Error);
  }
});

// Instance method to compare password
superAdminSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error('Error comparing password:', error);
    return false;
  }
};

// Instance method to update last login
superAdminSchema.methods.updateLastLogin = async function(): Promise<void> {
  try {
    this.lastLogin = new Date();
    await this.save();
  } catch (error) {
    logger.error('Error updating last login:', error);
  }
};

// Static method to find by email with password
superAdminSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Static method to create default super admin
superAdminSchema.statics.createDefaultSuperAdmin = async function() {
  try {
    const existingSuperAdmin = await this.findOne({});
    if (existingSuperAdmin) {
      logger.info('Super admin already exists, skipping creation');
      return existingSuperAdmin;
    }

    const defaultEmail = process.env.SUPER_ADMIN_EMAIL;
    const defaultPassword = process.env.SUPER_ADMIN_PASSWORD;
    const defaultName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    if (!defaultEmail || !defaultPassword) {
      logger.warn('Super admin credentials not provided in environment variables');
      return null;
    }

    const superAdmin = new this({
      email: defaultEmail,
      password: defaultPassword,
      name: defaultName,
      permissions: Object.values(PERMISSIONS)
    });

    await superAdmin.save();
    logger.info('Default super admin created successfully');
    return superAdmin;
  } catch (error) {
    logger.error('Error creating default super admin:', error);
    return null;
  }
};

// Pre-remove middleware to prevent deletion of the last super admin
superAdminSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const count = await mongoose.model('SuperAdmin').countDocuments();
    if (count <= 1) {
      const error = new Error('Cannot delete the last super admin');
      return next(error);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

const SuperAdmin = mongoose.model<ISuperAdmin>('SuperAdmin', superAdminSchema);

export default SuperAdmin;