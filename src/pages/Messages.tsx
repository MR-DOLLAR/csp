import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, updateDoc, doc } from '../firebase';
import { MessageSquare, Send, User } from 'lucide-react';
import { ChatRoom, ChatMessage, UserProfile } from '../types';
import { format } from 'date-fns';

const Messages: React.FC = () => {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    if (!profile) return;

    // Fetch all users to display names
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userMap: Record<string, UserProfile> = {};
      snapshot.docs.forEach(d => userMap[d.id] = d.data() as UserProfile);
      setUsers(userMap);
    });

    const q = query(collection(db, 'messages'), where('participants', 'array-contains', profile.uid), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom)));
    });

    return () => {
      unsubUsers();
      unsubscribe();
    };
  }, [profile]);

  useEffect(() => {
    if (!activeRoom) return;
    const q = query(collection(db, `messages/${activeRoom.id}/messages`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    });
    return () => unsubscribe();
  }, [activeRoom]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !profile) return;
    const msg = newMessage;
    setNewMessage('');
    
    await addDoc(collection(db, `messages/${activeRoom.id}/messages`), {
      senderId: profile.uid,
      text: msg,
      createdAt: serverTimestamp()
    });

    await updateDoc(doc(db, 'messages', activeRoom.id), {
      lastMessage: msg,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="h-[calc(100vh-12rem)] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex">
      {/* Rooms List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {rooms.map((room) => {
            const otherUserId = room.participants.find(p => p !== profile?.uid);
            const otherUser = otherUserId ? users[otherUserId] : null;
            return (
              <button 
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${activeRoom?.id === room.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {otherUser?.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm text-gray-900 truncate">{otherUser?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {activeRoom ? (
          <>
            <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                {users[activeRoom.participants.find(p => p !== profile?.uid) || '']?.name?.charAt(0)}
              </div>
              <span className="font-bold text-gray-900">
                {users[activeRoom.participants.find(p => p !== profile?.uid) || '']?.name}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === profile?.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                    msg.senderId === profile?.uid 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 shadow-sm rounded-tl-none'
                  }`}>
                    {msg.text}
                    <p className={`text-[10px] mt-1 ${msg.senderId === profile?.uid ? 'text-blue-200' : 'text-gray-400'}`}>
                      {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '...'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSendMessage} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
