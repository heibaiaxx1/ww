import React from 'react';
import { Supplement } from '../types';
import { Check, Pill, Trash2, Clock, FileText, Bell } from 'lucide-react';

interface SupplementCardProps {
  item: Supplement;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const SupplementCard: React.FC<SupplementCardProps> = ({ item, onToggle, onDelete }) => {
  const getIconColor = (category?: string) => {
    switch (category) {
      case 'vitamin': return 'text-orange-500 bg-orange-100';
      case 'medicine': return 'text-blue-500 bg-blue-100';
      case 'protein': return 'text-purple-500 bg-purple-100';
      default: return 'text-emerald-500 bg-emerald-100';
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event from bubbling to the card click
    // Using a simple window.confirm inside the handler
    if (window.confirm(`确定要删除 "${item.name}" 吗?`)) {
      onDelete(item.id);
    }
  };

  return (
    <div 
      onClick={() => onToggle(item.id)}
      className={`
        relative group flex items-start p-4 mb-3 rounded-2xl border transition-all duration-300 cursor-pointer
        ${item.taken 
          ? 'bg-slate-50 border-slate-100 opacity-75' 
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }
      `}
    >
      {/* Icon */}
      <div className={`p-3 rounded-xl mr-4 ${getIconColor(item.category)}`}>
        <Pill className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-lg truncate ${item.taken ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {item.name}
        </h3>
        
        <div className="flex flex-wrap gap-3 mt-1 text-sm">
          <span className="flex items-center text-slate-500">
            <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">
              {item.dosage}
            </span>
          </span>
          {item.reminderTime && (
            <span className={`flex items-center text-xs px-1.5 py-0.5 rounded ${item.taken ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-600'}`}>
              <Bell className="w-3 h-3 mr-1" />
              {item.reminderTime}
            </span>
          )}
          {item.frequency && (
             <span className="flex items-center text-slate-400 text-xs truncate">
             <Clock className="w-3 h-3 mr-1" /> {item.frequency}
           </span>
          )}
        </div>

        {item.notes && (
          <div className="mt-2 text-xs text-slate-400 flex items-start truncate">
             <FileText className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
             <span className="truncate">{item.notes}</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex flex-col items-end gap-3 pl-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className={`
            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
            ${item.taken 
              ? 'bg-emerald-500 text-white scale-110 shadow-emerald-200' 
              : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
            }
          `}
        >
          <Check className="w-5 h-5" />
        </button>
        
        {/* Improved Delete Button with larger hit area */}
        <button
          onClick={handleDeleteClick}
          className="text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg p-2 transition-colors z-10"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SupplementCard;