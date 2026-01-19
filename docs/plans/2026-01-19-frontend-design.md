# SlideLink Frontend Design

## Overview

Build a complete frontend for SlideLink, a layout-preserving PowerPoint translation system. The frontend implements a 4-step wizard workflow matching the Figma design.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Server State**: TanStack Query (React Query)
- **Client State**: Zustand
- **Location**: `/frontend` directory

## Project Structure

```
/frontend
├── app/
│   ├── layout.tsx           # Root layout with header
│   ├── page.tsx             # Main app (step wizard)
│   ├── globals.css          # Tailwind + custom styles
│   └── providers.tsx        # React Query + Zustand providers
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/
│   │   └── Header.tsx       # SlideLink header with logo
│   ├── steps/
│   │   ├── StepIndicator.tsx
│   │   ├── StepUpload.tsx
│   │   ├── StepProcessing.tsx
│   │   ├── StepPreview.tsx
│   │   └── StepDownload.tsx
│   └── workspace/
│       ├── SlidePanel.tsx
│       ├── SlideViewer.tsx
│       ├── AIAssistant.tsx
│       └── CompareModal.tsx
├── lib/
│   ├── api.ts               # FastAPI client
│   └── utils.ts             # Helpers
├── stores/
│   └── useAppStore.ts       # Zustand store
└── types/
    └── index.ts             # TypeScript types
```

## Data Flow

1. User uploads file → `POST /upload` → Receives session_id + preview
2. Processing screen shows progress (simulated stages)
3. Preview loads translations → `GET /preview/{session_id}`
4. User edits → `PUT /preview/{session_id}`
5. Confirm → `POST /confirm/{session_id}`
6. Download → `GET /download/{session_id}`

## Component Specifications

### Header (60px height)
- Left: Logo icon + "SlideLink" + "スライドリンク"
- Right: "Enterprise Edition" badge + User avatar ("MK")

### Step Indicator
- 4 steps: Upload → Process → Preview → Download
- Active: Red/coral circle
- Completed: Checkmark
- Inactive: Gray circle

### Step 1 - Upload
- Centered card (672px width)
- Drag & drop zone with dashed border
- "Browse Files" button
- Security note card

### Step 2 - Processing
- Centered card (576px width)
- Spinning loader
- Progress bar (0-100%)
- Three stages with status icons

### Step 3 - Preview Workspace
- Left panel (200px): Slide thumbnails
- Center: Slide viewer with toggle (Original/Translated)
- Right panel (280px): AI Assistant insights
- Compare modal for side-by-side view

### Step 4 - Download
- Modal with completion message
- Download button
- "Start new translation" link

## API Integration

```typescript
const API_BASE = 'http://localhost:8000';

export const api = {
  upload: (file: File) => POST /upload
  getPreview: (sessionId: string) => GET /preview/{session_id}
  updateTranslation: (sessionId: string, edits: TranslationEdit[]) => PUT /preview/{session_id}
  confirm: (sessionId: string) => POST /confirm/{session_id}
  download: (sessionId: string) => GET /download/{session_id}
  deleteSession: (sessionId: string) => DELETE /session/{session_id}
}
```

## State Management

### Zustand Store
```typescript
interface AppState {
  currentStep: 1 | 2 | 3 | 4;
  sessionId: string | null;
  selectedSlide: number;
  viewMode: 'original' | 'translated';
  isCompareOpen: boolean;
  processingStage: 'extracting' | 'translating' | 'adjusting';
  processingProgress: number;
}
```

## Design Tokens (from Figma)

### Colors
- Primary (coral/red): `#DC2626` or similar
- Background: `#FFFFFF`
- Text primary: `#1F2937`
- Text secondary: `#6B7280`
- Border: `#E5E7EB`
- Success: `#10B981`
- Warning: `#F59E0B`
- Info: `#3B82F6`

### Typography
- Headings: Inter/System font
- Body: 14-16px
- Japanese text: Noto Sans JP fallback

## Error Handling
- Toast notifications for API errors
- Retry logic for uploads
- Session expiry → redirect to upload
- File validation (pptx only, size limits)
