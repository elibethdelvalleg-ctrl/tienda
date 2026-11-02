import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Product } from '../types.ts';
import { formatUsd } from '../utils/formatters.ts';

interface FavoritesModalProps {
  isOpen: boolean;
  favorites: string[];
  products: Product[];
  onClose: () => void;
  onRemoveFavorite: (id: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  favorites,
  products,
  onClose,
  onRemoveFavorite,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-lg bg-[#FBF7EE] dark:bg-[#1A1612] text-[#3B2A10] dark:text-[#FBF7EE] rounded-2xl shadow-2xl border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#B8962E] fill-[#B8962E]" />
            <h3 className="font-display text-base font-bold">Tus Prendas Favoritas</h3>
            <span className="text-xs font-mono text-[#3B2A10]/60">({favoriteProducts.length})</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-3">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 space-y-2">
              <Heart className="w-8 h-8 mx-auto text-[#3B2A10]/20 dark:text-white/20" />
              <p>No tienes prendas guardadas todavía.</p>
            </div>
          ) : (
            favoriteProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                >
                  <img
                    src={product.image}
                    alt=""
                    className="w-14 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-display text-xs font-bold line-clamp-1">{product.name}</h4>
                    <span className="font-mono text-xs font-bold text-[#B8962E] dark:text-[#D4B24C]">
                      {formatUsd(product.salePriceUsd || product.priceUsd)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="p-2 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] rounded-lg text-xs cursor-pointer"
                    title="Ver prenda"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveFavorite(product.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer"
                    title="Quitar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
