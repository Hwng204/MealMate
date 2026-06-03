import { Types } from 'mongoose';
import { ClassModel } from '~/shared/database/models/class-model';
import { MessageModel } from '~/shared/database/models/message-model';
import { UserModel } from '~/shared/database/models/user-model';
import { ROLE } from '~/shared/constants/role';

export class ChatService {
  static async getContacts(userId: string, role: string) {
    const userObjectId = new Types.ObjectId(userId);
    let contactIds = new Set<string>();

    if (role === ROLE.USER) {
      const classes = await ClassModel.find({ members: userObjectId }).select('nutritionistId members').lean();
      classes.forEach(c => {
        if (c.nutritionistId) {
          contactIds.add(c.nutritionistId.toString());
        }
        if (c.members) {
          c.members.forEach((m: any) => {
            if (m.toString() !== userId) {
              contactIds.add(m.toString());
            }
          });
        }
      });
    } else if (role === ROLE.NUTRITIONIST) {
      const classes = await ClassModel.find({ nutritionistId: userObjectId }).select('members').lean();
      classes.forEach(c => {
        if (c.members) {
          c.members.forEach((m: any) => contactIds.add(m.toString()));
        }
      });
    }

    const contacts = await UserModel.find({ _id: { $in: Array.from(contactIds) } })
      .select('name avatar role')
      .lean();

    const unreadCounts = await MessageModel.aggregate([
      { $match: { receiver: userObjectId, isRead: false } },
      { $group: { _id: '$sender', count: { $sum: 1 } } }
    ]);

    const unreadMap = new Map();
    unreadCounts.forEach(u => unreadMap.set(u._id.toString(), u.count));

    return contacts.map(c => ({
      ...c,
      unreadCount: unreadMap.get(c._id.toString()) || 0
    }));
  }

  static async getMessages(userId1: string, userId2: string) {
    const u1 = new Types.ObjectId(userId1);
    const u2 = new Types.ObjectId(userId2);
    const messages = await MessageModel.find({
      $or: [
        { sender: u1, receiver: u2 },
        { sender: u2, receiver: u1 }
      ]
    }).sort({ createdAt: 1 }).lean();
    return messages;
  }

  static async markMessagesAsRead(senderId: string, receiverId: string) {
    const sId = new Types.ObjectId(senderId);
    const rId = new Types.ObjectId(receiverId);
    await MessageModel.updateMany(
      { sender: sId, receiver: rId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  static async saveMessage(sender: string, receiver: string, content: string) {
    const message = new MessageModel({ sender, receiver, content });
    await message.save();
    return message;
  }
}
