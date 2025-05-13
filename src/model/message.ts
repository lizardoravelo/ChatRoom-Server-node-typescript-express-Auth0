import { Schema, model, Document } from 'mongoose';
import { IRoom } from './room';
import { IUser } from './user';

export interface IMessage extends Document {
  content: string;
  roomId: IRoom;
  userId: IUser;
}

const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

const Message = model<IMessage>('Message', messageSchema);
export default Message;
