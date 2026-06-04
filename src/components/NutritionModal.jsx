import React, { useEffect } from 'react';
import { VendingItemVector } from './VendingItemVector';

export const NutritionModal = ({ item, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const { nutrition } = item;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: '#1D1E2E', border: '1px solid #2A2B40' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header strip with item color */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-4" style={{ borderBottom: '1px solid #2A2B40' }}>
          <div className="w-16 h-20 flex-shrink-0">
            <VendingItemVector type={item.type} brandColor={item.brandColor} accentColor={item.accentColor} name={item.name} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#2A2B40', color: '#9CA3AF' }}>
                Slot {item.id}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: '#2A2B40', color: '#9CA3AF' }}>
                {item.category}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white leading-tight truncate">{item.name}</h2>
            <p className="text-2xl font-extrabold mt-1" style={{ color: '#60A5FA' }}>
              ₩{item.price.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ backgroundColor: '#2A2B40', color: '#9CA3AF' }}
          >
            ✕
          </button>
        </div>

        {/* Nutrition Facts */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>
              Nutrition Facts
            </h3>
            <span className="text-xs" style={{ color: '#6B7280' }}>per {nutrition.servingSize}</span>
          </div>

          {/* Calories — big featured row */}
          <div className="rounded-2xl p-4 mb-4 flex items-center justify-between" style={{ backgroundColor: '#12131D' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#6B7280' }}>Calories</p>
              <p className="text-4xl font-black text-white">{nutrition.calories}</p>
            </div>
            <span className="text-sm font-bold" style={{ color: '#6B7280' }}>kcal</span>
          </div>

          {/* Other nutrients grid */}
          <div className="space-y-2">
            {[
              { label: 'Carbohydrates', value: nutrition.carbs, unit: 'g' },
              { label: 'Sugar', value: nutrition.sugar, unit: 'g', indent: true },
              { label: 'Protein', value: nutrition.protein, unit: 'g' },
              { label: 'Fat', value: nutrition.fat, unit: 'g' },
              { label: 'Sodium', value: nutrition.sodium, unit: 'mg' },
            ].map(({ label, value, unit, indent }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ backgroundColor: '#12131D', marginLeft: indent ? '12px' : '0' }}
              >
                <span className="text-sm font-semibold" style={{ color: indent ? '#6B7280' : '#D1D5DB' }}>
                  {indent && '↳ '}{label}
                </span>
                <span className="text-sm font-bold text-white">
                  {value}<span className="text-xs ml-0.5" style={{ color: '#6B7280' }}>{unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock status footer */}
        <div className="px-6 pb-5">
          <div className={`w-full py-2.5 rounded-2xl text-center text-sm font-bold ${
            item.inStock ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {item.inStock ? '✓ In Stock' : '✗ Sold Out'}
          </div>
        </div>
      </div>
    </div>
  );
};
