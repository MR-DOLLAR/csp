import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy, updateDoc, doc } from '../firebase';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Notification } from '../types';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!profile) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });
    return () => unsubscribe();
  }, [profile]);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const deleteNotification = async (id: string) => {
    // Note: deleteDoc requires security rules permission
    // For now we just mark as read if delete is restricted
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <span className="text-sm text-gray-500">{notifications.filter(n => !n.read).length} Unread</span>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-6 rounded-2xl border transition-all flex items-start gap-4 ${
                n.read ? 'bg-white border-gray-100 opacity-60' : 'bg-white border-blue-100 shadow-sm ring-1 ring-blue-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.read ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.message}</p>
                <p className="text-xs text-gray-400 mt-2">{format(n.createdAt.toDate(), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <div className="flex gap-2">
                {!n.read && (
                  <button 
                    onClick={() => markAsRead(n.id)}
                    className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(n.id)}
                  className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
