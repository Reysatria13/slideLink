'use client';

import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { SlideData } from '@/types';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: SlideData | null;
}

export function CompareModal({ isOpen, onClose, slide }: CompareModalProps) {
  if (!slide) return null;

  // Get text content for display
  const titleShape = slide.shapes.find(
    (s) => s.original.length > 0 && s.original.length < 100
  );
  const subtitleShapes = slide.shapes.filter(
    (s) => s.original.length > 0 && s !== titleShape
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1500px] h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <DialogTitle>Side-by-Side Comparison</DialogTitle>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-gray-600">Original</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">Translated</span>
            </div>
          </div>
        </DialogHeader>

        {/* Comparison Content */}
        <div className="flex-1 flex items-center justify-center gap-8 p-8 bg-gray-100 overflow-auto">
          {/* Original Slide */}
          <SlideCard
            title={titleShape?.original || ''}
            subtitles={subtitleShapes.map((s) => s.original)}
            badge="ORIGINAL (JP)"
            badgeColor="gray"
          />

          {/* Translated Slide */}
          <SlideCard
            title={titleShape?.translated || ''}
            subtitles={subtitleShapes.map((s) => s.translated)}
            badge="TRANSLATED (EN)"
            badgeColor="green"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SlideCardProps {
  title: string;
  subtitles: string[];
  badge: string;
  badgeColor: 'gray' | 'green';
}

function SlideCard({ title, subtitles, badge, badgeColor }: SlideCardProps) {
  return (
    <Card className="w-[600px] aspect-[16/9] bg-white shadow-lg overflow-hidden">
      {/* Top accent bar */}
      <div className="h-[5px] bg-red-500" />

      {/* Content */}
      <div className="relative h-full p-8 flex flex-col">
        {/* Badge */}
        <div
          className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium rounded ${
            badgeColor === 'gray'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {badge}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
          <div className="w-16 h-1 bg-red-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <div className="space-y-2">
            {subtitles.slice(0, 2).map((text, i) => (
              <p key={i} className="text-lg text-gray-600">
                {text}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
          CONFIDENTIAL
        </div>
      </div>
    </Card>
  );
}
