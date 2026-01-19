import React from 'react';
import { Slide } from '../types';
import { SlideWorkspace } from './SlideWorkspace';

interface StepEditProps {
  slides: Slide[];
  onSlidesUpdate: (updatedSlides: Slide[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const StepEdit: React.FC<StepEditProps> = ({ slides, onSlidesUpdate, onSave, onCancel }) => {
  return (
    <div className="h-full bg-slate-50">
      <SlideWorkspace 
        slides={slides}
        isEditable={true}
        onSlidesUpdate={onSlidesUpdate}
        onSave={onSave}
        onCancel={onCancel}
        onBack={onCancel}
      />
    </div>
  );
};
