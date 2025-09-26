import React from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onAddToOrder: (itemId: number) => void;
  isSelected?: boolean;
}

export default function MenuCard({ item, onAddToOrder, isSelected = false }: MenuCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
          ${item.price.toFixed(2)}
        </span>
      </div>
      
      <p className="text-sm text-blue-600 font-medium mb-2">{item.category}</p>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{item.description}</p>
      
      <button
        onClick={() => onAddToOrder(item.id)}
        className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
          isSelected
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSelected ? 'Added to Order' : 'Add to Order'}
      </button>
    </div>
  );
}