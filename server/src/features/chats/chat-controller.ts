import { Request, Response } from 'express';
import { ChatService } from './chat-service';

export class ChatController {
  static async getContacts(req: Request, res: Response) {
    const userId = req.user._id.toString();
    const role = req.user.role;
    const contacts = await ChatService.getContacts(userId, role);
    res.json({ data: contacts });
  }

  static async getMessages(req: Request, res: Response) {
    const userId = req.user._id.toString();
    const contactId = req.params.contactId;
    const messages = await ChatService.getMessages(userId, contactId);
    res.json({ data: messages });
  }

  static async markAsRead(req: Request, res: Response) {
    const userId = req.user._id.toString();
    const senderId = req.params.senderId;
    await ChatService.markMessagesAsRead(senderId, userId);
    res.json({ message: 'Marked as read' });
  }
}
