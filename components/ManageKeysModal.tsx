
import React, { useState } from 'react';
import { X, Key, Trash2, Plus, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rtdb, ref, push, set, remove } from '../services/firebase';
import { APIKeyRecord } from '../types';

interface ManageKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManageKeysModal: React.FC<ManageKeysModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'Gemini' | 'Groq'>('Gemini');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleAddKey = async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const keysRef = ref(rtdb, `users/${user.uid}/apiKeys`);
      const newKeyRef = push(keysRef);
      const newKey: APIKeyRecord = {
        id: newKeyRef.key || '',
        label: label || (activeTab === 'Gemini' ? 'My Gemini Key' : 'My Groq Key'),
        key: apiKey,
        provider: activeTab,
        createdAt: new Date().toISOString()
      };
      await set(newKeyRef, newKey);
      setApiKey('');
      setLabel('');
    } catch (err) {
      console.error("Error adding key:", err);
      alert("Failed to save key. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Remove this API key?")) return;
    try {
      await remove(ref(rtdb, `users/${user.uid}/apiKeys/${id}`));
    } catch (err) {
      console.error("Error deleting key:", err);
    }
  };

  const filteredKeys = Object.values(profile?.apiKeys || {}).filter(k => k.provider === activeTab);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 leading-none">Manage API Keys</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Manage your AI provider keys securely.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-50">
          <button 
            onClick={() => setActiveTab('Gemini')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'Gemini' ? 'border-green-500 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={16} /> Gemini
          </button>
          <button 
            onClick={() => setActiveTab('Groq')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-b-2 ${activeTab === 'Groq' ? 'border-green-500 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Cpu size={16} /> Groq(Beta)
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="min-h-[100px] flex flex-col gap-3">
            {filteredKeys.length > 0 ? filteredKeys.map(k => (
              <div key={k.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group animate-in slide-in-from-top-2">
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{k.label}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">••••••••{k.key.slice(-4)}</p>
                </div>
                <button onClick={() => handleDeleteKey(k.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            )) : (
              <div className="py-10 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                <p className="text-sm text-slate-400 font-medium tracking-tight">No {activeTab} keys saved. Add one below.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
            <div className="flex items-center gap-2 text-slate-700 mb-2">
              <Plus size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Add New {activeTab} Key</span>
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-white border border-slate-100 flex items-center justify-center"><Plus size={12} /></div>
              </div>
              <input 
                type="text" 
                placeholder="Label (Optional, e.g. 'Production')" 
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-6 text-sm text-slate-800 focus:outline-none focus:border-green-500/40 transition-all shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <Key size={16} />
                </div>
                <input 
                  type="password" 
                  placeholder={`Enter ${activeTab} API Key`} 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-6 text-sm text-slate-800 focus:outline-none focus:border-green-500/40 transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={handleAddKey}
                disabled={loading || !apiKey}
                className="px-6 py-3.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-300 disabled:opacity-50 transition-all active:scale-95"
              >
                Add Key
              </button>
            </div>

            <a 
              href={activeTab === 'Gemini' ? "https://aistudio.google.com/app/apikey" : "https://console.groq.com/keys"} 
              target="_blank" 
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-500 hover:underline uppercase tracking-widest"
            >
              Get {activeTab} API Key from here <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-10 py-3.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-slate-300 transition-all active:scale-95">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageKeysModal;
