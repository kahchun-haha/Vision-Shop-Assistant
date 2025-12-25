import React from 'react';
import { CartItem } from '../types';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartSummaryProps {
  items: CartItem[];
  onClear: () => void;
  onRemove: (timestamp: number) => void;
  onUpdateQuantity: (timestamp: number, delta: number) => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ 
  items, 
  onClear, 
  onRemove, 
  onUpdateQuantity 
}) => {
  // Member 3: Expense Calculation Logic
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-700 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
        <button 
            onClick={onClear}
            className="text-red-400 hover:text-red-300 font-semibold p-2 focus:ring-2 ring-red-500 rounded"
            aria-label="Clear all items from cart"
        >
            Clear All
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-zinc-500 text-lg italic">Cart is empty. Scan an item.</p>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={item.timestamp} className="bg-zinc-800 p-4 rounded-lg flex flex-col gap-3 border border-zinc-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-bold text-yellow-300">{item.name}</p>
                  <p className="text-sm text-zinc-400">{item.category}</p>
                </div>
                <button 
                  onClick={() => onRemove(item.timestamp)}
                  className="text-zinc-500 hover:text-red-400 p-2 transition-colors"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <Trash2 size={24} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-zinc-900/50 p-2 rounded-md">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => onUpdateQuantity(item.timestamp, -1)}
                    disabled={item.quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-700 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-600"
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    <Minus size={20} />
                  </button>
                  <span className="text-xl font-mono font-bold w-6 text-center" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(item.timestamp, 1)}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-700 rounded-full hover:bg-zinc-600"
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Expense Display */}
      <div className="mt-6 pt-4 border-t-2 border-zinc-700 flex justify-between items-center">
        <span className="text-2xl font-bold text-white">Total:</span>
        <span className="text-4xl font-mono font-bold text-yellow-400" aria-live="polite">
            ${total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};