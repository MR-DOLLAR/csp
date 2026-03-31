import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, collection, onSnapshot, addDoc, serverTimestamp } from '../firebase';
import { Timestamp } from 'firebase/firestore';
import { Plus, Calendar, Trash2, X } from 'lucide-react';
import { Deadline } from '../types';
import { format } from 'date-fns';

const Deadlines: React.FC = () => {
  const { profile, isSupervisor, isAdmin } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    dueDate: '',
    target: 'all_students'
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'deadlines'), (snapshot) => {
      setDeadlines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deadline)));
    });
    return () => unsubscribe();
  }, []);

  const handleAddDeadline = async () => {
    if (!newDeadline.title || !newDeadline.dueDate || !profile) return;
    await addDoc(collection(db, 'deadlines'), {
      title: newDeadline.title,
      dueDate: Timestamp.fromDate(new Date(newDeadline.dueDate)),
      createdBy: profile.uid,
      target: newDeadline.target,
      createdAt: serverTimestamp()
    });
    setShowAddModal(false);
    setNewDeadline({ title: '', dueDate: '', target: 'all_students' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Project Deadlines</h1>
        {(isSupervisor || isAdmin) && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-5 h-5" />
            Set New Deadline
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deadlines.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
            <p>No deadlines set yet.</p>
          </div>
        ) : (
          deadlines.map((d) => (
            <div key={d.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-xs font-bold uppercase">{format(d.dueDate.toDate(), 'MMM')}</span>
                <span className="text-2xl font-black text-blue-700">{format(d.dueDate.toDate(), 'dd')}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{d.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{format(d.dueDate.toDate(), 'EEEE, hh:mm a')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    Target: {d.target}
                  </span>
                  {(isSupervisor || isAdmin) && (
                    <button className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Set New Deadline</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500" 
                  value={newDeadline.title}
                  onChange={(e) => setNewDeadline({...newDeadline, title: e.target.value})}
                  placeholder="e.g., Final Report Submission"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Due Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500" 
                  value={newDeadline.dueDate}
                  onChange={(e) => setNewDeadline({...newDeadline, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Group</label>
                <select 
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                  value={newDeadline.target}
                  onChange={(e) => setNewDeadline({...newDeadline, target: e.target.value})}
                >
                  <option value="all_students">All Students</option>
                  <option value="CSE">CSE Department</option>
                  <option value="ECE">ECE Department</option>
                </select>
              </div>
            </div>
            <button 
              onClick={handleAddDeadline}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              Create Deadline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deadlines;
