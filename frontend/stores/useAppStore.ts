import { create } from 'zustand';
import type { Step, ViewMode, ProcessingStage, TranslationPreviewItem } from '@/types';

interface AppState {
  // Navigation
  currentStep: Step;
  setCurrentStep: (step: Step) => void;

  // Session
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // File info
  fileName: string | null;
  setFileName: (name: string | null) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
  slideWidth: number;
  setSlideWidth: (width: number) => void;
  slideHeight: number;
  setSlideHeight: (height: number) => void;

  // Processing
  processingStage: ProcessingStage;
  setProcessingStage: (stage: ProcessingStage) => void;
  processingProgress: number;
  setProcessingProgress: (progress: number) => void;

  // Preview
  translations: TranslationPreviewItem[];
  setTranslations: (translations: TranslationPreviewItem[]) => void;
  updateTranslation: (shapeId: number, newText: string) => void;

  // Workspace
  selectedSlide: number;
  setSelectedSlide: (slide: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // Download
  downloadUrl: string | null;
  setDownloadUrl: (url: string | null) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentStep: 1 as Step,
  sessionId: null,
  fileName: null,
  slideCount: 0,
  slideWidth: 960, // Default 16:9
  slideHeight: 540,
  processingStage: 'extracting' as ProcessingStage,
  processingProgress: 0,
  translations: [],
  selectedSlide: 0,
  viewMode: 'translated' as ViewMode,
  isCompareOpen: false,
  zoomLevel: 85,
  downloadUrl: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),
  setSessionId: (id) => set({ sessionId: id }),
  setFileName: (name) => set({ fileName: name }),
  setSlideCount: (count) => set({ slideCount: count }),
  setSlideWidth: (width) => set({ slideWidth: width }),
  setSlideHeight: (height) => set({ slideHeight: height }),
  setProcessingStage: (stage) => set({ processingStage: stage }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  setTranslations: (translations) => set({ translations }),
  updateTranslation: (shapeId, newText) =>
    set((state) => ({
      translations: state.translations.map((t) =>
        t.shape_id === shapeId ? { ...t, translated: newText } : t
      ),
    })),
  setSelectedSlide: (slide) => set({ selectedSlide: slide }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsCompareOpen: (open) => set({ isCompareOpen: open }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setDownloadUrl: (url) => set({ downloadUrl: url }),

  reset: () => set(initialState),
}));
