import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import config from '@config/constants';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  active: boolean;
  role: (typeof config.roles)[number];
  comparePassword(password: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 1024,
    },
    address: String,
    phone: String,
    active: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'user',
      enum: config.roles,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre<IUser>('save', function save(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = bcrypt.hashSync(this.password);
    return next();
  } catch (error) {
    return next(error as any);
  }
});

userSchema.methods.comparePassword = function (password: string): boolean {
  return bcrypt.compareSync(password, this.password);
};

const User = model<IUser>('User', userSchema);
export default User;
