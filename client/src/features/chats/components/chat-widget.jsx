import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { io } from 'socket.io-client';
import { MessageCircle, X, ChevronLeft, Send, User } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import apiClient from '~/lib/api-client';
import { cn } from '~/lib/utils';
import { ROLE } from '~/constants/role';
import {
  clearTargetContact,
  closeChatWidget,
  openChatWidget
} from '~/store/features/auth-slice';

export default function ChatWidget() {
  const { user, targetContactId, isChatWidgetOpen } = useSelector(
    state => state.auth
  );
  const dispatch = useDispatch();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#chat') {
      dispatch(openChatWidget());
    }
  }, [location.hash, dispatch]);

  useEffect(() => {
    if (targetContactId && contacts) {
      const target = contacts.find(c => c._id === targetContactId);
      if (target) {
        setActiveContact(target);
        dispatch(clearTargetContact());
      } else {
        // If contact is not in the list, create a temporary contact object.
        // The backend should handle creating the relationship on the first message.
        const fetchAndSetTargetUser = async () => {
          try {
            const { data } = await apiClient.get(`/api/users/${targetContactId}/contact-info`);
            if (data.data) {
                const newContact = {
                    _id: data.data._id,
                    name: data.data.name,
                    avatar: data.data.avatar,
                    role: data.data.role,
                };
                setContacts(prev => [newContact, ...prev.filter(c => c._id !== newContact._id)]);
                setActiveContact(newContact);
                dispatch(clearTargetContact());
            }
          } catch (error) {
            console.error('Failed to fetch target user', error);
            dispatch(clearTargetContact());
          }
        };
        fetchAndSetTargetUser();
      }
    }
  }, [targetContactId, contacts, dispatch]);

  useEffect(() => {
    if (!user || user.role === ROLE.ADMIN) return;

    const fetchContacts = async () => {
      try {
        const { data } = await apiClient.get('/api/chats/contacts');
        setContacts(data.data || []);
      } catch (error) {
        console.error('Failed to load contacts', error);
      }
    };
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!user || user.role === ROLE.ADMIN) return;

    const userId = user._id || user.id;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      newSocket.emit('join', userId);
    });

    newSocket.on('newMessage', msg => {
      setMessages(prev => {
        const isActiveConversation =
          activeContact &&
          ((msg.sender === activeContact._id && msg.receiver === userId) ||
            (msg.sender === userId && msg.receiver === activeContact._id));

        if (isActiveConversation) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return [...prev, msg];
        }
        return prev;
      });

      if (msg.sender !== userId) {
        setContacts(prev =>
          prev.map(c => {
            if (c._id === msg.sender) {
              if (
                !activeContact ||
                activeContact._id !== msg.sender ||
                !isChatWidgetOpen
              ) {
                return { ...c, unreadCount: (c.unreadCount || 0) + 1 };
              }
            }
            return c;
          })
        );
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [user, activeContact, isChatWidgetOpen]);

  useEffect(() => {
    if (!activeContact) return;
    const fetchMessages = async () => {
      try {
        const { data } = await apiClient.get(
          `/api/chats/${activeContact._id}/messages`
        );
        setMessages(data.data || []);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        await apiClient.put(`/api/chats/${activeContact._id}/read`);
        setContacts(prev =>
          prev.map(c =>
            c._id === activeContact._id ? { ...c, unreadCount: 0 } : c
          )
        );
      } catch (error) {
        console.error('Failed to load messages', error);
      }
    };
    fetchMessages();
  }, [activeContact]);

  if (!user || user.role === ROLE.ADMIN) return null;

  const handleSend = () => {
    if (!newMessage.trim() || !activeContact || !socket) return;

    const userId = user._id || user.id;

    const data = {
      senderId: userId,
      receiverId: activeContact._id,
      content: newMessage.trim()
    };
    socket.emit('sendMessage', data);
    setNewMessage('');
  };

  const totalUnread = contacts.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  return (
    <div className='fixed bottom-6 right-[6.5rem] z-50 flex flex-col items-end gap-3'>
      {isChatWidgetOpen && (
        <div className='mb-2 w-[340px] h-[450px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden'>
          <div className='p-3 border-b flex justify-between items-center bg-primary text-primary-foreground shadow-sm'>
            {activeContact ? (
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setActiveContact(null)}
                  className='hover:bg-primary/80 p-1.5 rounded-full transition-colors'
                >
                  <ChevronLeft size={20} />
                </button>
                <Avatar className='w-8 h-8 border-2 border-primary-foreground/20'>
                  <AvatarImage src={activeContact.avatar} />
                  <AvatarFallback className='text-primary font-semibold text-xs bg-background'>
                    {activeContact.name?.charAt(0) || <User size={16} />}
                  </AvatarFallback>
                </Avatar>
                <span className='font-semibold text-sm truncate'>
                  {activeContact.name}
                </span>
              </div>
            ) : (
              <h3 className='font-semibold px-4'>Tin nhắn</h3>
            )}
            <button
              onClick={() => dispatch(closeChatWidget())}
              className='hover:bg-primary/80 p-1.5 rounded-full transition-colors'
            >
              <X size={20} />
            </button>
          </div>

          {activeContact ? (
            <div className='flex-1 flex flex-col overflow-hidden bg-muted/10'>
              <ScrollArea className='flex-1 p-4'>
                <div className='space-y-4'>
                  {messages.map((m, i) => {
                    const isMe = m.sender === (user._id || user.id);
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                          isMe
                            ? 'ml-auto bg-primary text-primary-foreground rounded-br-sm'
                            : 'mr-auto bg-background border rounded-bl-sm'
                        )}
                      >
                        {m.content}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className='p-3 border-t bg-background flex gap-2'>
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Nhập tin nhắn...'
                  className='rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent'
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <Button
                  size='icon'
                  className='rounded-full shrink-0'
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} className='ml-1' />
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className='flex-1'>
              {contacts.length === 0 ? (
                <div className='p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-full gap-2'>
                  <MessageCircle size={40} className='opacity-20' />
                  <p className='text-sm'>Chưa có liên hệ nào</p>
                </div>
              ) : (
                <div className='p-2 space-y-1'>
                  {contacts.map(c => (
                    <div
                      key={c._id}
                      onClick={() => setActiveContact(c)}
                      className='flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors'
                    >
                      <Avatar className='w-12 h-12 border shadow-sm relative'>
                        <AvatarImage src={c.avatar} />
                        <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                          {c.name?.charAt(0) || <User size={20} />}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 overflow-hidden'>
                        <div className='font-semibold text-sm truncate'>
                          {c.name}
                        </div>
                        <div className='text-xs text-muted-foreground truncate mt-0.5'>
                          {c.role === ROLE.NUTRITIONIST
                            ? 'Personal Trainer'
                            : 'Học viên'}
                        </div>
                      </div>
                      {c.unreadCount > 0 && (
                        <div className='bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm'>
                          {c.unreadCount > 9 ? '9+' : c.unreadCount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      )}

      <button
        onClick={() =>
          isChatWidgetOpen
            ? dispatch(closeChatWidget())
            : dispatch(openChatWidget())
        }
        className='w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:bg-primary/90 transition-transform hover:scale-105 relative active:scale-95'
      >
        {isChatWidgetOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isChatWidgetOpen && totalUnread > 0 && (
          <span className='absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full border-2 border-background shadow-sm'>
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
