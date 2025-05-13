import { Request, Response } from 'express';
import Room from '@model/room';
import handleErrorResponse from '@error/error-handler';
import { validateRoom } from '@validators/room';
import { IUser } from '@model/user';
import config from '@config/constants';

interface RoomQueryParams {
  page?: string;
  status?: string;
  isPrivate?: string;
}

interface IRoomController {
  getRooms: (req: Request<any, any, any, RoomQueryParams>, res: Response) => Promise<void>;
  createRoom: (req: Request, res: Response) => Promise<void>;
  joinRoom: (req: Request<{ roomId: string }>, res: Response) => Promise<void>;
  leaveRoom: (req: Request<{ roomId: string }>, res: Response) => Promise<void>;
  updateRoomStatus: (req: Request<{ roomId: string }>, res: Response) => Promise<void>;
}

const roomCtrl: IRoomController = {
  getRooms: async (req, res): Promise<void> => {
    try {
      const page = parseInt(req.query.page ?? '1');
      const status = req.query.status ?? 'active';

      const query: Record<string, any> = { status };
      if (req.query.isPrivate) {
        query.isPrivate = req.query.isPrivate === 'true';
      }

      const rooms = await Room.find(query)
        .sort({ lastActivity: -1 })
        .skip((page - 1) * config.rooms_per_page)
        .limit(config.rooms_per_page)
        .populate('createdBy', 'name email')
        .populate('activeUsers', 'name email');

      const totalRooms = await Room.countDocuments(query);

      const formattedRooms = rooms.map(room => ({
        _id: room._id,
        name: room.name,
        description: room.description,
        activeUsers: room.activeUsers.map(user => ({ name: (user as IUser).name, email: (user as IUser).email })), // Include user list
      }));

      res.status(200).json({
        rooms: formattedRooms,
        pagination: {
          page,
          totalPages: Math.ceil(totalRooms / config.rooms_per_page),
          totalRooms,
        },
      });
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  createRoom: async (req, res): Promise<void> => {
    try {
      const validation = validateRoom(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.issues });
        return;
      }

      const user = req.user as IUser;
      const room = new Room({
        name: req.body.name,
        description: req.body.description,
        createdBy: user._id,
        maxUsers: req.body.maxUsers,
        isPrivate: req.body.isPrivate ?? false,
        status: 'active',
        activeUsers: [],
      });

      await room.save();
      const populatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'name email')
        .populate('activeUsers', 'name email');

      // Emit to all connected clients that a new room was created
      req.app.get('io').emit('new room', populatedRoom);

      res.status(201).json(populatedRoom);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  joinRoom: async (req, res): Promise<void> => {
    try {
      const user = req.user as IUser;
      const roomId = req.params.roomId;

      const room = await Room.findById(roomId);
      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      if (room.status !== 'active') {
        res.status(400).json({ error: 'Room is not active' });
        return;
      }

      if (room.isFull()) {
        res.status(400).json({ error: 'Room is full' });
        return;
      }

      const createdBy = room.createdBy as IUser;
      if (room.isPrivate && createdBy._id !== user._id) {
        res.status(403).json({ error: 'Cannot join private room' });
        return;
      }

      if (!room.activeUsers.some(_id => _id === user._id)) {
        room.activeUsers.push(user._id);
        await room.save();
      }

      const populatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'name email')
        .populate('activeUsers', 'name email');

      req.app.get('io').to(roomId).emit('user joined', {
        userId: user._id,
        username: user.name,
        email: user.email,
        room: populatedRoom,
      });

      res.status(200).json(populatedRoom);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  leaveRoom: async (req, res): Promise<void> => {
    try {
      const user = req.user as IUser;
      const roomId = req.params.roomId;

      const room = await Room.findById(roomId);
      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      room.activeUsers = room.activeUsers.filter(id => id !== user._id);
      await room.save();

      const populatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'name email')
        .populate('activeUsers', 'name email');

      req.app.get('io').to(roomId).emit('user left', {
        userId: user._id,
        username: user.name,
        email: user.email,
        room: populatedRoom,
      });

      res.status(200).json(populatedRoom);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },

  updateRoomStatus: async (req, res): Promise<void> => {
    try {
      const user = req.user as IUser;
      const roomId = req.params.roomId;
      const { status } = req.body;

      const room = await Room.findById(roomId);
      if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
      }

      const createdBy = room.createdBy as IUser;
      if (createdBy._id !== user._id) {
        res.status(403).json({ error: 'Unauthorized to update room status' });
        return;
      }

      if (!['active', 'archived', 'closed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      room.status = status;
      if (status !== 'active') {
        room.activeUsers = [];
      }
      await room.save();

      const populatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'name email')
        .populate('activeUsers', 'name email');

      req.app.get('io').to(roomId).emit('room status changed', {
        roomId,
        status,
        room: populatedRoom,
      });

      res.status(200).json(populatedRoom);
    } catch (err) {
      handleErrorResponse(res, err);
    }
  },
};

export default roomCtrl;
