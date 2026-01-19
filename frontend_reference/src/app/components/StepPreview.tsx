import React from 'react';
import { Slide } from '../types';
import { SlideWorkspace } from './SlideWorkspace';

interface StepPreviewProps {
  slides: Slide[];
  onEdit: () => void;
  onDownload: () => void;
  onBack: () => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({ slides, onEdit, onDownload, onBack }) => {
  return (
    <div className="h-full bg-slate-50">
      <SlideWorkspace 
        slides={slides}
        isEditable={false}
        onEdit={onEdit}
        onDownload={onDownload}
        onBack={onBack}
      />
    </div>
  );
};
