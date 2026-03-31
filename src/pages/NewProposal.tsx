import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { ArrowLeft, Save, Send, Plus, X } from 'lucide-react';

const NewProposal: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    introduction: '',
    objectives: [''],
    methodology: '',
    platforms: [''],
    keywords: [''],
    references: ['']
  });

  const handleAddField = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const handleRemoveField = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (field: keyof typeof formData, index: number, value: string) => {
    const newList = [...(formData[field] as string[])];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!formData.title.trim()) return alert("Title is required");
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'proposals'), {
        ...formData,
        studentId: profile?.uid,
        studentName: profile?.name,
        status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate('/dashboard/proposals');
    } catch (error) {
      console.error("Error submitting proposal", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Proposals
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => handleSubmit('draft')}
            disabled={loading}
            className="px-6 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Save Draft
          </button>
          <button 
            onClick={() => handleSubmit('submitted')}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-100"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Submit Proposal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Project Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="Enter a descriptive project title"
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-lg font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Introduction</label>
          <textarea 
            rows={4}
            value={formData.introduction}
            onChange={(e) => setFormData({...formData, introduction: e.target.value})}
            placeholder="Provide a brief overview of the project..."
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dynamic Fields: Objectives */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-bold text-gray-700">Objectives</label>
            <button onClick={() => handleAddField('objectives')} className="text-blue-600 text-sm font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Objective
            </button>
          </div>
          <div className="space-y-3">
            {formData.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2">
                <input 
                  type="text" 
                  value={obj}
                  onChange={(e) => handleFieldChange('objectives', i, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder={`Objective ${i + 1}`}
                />
                <button onClick={() => handleRemoveField('objectives', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Methodology</label>
          <textarea 
            rows={4}
            value={formData.methodology}
            onChange={(e) => setFormData({...formData, methodology: e.target.value})}
            placeholder="Describe the technical approach and tools..."
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Platforms & Keywords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-gray-700">Platforms/Tools</label>
              <button onClick={() => handleAddField('platforms')} className="text-blue-600 text-sm font-bold flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {formData.platforms.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    value={p}
                    onChange={(e) => handleFieldChange('platforms', i, e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={() => handleRemoveField('platforms', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-gray-700">Keywords</label>
              <button onClick={() => handleAddField('keywords')} className="text-blue-600 text-sm font-bold flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {formData.keywords.map((k, i) => (
                <div key={i} className="flex gap-2">
                  <input 
                    type="text" 
                    value={k}
                    onChange={(e) => handleFieldChange('keywords', i, e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={() => handleRemoveField('keywords', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProposal;
