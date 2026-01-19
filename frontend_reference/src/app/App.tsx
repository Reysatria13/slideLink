import React, { useState } from 'react';
import { Header } from './components/Header';
import { StepUpload } from './components/StepUpload';
import { StepProcessing } from './components/StepProcessing';
import { StepPreview } from './components/StepPreview';
import { StepEdit } from './components/StepEdit';
import { StepDownload } from './components/StepDownload';
import { FlowchartVisual } from './components/FlowchartVisual';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { Slide } from './types';

const INITIAL_SLIDES: Slide[] = [
  {
    id: 1,
    type: 'title',
    jpContent: { title: '2025年度 事業戦略', body: ['株式会社グローバル・テック', '代表取締役社長 山田 太郎'] },
    enContent: { title: 'FY2025 Business Strategy', body: ['Global Tech Inc.', 'CEO Taro Yamada'] }
  },
  {
    id: 2,
    type: 'agenda',
    jpContent: { title: '本日のアジェンダ', body: ['1. 市場環境分析', '2. 成長戦略の柱', '3. 数値目標', '4. 実行計画'] },
    enContent: { title: 'Agenda', body: ['1. Market Analysis', '2. Growth Strategy Pillars', '3. Numerical Targets', '4. Action Plan'] }
  },
  {
    id: 3,
    type: 'flowchart',
    jpContent: { 
      title: '業務プロセス改革', 
      body: [], 
      labels: ['現状分析', '課題特定', 'ソリューション策定', '実行・検証'] 
    },
    enContent: { 
      title: 'Business Process Reform', 
      body: [], 
      labels: ['Current Analysis', 'Identify Issues', 'Develop Solution', 'Execute & Verify'] 
    }
  },
  {
    id: 4,
    type: 'chart',
    jpContent: { title: '売上予測 (2023-2026)', body: ['単位: 百万円'] },
    enContent: { title: 'Sales Forecast (2023-2026)', body: ['Unit: Million JPY'] }
  }
];

type Step = 'upload' | 'processing' | 'preview' | 'edit' | 'download';

const App = () => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);

  const handleUpload = (files: File[]) => {
    setFile(files[0]);
    setCurrentStep('processing');
  };

  const handleProcessingComplete = () => {
    setCurrentStep('preview');
  };

  const handleSlidesUpdateOnly = (updatedSlides: Slide[]) => {
    setSlides(updatedSlides);
  };

  const handleEditComplete = () => {
    setCurrentStep('preview');
  };

  const STEPS = [
    { id: 'upload', label: 'Upload' },
    { id: 'processing', label: 'Process' },
    { id: 'preview', label: 'Preview' },
    { id: 'download', label: 'Download' }
  ];

  const getStepStatus = (stepId: string) => {
    const stepOrder = ['upload', 'processing', 'preview', 'download'];
    const currentOrder = stepOrder.indexOf(currentStep === 'edit' ? 'preview' : currentStep);
    const thisOrder = stepOrder.indexOf(stepId);

    if (thisOrder < currentOrder) return 'complete';
    if (thisOrder === currentOrder) return 'active';
    return 'inactive';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <Header />
      
      {/* Compact Stepper */}
      <div className="bg-white border-b border-slate-200 z-40 shadow-sm relative">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute left-0 top-1/2 w-full h-px bg-slate-200 -z-10" />
            
            {STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              return (
                <div key={step.id} className="flex flex-col items-center bg-white px-2 group">
                   <div className="flex items-center gap-2">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                        ${status === 'complete' ? 'bg-[#3A9A8A] text-white' : 
                          status === 'active' ? 'bg-[#CC0000] text-white shadow-lg shadow-red-100 scale-110' : 
                          'bg-slate-100 text-slate-400 border border-slate-200'}
                      `}>
                        {status === 'complete' ? <Check size={10} /> : index + 1}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${status === 'inactive' ? 'text-slate-400' : 'text-slate-700'}`}>
                        {step.label}
                      </span>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="pt-10 flex-1"
            >
              <div className="max-w-7xl mx-auto px-6">
                 <StepUpload onUpload={handleUpload} />
              </div>
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
               <div className="max-w-7xl mx-auto px-6 pt-10">
                 <StepProcessing 
                    onComplete={handleProcessingComplete} 
                    fileName={file?.name || 'presentation.pptx'} 
                  />
               </div>
            </motion.div>
          )}

          {currentStep === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col"
            >
              <StepPreview 
                slides={slides}
                onEdit={() => setCurrentStep('edit')}
                onDownload={() => setCurrentStep('download')}
                onBack={() => setCurrentStep('upload')}
              />
            </motion.div>
          )}

          {currentStep === 'edit' && (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 flex flex-col"
            >
              <StepEdit 
                slides={slides}
                onSlidesUpdate={handleSlidesUpdateOnly}
                onSave={handleEditComplete}
                onCancel={() => setCurrentStep('preview')}
              />
            </motion.div>
          )}

          {currentStep === 'download' && (
            <motion.div 
              key="download"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
               <div className="max-w-7xl mx-auto px-6 pt-10">
                  <StepDownload 
                    onReset={() => {
                      setFile(null);
                      setCurrentStep('upload');
                      setSlides(INITIAL_SLIDES);
                    }}
                    fileName={file?.name || 'presentation.pptx'}
                  />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Conditionally render architecture viewer only on upload/processing/download to avoid cluttering workspace */}
      {currentStep !== 'preview' && currentStep !== 'edit' && <FlowchartVisual />}
    </div>
  );
};

export default App;
