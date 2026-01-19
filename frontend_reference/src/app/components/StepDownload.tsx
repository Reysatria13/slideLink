import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Download, FileText, Share2, Home } from 'lucide-react';
import { Button } from './ui/button';

interface StepDownloadProps {
  onReset: () => void;
  fileName: string;
}

export const StepDownload: React.FC<StepDownloadProps> = ({ onReset, fileName }) => {
  const translatedFileName = fileName.replace('.pptx', '_EN.pptx').replace('.ppt', '_EN.ppt');

  return (
    <div className="w-full max-w-2xl mx-auto text-center pt-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          delay={0.2}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <h2 className="text-3xl font-bold text-slate-800 mb-2">Translation Complete!</h2>
        <p className="text-slate-500 mb-8">Your file has been successfully processed and formatted.</p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#CC0000] rounded text-white flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800">{translatedFileName}</p>
              <p className="text-sm text-slate-500">PowerPoint Presentation • 2.4 MB</p>
            </div>
          </div>
          <Button className="bg-[#3A9A8A] hover:bg-[#2e7d70] text-white h-12 px-6 rounded-lg shadow-md transition-all hover:-translate-y-0.5">
            <Download className="mr-2 h-5 w-5" /> Download
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 border-slate-300 text-slate-600 hover:bg-slate-50">
            <Share2 className="mr-2 h-4 w-4" /> Share via Email
          </Button>
          <Button variant="ghost" onClick={onReset} className="h-12 text-slate-500 hover:text-slate-800">
            <Home className="mr-2 h-4 w-4" /> Translate Another File
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
