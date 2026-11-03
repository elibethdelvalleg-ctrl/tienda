import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Eye, MessageCircle, Clock, Check, Star } from 'lucide-react';
import { Product } from '../types.ts';
import { formatUsd, formatBs, calculateBs, buildWhatsAppOrderMessage, buildWhatsAppNegotiationMessage } from '../utils/formatters.ts';
import { getProductReviews } from '../utils/reviewStorage.ts';
import { StarRatingDisplay } from './StarRating.tsx';

interface ProductCardProps {
  product: Product;
  bcvRate: number;
  currencyMode: 'both' | 'usd' | 'bs';
  isFavorite: boolean;
  whatsappNumber: string;
  onToggleFavorite: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  bcvRate,
  currencyMode,
  isFavorite,
  whatsappNumber,
  onToggleFavorite,
  onQuickView,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [reviewCountSync, setReviewCountSync] = useState(0);

  useEffect(() => {
    const handleReviewAdded = (e: any) => {
      if (e.detail?.productId === product.id) {
        setReviewCountSync(prev => prev + 1);
      }
    };
    window.addEventListener('edv-review-added', handleReviewAdded);
    return () => window.removeEventListener('edv-review-added', handleReviewAdded);
  }, [product.id]);

  const defaultSize = product.sizes[0] || 'Única';
  const defaultColor = product.colors[0] || 'Estándar';

  const effectivePriceUsd = product.salePriceUsd || product.priceUsd;
  const effectivePriceBs = calculateBs(effectivePriceUsd, bcvRate);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, defaultSize, defaultColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleDirectWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = buildWhatsAppOrderMessage({
      customerName: "Cliente Interesado",
      customerPhone: "",
      customerDoc: "",
      state: "Por coordinar",
      city: "Por coordinar",
      deliveryAddress: "Consulta directa por WhatsApp",
      shippingAgencyName: "MRW / ZOOM / Entrega Personal",
      paymentMethod: "pagoMovil",
      items: [
        {
          productName: product.name,
          size: defaultSize,
          color: defaultColor,
          quantity: 1,
          priceUsd: effectivePriceUsd
        }
      ],
      totalUsd: effectivePriceUsd,
      totalBs: effectivePriceBs,
      bcvRate
    });
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-[#1A1612] rounded-xl overflow-hidden border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div 
        className="relative aspect-[4/5] bg-[#3B2A10]/5 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={isHovered && product.secondaryImage ? product.secondaryImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = "./assets/aistudio/logoemprendimientoropa_9eefadce.jpeg";
          }}
        />

        {/* Favorite Wishlist Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isFavorite
              ? 'bg-[#B8962E] text-white shadow-md'
              : 'bg-white/80 dark:bg-black/60 text-[#3B2A10] dark:text-white hover:text-[#B8962E]'
          }`}
          aria-label="Agregar a favoritos"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Status Indicators */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
          {product.isBespoke ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide bg-[#3B2A10]/90 text-[#F4E7BD] px-2.5 py-1 rounded-md backdrop-blur-xs">
              <Clock className="w-3 h-3 text-[#D4B24C]" />
              <span>Por Encargo</span>
            </span>
          ) : product.salePriceUsd ? (
            <span className="text-[11px] font-bold tracking-wide bg-[#B8962E] text-white px-2 py-0.5 rounded-md">
              Oferta
            </span>
          ) : product.stock <= 3 ? (
            <span className="text-[11px] font-medium tracking-wide bg-amber-600/90 text-white px-2 py-0.5 rounded-md">
              Últimas {product.stock} unid.
            </span>
          ) : null}
        </div>

        {/* Quick View Hover Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 bg-white/90 dark:bg-[#12100E]/90 hover:bg-white dark:hover:bg-[#12100E] text-[#3B2A10] dark:text-[#F4E7BD] text-xs font-semibold rounded-lg shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#B8962E]" />
            <span>Vista Rápida</span>
          </button>
        </div>
      </div>

      {/* Product Content & Typography */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category & Tags - Unboxed Clean Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 uppercase tracking-wider font-semibold">
            <span>{product.category}</span>
            {product.tags && product.tags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{product.tags[0]}</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-display text-base font-bold text-[#3B2A10] dark:text-[#FBF7EE] mt-1 line-clamp-1 hover:text-[#B8962E] dark:hover:text-[#D4B24C] cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Star rating indicator */}
          {(() => {
            // reviewCountSync triggers re-render when a new review is submitted
            void reviewCountSync;
            const cardReviews = getProductReviews(product);
            const cardAvg = cardReviews.length > 0 
              ? (cardReviews.reduce((acc, r) => acc + r.rating, 0) / cardReviews.length).toFixed(1)
              : '5.0';
            return (
              <div 
                onClick={() => onQuickView(product)}
                className="flex items-center gap-1.5 mt-1 cursor-pointer group-hover:opacity-90"
              >
                <StarRatingDisplay rating={Number(cardAvg)} size="xs" showValue count={cardReviews.length} />
              </div>
            );
          })()}

          <p className="text-xs text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Venezuelan Conversion */}
        <div className="pt-2 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/15 space-y-1">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3B2A10]/50 dark:text-[#FBF7EE]/50">
                Precio Detal Ref.
              </span>
              {/* USD Price */}
              {(currencyMode === 'both' || currencyMode === 'usd') && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-base font-bold text-[#3B2A10] dark:text-[#F4E7BD] tabular-nums">
                    {formatUsd(effectivePriceUsd)}
                  </span>
                  {product.salePriceUsd && (
                    <span className="font-mono text-xs text-[#3B2A10]/40 dark:text-[#FBF7EE]/40 line-through tabular-nums">
                      {formatUsd(product.priceUsd)}
                    </span>
                  )}
                </div>
              )}

              {/* Bolívares (BCV) Price */}
              {(currencyMode === 'both' || currencyMode === 'bs') && (
                <span className="font-mono text-xs font-semibold text-[#B8962E] dark:text-[#D4B24C] tabular-nums">
                  {formatBs(effectivePriceBs)}
                </span>
              )}
            </div>

            {/* Wholesale Price Box if available */}
            {product.wholesalePriceUsd && (
              <div className="text-right p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-800">
                <span className="block text-[9px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                  Al Mayor ({product.minWholesaleQty || 3}+ unid)
                </span>
                <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  {formatUsd(product.wholesalePriceUsd)} c/u
                </span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-amber-700 dark:text-amber-400/90 italic leading-tight">
            * Precio referencial sujeto a cambios con el mayorista
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleQuickAdd}
            className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] hover:bg-[#231809] dark:hover:bg-[#E7CE7F]'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Listo!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#D4B24C] dark:text-[#12100E]" />
                <span>Al Detal</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const encoded = buildWhatsAppNegotiationMessage({
                productName: product.name,
                sku: product.sku,
                refPriceUsd: effectivePriceUsd,
                wholesalePriceUsd: product.wholesalePriceUsd,
                selectedSize: defaultSize,
                selectedColor: defaultColor,
                quantity: product.minWholesaleQty || 3,
                bcvRate
              });
              window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
            }}
            className="py-2 px-2 rounded-lg text-xs font-bold border border-emerald-600/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 flex items-center justify-center gap-1 transition-colors cursor-pointer"
            title="Negociar precio especial al mayor o compra por volumen"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Negociar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
