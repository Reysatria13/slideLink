import React from 'react';
import { Layers } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-[#1e293b] text-white py-3 px-6 flex items-center justify-between h-[60px] z-50 relative">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#CC0000] rounded flex items-center justify-center">
          <Layers className="text-white w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight leading-none">
            SlideLink
          </h1>
          <span className="text-sm text-slate-400 border-l border-slate-600 pl-2">
            スライドリンク
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400">Enterprise Edition</span>
        <div className="w-8 h-8 rounded-full bg-[#3A9A8A] flex items-center justify-center text-white font-semibold text-xs">
          MK
        </div>
      </div>
    </header>
  );
};
