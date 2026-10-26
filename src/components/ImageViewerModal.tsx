import React from 'react';
import { useStore } from '../store/useStore';
import { X, Download, ExternalLink } from 'lucide-react';

export const ImageViewerModal: React.FC = () => {
  const { previewImageUrl, setPreviewImageUrl } = useStore();

  if (!previewImageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative max-w-xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/60 text-white border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300">Pratinjau Foto Bukti / Visual</span>
          <div className="flex items-center gap-2">
            <a
              href={previewImageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Buka Tab Baru"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-slate-950/90 min-h-[300px]">
          <img
            src={previewImageUrl}
            alt="Foto Bukti"
            className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-lg"
          />
        </div>

      </div>
    </div>
  );
};
