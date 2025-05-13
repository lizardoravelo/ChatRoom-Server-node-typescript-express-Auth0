import { Schema, model, Document } from 'mongoose';
import { IUser } from './user';

export interface IRoom extends Document {
  name: string;
  description: string;
  createdBy: IUser['_id'];
  activeUsers: IUser['_id'][];
  maxUsers?: number;
  isPrivate: boolean;
  status: 'active' | 'archived' | 'closed';
  lastActivity: Date;
  isFull(): boolean;
}

const roomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activeUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxUsers: {
      type: Number,
      default: null,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

roomSchema.pre('save', function (next) {
  this.lastActivity = new Date();
  next();
});

roomSchema.methods.isFull = function (): boolean {
  if (!this.maxUsers) return false;
  return this.activeUsers.length >= this.maxUsers;
};

const Room = model<IRoom>('Room', roomSchema);
export default Room;
