import { Request, Response } from 'express';
import Message from '@model/message';
import handleErrorResponse from '@error/handle-error';
import { validateMessage } from '@validators/message';
import config from '@config/constants';
import { getAuthUser } from '@utils/get-auth-user';

interface IMessageController {
  getMessages: (req: Request<{ roomId: string }, any, any, { page?: string }>, res: Response) => Promise<void>;
  sendMessage: (req: Request<{ roomId: string }>, res: Response) => Promise<void>;
}

const messageCtrl: IMessageController = {
  getMessages: async (req: Request<{ roomId: string }, any, any, { page?: string }>, res: Response): Promise<void> => {
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

  sendMessage: async (req: Request<{ roomId: string }>, res: Response): Promise<void> => {
    try {
      const validation = validateMessage(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues });
        return;
      }

      const user = getAuthUser(req);
      const message = new Message({
        content: req.body.content,
        roomId: req.params.roomId,
        userId: user.sub,
      });

      await message.save();
      const populatedMessage = await Message.findById(message._id).populate('userId', 'username email');

      req.app.get('io').to(req.params.roomId).emit('new message', populatedMessage);

      res.status(201).json(populatedMessage);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
};

export default messageCtrl;
