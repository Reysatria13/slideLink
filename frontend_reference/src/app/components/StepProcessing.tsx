import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Progress } from './ui/progress';

interface StepProcessingProps {
  onComplete: () => void;
  fileName: string;
}

export const StepProcessing: React.FC<StepProcessingProps> = ({ onComplete, fileName }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'extract' | 'translate' | 'layout' | 'complete'>('extract');

  useEffect(() => {
    // Simulation of processing stages
    const totalDuration = 5000; // 5 seconds total
    const intervalTime = 50;
    const steps = totalDuration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 30) setStage('extract');
      else if (newProgress < 70) setStage('translate');
      else if (newProgress < 100) setStage('layout');
      else {
        setStage('complete');
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  const stages = [
    { id: 'extract', label: 'Extracting Text', subLabel: 'テキスト抽出中' },
    { id: 'translate', label: 'Translating (AI)', subLabel: 'AI翻訳実行中' },
    { id: 'layout', label: 'Adjusting Layout', subLabel: 'レイアウト調整中' }
  ];

  return (
    <div className="w-full max-w-xl mx-auto text-center pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg border border-slate-100"
      >
        <div className="w-16 h-16 bg-[#3A9A8A]/10 text-[#3A9A8A] rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Processing Presentation</h2>
        <p className="text-slate-500 mb-8 flex items-center justify-center gap-2">
          <FileText size={16} />
          {fileName}
        </p>

        <div className="mb-8">
          <Progress value={progress} className="h-3 w-full bg-slate-100" indicatorClassName="bg-[#3A9A8A]" />
          <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
            <span>0%</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="space-y-4 text-left">
          {stages.map((s, idx) => {
            const isActive = stage === s.id;
            const isPast = stages.findIndex(item => item.id === stage) > idx || stage === 'complete';
            
            return (
              <div 
                key={s.id}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  isActive ? 'bg-[#3A9A8A]/5 border border-[#3A9A8A]/20' : 'bg-transparent'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                  ${isPast ? 'bg-[#3A9A8A] text-white' : isActive ? 'bg-white border-2 border-[#3A9A8A] text-[#3A9A8A]' : 'bg-slate-100 text-slate-300'}
                `}>
                  {isPast ? <CheckCircle2 size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : <span className="text-xs">{idx + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isActive || isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-400">{s.subLabel}</p>
                </div>
                {isActive && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[#3A9A8A] text-xs font-bold px-2 py-1 bg-white rounded shadow-sm"
                  >
                    Processing...
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
