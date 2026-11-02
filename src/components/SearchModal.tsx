import React, { useState } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';
import { formatUsd } from '../utils/formatters.ts';

interface SearchModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  products,
  onClose,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-20 bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-xl bg-[#FBF7EE] dark:bg-[#1A1612] text-[#3B2A10] dark:text-[#FBF7EE] rounded-2xl shadow-2xl border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#B8962E] dark:text-[#D4B24C] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por vestido, lino, camisa, talla o código..."
            className="w-full bg-transparent text-sm focus:outline-hidden text-[#3B2A10] dark:text-[#FBF7EE]"
          />
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <div className="text-center py-8 text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
              Escribe algo para encontrar prendas en el catálogo.
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
              No se encontraron prendas que coincidan con "{query}".
            </div>
          ) : (
            filtered.map(product => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white dark:hover:bg-[#12100E] border border-transparent hover:border-[#D4B24C]/20 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt=""
                    className="w-12 h-14 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-display text-xs font-bold">{product.name}</h4>
                    <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 uppercase">
                      {product.category} · {product.sku}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#B8962E] dark:text-[#D4B24C]">
                    {formatUsd(product.salePriceUsd || product.priceUsd)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#3B2A10]/40" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
