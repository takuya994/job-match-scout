import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.DEFINE_CRITERIA, label: '設定 (Criteria)' },
    { id: AppStep.SEARCH_COMPANIES, label: '企業検索 (Search)' },
    { id: AppStep.ANALYZE_JOBS, label: '求人分析 (Analyze)' },
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold
                  ${isActive ? 'border-indigo-600 bg-indigo-600 text-white' : ''}
                  ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                  ${!isActive && !isCompleted ? 'border-slate-300 text-slate-400' : ''}
                `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;