import { Router } from 'express';
import { authenticate } from '~/shared/middlewares';
import { asyncHandler } from '~/shared/utils';
import { ChatController } from './chat-controller';

const router = Router();

router.get('/contacts', authenticate(), asyncHandler(ChatController.getContacts));
router.get('/:contactId/messages', authenticate(), asyncHandler(ChatController.getMessages));
router.put('/:senderId/read', authenticate(), asyncHandler(ChatController.markAsRead));

export default router;

