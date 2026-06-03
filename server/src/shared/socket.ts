import { Server, Socket } from 'socket.io';
import { ChatService } from '~/features/chats/chat-service';

export let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('join', (userId: string) => {
      socket.join(userId);
    });

    socket.on('sendMessage', async (data: { senderId: string; receiverId: string; content: string }) => {
      try {
        const { senderId, receiverId, content } = data;
        const message = await ChatService.saveMessage(senderId, receiverId, content);
        
        io.to(receiverId).emit('newMessage', message);
        io.to(senderId).emit('newMessage', message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      // Clean up if necessary
    });
  });

  return io;
};
