import React, { useState } from 'react';
import { Users, Receipt, Calculator } from 'lucide-react';

export type SplitMethod = 'equal' | 'items' | 'amount';

interface SplitOptionsProps {
  selectedMethod: SplitMethod;
  onMethodChange: (method: SplitMethod) => void;
}

export default function SplitOptions({ selectedMethod, onMethodChange }: SplitOptionsProps) {
  const options = [
    {
      id: 'equal' as SplitMethod,
      title: 'Equal Split',
      description: 'Split the bill equally among all guests',
      icon: Users,
    },
    {
      id: 'items' as SplitMethod,
      title: 'Split by Items',
      description: 'Assign specific items to each guest',
      icon: Receipt,
    },
    {
      id: 'amount' as SplitMethod,
      title: 'Split by Amount',
      description: 'Manually specify each guest\'s contribution',
      icon: Calculator,
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Split Method</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedMethod === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => onMethodChange(option.id)}
              className={`p-4 rounded-lg border text-left transition-all hover:shadow-sm ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                <div>
                  <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {option.title}
                  </h4>
                  <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}