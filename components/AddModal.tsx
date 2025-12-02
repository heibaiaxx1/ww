import React, { useState } from 'react';
import { NewSupplementInput } from '../types';
import { parseSupplementText } from '../services/geminiService';
import { X, Sparkles, Plus, Loader2, ClipboardList, Wand2, Clock } from 'lucide-react';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: NewSupplementInput[]) => void;
}

const AddModal: React.FC<AddModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');
  const [isLoading, setIsLoading] = useState(false);
  
  // Manual State
  const [manualInput, setManualInput] = useState<NewSupplementInput>({
    name: '',
    dosage: '',
    frequency: 'Daily',
    notes: '',
    category: 'vitamin',
    reminderTime: ''
  });

  // AI State
  const [aiText, setAiText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<NewSupplementInput[] | null>(null);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.name) {
      onAdd([manualInput]);
      setManualInput({ name: '', dosage: '', frequency: 'Daily', notes: '', category: 'vitamin', reminderTime: '' });
      onClose();
    }
  };

  const handleAiAnalyze = async () => {
    if (!aiText.trim()) return;
    setIsLoading(true);
    setParsedPreview(null);
    try {
      const results = await parseSupplementText(aiText);
      setParsedPreview(results);
    } catch (error) {
      console.error(error);
      alert("AI Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAi = () => {
    if (parsedPreview && parsedPreview.length > 0) {
      onAdd(parsedPreview);
      setParsedPreview(null);
      setAiText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">添加补剂</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 mx-6 mt-4 rounded-xl">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ai' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI 智能导入
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'manual' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            手动添加
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'ai' ? (
            <div className="space-y-4">
              {!parsedPreview ? (
                <>
                  <label className="block text-sm font-medium text-slate-700">粘贴您的健康计划或医嘱</label>
                  <textarea
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none text-slate-600 text-sm"
                    placeholder="例如：每天早上8点吃一粒维他命C，晚上锻炼后吃两勺蛋白粉..."
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                  />
                  <div className="bg-indigo-50 p-3 rounded-lg flex items-start gap-3">
                     <Wand2 className="w-5 h-5 text-indigo-500 mt-0.5" />
                     <p className="text-xs text-indigo-700 leading-relaxed">
                        AI 将自动识别补剂名称、用量、频率以及<b>提醒时间</b>。支持中文自然语言。
                     </p>
                  </div>
                  <button
                    onClick={handleAiAnalyze}
                    disabled={isLoading || !aiText.trim()}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '开始分析'}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">识别结果 ({parsedPreview.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {parsedPreview.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                             <span>{item.dosage}</span>
                             {item.reminderTime && (
                               <span className="flex items-center text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                 <Clock className="w-3 h-3 mr-1" />
                                 {item.reminderTime}
                               </span>
                             )}
                          </div>
                        </div>
                        <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-400 uppercase">{item.category}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button 
                       onClick={() => setParsedPreview(null)}
                       className="flex-1 py-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-sm font-medium"
                    >
                        重新编辑
                    </button>
                    <button 
                       onClick={handleConfirmAi}
                       className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-200"
                    >
                        确认添加全部
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">名称</label>
                <input
                  required
                  type="text"
                  value={manualInput.name}
                  onChange={(e) => setManualInput({ ...manualInput, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                  placeholder="例如：Omega-3 鱼油"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">用量</label>
                    <input
                    type="text"
                    value={manualInput.dosage}
                    onChange={(e) => setManualInput({ ...manualInput, dosage: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                    placeholder="1000mg"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">分类</label>
                    <select
                    value={manualInput.category}
                    onChange={(e) => setManualInput({ ...manualInput, category: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm bg-white"
                    >
                        <option value="vitamin">维生素</option>
                        <option value="medicine">药物</option>
                        <option value="protein">健身/蛋白</option>
                        <option value="other">其他</option>
                    </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">频率描述</label>
                  <input
                    type="text"
                    value={manualInput.frequency}
                    onChange={(e) => setManualInput({ ...manualInput, frequency: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                    placeholder="每天一次"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">提醒时间</label>
                  <input
                    type="time"
                    value={manualInput.reminderTime}
                    onChange={(e) => setManualInput({ ...manualInput, reminderTime: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-5 h-5" /> 添加
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddModal;