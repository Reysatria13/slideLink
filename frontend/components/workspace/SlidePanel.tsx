'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { TranslationPreviewItem, SlideData } from '@/types';

interface SlidePanelProps {
  slides: SlideData[];
  selectedSlide: number;
  onSlideSelect: (slideIndex: number) => void;
}

export function SlidePanel({
  slides,
  selectedSlide,
  onSlideSelect,
}: SlidePanelProps) {
  return (
    <div className="w-[200px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">Slides</h3>
      </div>

      {/* Slide List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {slides.map((slide, index) => (
            <button
              key={slide.slideIndex}
              onClick={() => onSlideSelect(slide.slideIndex)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left',
                selectedSlide === slide.slideIndex
                  ? 'bg-red-50 ring-2 ring-red-500'
                  : 'hover:bg-gray-50'
              )}
            >
              {/* Slide Number */}
              <span className="text-xs text-gray-500 mt-1">{index + 1}</span>

              {/* Slide Thumbnail Preview */}
              <div className="flex-1 bg-white border border-gray-200 rounded aspect-[16/9] p-2 overflow-hidden">
                <SlideThumbnail shapes={slide.shapes} />
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Mini slide thumbnail component
function SlideThumbnail({ shapes }: { shapes: TranslationPreviewItem[] }) {
  // Get the first shape's text as title (simplified preview)
  const titleShape = shapes.find((s) => s.original.length > 0);
  const subtitleShape = shapes.find(
    (s) => s.original.length > 0 && s !== titleShape
  );

  return (
    <div className="h-full flex flex-col justify-center items-center text-center">
      {/* Fake red header bar */}
      <div className="w-1/3 h-0.5 bg-red-500 mb-2" />

      {/* Title preview */}
      {titleShape && (
        <p className="text-[6px] font-medium text-gray-800 line-clamp-2 mb-1">
          {titleShape.original.slice(0, 30)}
        </p>
      )}

      {/* Subtitle preview */}
      {subtitleShape && (
        <p className="text-[5px] text-gray-500 line-clamp-2">
          {subtitleShape.original.slice(0, 40)}
        </p>
      )}
    </div>
  );
}
