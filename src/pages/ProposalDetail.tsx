import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  db, doc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp
} from '../firebase';
import { 
  ArrowLeft, FileText, CheckCircle, XCircle, MessageSquare, Send, Award, Clock, X, Upload 
} from 'lucide-react';
import { Proposal, Comment, Evaluation, Report } from '../types';
import { format } from 'date-fns';

const ProposalDetail: React.FC = () => {
  const { proposalId } = useParams();
  const { profile, isSupervisor, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [newComment, setNewComment] = useState('');
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    pdfUrl: '',
    pptUrl: ''
  });
  const [evalForm, setEvalForm] = useState({
    innovation: 0,
    implementation: 0,
    documentation: 0,
    presentation: 0,
    remarks: ''
  });

  useEffect(() => {
    if (!proposalId) return;

    const unsubProposal = onSnapshot(doc(db, 'proposals', proposalId), (doc) => {
      if (doc.exists()) setProposal({ id: doc.id, ...doc.data() } as Proposal);
    });

    const unsubComments = onSnapshot(
      query(collection(db, `proposals/${proposalId}/comments`), orderBy('createdAt', 'asc')),
      (snapshot) => setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment)))
    );

    const unsubReports = onSnapshot(
      query(collection(db, `proposals/${proposalId}/reports`), orderBy('uploadedAt', 'desc')),
      (snapshot) => setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report)))
    );

    const unsubEval = onSnapshot(
      collection(db, `proposals/${proposalId}/evaluations`),
      (snapshot) => {
        if (!snapshot.empty) setEvaluation({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Evaluation);
      }
    );

    return () => {
      unsubProposal();
      unsubComments();
      unsubReports();
      unsubEval();
    };
  }, [proposalId]);

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!proposalId) return;
    await updateDoc(doc(db, 'proposals', proposalId), { status, updatedAt: serverTimestamp() });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !proposalId || !profile) return;
    await addDoc(collection(db, `proposals/${proposalId}/comments`), {
      staffId: profile.uid,
      staffName: profile.name,
      message: newComment,
      createdAt: serverTimestamp()
    });
    setNewComment('');
  };

  const handleEvaluation = async () => {
    if (!proposalId || !profile) return;
    const total = evalForm.innovation + evalForm.implementation + evalForm.documentation + evalForm.presentation;
    let grade = 'F';
    if (total >= 90) grade = 'S';
    else if (total >= 80) grade = 'A';
    else if (total >= 70) grade = 'B';
    else if (total >= 60) grade = 'C';
    else if (total >= 50) grade = 'D';

    await addDoc(collection(db, `proposals/${proposalId}/evaluations`), {
      staffId: profile.uid,
      ...evalForm,
      total,
      grade,
      evaluatedAt: serverTimestamp()
    });
    setShowEvalModal(false);
  };

  const handleUploadReport = async () => {
    if (!proposalId || !profile || !uploadForm.pdfUrl || !uploadForm.pptUrl) return;
    
    const nextVersion = reports.length > 0 ? Math.max(...reports.map(r => r.version)) + 1 : 1;
    
    await addDoc(collection(db, `proposals/${proposalId}/reports`), {
      ...uploadForm,
      version: nextVersion,
      uploadedAt: serverTimestamp()
    });
    
    setUploadForm({ pdfUrl: '', pptUrl: '' });
    setShowUploadModal(false);
  };

  if (!proposal) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex gap-4">
          {isSupervisor && proposal.status === 'submitted' && (
            <>
              <button onClick={() => handleStatusUpdate('rejected')} className="px-6 py-2 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50">
                Reject
              </button>
              <button onClick={() => handleStatusUpdate('approved')} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                Approve
              </button>
            </>
          )}
          {isSupervisor && proposal.status === 'approved' && !evaluation && (
            <button onClick={() => setShowEvalModal(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              Evaluate Project
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                proposal.status === 'approved' ? 'bg-green-100 text-green-700' :
                proposal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {proposal.status}
              </span>
              <span className="text-sm text-gray-500">
                Submitted {format(proposal.createdAt.toDate(), 'MMM dd, yyyy')}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{proposal.title}</h1>
            
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Introduction</h3>
                <p className="text-gray-700 leading-relaxed">{proposal.introduction}</p>
              </section>
              
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Objectives</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {proposal.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Methodology</h3>
                <p className="text-gray-700 leading-relaxed">{proposal.methodology}</p>
              </section>

              <div className="grid grid-cols-2 gap-8">
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposal.platforms.map((p, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">{p}</span>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposal.keywords.map((k, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm">{k}</span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Project Reports
              </h3>
              {profile?.uid === proposal.studentId && proposal.status === 'approved' && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" /> Upload New Version
                </button>
              )}
            </div>
            {reports.length === 0 ? (
              <p className="text-gray-500 text-sm">No reports uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Version {r.version}</p>
                        <p className="text-xs text-gray-500">{format(r.uploadedAt.toDate(), 'MMM dd, yyyy HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a href={r.pdfUrl} target="_blank" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50">PDF</a>
                      <a href={r.pptUrl} target="_blank" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50">PPT</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Feedback & Evaluation */}
        <div className="space-y-8">
          {/* Evaluation Result */}
          {evaluation && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Evaluation Result</h3>
                <Award className="w-6 h-6" />
              </div>
              <div className="text-center mb-6">
                <p className="text-5xl font-black">{evaluation.grade}</p>
                <p className="text-blue-200 text-sm mt-1">Score: {evaluation.total}/100</p>
              </div>
              <div className="space-y-2 text-sm text-blue-100">
                <div className="flex justify-between"><span>Innovation</span><span>{evaluation.innovation}/20</span></div>
                <div className="flex justify-between"><span>Implementation</span><span>{evaluation.implementation}/30</span></div>
                <div className="flex justify-between"><span>Documentation</span><span>{evaluation.documentation}/25</span></div>
                <div className="flex justify-between"><span>Presentation</span><span>{evaluation.presentation}/25</span></div>
              </div>
              <div className="mt-6 pt-6 border-t border-blue-500/30">
                <p className="text-xs text-blue-200 uppercase font-bold mb-2">Remarks</p>
                <p className="text-sm italic">"{evaluation.remarks}"</p>
              </div>
            </div>
          )}

          {/* Comments / Feedback */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Feedback
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{c.staffName}</span>
                    <span className="text-[10px] text-gray-400">{format(c.createdAt.toDate(), 'HH:mm')}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700">
                    {c.message}
                  </div>
                </div>
              ))}
            </div>
            {(isSupervisor || isAdmin) && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add feedback..."
                    className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleAddComment} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evaluation Modal */}
      {showEvalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Project Evaluation</h3>
              <button onClick={() => setShowEvalModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Innovation (20)</label>
                <input type="number" max={20} className="w-full px-4 py-2 bg-gray-50 rounded-xl" value={evalForm.innovation} onChange={(e) => setEvalForm({...evalForm, innovation: +e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Implementation (30)</label>
                <input type="number" max={30} className="w-full px-4 py-2 bg-gray-50 rounded-xl" value={evalForm.implementation} onChange={(e) => setEvalForm({...evalForm, implementation: +e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Documentation (25)</label>
                <input type="number" max={25} className="w-full px-4 py-2 bg-gray-50 rounded-xl" value={evalForm.documentation} onChange={(e) => setEvalForm({...evalForm, documentation: +e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Presentation (25)</label>
                <input type="number" max={25} className="w-full px-4 py-2 bg-gray-50 rounded-xl" value={evalForm.presentation} onChange={(e) => setEvalForm({...evalForm, presentation: +e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Remarks</label>
              <textarea className="w-full px-4 py-2 bg-gray-50 rounded-xl" rows={3} value={evalForm.remarks} onChange={(e) => setEvalForm({...evalForm, remarks: e.target.value})} />
            </div>
            <button onClick={handleEvaluation} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              Submit Evaluation
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Upload Project Report</h3>
              <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <p className="text-sm text-gray-500">
              Submit the latest version of your project documentation. This will be saved as Version {reports.length > 0 ? Math.max(...reports.map(r => r.version)) + 1 : 1}.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">PDF Report URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/report.pdf"
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500" 
                  value={uploadForm.pdfUrl} 
                  onChange={(e) => setUploadForm({...uploadForm, pdfUrl: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">PPT Presentation URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/presentation.ppt"
                  className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500" 
                  value={uploadForm.pptUrl} 
                  onChange={(e) => setUploadForm({...uploadForm, pptUrl: e.target.value})} 
                />
              </div>
            </div>
            <button 
              onClick={handleUploadReport}
              disabled={!uploadForm.pdfUrl || !uploadForm.pptUrl}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              Submit Version {reports.length > 0 ? Math.max(...reports.map(r => r.version)) + 1 : 1}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalDetail;
