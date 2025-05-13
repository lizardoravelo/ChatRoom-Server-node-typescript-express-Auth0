import { Request, Response } from 'express';
import Message from '@model/message';
import handleErrorResponse from '@error/error-handler';
import { validateMessage } from '@validators/message';
import { IUser } from '@model/user';
import config from '@config/constants';

interface IMessageController {
  getMessages: (req: Request<{ roomId: string }, any, any, { page?: string }>, res: Response) => Promise<void>;
  sendMessage: (req: Request<{ roomId: string }>, res: Response) => Promise<void>;
}

const messageCtrl: IMessageController = {
  getMessages: async (req, res): Promise<void> => {
    try {
      const page = parseInt(req.query.page ?? '1');
      const messages = await Message.find({ roomId: req.params.roomId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * config.messages_per_page)
        .limit(config.messages_per_page)
        .populate('userId', 'username email');

      const totalMessages = await Message.countDocuments({ roomId: req.params.roomId });

      res.status(200).json({
        messages: messages.reverse(), // Reverse to get chronological order
        pagination: {
          page,
          totalPages: Math.ceil(totalMessages / config.messages_per_page),
          totalMessages,
        },
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  sendMessage: async (req, res): Promise<void> => {
    try {
      const validation = validateMessage(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues });
        return;
      }

      const user = req.user as IUser;
      const message = new Message({
        content: req.body.content,
        roomId: req.params.roomId,
        userId: user._id,
      });

      await message.save();
      const populatedMessage = await Message.findById(message._id).populate('userId', 'username email');

      // Emit to room via WebSocket
      req.app.get('io').to(req.params.roomId).emit('new message', populatedMessage);

      res.status(201).json(populatedMessage);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
};

export default messageCtrl;
