import React from 'react';
import { Layers } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-[#1a1a2e] text-white py-3 px-6 flex items-center justify-between shadow-md h-[60px] z-50 relative">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#CC0000] rounded flex items-center justify-center shadow-sm">
          <Layers className="text-white w-5 h-5" />
        </div>
        <div>
            <h1 className="text-lg font-bold tracking-tight leading-none flex items-center gap-2">
                SlideLink 
                <span className="text-xs font-normal text-slate-400 border-l border-slate-600 pl-2">スライドリンク</span>
            </h1>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-300">
        <span className="hidden sm:inline-block">Enterprise Edition</span>
        <div className="w-8 h-8 rounded-full bg-[#3A9A8A] flex items-center justify-center text-white font-semibold text-xs border-2 border-[#1a1a2e] ring-2 ring-[#3A9A8A]/30">
          MK
        </div>
      </div>
    </header>
  );
};
