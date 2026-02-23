// API Response Types (matching FastAPI backend)

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface TranslationPreviewItem {
  shape_id: number;
  slide_index: number;
  shape_name: string;
  shape_type: string;
  rotation: number;
  bg_color?: string;
  font_color?: string;
  font_size_pt?: number;
  original: string;
  translated: string;
  char_count: number;
  max_chars: number;
  fits_box: boolean;
  was_shortened: boolean;
  bounding_box: BoundingBox;
}

export interface UploadResponse {
  session_id: string;
  source_lang: string;
  target_lang: string;
  slide_count: number;
  shape_count: number;
  slide_width_px?: number;
  slide_height_px?: number;
  preview: TranslationPreviewItem[];
}

export interface PreviewResponse {
  session_id: string;
  source_lang: string;
  target_lang: string;
  preview: TranslationPreviewItem[];
}

export interface TranslationEdit {
  shape_id: number;
  slide_index: number;
  translated: string;
}

export interface PreviewUpdateRequest {
  translations: TranslationEdit[];
}

export interface ConfirmResponse {
  session_id: string;
  download_url: string;
  message: string;
}

export interface ChatAction {
  type: string;
  target_shape_id?: number;
  slide_index?: number;
  property?: string;
  value?: string;
  text?: string;
  shape_type?: string;
  bounding_box?: Record<string, number>;
}

export interface ChatSource {
  title: string;
  url: string;
}

export interface ChatResponse {
  message: string;
  thinking: string[];
  actions: ChatAction[];
  sources: ChatSource[];
}

export interface ErrorResponse {
  detail: string;
}

// Frontend State Types

export type Step = 1 | 2 | 3 | 4;

export type ViewMode = 'original' | 'translated';

export type ProcessingStage = 'extracting' | 'translating' | 'adjusting' | 'complete';

export interface SlideData {
  slideIndex: number;
  shapes: TranslationPreviewItem[];
}

export interface AIInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
}

// New types for the redesigned workspace
export interface SlideContent {
  title: string;
  body: string[];
  labels?: string[];
}

export interface Slide {
  id: number;
  type: 'title' | 'agenda' | 'flowchart' | 'chart';
  jpContent: SlideContent;
  enContent: SlideContent;
  shapes: TranslationPreviewItem[]; // Keep the original shapes data
}
