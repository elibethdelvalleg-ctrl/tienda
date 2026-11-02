import React, { useState } from 'react';
import { X, Heart, ShoppingBag, MessageCircle, ShieldCheck, Truck, Ruler, Check, Clock, Sparkles, Star } from 'lucide-react';
import { Product } from '../types.ts';
import { formatUsd, formatBs, calculateBs, buildWhatsAppOrderMessage, buildWhatsAppNegotiationMessage } from '../utils/formatters.ts';
import { ProductReviewsSection } from './ProductReviewsSection.tsx';
import { getProductReviews } from '../utils/reviewStorage.ts';

interface ProductDetailModalProps {
  product: Product | null;
  bcvRate: number;
  currencyMode: 'both' | 'usd' | 'bs';
  isFavorite: boolean;
  whatsappNumber: string;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (product: Product, size: string, color: string, qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  bcvRate,
  currencyMode,
  isFavorite,
  whatsappNumber,
  onClose,
  onToggleFavorite,
  onAddToCart,
}) => {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'Única');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Estándar');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const effectivePriceUsd = product.salePriceUsd || product.priceUsd;
  const effectivePriceBs = calculateBs(effectivePriceUsd, bcvRate);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleWhatsAppBuy = () => {
    const encoded = buildWhatsAppOrderMessage({
      customerName: "Cliente VIP",
      customerPhone: "",
      customerDoc: "",
      state: "Por definir",
      city: "Por definir",
      deliveryAddress: "Consulta sobre producto de la tienda",
      shippingAgencyName: "MRW / ZOOM / Delivery",
      paymentMethod: "pagoMovil",
      items: [
        {
          productName: product.name,
          size: selectedSize,
          color: selectedColor,
          quantity,
          priceUsd: effectivePriceUsd
        }
      ],
      totalUsd: effectivePriceUsd * quantity,
      totalBs: effectivePriceBs * quantity,
      bcvRate
    });
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#FBF7EE] dark:bg-[#1A1612] rounded-2xl shadow-2xl border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 my-8 scroll-smooth"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-[#3B2A10] dark:text-white rounded-full transition-colors cursor-pointer shadow-sm"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8">
          
          {/* Left Column: Gallery & Images */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-white/40 dark:bg-black/40 border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg";
                }}
              />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isBespoke ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#3B2A10] text-[#F4E7BD] px-3 py-1 rounded-md shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#D4B24C]" />
                    <span>Confección Por Encargo</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-700 text-white px-2.5 py-1 rounded-md shadow-sm">
                    <Check className="w-3.5 h-3.5" />
                    <span>En Stock ({product.stock} disponibles)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails row */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedImage(product.image)}
                className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedImage === product.image ? 'border-[#B8962E] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={product.image} alt="" className="w-full h-full object-cover" />
              </button>

              {product.secondaryImage && (
                <button
                  onClick={() => setSelectedImage(product.secondaryImage!)}
                  className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedImage === product.secondaryImage ? 'border-[#B8962E] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={product.secondaryImage} alt="" className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-semibold uppercase tracking-wider">
                <span>Colección {product.category} · {product.sku}</span>
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="flex items-center gap-1 text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 hover:text-[#B8962E] cursor-pointer"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#B8962E] text-[#B8962E]' : ''}`} />
                  <span>{isFavorite ? 'En Favoritos' : 'Guardar'}</span>
                </button>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#3B2A10] dark:text-[#FBF7EE] mt-2">
                {product.name}
              </h2>

              {/* Star Rating & Reviews anchor */}
              {(() => {
                const modalReviews = getProductReviews(product);
                const avg = modalReviews.length > 0
                  ? (modalReviews.reduce((acc, r) => acc + r.rating, 0) / modalReviews.length).toFixed(1)
                  : '5.0';
                return (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(Number(avg))
                              ? 'fill-[#D4B24C] text-[#D4B24C]'
                              : 'text-stone-300 dark:text-stone-600'
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('product-reviews-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#8B6F38] dark:text-[#D4B24C] hover:underline cursor-pointer"
                    >
                      {avg} ({modalReviews.length} {modalReviews.length === 1 ? 'opinión' : 'opiniones'})
                    </button>
                    <span className="text-xs text-stone-300 dark:text-stone-700">·</span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
                      ✓ Clientes Satisfechos
                    </span>
                  </div>
                );
              })()}

              {/* Price Banner with Wholesale & Dropshipping Info */}
              <div className="mt-3 p-3.5 bg-white dark:bg-[#12100E] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/25 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#3B2A10]/50 dark:text-[#FBF7EE]/50 block">
                      Precio Detal Referencial
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-2xl font-bold text-[#3B2A10] dark:text-[#F4E7BD] tabular-nums">
                        {formatUsd(effectivePriceUsd)}
                      </span>
                      {product.salePriceUsd && (
                        <span className="font-mono text-sm text-[#3B2A10]/40 dark:text-[#FBF7EE]/40 line-through tabular-nums">
                          {formatUsd(product.priceUsd)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-[#B8962E] dark:text-[#D4B24C] font-mono mt-0.5">
                      {formatBs(effectivePriceBs)} <span className="font-sans text-[11px] font-normal text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">(Tasa BCV: {bcvRate.toFixed(2)})</span>
                    </div>
                  </div>

                  {product.wholesalePriceUsd && (
                    <div className="text-right p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-300 dark:border-emerald-800">
                      <span className="block text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                        Precio Mayorista ({product.minWholesaleQty || 3}+ unid)
                      </span>
                      <p className="font-mono text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {formatUsd(product.wholesalePriceUsd)} c/u
                      </p>
                      <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
                        {formatBs(product.wholesalePriceUsd * bcvRate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[11px] text-amber-900 dark:text-amber-200/90 leading-tight">
                  <p className="font-semibold">⚠️ Nota de Dropshipping & Mayoristas:</p>
                  <p className="mt-0.5">
                    {product.pricingNotice || "El precio mostrado es referencial y está sujeto a cambios según disponibilidad de mayoristas y tasa del día. ¡Precio 100% negociable al mayor!"}
                  </p>
                  {product.supplierOrigin && (
                    <p className="mt-1 text-[10px] text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 font-mono">
                      📍 Origen: {product.supplierOrigin}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 mt-4 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selector with Size Guide button */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#3B2A10] dark:text-[#FBF7EE]">Selecciona tu Talla:</span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="flex items-center gap-1 text-[#B8962E] dark:text-[#D4B24C] hover:underline font-medium cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Guía de Tallas (cm)</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map(size => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#B8962E] bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E] shadow-sm'
                            : 'border-[#3B2A10]/20 dark:border-[#D4B24C]/30 bg-white dark:bg-[#12100E] text-[#3B2A10] dark:text-[#FBF7EE] hover:border-[#B8962E]'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-semibold text-[#3B2A10] dark:text-[#FBF7EE]">Color:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map(color => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#B8962E] bg-[#D4B24C]/20 text-[#3B2A10] dark:text-[#F4E7BD] font-bold'
                            : 'border-[#3B2A10]/20 dark:border-[#D4B24C]/30 bg-white dark:bg-[#12100E] text-[#3B2A10]/80 dark:text-[#FBF7EE]/80'
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Guide Table Toggle */}
              {showSizeGuide && (
                <div className="mt-4 p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 text-xs animate-in fade-in duration-150">
                  <div className="font-bold text-[#3B2A10] dark:text-[#F4E7BD] mb-2 flex items-center justify-between">
                    <span>Tabla de Medidas (Venezuela / Internacional)</span>
                    <button onClick={() => setShowSizeGuide(false)} className="text-[#3B2A10]/50 hover:text-black">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <table className="w-full text-left font-mono tabular-nums text-[11px]">
                    <thead>
                      <tr className="border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                        <th className="py-1">Talla</th>
                        <th className="py-1">Busto (cm)</th>
                        <th className="py-1">Cintura (cm)</th>
                        <th className="py-1">Cadera (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3B2A10]/5 dark:divide-[#D4B24C]/10 text-[#3B2A10] dark:text-[#FBF7EE]">
                      <tr>
                        <td className="py-1 font-bold">XS (32)</td>
                        <td>80 - 84</td>
                        <td>62 - 66</td>
                        <td>88 - 92</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">S (34)</td>
                        <td>85 - 89</td>
                        <td>67 - 71</td>
                        <td>93 - 97</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">M (36-38)</td>
                        <td>90 - 95</td>
                        <td>72 - 77</td>
                        <td>98 - 103</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">L (40-42)</td>
                        <td>96 - 102</td>
                        <td>78 - 84</td>
                        <td>104 - 110</td>
                      </tr>
                      <tr>
                        <td className="py-1 font-bold">XL (44)</td>
                        <td>103 - 110</td>
                        <td>85 - 92</td>
                        <td>111 - 118</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 mt-2">
                    * Si deseas una prenda sobre medidas exactas, elígela como Por Encargo o contáctanos al WhatsApp.
                  </p>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-semibold text-[#3B2A10] dark:text-[#FBF7EE]">Cantidad:</span>
                <div className="flex items-center border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg overflow-hidden bg-white dark:bg-[#12100E]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm font-bold text-[#3B2A10] dark:text-white hover:bg-[#3B2A10]/10 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-mono font-bold text-[#3B2A10] dark:text-white tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-sm font-bold text-[#3B2A10] dark:text-white hover:bg-[#3B2A10]/10 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAdd}
                  className="py-3 px-4 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] hover:bg-[#231809] dark:hover:bg-[#E7CE7F] font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-[#D4B24C] dark:text-[#12100E]" />
                  <span>Comprar al Detal ({quantity} unid)</span>
                </button>

                <button
                  onClick={() => {
                    const encoded = buildWhatsAppNegotiationMessage({
                      productName: product.name,
                      sku: product.sku,
                      refPriceUsd: effectivePriceUsd,
                      wholesalePriceUsd: product.wholesalePriceUsd,
                      selectedSize,
                      selectedColor,
                      quantity: Math.max(quantity, product.minWholesaleQty || 3),
                      bcvRate
                    });
                    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
                  }}
                  className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  title="Negociar precio especial con el mayorista"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Negociar al Mayor por WhatsApp</span>
                </button>
              </div>

              {addedToast && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 text-center font-medium flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>¡Prenda agregada a tu carrito con éxito!</span>
                </div>
              )}

              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B8962E] shrink-0" />
                  <span>Garantía de confección</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#B8962E] shrink-0" />
                  <span>Envíos asegurados</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8962E] shrink-0" />
                  <span>Atención VIP</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Sección Completa de Reseñas, Calificaciones con Estrellas y Formulario */}
        <div id="product-reviews-section" className="px-6 sm:px-8 pb-8">
          <ProductReviewsSection product={product} />
        </div>
      </div>
    </div>
  );
};
