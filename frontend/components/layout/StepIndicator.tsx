'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Step } from '@/types';

interface StepIndicatorProps {
  currentStep: Step;
}

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Process' },
  { id: 3, label: 'Download' },
] as const;

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="bg-white border-b border-slate-200 py-4">
      <div className="max-w-4xl mx-auto px-8">
        <div className="flex items-center">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step: Circle + Label */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300',
                      isCurrent && 'bg-[#CC0000] text-white shadow-[0_4px_14px_rgba(204,0,0,0.4)]',
                      isCompleted && 'bg-[#CC0000] text-white',
                      !isCurrent && !isCompleted && 'bg-slate-100 text-slate-400 border border-slate-200'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold uppercase tracking-wider',
                      isCurrent && 'text-slate-800',
                      isCompleted && 'text-slate-800',
                      !isCurrent && !isCompleted && 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connecting Line */}
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-[2px] w-full bg-slate-200 rounded-full" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
