'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { StartPage } from '@/components/steps/StartPage';
import { SlideWorkspace } from '@/components/workspace/SlideWorkspace';
import { useAppStore } from '@/stores/useAppStore';
import { api, ApiError } from '@/lib/api';

export default function Home() {
  const [appState, setAppState] = useState<'start' | 'generating' | 'workspace'>('start');
  const [prompt, setPrompt] = useState('');
  
  const { setSessionId, translations, setTranslations, setSlideWidth, setSlideHeight, slideWidth, slideHeight } = useAppStore();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, promptText }: { file: File, promptText: string }) => {
      // We default to ja->en for the prototype, but this uses the REAL backend!
      return api.upload(file, 'ja', 'en', promptText);
    },
    onSuccess: (data) => {
      setSessionId(data.session_id);
      setTranslations(data.preview); // This is the Slide JSON Schema
      setSlideWidth(data.slide_width_px || 960);
      setSlideHeight(data.slide_height_px || 540);
      setAppState('workspace');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? `Upload failed: ${error.message}` : 'Upload failed. Ensure you are uploading a valid file.');
      setAppState('start');
    },
  });

  const handleGenerate = (newPrompt: string, file: File | null) => {
    if (!file) {
      toast.error("For this prototype, please upload a data file to generate from.");
      return;
    }
    setPrompt(newPrompt);
    setAppState('generating');
    
    // Call the actual Python backend with any file and prompt
    uploadMutation.mutate({ file, promptText: newPrompt });
  };

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {(appState === 'start' || appState === 'generating') && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <StartPage onGenerate={handleGenerate} isGenerating={appState === 'generating'} />
          </motion.div>
        )}
        
        {appState === 'workspace' && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <SlideWorkspace 
              initialPrompt={prompt} 
              shapes={translations} // Pass the real backend data
              slideWidth={slideWidth}
              slideHeight={slideHeight}
              onDownload={() => toast.success("Downloading PPTX...")} 
              onTranslate={() => toast.success("Translation triggered...")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}