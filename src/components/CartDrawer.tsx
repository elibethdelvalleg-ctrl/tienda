import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Tag, ShoppingBag, MessageCircle, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { CartItem, StoreConfig } from '../types.ts';
import { formatUsd, formatBs, calculateBs, buildWhatsAppOrderMessage } from '../utils/formatters.ts';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  bcvRate: number;
  config: StoreConfig;
  onClose: () => void;
  onUpdateQuantity: (productId: string, size: string, color: string, newQty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  onCheckout: () => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onSyncBcv?: () => Promise<{ success: boolean; rate?: number }>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  bcvRate,
  config,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onSyncBcv,
}) => {
  if (!isOpen) return null;

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [syncingBcv, setSyncingBcv] = useState(false);
  const [copiedBs, setCopiedBs] = useState(false);

  const subtotalUsd = items.reduce((acc, item) => acc + item.subtotalUsd, 0);

  let discountUsd = 0;
  if (appliedCoupon) {
    const couponObj = config.coupons.find(c => c.code.toUpperCase() === appliedCoupon.toUpperCase() && c.active);
    if (couponObj && subtotalUsd >= couponObj.minPurchaseUsd) {
      discountUsd = (subtotalUsd * couponObj.discountPercent) / 100;
    }
  }

  const totalUsd = Math.max(0, subtotalUsd - discountUsd);
  const totalBs = calculateBs(totalUsd, bcvRate);

  const handleSyncBcvRate = async () => {
    if (!onSyncBcv || syncingBcv) return;
    setSyncingBcv(true);
    await onSyncBcv();
    setSyncingBcv(false);
  };

  const handleCopyTotalBs = () => {
    navigator.clipboard.writeText(formatBs(totalBs));
    setCopiedBs(true);
    setTimeout(() => setCopiedBs(false), 2000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = onApplyCoupon(couponInput.trim());
    setCouponFeedback(res);
    if (res.success) setCouponInput('');
  };

  const handleDirectWhatsAppCart = () => {
    const encoded = buildWhatsAppOrderMessage({
      customerName: "Cliente Tienda",
      customerPhone: "",
      customerDoc: "",
      state: "Por coordinar",
      city: "Por coordinar",
      deliveryAddress: "Enviado desde el Carrito de la Web",
      shippingAgencyName: "MRW / ZOOM / Delivery Express",
      paymentMethod: "pagoMovil",
      items: items.map(i => ({
        productName: i.product.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        priceUsd: i.priceUsd
      })),
      totalUsd,
      totalBs,
      bcvRate
    });
    window.open(`https://wa.me/${config.whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FBF7EE] dark:bg-[#1A1612] text-[#3B2A10] dark:text-[#FBF7EE] shadow-2xl flex flex-col border-l border-[#3B2A10]/15 dark:border-[#D4B24C]/30">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#B8962E] dark:text-[#D4B24C]" />
              <h2 className="font-display text-lg font-bold">Tu Carrito de Compras</h2>
              <span className="text-xs font-mono text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                ({items.length} {items.length === 1 ? 'prenda' : 'prendas'})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#3B2A10]/10 dark:hover:bg-[#FBF7EE]/10 text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-[#3B2A10]/20 dark:text-[#FBF7EE]/20" />
                <p className="font-display text-base font-bold text-[#3B2A10]/80 dark:text-[#FBF7EE]/80">
                  Tu carrito está vacío
                </p>
                <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 max-w-xs mx-auto">
                  Explora las colecciones exclusivas de Elibeth Del Valle Store y viste con poder y elegancia.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Descubrir colecciones
                </button>
              </div>
            ) : (
              <>
                {/* Live BCV Reference Card */}
                <div className="flex items-center justify-between p-2.5 bg-[#3B2A10]/5 dark:bg-[#D4B24C]/10 border border-[#D4B24C]/30 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#B8962E] dark:text-[#D4B24C] shrink-0" />
                    <div>
                      <p className="font-medium text-[#3B2A10] dark:text-[#F4E7BD]">
                        Tasa BCV del día: <strong className="font-mono text-sm">{formatBs(bcvRate)}</strong>
                      </p>
                      <p className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                        Convertidor automático a moneda nacional
                      </p>
                    </div>
                  </div>
                  {onSyncBcv && (
                    <button
                      type="button"
                      onClick={handleSyncBcvRate}
                      disabled={syncingBcv}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-[#12100E] border border-[#D4B24C]/40 rounded-lg hover:border-[#B8962E] transition-colors cursor-pointer shrink-0"
                      title="Sincronizar tasa oficial con el BCV"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncingBcv ? 'animate-spin text-[#B8962E]' : ''}`} />
                      <span>{syncingBcv ? 'Sincronizando' : 'Actualizar'}</span>
                    </button>
                  )}
                </div>

                {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-3 p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-18 h-22 object-cover rounded-lg shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg";
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-sm font-bold line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.productId, item.size, item.color)}
                          className="text-[#3B2A10]/40 dark:text-[#FBF7EE]/40 hover:text-red-600 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant tags */}
                      <div className="flex items-center gap-2 text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 mt-0.5">
                        <span>Talla: <strong>{item.size}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Color: <strong>{item.color}</strong></span>
                      </div>
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3B2A10]/5 dark:border-[#D4B24C]/10">
                      <div className="flex items-center border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-md bg-[#FBF7EE] dark:bg-[#1A1612]">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-[#3B2A10]/10"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-[#3B2A10]/10"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-xs font-bold tabular-nums">
                          {formatUsd(item.subtotalUsd)}
                        </p>
                        <p className="font-mono text-[10px] text-[#B8962E] dark:text-[#D4B24C] tabular-nums">
                          {formatBs(calculateBs(item.subtotalUsd, bcvRate))}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
              </>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-white dark:bg-[#12100E] border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#3B2A10]/40 dark:text-[#FBF7EE]/40" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Cupón (ej: RENACER10)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs uppercase bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#3B2A10]/10 dark:bg-[#D4B24C]/20 hover:bg-[#3B2A10]/20 text-[#3B2A10] dark:text-[#F4E7BD] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Aplicar
                </button>
              </form>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 p-2 rounded-lg">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cupón {appliedCoupon} aplicado ({formatUsd(discountUsd)})</span>
                  </span>
                  <button
                    onClick={onRemoveCoupon}
                    className="text-emerald-800 hover:text-red-600 font-bold ml-2"
                  >
                    Quitar
                  </button>
                </div>
              )}

              {couponFeedback && !appliedCoupon && (
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  {couponFeedback.message}
                </p>
              )}

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-[#3B2A10]/5 dark:border-[#D4B24C]/10">
                <div className="flex justify-between text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
                  <span>Subtotal en USD:</span>
                  <div className="text-right">
                    <span className="font-mono tabular-nums">{formatUsd(subtotalUsd)}</span>
                    <span className="text-[10px] text-[#3B2A10]/50 dark:text-[#FBF7EE]/50 ml-1.5">
                      ({formatBs(calculateBs(subtotalUsd, bcvRate))})
                    </span>
                  </div>
                </div>

                {discountUsd > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Descuento cupón:</span>
                    <div className="text-right">
                      <span className="font-mono tabular-nums">-{formatUsd(discountUsd)}</span>
                      <span className="text-[10px] text-emerald-600/70 ml-1.5">
                        (-{formatBs(calculateBs(discountUsd, bcvRate))})
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-2">
                  <div className="flex justify-between items-baseline font-bold text-sm">
                    <span>Total a Pagar (USD):</span>
                    <span className="font-mono text-lg text-[#3B2A10] dark:text-[#F4E7BD] tabular-nums">
                      {formatUsd(totalUsd)}
                    </span>
                  </div>

                  {/* Venezuelan Bolívares Calculation Box */}
                  <div className="p-3 bg-[#D4B24C]/10 dark:bg-[#D4B24C]/15 border border-[#D4B24C]/40 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#B8962E] dark:text-[#D4B24C] block">
                        Total en Bolívares (Tasa Oficial BCV)
                      </span>
                      <p className="font-mono text-base font-extrabold text-[#3B2A10] dark:text-white tabular-nums">
                        {formatBs(totalBs)}
                      </p>
                      <p className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-mono mt-0.5">
                        Cálculo: ${totalUsd.toFixed(2)} USD × {formatBs(bcvRate)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyTotalBs}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#12100E] border border-[#D4B24C]/40 rounded-lg text-xs font-semibold hover:border-[#B8962E] transition-all cursor-pointer shadow-xs shrink-0"
                      title="Copiar monto exacto en Bolívares para Pago Móvil"
                    >
                      {copiedBs ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#B8962E]" />
                          <span>Copiar Bs.</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={onCheckout}
                  className="w-full py-3 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] hover:bg-[#231809] dark:hover:bg-[#E7CE7F] font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceder al Pago & Envío</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDirectWhatsAppCart}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Carrito por WhatsApp</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
