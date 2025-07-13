import React, { useState } from 'react';
import { OperationType, ListType } from '../types';

interface ControlsProps {
  onOperate: (type: OperationType, value: number) => void;
  isAnimating: boolean;
  listSize: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  currentStep: number | null;
  totalSteps: number;
  listType: ListType;
  onListTypeChange: (type: ListType) => void;
}

const ListTypeSelector: React.FC<{ listType: ListType; onListTypeChange: (type: ListType) => void; disabled: boolean }> = ({ listType, onListTypeChange, disabled }) => {
  const getButtonClass = (type: ListType) => {
    const isActive = listType === type;
    return `
      w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;
  };

  return (
    <div className="flex w-full max-w-sm mx-auto p-1 bg-gray-100 rounded-lg mb-4">
      <button onClick={() => onListTypeChange('singly')} className={getButtonClass('singly')} disabled={disabled}>Singly Linked</button>
      <button onClick={() => onListTypeChange('doubly')} className={getButtonClass('doubly')} disabled={disabled}>Doubly Linked</button>
    </div>
  );
};


export const Controls: React.FC<ControlsProps> = ({ 
  onOperate, 
  isAnimating, 
  listSize, 
  onNext, 
  onPrev, 
  onFinish, 
  currentStep, 
  totalSteps,
  listType,
  onListTypeChange
}) => {
  const [value, setValue] = useState<string>('');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
        setValue(val);
    }
  };
  
  const parsedValue = parseInt(value, 10);

  const buttonClass = `
    px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100
    disabled:bg-gray-400 disabled:cursor-not-allowed w-full shadow-md hover:shadow-lg
  `;
  
  const stepButtonClass = `
     px-3 py-1.5 rounded-md font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300
     transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const inputClass = `
    bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 w-full
    focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm
  `;
  
  const canGoPrev = currentStep !== null && currentStep > -1;
  const canGoNext = currentStep !== null && currentStep < totalSteps - 1;


  return (
    <div className="p-4 rounded-t-xl bg-gray-50/70 border-b border-gray-200">
      <ListTypeSelector listType={listType} onListTypeChange={onListTypeChange} disabled={isAnimating} />
      {isAnimating ? (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Animating: Step {currentStep! + 2} of {totalSteps}
            </span>
            <div className="flex items-center gap-2">
                 <button onClick={onPrev} disabled={!canGoPrev} className={stepButtonClass}>
                    <i className="fa-solid fa-backward-step"></i> Prev
                </button>
                <button onClick={onNext} disabled={!canGoNext} className={stepButtonClass}>
                    Next <i className="fa-solid fa-forward-step"></i>
                </button>
                 <button 
                    onClick={onFinish} 
                    className="px-3 py-1.5 rounded-md font-semibold text-white bg-green-500 hover:bg-green-600 transition-all">
                    Finish
                </button>
            </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        {/* Column 1: Value Input & Search */}
        <div>
          <label htmlFor="value-input" className="block text-sm font-medium text-gray-600 mb-1">
            Node Value
          </label>
          <div className="flex gap-2">
            <input
              id="value-input"
              type="number"
              value={value}
              onChange={handleValueChange}
              placeholder="e.g., 42"
              className={inputClass}
              disabled={isAnimating}
            />
            <button
              onClick={() => onOperate(OperationType.SEARCH, parsedValue)}
              disabled={isAnimating || value === '' || listSize === 0}
              className={`${buttonClass} bg-purple-500 hover:bg-purple-600`}
            >
              Search
            </button>
          </div>
        </div>

        {/* Column 2: Operations */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOperate(OperationType.ADD_FIRST, parsedValue)}
            disabled={isAnimating || value === ''}
            className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}
          >
            addFirst
          </button>
          <button
            onClick={() => onOperate(OperationType.ADD_LAST, parsedValue)}
            disabled={isAnimating || value === ''}
            className={`${buttonClass} bg-blue-500 hover:bg-blue-600`}
          >
            addLast
          </button>
          <button
            onClick={() => onOperate(OperationType.REMOVE_FIRST, -1)}
            disabled={isAnimating || listSize === 0}
            className={`${buttonClass} bg-red-500 hover:bg-red-600`}
          >
            removeFirst
          </button>
           <button
            onClick={() => onOperate(OperationType.REMOVE_LAST, -1)}
            disabled={isAnimating || listSize === 0}
            className={`${buttonClass} bg-red-500 hover:bg-red-600`}
          >
            removeLast
          </button>
        </div>
      </div>
      )}
    </div>
  );
};