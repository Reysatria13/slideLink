import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Plus, Wrench, Mic, CornerDownLeft, Loader2, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface StartPageProps {
  onGenerate: (prompt: string, file: File | null) => void;
  isGenerating: boolean;
}

export function StartPage({ onGenerate, isGenerating }: StartPageProps) {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    maxFiles: 1,
  });

  const handleSubmit = () => {
    if (prompt.trim() || file) {
      onGenerate(prompt, file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex flex-col items-center justify-center p-4 relative overflow-hidden" {...getRootProps()}>
      <input {...getInputProps()} />
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
          SlideLink AI Workspace <span className="text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-md text-2xl">2.0</span>
        </h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-3xl z-10"
      >
        {/* Chat Input Container */}
        <div className="bg-[#2c2c2e] border border-white/10 rounded-2xl p-2 relative shadow-2xl transition-all focus-within:border-primary-500/50 focus-within:ring-1 focus-within:ring-primary-500/50 flex flex-col">
          
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder="Ask anything, create anything..."
            className="w-full bg-transparent border-none text-white placeholder:text-white/40 resize-none min-h-[120px] p-4 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Attached File Preview - Moved into flow */}
          {file && (
            <div className="mx-4 mb-4 flex items-center gap-2 bg-[#3c3c3e] px-3 py-2 rounded-xl border border-white/10 w-fit">
              <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-white/90 text-xs font-semibold truncate max-w-[200px]">{file.name}</span>
                <span className="text-white/40 text-[10px] font-medium tracking-tight uppercase">{file.name.split('.').pop()?.toUpperCase() || 'File'} • {(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <button 
                onClick={() => setFile(null)} 
                className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={open}
                disabled={isGenerating}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/5 transition-colors">
                <Wrench className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isGenerating || (!prompt.trim() && !file)}
                className={cn(
                  "px-4 h-10 rounded-xl flex items-center justify-center transition-all",
                  (prompt.trim() || file) && !isGenerating
                    ? "bg-primary-500 hover:bg-primary-600 text-white" 
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CornerDownLeft className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Personalized Tools Banner */}
        <div className="bg-[#242426] border border-white/5 border-t-0 rounded-b-xl mx-4 px-4 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
             {/* Mock Icons for Google Workspace tools */}
            <div className="flex gap-2 opacity-80">
               <div className="w-5 h-5 bg-blue-500 rounded-sm" />
               <div className="w-5 h-5 bg-green-500 rounded-sm" />
               <div className="w-5 h-5 bg-yellow-500 rounded-sm" />
            </div>
            <span className="text-sm text-white/50 font-medium">SlideLink supports enterprise tools integration</span>
          </div>
          <button className="text-white/40 hover:text-white/80">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}