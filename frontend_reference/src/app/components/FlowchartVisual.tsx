import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import flowchartImg from 'figma:asset/a8979c0944fcb42765ff2e91325793b4e140e85f.png';

export const FlowchartVisual = () => {
  const [isOpen,UJsoOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white p-4 rounded-lg shadow-xl border border-slate-200 w-[400px] max-h-[60vh] overflow-auto"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-2">System Architecture</h3>
            <div className="rounded border border-slate-100 overflow-hidden">
               <img src={flowchartImg} alt="SlideLink Process Flowchart" className="w-full h-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button 
        onClick={() => UJsoOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full shadow-lg transition-colors text-sm font-medium"
      >
        <Info size={16} />
        {isOpen ? 'Hide Architecture' : 'View Architecture'}
        {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
    </div>
  );
};
