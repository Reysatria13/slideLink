import React, { useState } from 'react';
import { Slide } from '../types';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  ZoomIn, ZoomOut, 
  MessageSquare, CheckCircle2, Edit3, Download, 
  ArrowLeft, Save, MoveRight, Type, LayoutTemplate, BarChart3,
  Columns, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from './ui/dialog';

interface SlideWorkspaceProps {
  slides: Slide[];
  isEditable?: boolean;
  onSlidesUpdate?: (slides: Slide[]) => void;
  onEdit?: () => void;
  onDownload?: () => void;
  onBack?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const SlideThumbnail = ({ 
  slide, 
  index, 
  isSelected, 
  onClick 
}: { 
  slide: Slide; 
  index: number; 
  isSelected: boolean; 
  onClick: () => void; 
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer group flex gap-3 p-3 transition-all hover:bg-slate-100 rounded-lg mx-2 mb-2",
        isSelected ? "bg-[#3A9A8A]/10 hover:bg-[#3A9A8A]/15 ring-1 ring-[#3A9A8A]" : "bg-transparent"
      )}
    >
      <div className="flex flex-col items-center gap-1 min-w-[24px]">
        <span className={cn(
          "text-xs font-semibold",
          isSelected ? "text-[#3A9A8A]" : "text-slate-400"
        )}>{index + 1}</span>
      </div>
      <div className="flex-1">
        <div className={cn(
          "aspect-video bg-white border rounded shadow-sm overflow-hidden relative transition-all",
          isSelected ? "border-[#3A9A8A] shadow-md" : "border-slate-200 group-hover:border-slate-300"
        )}>
          {/* Mini Thumbnail Content - Rendered at full resolution and scaled down */}
          <div 
             className="absolute top-0 left-0 origin-top-left pointer-events-none select-none flex flex-col p-12 bg-white"
             style={{ width: '960px', height: '540px', transform: 'scale(0.166666)' }}
          >
            <div className="h-2 w-20 bg-[#CC0000] mb-8" />
            <h3 className="text-4xl font-bold text-slate-800 mb-8 line-clamp-2 leading-tight">
                {slide.jpContent.title}
            </h3>
            <div className="space-y-4">
              {slide.jpContent.body.map((line, i) => (
                <p key={i} className="text-slate-500 font-medium text-2xl line-clamp-1">
                    {line}
                </p>
              ))}
            </div>
            
            {/* Visual cues for other types */}
            {slide.type === 'chart' && (
                <div className="absolute bottom-12 left-12 right-12 flex items-end justify-around h-40 opacity-50">
                    <div className="w-20 bg-slate-200 h-[40%] rounded-t" />
                    <div className="w-20 bg-slate-300 h-[60%] rounded-t" />
                    <div className="w-20 bg-[#3A9A8A] h-[80%] rounded-t" />
                </div>
            )}
            
            {slide.type === 'flowchart' && (
                <div className="absolute bottom-12 left-12 right-12 flex items-center gap-4 opacity-50">
                     <div className="h-24 flex-1 border-2 border-[#3A9A8A] rounded-xl" />
                     <MoveRight className="text-slate-300" size={48} />
                     <div className="h-24 flex-1 border-2 border-[#3A9A8A] rounded-xl" />
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SlideWorkspace = ({
  slides,
  isEditable = false,
  onSlidesUpdate,
  onEdit,
  onDownload,
  onBack,
  onSave,
  onCancel
}: SlideWorkspaceProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(85); 
  const [showAiPanel, setShowAiPanel] = useState(true);
  
  // New State for Simplified Layout (Option B)
  const [activeTab, setActiveTab] = useState<'jp' | 'en'>('en');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  const handleUpdateSlide = (updatedSlide: Slide) => {
    if (!onSlidesUpdate) return;
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = updatedSlide;
    onSlidesUpdate(newSlides);
  };

  const handleTitleChange = (val: string) => {
    handleUpdateSlide({
      ...currentSlide,
      enContent: { ...currentSlide.enContent, title: val }
    });
  };

  const handleBodyChange = (lineIndex: number, val: string) => {
    const newBody = [...currentSlide.enContent.body];
    newBody[lineIndex] = val;
    handleUpdateSlide({
      ...currentSlide,
      enContent: { ...currentSlide.enContent, body: newBody }
    });
  };

  const handleLabelChange = (labelIndex: number, val: string) => {
    if (!currentSlide.enContent.labels) return;
    const newLabels = [...currentSlide.enContent.labels];
    newLabels[labelIndex] = val;
    handleUpdateSlide({
      ...currentSlide,
      enContent: { ...currentSlide.enContent, labels: newLabels }
    });
  };

  // --- Render Helpers ---

  const renderVisualContent = (content: { title: string; body: string[]; labels?: string[] }, type: Slide['type'], isEn: boolean) => {
    const isEditMode = isEditable && isEn;

    return (
      <div className="flex-1 flex flex-col h-full relative select-none">
        {type === 'title' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-1.5 bg-[#CC0000] mb-6" />
            {isEditMode ? (
              <Input
                value={content.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-4xl font-bold text-slate-800 text-center border-none shadow-none bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#3A9A8A] h-auto py-2"
              />
            ) : (
              <h3 className="text-4xl font-bold text-slate-800">{content.title}</h3>
            )}
            
            <div className="space-y-4 w-full max-w-2xl">
              {content.body.map((line, i) => (
                <div key={i}>
                  {isEditMode ? (
                    <Input
                      value={line}
                      onChange={(e) => handleBodyChange(i, e.target.value)}
                      className="text-slate-500 font-medium text-xl text-center border-none shadow-none bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-1 focus:ring-[#3A9A8A] h-auto py-1"
                    />
                  ) : (
                    <p className="text-slate-500 font-medium text-xl">{line}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'agenda' && (
          <div className="flex-1 flex flex-col">
             <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-8 bg-[#3A9A8A]" />
                {isEditMode ? (
                   <Input value={content.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-2xl font-bold text-slate-800 border-none p-0 h-auto focus-visible:ring-0" />
                ) : (
                   <h3 className="text-2xl font-bold text-slate-800">{content.title}</h3>
                )}
             </div>
             <div className="flex-1 grid grid-cols-2 gap-12">
                <div className="bg-slate-50/50 p-8 rounded-xl border border-slate-100 flex flex-col justify-center gap-6">
                    {content.body.map((line, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#3A9A8A]/10 text-[#3A9A8A] flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {i + 1}
                            </div>
                            {isEditMode ? (
                               <Input 
                                 value={line.replace(/^\d+\.\s*/, '')} 
                                 onChange={(e) => handleBodyChange(i, (i+1)+'. '+e.target.value)} 
                                 className="text-slate-700 font-medium text-lg border-none bg-transparent focus:bg-white" 
                               />
                            ) : (
                               <span className="text-slate-700 font-medium text-lg">{line.replace(/^\d+\.\s*/, '')}</span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center">
                    <div className="w-48 h-48 rounded-full border-8 border-slate-100 flex items-center justify-center bg-slate-50">
                         <LayoutTemplate className="w-16 h-16 text-slate-300" />
                    </div>
                </div>
             </div>
          </div>
        )}

        {type === 'flowchart' && (
          <div className="flex-1 flex flex-col">
             <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-100">
                <span className="w-3 h-8 bg-[#CC0000]" />
                {isEditMode ? (
                   <Input value={content.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-2xl font-bold text-slate-800 border-none p-0 h-auto focus-visible:ring-0" />
                ) : (
                   <h3 className="text-2xl font-bold text-slate-800">{content.title}</h3>
                )}
             </div>
             <div className="flex-1 flex items-center justify-between px-4 gap-4">
                {content.labels?.map((label, i) => (
                    <div key={i} className="contents">
                        <div className="flex-1 h-32 bg-white border-2 border-[#3A9A8A] rounded-xl flex items-center justify-center p-4 shadow-sm relative group/box">
                            {isEditMode ? (
                                <Textarea 
                                  value={label} 
                                  onChange={(e) => handleLabelChange(i, e.target.value)} 
                                  className="text-base font-bold text-[#3A9A8A] text-center border-none shadow-none resize-none p-0 focus-visible:ring-0 h-full flex items-center justify-center"
                                />
                            ) : (
                                <span className="text-base font-bold text-[#3A9A8A] text-center">{label}</span>
                            )}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 text-xs text-slate-400 font-bold border border-slate-100 rounded-full">
                                STEP 0{i+1}
                            </div>
                        </div>
                        {i < (content.labels?.length || 0) - 1 && (
                            <div className="px-2 text-slate-300">
                                <MoveRight size={32} />
                            </div>
                        )}
                    </div>
                ))}
             </div>
          </div>
        )}

        {type === 'chart' && (
          <div className="flex-1 flex flex-col">
             <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
                <span className="w-3 h-8 bg-[#3A9A8A]" />
                {isEditMode ? (
                   <Input value={content.title} onChange={(e) => handleTitleChange(e.target.value)} className="text-2xl font-bold text-slate-800 border-none p-0 h-auto focus-visible:ring-0" />
                ) : (
                   <h3 className="text-2xl font-bold text-slate-800">{content.title}</h3>
                )}
             </div>
             <div className="flex-1 relative pl-12 pb-12 border-l border-b border-slate-200 ml-4">
                <div className="absolute inset-0 flex items-end justify-around px-8 pt-8">
                     <div className="w-20 h-[40%] bg-slate-200 rounded-t-md relative group/bar" />
                     <div className="w-20 h-[60%] bg-slate-300 rounded-t-md relative group/bar" />
                     <div className="w-20 h-[75%] bg-[#3A9A8A]/60 rounded-t-md relative group/bar" />
                     <div className="w-20 h-[90%] bg-[#3A9A8A] rounded-t-md relative group/bar" />
                </div>
             </div>
             <div className="mt-4 flex justify-end">
                {isEditMode ? (
                    <Input value={content.body[0]} onChange={(e) => handleBodyChange(0, e.target.value)} className="text-right text-sm text-slate-400 border-none w-48" />
                ) : (
                    <p className="text-right text-sm text-slate-400">{content.body[0]}</p>
                )}
             </div>
          </div>
        )}
      </div>
    );
  };

  const SlideCard = ({ isEn, className }: { isEn: boolean; className?: string }) => (
    <div className={cn(
        "aspect-video bg-white shadow-lg border rounded-xl overflow-hidden flex flex-col relative",
         isEn && isEditable ? "ring-2 ring-[#3A9A8A] ring-offset-4 border-[#3A9A8A]" : "border-slate-200",
         className
    )}>
        <div className={cn("h-1.5", isEn ? "bg-[#3A9A8A]" : "bg-[#CC0000]")} />
        <div className={cn(
            "absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1",
            isEn 
                ? "bg-[#3A9A8A]/10 text-[#3A9A8A] border-[#3A9A8A]/20" 
                : "bg-slate-100 text-slate-500 border-slate-200"
        )}>
            {isEn ? (isEditable ? <><Edit3 size={10} /> EDITING (EN)</> : "TRANSLATED (EN)") : "ORIGINAL (JP)"}
        </div>
        
        {/* Slide Content */}
        <div className="flex-1 p-12 overflow-hidden">
            {renderVisualContent(isEn ? currentSlide.enContent : currentSlide.jpContent, currentSlide.type, isEn)}
        </div>

            {/* Bottom Bar */}
        <div className="h-10 border-t border-slate-100 bg-slate-50 flex items-center justify-between px-6 shrink-0">
            <span className="text-[10px] text-slate-400">CONFIDENTIAL</span>
            {isEn && (
                <div className="flex items-center gap-2">
                    <Checkbox id={`reviewed-${currentSlideIndex}`} className="h-3 w-3" />
                    <label htmlFor={`reviewed-${currentSlideIndex}`} className="text-[10px] text-slate-500 font-medium cursor-pointer">Mark as reviewed</label>
                </div>
            )}
            {!isEn && (
                <span className="text-[10px] text-slate-400">{currentSlideIndex + 1}</span>
            )}
        </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      {/* Top Bar for Workspace */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-800">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-slate-700">
                    Slide {currentSlideIndex + 1} <span className="text-slate-400">of {slides.length}</span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-3">
             {/* Actions */}
            {isEditable ? (
                 <>
                    <Button variant="outline" onClick={onCancel} className="text-slate-600">
                        Cancel
                    </Button>
                    <Button onClick={onSave} className="bg-[#3A9A8A] hover:bg-[#2e7d70] text-white">
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                 </>
            ) : (
                <>
                    <Button variant="outline" onClick={onEdit} className="border-[#3A9A8A] text-[#3A9A8A] hover:bg-[#3A9A8A]/5">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Translation
                    </Button>
                    <Button onClick={onDownload} className="bg-[#CC0000] hover:bg-[#A30000] text-white shadow-sm shadow-red-200">
                        <Download className="mr-2 h-4 w-4" /> Confirm & Download
                    </Button>
                </>
            )}
            
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={cn("ml-2 relative", showAiPanel ? "bg-slate-100 text-[#3A9A8A]" : "text-slate-400")}
            >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#CC0000] rounded-full border-2 border-white" />
            </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Thumbnails */}
        <div className="w-[200px] flex-shrink-0 bg-[#f8f9fa] border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slides</h3>
            </div>
            <ScrollArea className="flex-1 py-4">
                {slides.map((slide, idx) => (
                    <SlideThumbnail 
                        key={slide.id} 
                        slide={slide} 
                        index={idx} 
                        isSelected={idx === currentSlideIndex} 
                        onClick={() => setCurrentSlideIndex(idx)} 
                    />
                ))}
            </ScrollArea>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-[#eef0f2] relative flex flex-col overflow-hidden">
            
            {/* Tab Bar - Centered above canvas */}
            <div className="flex justify-center pt-4 pb-2 relative z-10">
                <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 flex items-center gap-1">
                    <button
                        onClick={() => setActiveTab('jp')}
                        className={cn(
                            "px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2",
                            activeTab === 'jp' ? "bg-slate-100 text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Original (JP)
                    </button>
                    <button
                        onClick={() => setActiveTab('en')}
                        className={cn(
                            "px-4 py-1.5 text-sm font-bold rounded-md transition-all flex items-center gap-2",
                            activeTab === 'en' ? "bg-[#3A9A8A]/10 text-[#3A9A8A] shadow-sm ring-1 ring-[#3A9A8A]/20" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        Translated (EN)
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-1" />
                    <button
                        onClick={() => setIsCompareOpen(true)}
                        className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-[#3A9A8A] hover:bg-slate-50 rounded-md transition-all flex items-center gap-2"
                    >
                        <Columns size={14} />
                        Compare
                    </button>
                </div>
            </div>

            {/* Canvas Area (Single Slide View) */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
                <motion.div 
                    layout
                    key={activeTab} // Animate switch
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: zoomLevel / 100 }}
                    transition={{ duration: 0.2 }}
                    className="origin-center shadow-2xl"
                    style={{ width: 960 }} // Fixed base width for scale
                >
                    <SlideCard isEn={activeTab === 'en'} />
                </motion.div>
                
                 {/* Zoom Toolbar Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-full px-4 py-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setZoomLevel(Math.max(20, zoomLevel - 10))}>
                        <ZoomOut className="h-4 w-4 text-slate-500" />
                    </Button>
                    <span className="text-xs font-medium text-slate-600 min-w-[3ch] text-center">{zoomLevel}%</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}>
                        <ZoomIn className="h-4 w-4 text-slate-500" />
                    </Button>
                </div>
            </div>
        </div>

        {/* Right AI Panel (Collapsible) */}
        <AnimatePresence>
            {showAiPanel && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="bg-white border-l border-slate-200 flex flex-col shadow-xl z-10"
                >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-br from-[#3A9A8A] to-[#2c7a6b] text-white p-1.5 rounded-md">
                                <MessageSquare size={14} />
                            </div>
                            <h3 className="font-bold text-slate-700 text-sm">AI Assistant</h3>
                        </div>
                        <div className="bg-[#CC0000] text-white text-[10px] font-bold px-1.5 rounded-full">3</div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg">
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="text-orange-500 mt-0.5"><Type size={14} /></div>
                                    <span className="text-xs font-bold text-orange-700">Text Overflow Risk</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    The title "Business Process Reform" might be too long for the container on mobile devices. Consider shortening to "Process Reform".
                                </p>
                            </div>

                             <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="text-blue-500 mt-0.5"><BarChart3 size={14} /></div>
                                    <span className="text-xs font-bold text-blue-700">Data Insight</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    The chart labels have been automatically converted to English standard units (Millions).
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <div className="flex items-start gap-2 mb-2">
                                    <div className="text-slate-500 mt-0.5"><CheckCircle2 size={14} /></div>
                                    <span className="text-xs font-bold text-slate-700">Tone Analysis</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Translation tone is consistent with "Professional / Formal" setting.
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Comparison Modal Overlay */}
      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 bg-[#eef0f2] overflow-hidden flex flex-col sm:max-w-none">
            <DialogHeader className="h-14 bg-white border-b border-slate-200 flex flex-row items-center justify-between px-6 shrink-0 space-y-0">
                <DialogTitle className="font-bold text-slate-700 flex items-center gap-2">
                    <Columns size={18} className="text-[#3A9A8A]" />
                    Side-by-Side Comparison
                </DialogTitle>
                <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full mr-8">
                        <span className="w-2 h-2 rounded-full bg-[#CC0000]" />
                        <span className="text-xs font-bold text-slate-600">Original</span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span className="w-2 h-2 rounded-full bg-[#3A9A8A]" />
                        <span className="text-xs font-bold text-slate-600">Translated</span>
                        </div>
                        {/* Close button is automatically added by DialogContent */}
                </div>
            </DialogHeader>
            <div className="flex-1 w-full h-full overflow-auto flex flex-col items-center justify-center bg-slate-50/50 relative p-4">
                {/* Accessibility Description */}
                <DialogDescription className="sr-only">
                    Side-by-side comparison view: Original Japanese slide on the left, Translated English slide on the right.
                </DialogDescription>

                {/* Scaled Container - Adjusted for better fit on standard laptop screens */}
                <div className="flex gap-4 md:gap-8 items-center justify-center origin-center transition-transform duration-300 scale-[0.35] md:scale-[0.45] lg:scale-[0.55] xl:scale-[0.65] 2xl:scale-[0.85]">
                    <div className="w-[960px] h-[540px] shrink-0 shadow-lg rounded-lg overflow-hidden bg-white ring-1 ring-slate-200">
                        <SlideCard isEn={false} />
                    </div>
                    <div className="w-[960px] h-[540px] shrink-0 shadow-lg rounded-lg overflow-hidden bg-white ring-1 ring-slate-200">
                        <SlideCard isEn={true} />
                    </div>
                </div>
            </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};
