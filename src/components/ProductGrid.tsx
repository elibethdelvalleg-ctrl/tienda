import React, { useState, useMemo } from 'react';
import { Product } from '../types.ts';
import { ProductCard } from './ProductCard.tsx';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  bcvRate: number;
  currencyMode: 'both' | 'usd' | 'bs';
  activeCategory: string;
  searchQuery: string;
  favorites: string[];
  whatsappNumber: string;
  onSelectCategory: (cat: string) => void;
  onClearSearch: () => void;
  onToggleFavorite: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  bcvRate,
  currencyMode,
  activeCategory,
  searchQuery,
  favorites,
  whatsappNumber,
  onSelectCategory,
  onClearSearch,
  onToggleFavorite,
  onQuickView,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [onlyBespoke, setOnlyBespoke] = useState<boolean>(false);

  const categories = [
    { id: 'todos', label: 'Todo el Catálogo' },
    { id: 'intima', label: 'Ropa Íntima Dama' },
    { id: 'pantalones', label: 'Pantalones & Jeans' },
    { id: 'deportivo', label: 'Franelas & Deportivo' },
    { id: 'caballero', label: 'Caballeros' },
    { id: 'encargo', label: 'Por Encargo' },
  ];

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.sizes.forEach(s => set.add(s)));
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (activeCategory !== 'todos') {
        if (activeCategory === 'encargo' && !p.isBespoke) return false;
        if (activeCategory !== 'encargo' && p.category !== activeCategory) return false;
      }
      // Bespoke only toggle
      if (onlyBespoke && !p.isBespoke) return false;

      // Size filter
      if (selectedSize !== 'all' && !p.sizes.includes(selectedSize)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesTag = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesSku && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePriceUsd || a.priceUsd;
      const priceB = b.salePriceUsd || b.priceUsd;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, activeCategory, onlyBespoke, selectedSize, searchQuery, sortBy]);

  return (
    <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Dropshipping & Wholesale Notice Banner */}
      <div className="mb-8 p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#3B2A10] dark:text-[#F4E7BD]">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🤝</span>
          <div>
            <p className="font-bold">
              Precios Referenciales & Dropshipping Negociable
            </p>
            <p className="text-[11px] text-[#3B2A10]/80 dark:text-[#FBF7EE]/80">
              Prendas de mayoristas del mercado venezolano (La Hoyada, El Cementerio y talleres aliados). Los precios están sujetos a cambios y son 100% negociables al mayor o por docena.
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("🦁 ¡Hola! Deseo información para hacer Dropshipping o comprar al mayor prendas del catálogo.")}`}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] font-bold rounded-lg shrink-0 hover:opacity-90 transition-opacity"
        >
          Consultar Lista Mayorista
        </a>
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B8962E] dark:text-[#D4B24C]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mercado Local Mayorista</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#3B2A10] dark:text-[#FBF7EE] mt-1">
            Prendas de Alta Rotación para Detal & Dropshipping
          </h2>
          <p className="text-xs sm:text-sm text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 mt-1 max-w-xl">
            Ropa íntima de dama, jeans levanta cola, pantalones cargo, franelas deportivas y prendas de caballero.
          </p>
        </div>

        {/* Search Query Active Notification */}
        {searchQuery && (
          <div className="flex items-center gap-2 bg-[#D4B24C]/15 px-3 py-1.5 rounded-lg text-xs text-[#3B2A10] dark:text-[#F4E7BD]">
            <span>Buscando: <strong>"{searchQuery}"</strong></span>
            <button
              onClick={onClearSearch}
              className="text-[#3B2A10]/70 hover:text-red-600 dark:text-white/70 dark:hover:text-red-400 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Categories & Filter Bar (Functional segmented buttons) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {categories.map(c => {
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] shadow-sm'
                    : 'bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 hover:bg-[#3B2A10]/10 dark:hover:bg-[#FBF7EE]/10'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Size, Bespoke toggle, Sort */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap shrink-0">
          
          {/* Size Select */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-medium hidden sm:inline">Talla:</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-white dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 text-[#3B2A10] dark:text-[#FBF7EE] text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[#B8962E] cursor-pointer"
            >
              <option value="all">Todas las tallas</option>
              {allSizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-medium hidden sm:inline">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 text-[#3B2A10] dark:text-[#FBF7EE] text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-[#B8962E] cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio ($)</option>
              <option value="price-desc">Mayor precio ($)</option>
              <option value="name">Nombre (A-Z)</option>
            </select>
          </div>

          {/* Por Encargo Quick Check */}
          <label className="flex items-center gap-2 text-xs font-medium text-[#3B2A10] dark:text-[#FBF7EE] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyBespoke}
              onChange={(e) => setOnlyBespoke(e.target.checked)}
              className="rounded border-[#3B2A10]/30 text-[#B8962E] focus:ring-[#B8962E]"
            />
            <span className="whitespace-nowrap">Solo Por Encargo</span>
          </label>

        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              bcvRate={bcvRate}
              currencyMode={currencyMode}
              isFavorite={favorites.includes(product.id)}
              whatsappNumber={whatsappNumber}
              onToggleFavorite={onToggleFavorite}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white/50 dark:bg-[#1A1612]/50 rounded-2xl border border-dashed border-[#3B2A10]/20 dark:border-[#D4B24C]/30 max-w-lg mx-auto">
          <p className="font-display text-lg font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
            No encontramos prendas con esos filtros
          </p>
          <p className="text-xs text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 mt-1">
            Intenta cambiar los términos de búsqueda o revisar otra categoría.
          </p>
          <button
            onClick={() => {
              onSelectCategory('todos');
              setSelectedSize('all');
              setOnlyBespoke(false);
              onClearSearch();
            }}
            className="mt-4 px-4 py-2 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] text-xs font-semibold rounded-lg cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </section>
  );
};
