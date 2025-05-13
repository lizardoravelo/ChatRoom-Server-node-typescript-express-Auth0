import { Router } from 'express';
import { checkJwt, authorize } from '@middleware/authorization';
import roomCtrl from '@controller/room.controller';
import messageCtrl from '@controller/message.controller';

const { getRooms, createRoom } = roomCtrl;
const { getMessages, sendMessage } = messageCtrl;

export const room = (router: Router): void => {
  router
    .route('/')
    .get(checkJwt, authorize(['admin', 'user']), getRooms)
    .post(checkJwt, authorize(['admin', 'user']), createRoom);

  //Message Routes
  router
    .route('/:roomId/messages')
    .get(checkJwt, authorize(['admin', 'user']), getMessages)
    .post(checkJwt, authorize(['admin', 'user']), sendMessage);
};
