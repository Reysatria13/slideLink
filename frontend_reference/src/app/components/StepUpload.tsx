import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface StepUploadProps {
  onUpload: (files: File[]) => void;
}

const LANGUAGES = [
  { value: 'ja', label: 'Japanese' },
  { value: 'en', label: 'English' },
  { value: 'id', label: 'Indonesian' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
];

export const StepUpload: React.FC<StepUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [inputLang, setInputLang] = useState('ja');
  const [targetLang, setTargetLang] = useState('en');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-powerpoint': ['.ppt']
    },
    maxFiles: 1,
    noClick: true // We handle click manually with the button
  });

  const handleContinue = () => {
    if (file) {
      onUpload([file]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Presentation</h2>
        <p className="text-slate-500">Select your presentation and translation settings.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
      >
        <div 
          {...getRootProps()} 
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[240px]",
            isDragActive ? "border-[#3A9A8A] bg-[#3A9A8A]/5" : "border-slate-300 hover:border-[#3A9A8A] hover:bg-slate-50",
            file ? "bg-slate-50 border-slate-200 border-solid" : ""
          )}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-[#3A9A8A]/10 text-[#3A9A8A] rounded-full flex items-center justify-center mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 max-w-md truncate px-4">
                {file.name}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex gap-3">
                 <Button 
                    variant="outline" 
                    onClick={handleRemoveFile}
                    className="text-slate-500 hover:text-red-500 hover:bg-red-50 border-slate-200"
                  >
                    <X className="w-4 h-4 mr-2" /> Remove
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={open}
                    className="text-[#3A9A8A] border-[#3A9A8A] hover:bg-[#3A9A8A]/5"
                  >
                    Replace File
                  </Button>
              </div>
            </motion.div>
          ) : (
            <>
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                isDragActive ? "bg-[#3A9A8A] text-white" : "bg-slate-100 text-slate-400"
              )}>
                <UploadCloud size={32} />
              </div>

              <h3 className="text-lg font-semibold text-slate-700 mb-1">
                {isDragActive ? 'Drop the file here' : 'Drag & drop your PPT file'}
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                Supports .pptx and .ppt formats. Maximum file size 50MB.
              </p>

              <Button 
                onClick={open}
                className="bg-[#CC0000] hover:bg-[#A30000] text-white shadow-sm shadow-red-200"
              >
                Browse Files
              </Button>
            </>
          )}
        </div>

        <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-slate-600">Input Language</Label>
                    <Select value={inputLang} onValueChange={setInputLang}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-[#CC0000]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            {LANGUAGES.map(lang => (
                                <SelectItem key={`in-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-600">Target Language</Label>
                    <Select value={targetLang} onValueChange={setTargetLang}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-[#3A9A8A]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                             {LANGUAGES.map(lang => (
                                <SelectItem key={`out-${lang.value}`} value={lang.value}>{lang.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Button 
                onClick={handleContinue}
                disabled={!file}
                className={cn(
                    "w-full h-12 text-base font-bold shadow-md transition-all",
                    file 
                        ? "bg-[#3A9A8A] hover:bg-[#2c7a6b] text-white shadow-teal-200" 
                        : "bg-slate-100 text-slate-400 shadow-none cursor-not-allowed"
                )}
            >
                Continue to Processing <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
      </motion.div>
    </div>
  );
};
