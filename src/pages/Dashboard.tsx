import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  db, collection, query, where, onSnapshot
} from '../firebase';
import { 
  FileText, Users, CheckCircle, Clock, AlertCircle, 
  BarChart3, ArrowUpRight, Plus, Database, CheckCircle2 
} from 'lucide-react';
import { Proposal, Deadline } from '../types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { profile, isAdmin, isSupervisor, isStudent } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [recentProposals, setRecentProposals] = useState<Proposal[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!profile) return;

    let q;
    if (isStudent) {
      q = query(collection(db, 'proposals'), where('studentId', '==', profile.uid));
    } else if (isSupervisor) {
      q = query(collection(db, 'proposals'), where('supervisorId', '==', profile.uid));
    } else {
      q = query(collection(db, 'proposals'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const proposals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proposal));
      setRecentProposals(proposals.slice(0, 5));
      setConnected(true);
      
      const s = { total: proposals.length, approved: 0, pending: 0, rejected: 0 };
      proposals.forEach(p => {
        if (p.status === 'approved') s.approved++;
        else if (p.status === 'submitted') s.pending++;
        else if (p.status === 'rejected') s.rejected++;
      });
      setStats(s);
    });

    const dUnsubscribe = onSnapshot(collection(db, 'deadlines'), (snapshot) => {
      setDeadlines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deadline)));
    });

    return () => {
      unsubscribe();
      dUnsubscribe();
    };
  }, [profile, isStudent, isSupervisor]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <Database className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-mono">DB: ai-studio-f3b8ffbd-8627-443c-94c2-d923137e9b1f</span>
          {connected ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-600 font-bold">
              <AlertCircle className="w-3 h-3" /> Syncing...
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats.total} 
          icon={<FileText className="w-6 h-6 text-blue-600" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Approved" 
          value={stats.approved} 
          icon={<CheckCircle className="w-6 h-6 text-green-600" />} 
          color="bg-green-50"
        />
        <StatCard 
          title="Pending Review" 
          value={stats.pending} 
          icon={<Clock className="w-6 h-6 text-orange-600" />} 
          color="bg-orange-50"
        />
        <StatCard 
          title="Rejected" 
          value={stats.rejected} 
          icon={<AlertCircle className="w-6 h-6 text-red-600" />} 
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Proposals</h3>
            <Link to="/dashboard/proposals" className="text-blue-600 text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProposals.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No proposals found.</div>
            ) : (
              recentProposals.map((p) => (
                <div key={p.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">By {p.studentName}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      p.status === 'approved' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {p.status}
                    </span>
                    <Link to={`/dashboard/proposals/${p.id}`} className="p-2 hover:bg-gray-200 rounded-lg">
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Deadlines & Quick Actions */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {deadlines.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming deadlines.</p>
              ) : (
                deadlines.map((d) => (
                  <div key={d.id} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center text-[10px] font-bold">
                      <span className="text-red-500">{format(d.dueDate.toDate(), 'MMM')}</span>
                      <span>{format(d.dueDate.toDate(), 'dd')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{d.title}</p>
                      <p className="text-xs text-gray-500">{format(d.dueDate.toDate(), 'hh:mm a')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-blue-100 text-sm mb-6">Our AI Project Assistant is here to help you with your proposals and research.</p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
              Chat with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-6">
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
