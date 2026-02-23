import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Bot,
  ArrowRight,
  Globe2,
  Download,
  Loader2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Search,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as fabric from 'fabric';
import { TranslationPreviewItem, ChatResponse, ChatAction, ChatSource } from '@/types';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/useAppStore';

interface ChatMessage {
  role: 'user' | 'agent';
  message: string;
  thinking?: string[];
  sources?: ChatSource[];
  actions?: ChatAction[];
}

interface SlideWorkspaceProps {
  initialPrompt?: string;
  shapes?: TranslationPreviewItem[];
  slideWidth?: number;
  slideHeight?: number;
  onDownload?: () => void;
  onTranslate?: () => void;
}

export const SlideWorkspace = ({
  initialPrompt,
  shapes = [],
  slideWidth = 960,
  slideHeight = 540,
  onDownload,
  onTranslate
}: SlideWorkspaceProps) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  // Responsive canvas scaling — measure available space and fit 960x540 inside it
  useEffect(() => {
    const wrapper = canvasWrapperRef.current;
    if (!wrapper) return;

    const updateScale = () => {
      const padding = 48; // 24px each side
      const availW = wrapper.clientWidth - padding;
      const availH = wrapper.clientHeight - padding;
      const scale = Math.min(availW / 960, availH / 540, 1);
      setCanvasScale(scale);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Chat State
  const { sessionId } = useAppStore();
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'agent',
      message: `I've analyzed your data and generated the initial slides. Successfully extracted ${shapes.length} elements across ${Math.max(...shapes.map(s => s.slide_index || 0), 0) + 1} slide(s). You can ask me to edit styles, add content, or search the web for data.`,
      thinking: [
        `Parsed uploaded file content`,
        `Generated ${shapes.length} shape elements`,
        `Rendered to canvas at ${slideWidth}x${slideHeight}`,
      ],
    }
  ]);

  // Local mutable state for shapes so chat can edit them
  const [localShapes, setLocalShapes] = useState<TranslationPreviewItem[]>(shapes);

  // Calculate unique slides based on localShapes
  const slideCount = localShapes.length > 0 ? Math.max(...localShapes.map(s => s.slide_index || 0)) + 1 : 1;
  const currentShapes = localShapes.filter(s => (s.slide_index || 0) === currentSlideIndex);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Initialize Fabric.js
  useEffect(() => {
    if (!canvasRef.current) return;

    const scaleX = 960 / slideWidth;
    const scaleY = 540 / slideHeight;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: '#ffffff',
      selection: true,
    });

    if (currentShapes.length > 0) {
      currentShapes.forEach(shape => {
        const box = shape.bounding_box;
        const isText = shape.shape_type?.includes('TEXT') || shape.translated;

        const scaledLeft = box.left * scaleX;
        const scaledTop = box.top * scaleY;
        const scaledWidth = box.width * scaleX;
        const scaledHeight = box.height * scaleY;

        if (isText) {
           const fontSize = (shape.font_size_pt || 18) * 1.333 * scaleY;

           const tb = new fabric.Textbox(shape.translated || shape.original || 'Text', {
             left: scaledLeft,
             top: scaledTop,
             width: scaledWidth,
             fontSize: fontSize,
             fontFamily: 'Poppins',
             fill: shape.font_color || '#0f172a',
             backgroundColor: shape.bg_color || undefined,
             angle: shape.rotation || 0,
             editable: true,
             name: shape.shape_id.toString(),
           });
           canvas.add(tb);
        } else {
           const rect = new fabric.Rect({
             left: scaledLeft,
             top: scaledTop,
             width: scaledWidth,
             height: scaledHeight,
             fill: shape.bg_color || '#e2e8f0',
             opacity: shape.bg_color ? 1 : 0.4,
             angle: shape.rotation || 0,
             name: shape.shape_id.toString(),
           });
           canvas.add(rect);
        }
      });

      // Auto zoom-to-fit: if any objects overflow the 960x540 canvas,
      // apply a viewport transform to show all content
      canvas.renderAll();
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        objects.forEach(obj => {
          const rect = obj.getBoundingRect();
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.left + rect.width);
          maxY = Math.max(maxY, rect.top + rect.height);
        });

        const overflows = minX < -5 || minY < -5 || maxX > 965 || maxY > 545;
        if (overflows) {
          const contentW = maxX - minX;
          const contentH = maxY - minY;
          const pad = 30;
          const zoom = Math.min((960 - pad * 2) / contentW, (540 - pad * 2) / contentH, 1);
          const cx = (minX + maxX) / 2;
          const cy = (minY + maxY) / 2;
          canvas.setViewportTransform([
            zoom, 0, 0, zoom,
            960 / 2 - cx * zoom,
            540 / 2 - cy * zoom,
          ]);
        }
      }
    } else {
      const placeholder = new fabric.Textbox('No data provided yet', {
        left: 300, top: 250, fontSize: 24, fill: '#94a3b8'
      });
      canvas.add(placeholder);
    }

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [currentSlideIndex, localShapes, slideWidth, slideHeight]);

  const applyActions = (actions: ChatAction[]) => {
    let newShapes = [...localShapes];

    actions.forEach((action: ChatAction) => {
      switch (action.type) {
        case 'update_style':
          if (action.target_shape_id != null) {
            newShapes = newShapes.map(s => {
              if (s.shape_id === action.target_shape_id) {
                return {
                  ...s,
                  font_color: action.property === 'font_color' ? action.value : s.font_color,
                  bg_color: action.property === 'bg_color' ? action.value : s.bg_color,
                  font_size_pt: action.property === 'font_size_pt' && action.value ? parseFloat(action.value) : s.font_size_pt,
                };
              }
              return s;
            });
          }
          break;

        case 'update_text':
          if (action.target_shape_id != null && action.text) {
            newShapes = newShapes.map(s => {
              if (s.shape_id === action.target_shape_id) {
                return { ...s, translated: action.text as string };
              }
              return s;
            });
          }
          break;

        case 'add_shape': {
          const box = action.bounding_box || { left: 100, top: 100, width: 400, height: 80 };
          const newId = Math.max(...newShapes.map(s => s.shape_id), 0) + 1;
          const newShape: TranslationPreviewItem = {
            shape_id: newId,
            slide_index: action.slide_index ?? currentSlideIndex,
            shape_name: `Added ${action.shape_type || 'TEXT_BOX'}`,
            shape_type: action.shape_type || 'TEXT_BOX',
            rotation: 0,
            bg_color: undefined,
            font_color: action.value || '#0f172a',
            font_size_pt: 18,
            original: action.text || 'New Text',
            translated: action.text || 'New Text',
            char_count: (action.text || 'New Text').length,
            max_chars: 1000,
            fits_box: true,
            was_shortened: false,
            bounding_box: {
              left: box.left ?? 100,
              top: box.top ?? 100,
              width: box.width ?? 400,
              height: box.height ?? 80,
            },
          };
          newShapes.push(newShape);
          break;
        }

        case 'remove_shape':
          if (action.target_shape_id != null) {
            newShapes = newShapes.filter(s => s.shape_id !== action.target_shape_id);
          }
          break;

        case 'add_slide': {
          const newSlideIndex = slideCount;
          const box = action.bounding_box || { left: 80, top: 200, width: 800, height: 80 };
          const newId = Math.max(...newShapes.map(s => s.shape_id), 0) + 1;
          const titleShape: TranslationPreviewItem = {
            shape_id: newId,
            slide_index: newSlideIndex,
            shape_name: 'Generated TEXT_BOX',
            shape_type: 'TEXT_BOX',
            rotation: 0,
            font_color: '#0f172a',
            font_size_pt: 36,
            original: action.text || 'New Slide',
            translated: action.text || 'New Slide',
            char_count: (action.text || 'New Slide').length,
            max_chars: 1000,
            fits_box: true,
            was_shortened: false,
            bounding_box: {
              left: box.left ?? 80,
              top: box.top ?? 200,
              width: box.width ?? 800,
              height: box.height ?? 80,
            },
          };
          newShapes.push(titleShape);
          // Navigate to the new slide
          setCurrentSlideIndex(newSlideIndex);
          break;
        }
      }
    });

    setLocalShapes(newShapes);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !sessionId || isThinking) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    setIsThinking(true);

    try {
      const response: ChatResponse = await api.chat(sessionId, userMessage, localShapes);

      const agentMsg: ChatMessage = {
        role: 'agent',
        message: response.message,
        thinking: response.thinking,
        sources: response.sources,
        actions: response.actions,
      };
      setChatHistory(prev => [...prev, agentMsg]);

      if (response.actions && response.actions.length > 0) {
        applyActions(response.actions);
      }

    } catch (error) {
      console.error("Chat failed:", error);
      setChatHistory(prev => [...prev, { role: 'agent', message: 'Sorry, I encountered an error processing that request.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleThinking = (index: number) => {
    setExpandedThinking(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden text-[#0f172a]">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-6 z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="text-[#0d9488] font-bold text-xl tracking-tight">SlideLink</div>
          <div className="h-6 w-px bg-[#e2e8f0] mx-2" />
          <div className="text-[#475569] text-sm font-medium px-2 py-1 bg-[#f8fafc] rounded-md border border-[#e2e8f0] truncate max-w-sm">
            Prompt: {initialPrompt?.slice(0, 30) || 'Generate slides from data'}...
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onTranslate} variant="outline" className="text-[#475569] border-[#e2e8f0] hover:bg-[#f8fafc] flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#0d9488]" />
            Translate to EN
          </Button>
          <Button onClick={onDownload} className="bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PPTX
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agent Chat */}
        <div className="w-[380px] bg-[#020617] flex flex-col shrink-0 relative shadow-xl z-10 border-r border-[#1e293b] overflow-hidden">
          <div className="p-5 border-b border-[#1e293b]">
            <h2 className="text-[#f8fafc] text-base font-medium leading-snug truncate">
              {initialPrompt || "Generate slides from data"}
            </h2>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-5 space-y-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Avatar */}
                  <div className="mt-1 flex-shrink-0">
                    {msg.role === 'agent' ? (
                      <div className="w-7 h-7 rounded-full bg-[#0d9488]/20 flex items-center justify-center">
                        <Bot className="text-[#0d9488] w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#334155] flex items-center justify-center">
                        <User className="text-[#94a3b8] w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm leading-relaxed",
                      msg.role === 'agent' ? "text-[#f8fafc]/90" : "text-[#cbd5e1]"
                    )}>
                      {msg.message}
                    </div>

                    {/* Thinking Section (collapsible) */}
                    {msg.thinking && msg.thinking.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleThinking(idx)}
                          className="flex items-center gap-1 text-[#64748b] text-xs font-mono tracking-wider hover:text-[#94a3b8] transition-colors"
                        >
                          {expandedThinking[idx] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          THINKING ({msg.thinking.length} steps)
                        </button>
                        {expandedThinking[idx] && (
                          <div className="mt-2 space-y-1.5 pl-1 border-l-2 border-[#1e293b] ml-1">
                            {msg.thinking.map((step, i) => (
                              <div key={i} className="flex items-start gap-2 pl-2">
                                <ArrowRight className="w-3 h-3 text-[#475569] mt-0.5 shrink-0" />
                                <span className="text-[#94a3b8] text-xs">{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-1 text-[#64748b] text-xs font-mono tracking-wider mb-1">
                          <Search className="w-3 h-3" />
                          SOURCES
                        </div>
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[#0d9488] text-xs hover:text-[#14b8a6] transition-colors truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{src.title || src.url}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Actions Applied Indicator */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 bg-[#0f172a] border border-[#0d9488]/20 rounded-lg px-3 py-2">
                        <span className="text-[#0d9488] text-xs font-medium">
                          Applied {msg.actions.length} canvas action{msg.actions.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-[#0d9488]/20 flex items-center justify-center">
                      <Loader2 className="text-[#0d9488] w-4 h-4 animate-spin" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[#94a3b8] text-sm flex items-center gap-2">
                      <span>Thinking</span>
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#0d9488] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <div className="p-4 border-t border-[#1e293b] bg-[#020617]">
            <div className="relative">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isThinking}
                className="bg-[#0f172a] border border-[#1e293b] text-[#f8fafc] placeholder:text-[#64748b] focus-visible:ring-1 focus-visible:ring-[#0d9488] h-12 pr-10 rounded-xl"
                placeholder="Edit slides, search the web..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleChatSubmit();
                  }
                }}
              />
              <button
                onClick={handleChatSubmit}
                disabled={isThinking || !chatInput.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0d9488] disabled:hover:text-[#64748b] transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9]">
          {/* Editing Toolbar */}
          <div className="h-14 border-b border-[#e2e8f0] bg-white flex items-center px-4 gap-2 overflow-x-auto shrink-0 shadow-sm z-10">
            <Button variant="outline" size="sm" className="text-[#475569] bg-white hover:bg-[#f8fafc]">Select</Button>
            <Button variant="outline" size="sm" className="text-[#475569] bg-white hover:bg-[#f8fafc]">Add Text</Button>
            <Button variant="outline" size="sm" className="text-[#475569] bg-white hover:bg-[#f8fafc]">Add Shape</Button>
            <div className="w-px h-6 bg-[#e2e8f0] mx-2" />
            <div className="w-6 h-6 rounded-full bg-[#dc2626] ml-1 mr-1 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-[#e2e8f0] transition-all" />
            <div className="w-6 h-6 rounded-full bg-[#0d9488] ml-1 mr-1 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-[#e2e8f0] transition-all" />
            <div className="w-6 h-6 rounded-full bg-[#0f172a] ml-1 mr-1 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-[#e2e8f0] transition-all" />
          </div>

          {/* Canvas Wrapper */}
          <div ref={canvasWrapperRef} className="flex-1 overflow-hidden relative flex items-center justify-center">
            {/* Outer div takes the scaled layout size so centering works */}
            <div style={{ width: 960 * canvasScale, height: 540 * canvasScale }}>
              {/* Inner div is always 960x540 but visually scaled */}
              <div
                className="shadow-xl border border-[#e2e8f0] relative bg-white origin-top-left"
                style={{ width: 960, height: 540, transform: `scale(${canvasScale})` }}
              >
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>

          {/* Bottom Pagination Bar */}
          <div className="h-14 border-t border-[#e2e8f0] bg-white flex items-center justify-between px-6 shrink-0 shadow-[0_-1px_2px_rgba(0,0,0,0.02)] z-10">
            <div className="flex gap-4 text-sm font-medium text-[#64748b]">
              <button className="hover:text-[#1e293b] transition-colors">Notes</button>
              <button className="hover:text-[#1e293b] transition-colors">Timer</button>
            </div>

            <div className="flex items-center gap-2">
              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlideIndex(i)}
                  className={cn(
                    "w-10 h-8 rounded border flex items-center justify-center text-sm transition-all",
                    currentSlideIndex === i
                      ? "border-[#0d9488] text-[#0f766e] bg-[#f0fdfa] font-bold ring-1 ring-[#0d9488] shadow-sm"
                      : "border-[#e2e8f0] text-[#475569] hover:border-[#cbd5e1] hover:bg-[#f8fafc]"
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button className="w-10 h-8 rounded border border-dashed border-[#cbd5e1] flex items-center justify-center text-[#94a3b8] hover:text-[#475569] hover:border-[#94a3b8] transition-all">
                +
              </button>
              <div className="text-[#94a3b8] text-sm font-medium ml-4">
                {currentSlideIndex + 1} / {slideCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
