import { Schema, model, Document } from 'mongoose';
import { IRoom } from './room';

export interface IMessage extends Document {
  content: string;
  roomId: IRoom;
  user: string;
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
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Message = model<IMessage>('Message', messageSchema);
export default Message;
