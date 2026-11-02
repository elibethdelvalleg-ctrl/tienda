import React, { useState, useEffect } from 'react';
import {
  X, BarChart3, Package, ShoppingCart, Sparkles, Settings, Globe, Plus, Trash2, Edit2,
  Check, RefreshCw, Eye, EyeOff, MessageCircle, ExternalLink, Printer, DollarSign, TrendingUp,
  AlertTriangle, Upload, Camera, Image as ImageIcon, Sliders, CheckCircle2, Search, RotateCcw
} from 'lucide-react';
import { Product, Order, StoreConfig, TrendInsight } from '../types.ts';
import { formatUsd, formatBs, calculateBs } from '../utils/formatters.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  config: StoreConfig;
  bcvRate: number;
  onUpdateBcv: (newRate: number) => Promise<void>;
  onSyncBcv?: () => Promise<{ success: boolean; rate?: number }>;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateOrders: (orders: Order[]) => void;
  onUpdateConfig: (newConfig: StoreConfig) => void;
  onResetCatalog?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  config,
  bcvRate,
  onUpdateBcv,
  onSyncBcv,
  onUpdateProducts,
  onUpdateOrders,
  onUpdateConfig,
  onResetCatalog,
}) => {
  if (!isOpen) return null;

  // Defaults directly to 'inventory' for rapid catalog management (poner y quitar prendas)
  const [activeTab, setActiveTab] = useState<'inventory' | 'stats' | 'orders' | 'trends' | 'settings' | 'seo'>('inventory');
  
  // Inventory Search & Filter states
  const [invSearch, setInvSearch] = useState<string>('');
  const [invCategory, setInvCategory] = useState<string>('todos');
  const [invStockFilter, setInvStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'delete' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'delete' | 'info' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 3500);
  };

  // BCV local edit & live sync
  const [bcvInput, setBcvInput] = useState<string>(bcvRate.toString());
  const [bcvSaving, setBcvSaving] = useState<boolean>(false);
  const [bcvSuccess, setBcvSuccess] = useState<boolean>(false);
  const [syncingBcv, setSyncingBcv] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // New product modal state
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for manual product creation
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<string>('intima');
  const [prodPrice, setProdPrice] = useState<number>(18);
  const [prodWholesalePrice, setProdWholesalePrice] = useState<number>(11);
  const [prodSalePrice, setProdSalePrice] = useState<string>('');
  const [prodCost, setProdCost] = useState<number>(7);
  const [prodStock, setProdStock] = useState<number>(30);
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSizes, setProdSizes] = useState('S, M, L');
  const [prodColors, setProdColors] = useState('Negro, Beige');
  const [prodIsBespoke, setProdIsBespoke] = useState(false);
  const [prodImage, setProdImage] = useState('./images/lenceria_intima_dama_1793412626756.jpg');
  const [prodSupplierOrigin, setProdSupplierOrigin] = useState('Mayoristas Galpones El Cementerio / La Hoyada');
  const [prodPricingNotice, setProdPricingNotice] = useState('Precio referencial sujeto a cambios según disponibilidad de mayoristas. Negociable por volumen.');
  const [prodIsNegotiable, setProdIsNegotiable] = useState<boolean>(true);
  const [prodMinWholesaleQty, setProdMinWholesaleQty] = useState<number>(3);
  const [imageInputMode, setImageInputMode] = useState<'file' | 'presets' | 'url'>('file');
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const venezuelaPresets = [
    { label: 'Lencería & Bralette Dama', url: './images/lenceria_intima_dama_1793412626756.jpg', cat: 'intima' },
    { label: 'Jeans Colombiano Levanta Cola', url: './images/jeans_colombiano_dama_1793412627102.jpg', cat: 'pantalones' },
    { label: 'Conjunto Deportivo Suplex', url: './images/conjunto_deportivo_suplex_1793412627777.jpg', cat: 'deportivo' },
    { label: 'Gymwear & Dry-Fit Hombre', url: './images/ropa_deportiva_caballero_1793412628454.jpg', cat: 'caballero' },
    { label: 'Atelier Por Encargo', url: './images/collection_por_encargo_1793411524038.jpg', cat: 'encargo' },
    { label: 'Moda Femenina Elegante', url: './images/collection_woman_gold_1793411522165.jpg', cat: 'mujer' }
  ];

  // AI Trends states
  const [trendCategory, setTrendCategory] = useState<string>('todas');
  const [trendSeason, setTrendSeason] = useState<string>('Actual / Clima Cálido & Fiesta');
  const [trendLoading, setTrendLoading] = useState<boolean>(false);
  const [trendResults, setTrendResults] = useState<{ summary: string; insights: TrendInsight[] } | null>(null);

  // Order detail / Voucher inspection
  const [selectedOrderVoucher, setSelectedOrderVoucher] = useState<Order | null>(null);

  // Calculate Metrics
  const totalSalesUsd = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((acc, o) => acc + o.totalUsd, 0);
  const totalSalesBs = totalSalesUsd * bcvRate;
  const verifiedOrdersCount = orders.filter(o => o.status === 'pago_verificado' || o.status === 'enviado' || o.status === 'entregado').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pendiente').length;
  const averageTicketUsd = orders.length > 0 ? (totalSalesUsd / Math.max(1, orders.length)) : 0;

  // Handle Manual BCV update
  const handleSaveBcv = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(bcvInput);
    if (!val || val <= 0) return;
    setBcvSaving(true);
    await onUpdateBcv(val);
    setBcvSaving(false);
    setBcvSuccess(true);
    setTimeout(() => setBcvSuccess(false), 2000);
  };

  // Handle Live BCV Sync from official BCV API
  const handleTriggerBcvSync = async () => {
    if (!onSyncBcv || syncingBcv) return;
    setSyncingBcv(true);
    setSyncNotice(null);
    const res = await onSyncBcv();
    setSyncingBcv(false);
    if (res.success && res.rate) {
      setBcvInput(res.rate.toString());
      setSyncNotice(`¡Tasa oficial BCV sincronizada: Bs. ${res.rate.toFixed(2)} / USD!`);
      setTimeout(() => setSyncNotice(null), 4000);
    } else {
      setSyncNotice('No se pudo conectar con la API de BCV. Revisa tu conexión.');
      setTimeout(() => setSyncNotice(null), 4000);
    }
  };

  // Image File Upload Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('La imagen supera los 5MB. Te sugerimos usar una imagen de menor tamaño.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProdImage(reader.result);
      }
    };
    reader.onerror = () => {
      setImageUploadError('Error al procesar la imagen seleccionada.');
    };
    reader.readAsDataURL(file);
  };

  // Open Product Modal
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory('intima');
    setProdPrice(16);
    setProdWholesalePrice(10);
    setProdSalePrice('');
    setProdCost(6);
    setProdStock(25);
    setProdSku(`MAY-${Math.floor(100 + Math.random() * 899)}`);
    setProdDesc('Prenda del mercado local venezolano con precio referencial negociable al mayor para dropshipping.');
    setProdSizes('S, M, L');
    setProdColors('Surtido');
    setProdIsBespoke(false);
    setProdImage('./images/lenceria_intima_dama_1793412626756.jpg');
    setProdSupplierOrigin('Mayoristas Galpones El Cementerio / La Hoyada');
    setProdPricingNotice('Precio referencial sujeto a cambios según disponibilidad de mayoristas. Negociable por volumen.');
    setProdIsNegotiable(true);
    setProdMinWholesaleQty(3);
    setImageInputMode('file');
    setImageUploadError(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdCategory(p.category);
    setProdPrice(p.priceUsd);
    setProdWholesalePrice(p.wholesalePriceUsd || Math.round(p.priceUsd * 0.65));
    setProdSalePrice(p.salePriceUsd ? String(p.salePriceUsd) : '');
    setProdCost(p.costUsd);
    setProdStock(p.stock);
    setProdSku(p.sku);
    setProdDesc(p.description);
    setProdSizes(p.sizes.join(', '));
    setProdColors(p.colors.join(', '));
    setProdIsBespoke(p.isBespoke);
    setProdImage(p.image);
    setProdSupplierOrigin(p.supplierOrigin || 'Mayoristas El Cementerio / La Hoyada');
    setProdPricingNotice(p.pricingNotice || 'Precio referencial sujeto a cambios de mayoristas. Negociable por volumen.');
    setProdIsNegotiable(p.isNegotiable !== undefined ? p.isNegotiable : true);
    setProdMinWholesaleQty(p.minWholesaleQty || 3);
    setImageInputMode('file');
    setImageUploadError(null);
    setShowProductModal(true);
  };

  // Save product (Poner prenda / Guardar edición)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const sizesArray = prodSizes.split(',').map(s => s.trim()).filter(Boolean);
    const colorsArray = prodColors.split(',').map(c => c.trim()).filter(Boolean);

    const productData = {
      name: prodName,
      category: prodCategory as any,
      priceUsd: Number(prodPrice),
      wholesalePriceUsd: Number(prodWholesalePrice) || Math.round(Number(prodPrice) * 0.65),
      salePriceUsd: prodSalePrice ? Number(prodSalePrice) : null,
      costUsd: Number(prodCost),
      stock: Number(prodStock),
      sku: prodSku,
      description: prodDesc,
      sizes: sizesArray.length ? sizesArray : ['Única'],
      colors: colorsArray.length ? colorsArray : ['Estándar'],
      isBespoke: prodIsBespoke,
      image: prodImage,
      secondaryImage: prodImage,
      deliveryDays: prodIsBespoke ? "7 a 10 días" : "Inmediato (24-48h)",
      featured: true,
      tags: ["Mayorista", "Dropshipping"],
      isNegotiable: prodIsNegotiable,
      minWholesaleQty: Number(prodMinWholesaleQty) || 3,
      supplierOrigin: prodSupplierOrigin,
      pricingNotice: prodPricingNotice
    };

    if (editingProduct) {
      try {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        const updated = await res.json();
        onUpdateProducts(products.map(p => p.id === editingProduct.id ? updated : p));
      } catch (err) {
        onUpdateProducts(products.map(p => p.id === editingProduct.id ? { ...editingProduct, ...productData } : p));
      }
      triggerToast(`Prenda "${prodName}" actualizada correctamente`, 'success');
    } else {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        const created = await res.json();
        onUpdateProducts([created, ...products]);
      } catch (err) {
        const fallback = { id: `prod-${Date.now()}`, slug: prodName.toLowerCase(), ...productData };
        onUpdateProducts([fallback as any, ...products]);
      }
      triggerToast(`¡Prenda "${prodName}" añadida al catálogo con éxito!`, 'success');
    }

    setShowProductModal(false);
  };

  // Confirm delete (Quitar prenda a voluntad)
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const target = productToDelete;
    try {
      await fetch(`/api/products/${target.id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    onUpdateProducts(products.filter(p => p.id !== target.id));
    triggerToast(`Prenda "${target.name}" eliminada del catálogo`, 'delete');
    setProductToDelete(null);
  };

  // Toggle Stock availability (Pausar / Agotar sin eliminar definitivamente)
  const handleToggleStock = async (p: Product) => {
    const newStock = p.stock > 0 ? 0 : 25;
    const updated = { ...p, stock: newStock };
    try {
      await fetch(`/api/products/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
    } catch {}
    onUpdateProducts(products.map(item => item.id === p.id ? updated : item));
    triggerToast(
      newStock === 0 
        ? `"${p.name}" marcada como Agotada / Pausada temporalmente` 
        : `"${p.name}" reactivada con 25 unidades en stock`,
      'info'
    );
  };

  // Order Status update
  const handleOrderStatusChange = async (orderId: string, newStatus: any) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
    }
    onUpdateOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Send WhatsApp message to customer about status
  const handleNotifyCustomer = (order: Order) => {
    const statusText: Record<string, string> = {
      pago_verificado: "¡Tu pago ha sido verificado con éxito y ya estamos empacando tus prendas!",
      preparando: "Tu pedido se encuentra en preparación y control de calidad en nuestro atelier.",
      enviado: `Tu paquete ha sido enviado vía ${order.shippingAgencyName}. En breve te compartiremos la foto de la guía física.`,
      entregado: "¡Tu paquete ha sido entregado! Esperamos que disfrutes tus prendas de Elibeth Del Valle Store.",
      cancelado: "Tu pedido ha sido cancelado. Si tienes dudas comunícate con nosotros."
    };

    const text = encodeURIComponent(
      `🦁 *ACTUALIZACIÓN DE PEDIDO - ELIBETH DEL VALLE STORE*\n` +
      `_El renacer de mi fuerza_\n\n` +
      `Hola *${order.customerName}*,\n` +
      `Te informamos sobre tu orden *#${order.id}*:\n\n` +
      `📌 *Estado Actual:* ${order.status.toUpperCase().replace('_', ' ')}\n` +
      `✨ ${statusText[order.status] || "Estamos gestionando tu pedido con la máxima atención."}\n\n` +
      `Cualquier consulta adicional estamos a tu entera disposición.`
    );
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  // Gemini Trends Trigger
  const handleFetchTrends = async () => {
    setTrendLoading(true);
    try {
      const res = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: trendCategory, season: trendSeason })
      });
      const data = await res.json();
      setTrendResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTrendLoading(false);
    }
  };

  // Create product directly from AI Trend
  const handleAddTrendToCatalog = (trend: TrendInsight) => {
    setEditingProduct(null);
    setProdName(trend.title);
    setProdCategory(trend.category === 'encargo' ? 'mujer' : trend.category);
    setProdPrice(trend.suggestedRetailPriceUsd);
    setProdSalePrice('');
    setProdCost(trend.targetPurchasePriceUsd);
    setProdStock(trend.recommendedStockUnits || 10);
    setProdSku(`TRD-${Math.floor(100 + Math.random() * 899)}`);
    setProdDesc(`${trend.whyTrending} Recomendado para: ${trend.targetAudience}. Abastecimiento: ${trend.sourcingLocations}`);
    setProdSizes('S, M, L');
    setProdColors('Según proveedor / Tendencia');
    setProdIsBespoke(trend.category === 'encargo');
    setProdImage('/src/assets/images/collection_woman_gold_1793411522165.jpg');
    setShowProductModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-6xl bg-[#FBF7EE] dark:bg-[#12100E] text-[#3B2A10] dark:text-[#FBF7EE] rounded-2xl shadow-2xl border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 flex flex-col max-h-[90vh] overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#3B2A10] dark:bg-[#1A1612] text-[#FBF7EE] flex items-center justify-between border-b border-[#D4B24C]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4B24C]">
              <img src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Panel Administrativo VIP</span>
                <span className="text-[10px] font-sans font-semibold bg-[#D4B24C] text-[#12100E] px-2 py-0.5 rounded-md">
                  Elibeth Del Valle Store
                </span>
              </h2>
              <p className="text-[11px] text-[#FBF7EE]/70 font-mono">
                Control de inventario, tasa BCV, comprobantes y Radar IA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick BCV form in header */}
            <form onSubmit={handleSaveBcv} className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 text-xs">
              <span className="text-[#D4B24C] font-semibold">Tasa BCV:</span>
              <input
                type="number"
                step="0.01"
                value={bcvInput}
                onChange={(e) => setBcvInput(e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-black/40 text-white rounded text-xs font-mono font-bold text-center focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={bcvSaving}
                className="text-[11px] font-bold text-[#D4B24C] hover:text-white px-1 cursor-pointer"
              >
                {bcvSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className={`w-3.5 h-3.5 ${bcvSaving ? 'animate-spin' : ''}`} />}
              </button>
            </form>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Functional segmented navigation) */}
        <div className="flex items-center px-6 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 bg-white dark:bg-[#16120E] overflow-x-auto no-scrollbar gap-2 py-2">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#D4B24C] dark:text-[#12100E] shadow-xs'
                : 'text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 hover:bg-[#3B2A10]/5 dark:hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catálogo: Poner / Quitar Prendas ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'stats'
                ? 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] shadow-xs'
                : 'text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:bg-[#3B2A10]/5 dark:hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Resumen & Métricas</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'orders'
                ? 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] shadow-xs'
                : 'text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:bg-[#3B2A10]/5 dark:hover:bg-white/5'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Pedidos & Comprobantes ({orders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trends');
              if (!trendResults) handleFetchTrends();
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'trends'
                ? 'bg-[#B8962E] text-white shadow-xs'
                : 'text-[#B8962E] dark:text-[#D4B24C] hover:bg-[#D4B24C]/10 font-bold'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Radar de Tendencias IA</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'settings'
                ? 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] shadow-xs'
                : 'text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:bg-[#3B2A10]/5 dark:hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pagos & Ajustes</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
              activeTab === 'seo'
                ? 'bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] shadow-xs'
                : 'text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:bg-[#3B2A10]/5 dark:hover:bg-white/5'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SEO & Posicionamiento</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: METRICS & SUMMARY */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-semibold">
                    <span>Total Facturado</span>
                    <DollarSign className="w-4 h-4 text-[#B8962E]" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-[#3B2A10] dark:text-[#F4E7BD] mt-2 tabular-nums">
                    {formatUsd(totalSalesUsd)}
                  </p>
                  <p className="font-mono text-xs text-[#B8962E] dark:text-[#D4B24C] mt-1 tabular-nums">
                    {formatBs(totalSalesBs)}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-semibold">
                    <span>Pedidos Verificados</span>
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
                    {verifiedOrdersCount}
                  </p>
                  <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 mt-1">
                    {pendingOrdersCount} pendiente(s) por verificar
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-semibold">
                    <span>Ticket Promedio</span>
                    <TrendingUp className="w-4 h-4 text-[#B8962E]" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-[#3B2A10] dark:text-[#F4E7BD] mt-2 tabular-nums">
                    {formatUsd(averageTicketUsd)}
                  </p>
                  <p className="font-mono text-xs text-[#B8962E] dark:text-[#D4B24C] mt-1 tabular-nums">
                    {formatBs(averageTicketUsd * bcvRate)}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-semibold">
                    <span>Tasa Oficial BCV</span>
                    <RefreshCw className="w-4 h-4 text-[#B8962E]" />
                  </div>
                  <p className="font-mono text-2xl font-bold text-[#B8962E] dark:text-[#D4B24C] mt-2 tabular-nums">
                    {formatBs(bcvRate)}
                  </p>
                  <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 mt-1">
                    Último ajuste: {new Date(config.lastBcvUpdate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Geographical Distribution in Venezuela */}
              <div className="p-5 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs space-y-4">
                <h3 className="font-display text-base font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
                  Distribución de Pedidos por Estados de Venezuela
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <p className="font-semibold">Distrito Capital</p>
                    <p className="font-mono text-lg font-bold text-[#B8962E] mt-1">42%</p>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Delivery & MRW</span>
                  </div>
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <p className="font-semibold">Miranda</p>
                    <p className="font-mono text-lg font-bold text-[#B8962E] mt-1">26%</p>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Chacao / Baruta</span>
                  </div>
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <p className="font-semibold">Carabobo</p>
                    <p className="font-mono text-lg font-bold text-[#B8962E] mt-1">14%</p>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Valencia ZOOM</span>
                  </div>
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <p className="font-semibold">Zulia</p>
                    <p className="font-mono text-lg font-bold text-[#B8962E] mt-1">9%</p>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Maracaibo TEALCA</span>
                  </div>
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <p className="font-semibold">Anzoátegui</p>
                    <p className="font-mono text-lg font-bold text-[#B8962E] mt-1">5%</p>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Lechería MRW</span>
                  </div>
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <p className="font-semibold">Otros Estados</p>
                    <p className="font-mono text-lg font-bold text-[#B8962E] mt-1">4%</p>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Lara, Aragua...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & PRODUCTS (PONER Y QUITAR PRENDAS A VOLUNTAD) */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Toast Feedback Banner */}
              {adminToast && (
                <div className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
                  adminToast.type === 'delete'
                    ? 'bg-red-900/90 text-red-100 border border-red-500/40'
                    : adminToast.type === 'info'
                    ? 'bg-[#3B2A10] text-[#D4B24C] border border-[#D4B24C]/40'
                    : 'bg-emerald-900/90 text-emerald-100 border border-emerald-500/40'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#D4B24C]" />
                    <span>{adminToast.message}</span>
                  </div>
                  <button onClick={() => setAdminToast(null)} className="text-white/60 hover:text-white cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                <div>
                  <h3 className="font-display text-base font-bold text-[#3B2A10] dark:text-[#F4E7BD] flex items-center gap-2">
                    <span>Gestión de Prendas del Catálogo</span>
                    <span className="px-2 py-0.5 bg-[#D4B24C]/20 text-[#B8962E] dark:text-[#D4B24C] text-[11px] font-mono rounded-full font-bold">
                      {products.length} prendas
                    </span>
                  </h3>
                  <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 mt-0.5">
                    Pon y quita prendas del catálogo a voluntad. Sube fotos desde tu dispositivo o enlaces, y fija precios en USD con cálculo automático en Bs. (Tasa BCV).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onResetCatalog && (
                    <button
                      type="button"
                      onClick={onResetCatalog}
                      className="px-3 py-2 border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 hover:bg-[#3B2A10]/5 text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Restaurar catálogo inicial de mayoristas venezolanos"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Restaurar Catálogo Base</span>
                    </button>
                  )}
                  <button
                    onClick={openNewProductModal}
                    className="px-4 py-2 bg-gradient-to-r from-[#B8962E] to-[#D4B24C] hover:from-[#9E7F25] hover:to-[#B8962E] text-[#12100E] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Poner Nueva Prenda</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar: Search & Category Chips */}
              <div className="p-3 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Search box */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#3B2A10]/40 dark:text-[#FBF7EE]/40" />
                    <input
                      type="text"
                      value={invSearch}
                      onChange={(e) => setInvSearch(e.target.value)}
                      placeholder="Buscar por nombre de prenda, SKU, tela..."
                      className="w-full pl-9 pr-8 py-2 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/15 dark:border-[#D4B24C]/20 rounded-lg text-xs focus:outline-hidden focus:border-[#B8962E]"
                    />
                    {invSearch && (
                      <button
                        onClick={() => setInvSearch('')}
                        className="absolute right-2.5 top-2 text-[#3B2A10]/40 hover:text-[#3B2A10] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Stock filter selector */}
                  <div className="flex items-center gap-1 self-stretch sm:self-auto text-xs shrink-0 bg-[#FBF7EE] dark:bg-[#12100E] p-1 rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <span className="text-[11px] font-semibold text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 px-1.5">Stock:</span>
                    <button
                      onClick={() => setInvStockFilter('all')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        invStockFilter === 'all'
                          ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                          : 'text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:bg-black/5'
                      }`}
                    >
                      Todos ({products.length})
                    </button>
                    <button
                      onClick={() => setInvStockFilter('in_stock')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        invStockFilter === 'in_stock'
                          ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                          : 'text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:bg-black/5'
                      }`}
                    >
                      En Stock ({products.filter(p => p.stock > 5).length})
                    </button>
                    <button
                      onClick={() => setInvStockFilter('low_stock')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        invStockFilter === 'low_stock'
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-700 dark:text-amber-400 hover:bg-amber-500/10'
                      }`}
                    >
                      Bajo ({products.filter(p => p.stock > 0 && p.stock <= 5).length})
                    </button>
                    <button
                      onClick={() => setInvStockFilter('out_of_stock')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        invStockFilter === 'out_of_stock'
                          ? 'bg-red-600 text-white'
                          : 'text-red-600 dark:text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      Pausadas ({products.filter(p => p.stock === 0).length})
                    </button>
                  </div>
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
                  <span className="text-[11px] text-[#3B2A10]/50 dark:text-[#FBF7EE]/50 font-medium shrink-0">Categoría:</span>
                  {[
                    { id: 'todos', label: 'Todas' },
                    { id: 'intima', label: 'Ropa Íntima Dama' },
                    { id: 'pantalones', label: 'Pantalones & Jeans' },
                    { id: 'deportivo', label: 'Franelas & Deportivo' },
                    { id: 'caballero', label: 'Caballeros' },
                    { id: 'mujer', label: 'Mujer / Gala' },
                    { id: 'encargo', label: 'Por Encargo' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setInvCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        invCategory === cat.id
                          ? 'bg-[#B8962E] text-white shadow-xs'
                          : 'bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/15 dark:border-[#D4B24C]/20 text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:border-[#B8962E]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of Products */}
              <div className="overflow-x-auto bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                {products.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <Package className="w-12 h-12 text-[#B8962E]/40 mx-auto" />
                    <h4 className="font-display text-base font-bold">No hay productos en el catálogo</h4>
                    <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 max-w-sm mx-auto">
                      Actualmente has quitado todos los productos. Puedes agregar prendas nuevas o restaurar el catálogo inicial de mayoristas.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={openNewProductModal}
                        className="px-4 py-2 bg-[#B8962E] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        + Poner Nueva Prenda
                      </button>
                      {onResetCatalog && (
                        <button
                          onClick={onResetCatalog}
                          className="px-4 py-2 border border-[#B8962E] text-[#B8962E] text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          Restaurar Catálogo Base
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 font-semibold text-[#3B2A10]/80 dark:text-[#FBF7EE]/80">
                      <tr>
                        <th className="p-3">Prenda & Foto</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Precio USD</th>
                        <th className="p-3">Precio Bs. (BCV)</th>
                        <th className="p-3">Mayorista / Dropshipping</th>
                        <th className="p-3">Stock & Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3B2A10]/5 dark:divide-[#D4B24C]/10">
                      {products
                        .filter(p => {
                          const matchesSearch = !invSearch || 
                            p.name.toLowerCase().includes(invSearch.toLowerCase()) ||
                            p.sku.toLowerCase().includes(invSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(invSearch.toLowerCase()) ||
                            (p.tags && p.tags.some(t => t.toLowerCase().includes(invSearch.toLowerCase())));
                          const matchesCat = invCategory === 'todos' || p.category === invCategory;
                          const matchesStock = invStockFilter === 'all'
                            ? true
                            : invStockFilter === 'out_of_stock'
                            ? p.stock === 0
                            : invStockFilter === 'low_stock'
                            ? (p.stock > 0 && p.stock <= 5)
                            : p.stock > 5;
                          return matchesSearch && matchesCat && matchesStock;
                        })
                        .map(p => {
                          const effective = p.salePriceUsd || p.priceUsd;
                          return (
                            <tr key={p.id} className="hover:bg-[#3B2A10]/2 dark:hover:bg-white/2 transition-colors">
                              <td className="p-3 flex items-center gap-3">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-11 h-13 object-cover rounded-md border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shrink-0 bg-white"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = './images/lenceria_intima_dama_1793412626756.jpg';
                                  }}
                                />
                                <div className="space-y-0.5 max-w-[200px]">
                                  <p className="font-bold line-clamp-1 text-[#3B2A10] dark:text-[#F4E7BD]">{p.name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">{p.sku}</span>
                                    {p.isNegotiable && (
                                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold rounded">
                                        Negociable
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 capitalize font-medium text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
                                {p.category}
                                {p.isBespoke && (
                                  <span className="block text-[10px] text-[#B8962E] font-bold">Por Encargo</span>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold tabular-nums">
                                <span className="text-sm">{formatUsd(effective)}</span>
                                {p.salePriceUsd && (
                                  <span className="block text-[10px] text-[#3B2A10]/40 line-through">
                                    {formatUsd(p.priceUsd)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-[#B8962E] dark:text-[#D4B24C] tabular-nums">
                                {formatBs(calculateBs(effective, bcvRate))}
                              </td>
                              <td className="p-3 text-[11px] font-mono">
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                  Mayor: ${p.wholesalePriceUsd || Math.round(effective * 0.65)}
                                </span>
                                <span className="block text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                                  Min: {p.minWholesaleQty || 3} uds (Costo: ${p.costUsd})
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  {p.stock === 0 ? (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold rounded text-[10px]">
                                      Agotado / Pausado
                                    </span>
                                  ) : p.stock <= 5 ? (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold rounded text-[10px]">
                                      {p.stock} uds (Poco)
                                    </span>
                                  ) : (
                                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                                      {p.stock} uds
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStock(p)}
                                    className="p-1 text-[#3B2A10]/50 hover:text-[#B8962E] cursor-pointer"
                                    title={p.stock > 0 ? "Pausar / Marcar como Agotado" : "Reactivar stock (+25 uds)"}
                                  >
                                    {p.stock > 0 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditProductModal(p)}
                                    className="px-2.5 py-1.5 bg-[#3B2A10]/5 hover:bg-[#3B2A10]/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-md text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                                    title="Editar foto, precio o stock"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#B8962E]" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    onClick={() => setProductToDelete(p)}
                                    className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/70 dark:hover:bg-red-900/90 text-red-700 dark:text-red-300 rounded-md cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                                    title="Quitar esta prenda del catálogo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Quitar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & VOUCHERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display text-base font-bold">Gestión de Pedidos & Despachos</h3>
                <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                  Verifica comprobantes de Pago Móvil/Zelle y notifica a clientes por WhatsApp
                </p>
              </div>

              <div className="overflow-x-auto bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 font-semibold">
                    <tr>
                      <th className="p-3">Pedido</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Destino</th>
                      <th className="p-3">Total ($ / Bs.)</th>
                      <th className="p-3">Pago & Ref</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B2A10]/5 dark:divide-[#D4B24C]/10">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-[#3B2A10]/2 dark:hover:bg-white/2 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#B8962E]">
                          #{order.id}
                          <span className="block text-[10px] text-[#3B2A10]/50 dark:text-[#FBF7EE]/50 font-normal">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold">{order.customerName}</p>
                          <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-mono">
                            {order.customerPhone}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium">{order.state} · {order.city}</p>
                          <span className="text-[10px] text-[#3B2A10]/50 dark:text-[#FBF7EE]/50">
                            {order.shippingAgencyName}
                          </span>
                        </td>
                        <td className="p-3 font-mono tabular-nums">
                          <p className="font-bold">{formatUsd(order.totalUsd)}</p>
                          <p className="text-[10px] text-[#B8962E] dark:text-[#D4B24C]">{formatBs(order.totalBs)}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold uppercase text-[10px] bg-[#3B2A10]/10 dark:bg-[#D4B24C]/20 px-1.5 py-0.5 rounded">
                            {order.paymentMethod}
                          </span>
                          {order.paymentRef && (
                            <p className="font-mono text-[10px] mt-0.5 text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
                              Ref: {order.paymentRef}
                            </p>
                          )}
                          {order.voucherUrl && (
                            <button
                              onClick={() => setSelectedOrderVoucher(order)}
                              className="text-[10px] text-blue-600 dark:text-blue-400 underline flex items-center gap-1 mt-0.5 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ver capture</span>
                            </button>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                            className="text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded px-2 py-1 focus:outline-hidden font-medium cursor-pointer"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="pago_verificado">Pago Verificado</option>
                            <option value="preparando">Preparando</option>
                            <option value="enviado">Enviado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleNotifyCustomer(order)}
                              className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded cursor-pointer"
                              title="Notificar por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="p-1.5 bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 hover:bg-[#3B2A10]/10 rounded cursor-pointer"
                              title="Imprimir guía/factura"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RADAR DE TENDENCIAS IA (VENEZUELA) */}
          {activeTab === 'trends' && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-[#D4B24C]/15 to-transparent rounded-xl border border-[#D4B24C]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#B8962E] uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Inteligencia de Mercado con Gemini 3.8 Flash</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#3B2A10] dark:text-[#FBF7EE] mt-0.5">
                    Radar de Tendencias de Moda para Venezuela
                  </h3>
                  <p className="text-xs text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 mt-1 max-w-xl">
                    Detecta qué estilos, telas y precios tienen mayor margen y demanda real en Caracas, Valencia, Maracaibo y Lechería.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={trendCategory}
                    onChange={(e) => setTrendCategory(e.target.value)}
                    className="text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg px-2.5 py-2"
                  >
                    <option value="todas">Todas las categorías</option>
                    <option value="mujer">Moda Mujer</option>
                    <option value="hombre">Moda Hombre</option>
                    <option value="ninos">Moda Niños</option>
                    <option value="encargo">Alta Costura Por Encargo</option>
                  </select>

                  <button
                    onClick={handleFetchTrends}
                    disabled={trendLoading}
                    className="px-4 py-2 bg-[#B8962E] hover:bg-[#A68324] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${trendLoading ? 'animate-spin' : ''}`} />
                    <span>{trendLoading ? 'Analizando...' : 'Escanear Ahora'}</span>
                  </button>
                </div>
              </div>

              {trendResults ? (
                <div className="space-y-4">
                  <div className="p-3.5 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 text-xs">
                    <p className="font-semibold text-[#3B2A10] dark:text-[#F4E7BD]">
                      💡 Diagnóstico de Mercado:
                    </p>
                    <p className="text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 mt-1 leading-relaxed">
                      {trendResults.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trendResults.insights.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#D4B24C]/30 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-[#B8962E] uppercase tracking-wide">
                              {item.category} · {item.badge}
                            </span>
                            <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded">
                              Score: {item.opportunityScore}/100
                            </span>
                          </div>

                          <h4 className="font-display text-base font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
                            {item.title}
                          </h4>

                          <p className="text-xs text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 mt-1 leading-relaxed">
                            {item.whyTrending}
                          </p>

                          <div className="mt-3 p-2.5 bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 rounded-lg text-xs grid grid-cols-3 gap-2 text-center font-mono">
                            <div>
                              <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 block">Costo Objetivo</span>
                              <span className="font-bold">${item.targetPurchasePriceUsd}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 block">Venta Sugerida</span>
                              <span className="font-bold text-[#B8962E]">${item.suggestedRetailPriceUsd}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 block">Margen</span>
                              <span className="font-bold text-emerald-600">{item.estimatedMarginPercent}%</span>
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
                            <strong>Dónde abastecerse:</strong> {item.sourcingLocations}
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddTrendToCatalog(item)}
                          className="w-full py-2 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] hover:bg-[#231809] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar a Catálogo / Por Encargo</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                  Presiona "Escanear Ahora" para consultar a Gemini las tendencias de alta demanda en Venezuela.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS & PAYMENT DATA */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="font-display text-base font-bold">Datos Bancarios para Clientes en Venezuela</h3>
                <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                  Estos datos se muestran en la pantalla de pago y en los mensajes automáticos de WhatsApp.
                </p>
              </div>

              {/* BCV Live Connection & Rate Card */}
              <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#D4B24C]/30 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#B8962E] uppercase tracking-wider block">
                      Tasa Oficial del Dólar BCV (Venezuela)
                    </span>
                    <span className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                      Fuente: {config.bcvSource || 'Banco Central de Venezuela (BCV Oficial vía ve.dolarapi.com)'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/30">
                    API Conectada
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#FBF7EE] dark:bg-[#12100E] rounded-lg border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                  <div>
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 block">Tasa de Referencia Activa</span>
                    <p className="font-mono text-xl font-extrabold text-[#3B2A10] dark:text-[#F4E7BD] tabular-nums">
                      {formatBs(bcvRate)} <span className="text-xs font-normal text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">/ $1 USD</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSyncBcv && (
                      <button
                        type="button"
                        onClick={handleTriggerBcvSync}
                        disabled={syncingBcv}
                        className="px-3.5 py-2 bg-[#B8962E] hover:bg-[#9B7A1E] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncingBcv ? 'animate-spin' : ''}`} />
                        <span>{syncingBcv ? 'Consultando BCV...' : 'Sincronizar API BCV'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {syncNotice && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    {syncNotice}
                  </div>
                )}

                {/* Manual Override Option */}
                <div className="pt-2 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 block">
                    ¿Deseas fijar una tasa manual temporal?
                  </span>
                  <form onSubmit={handleSaveBcv} className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={bcvInput}
                      onChange={(e) => setBcvInput(e.target.value)}
                      className="w-32 px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-xs font-mono font-bold"
                    />
                    <button
                      type="submit"
                      disabled={bcvSaving}
                      className="px-3 py-1.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] text-xs font-semibold rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {bcvSaving ? 'Guardando...' : 'Fijar Manual'}
                    </button>
                    {bcvSuccess && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> ¡Fijada!
                      </span>
                    )}
                  </form>
                </div>
              </div>

              {/* Pago Movil Details */}
              <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-3 text-xs">
                <span className="font-bold text-[#B8962E]">Cuenta Pago Móvil</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1">Banco:</label>
                    <input
                      type="text"
                      value={config.paymentMethods.pagoMovil.banco}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.paymentMethods.pagoMovil.banco = e.target.value;
                        onUpdateConfig(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Teléfono:</label>
                    <input
                      type="text"
                      value={config.paymentMethods.pagoMovil.telefono}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.paymentMethods.pagoMovil.telefono = e.target.value;
                        onUpdateConfig(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Cédula:</label>
                    <input
                      type="text"
                      value={config.paymentMethods.pagoMovil.cedula}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.paymentMethods.pagoMovil.cedula = e.target.value;
                        onUpdateConfig(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Titular:</label>
                    <input
                      type="text"
                      value={config.paymentMethods.pagoMovil.titular}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.paymentMethods.pagoMovil.titular = e.target.value;
                        onUpdateConfig(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Zelle and Binance */}
              <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-3 text-xs">
                <span className="font-bold text-[#B8962E]">Zelle & Binance Pay</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1">Correo Zelle:</label>
                    <input
                      type="text"
                      value={config.paymentMethods.zelle.email}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.paymentMethods.zelle.email = e.target.value;
                        onUpdateConfig(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Binance Pay ID:</label>
                    <input
                      type="text"
                      value={config.paymentMethods.binance.payId}
                      onChange={(e) => {
                        const updated = { ...config };
                        updated.paymentMethods.binance.payId = e.target.value;
                        onUpdateConfig(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#FBF7EE] dark:bg-[#12100E] border border-[#3B2A10]/20 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="font-display text-base font-bold">SEO & Visibilidad en Redes</h3>
                <p className="text-xs text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                  Previsualización de cómo aparece tu boutique en Google y al compartir el link en WhatsApp
                </p>
              </div>

              {/* Google Snippet Preview */}
              <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-2">
                <span className="text-[11px] text-[#3B2A10]/50 dark:text-[#FBF7EE]/50 uppercase font-semibold">
                  Previsualización en Google Search
                </span>
                <div className="space-y-1">
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-400 font-mono">
                    https://elibethdelvallestore.com
                  </div>
                  <h4 className="text-base text-blue-800 dark:text-blue-400 font-medium hover:underline cursor-pointer">
                    ELIBETH DEL VALLE STORE | El renacer de mi fuerza
                  </h4>
                  <p className="text-xs text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 leading-normal">
                    Boutique de moda exclusiva en Venezuela: Colección Mujer, Hombre y Niños. Confección por encargo, precios en USD/Bs. tasa BCV, y pagos en Pago Móvil, Zelle y Binance.
                  </p>
                </div>
              </div>

              {/* Open Graph WhatsApp Preview Card */}
              <div className="p-4 bg-white dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 space-y-2">
                <span className="text-[11px] text-[#3B2A10]/50 dark:text-[#FBF7EE]/50 uppercase font-semibold">
                  Tarjeta Open Graph (WhatsApp / Redes)
                </span>
                <div className="border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 rounded-xl overflow-hidden max-w-sm">
                  <img
                    src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg"
                    alt="Logo preview"
                    className="w-full aspect-[16/9] object-contain bg-white p-4"
                  />
                  <div className="p-3 bg-[#FBF7EE] dark:bg-[#12100E] border-t border-[#3B2A10]/10">
                    <p className="text-[10px] text-[#3B2A10]/50 uppercase font-mono">elibethdelvallestore.com</p>
                    <p className="font-bold text-xs">ELIBETH DEL VALLE STORE</p>
                    <p className="text-[11px] text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 line-clamp-1">
                      El renacer de mi fuerza · Moda de lujo accesible en Venezuela
                    </p>
                  </div>
                </div>
              </div>

              {/* XML Sitemap & Robots Link */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#B8962E] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver sitemap.xml</span>
                </a>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#B8962E] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver robots.txt</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL (MANUAL FOTO, PRECIO, CANTIDAD) */}
      {showProductModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] dark:bg-[#1A1612] rounded-2xl p-5 sm:p-6 max-w-2xl w-full border border-[#D4B24C]/40 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 pb-3">
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#3B2A10] dark:text-[#F4E7BD] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#B8962E] dark:text-[#D4B24C]" />
                  <span>{editingProduct ? 'Editar Prenda' : 'Carga Manual de Prenda / Producto'}</span>
                </h3>
                <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                  Ingresa foto, precios con cálculo en Bolívares (BCV) y cantidad disponible en stock.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1 rounded-full hover:bg-[#3B2A10]/10 dark:hover:bg-[#FBF7EE]/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              
              {/* 1. SECCIÓN: FOTO DE LA PRENDA */}
              <div className="p-3.5 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#B8962E] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <ImageIcon className="w-4 h-4" />
                    <span>1. Foto de la Prenda *</span>
                  </label>
                  
                  {/* Mode selector */}
                  <div className="flex items-center gap-1 bg-[#FBF7EE] dark:bg-[#1A1612] p-0.5 rounded-lg border border-[#3B2A10]/15 dark:border-[#D4B24C]/20 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        imageInputMode === 'file'
                          ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                          : 'text-[#3B2A10]/60 dark:text-[#FBF7EE]/60'
                      }`}
                    >
                      Subir Foto
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('presets')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        imageInputMode === 'presets'
                          ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                          : 'text-[#3B2A10]/60 dark:text-[#FBF7EE]/60'
                      }`}
                    >
                      Catálogo Base
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                          : 'text-[#3B2A10]/60 dark:text-[#FBF7EE]/60'
                      }`}
                    >
                      Enlace Web
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Photo Preview Thumbnail */}
                  <div className="relative w-24 h-28 rounded-lg overflow-hidden border border-[#D4B24C]/40 bg-[#FBF7EE] dark:bg-[#1A1612] shrink-0 shadow-xs">
                    {prodImage ? (
                      <img
                        src={prodImage}
                        alt="Previsualización"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#3B2A10]/30 dark:text-[#FBF7EE]/30">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Input Options according to Mode */}
                  <div className="flex-1 w-full space-y-2">
                    {imageInputMode === 'file' && (
                      <div>
                        <input
                          type="file"
                          id="admin-product-file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <label
                          htmlFor="admin-product-file"
                          className="w-full py-3 px-4 border-2 border-dashed border-[#D4B24C]/60 hover:border-[#B8962E] bg-[#FBF7EE] dark:bg-[#1A1612] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-center"
                        >
                          <div className="flex items-center gap-2 text-[#B8962E] font-semibold">
                            <Upload className="w-4 h-4" />
                            <Camera className="w-4 h-4" />
                            <span>Seleccionar o Tomar Foto</span>
                          </div>
                          <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                            Formatos soportados: JPG, PNG o WebP desde tu computadora o teléfono móvil
                          </span>
                        </label>
                        {imageUploadError && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">{imageUploadError}</p>
                        )}
                      </div>
                    )}

                    {imageInputMode === 'presets' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto p-1">
                        {venezuelaPresets.map(preset => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => {
                              setProdImage(preset.url);
                              if (!editingProduct) setProdCategory(preset.cat);
                            }}
                            className={`p-1 text-left rounded-lg border text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                              prodImage === preset.url
                                ? 'border-[#B8962E] bg-[#D4B24C]/15 font-bold'
                                : 'border-[#3B2A10]/15 dark:border-[#D4B24C]/20 hover:bg-[#3B2A10]/5'
                            }`}
                          >
                            <img src={preset.url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                            <span className="truncate">{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {imageInputMode === 'url' && (
                      <div>
                        <input
                          type="url"
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          placeholder="https://ejemplo.com/foto-prenda.jpg"
                          className="w-full px-3 py-2 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. SECCIÓN: PRECIOS & CONVERSIÓN EN BOLÍVARES (BCV) */}
              <div className="p-3.5 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#B8962E] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <DollarSign className="w-4 h-4" />
                    <span>2. Precios & Conversión Tasa BCV ({formatBs(bcvRate)} / $1) *</span>
                  </label>
                  <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-mono">
                    Tasa Oficial Activa
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Precio Detal */}
                  <div className="p-2.5 bg-[#FBF7EE] dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <label className="block font-semibold mb-1 text-[11px]">Precio Detal ($ USD) *</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min="0.5"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono font-bold text-sm text-[#3B2A10] dark:text-[#F4E7BD]"
                    />
                    <div className="mt-1 pt-1 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/10 text-[10px] text-[#B8962E] dark:text-[#D4B24C] font-mono font-bold">
                      = {formatBs(calculateBs(prodPrice, bcvRate))}
                    </div>
                  </div>

                  {/* Precio al Mayor */}
                  <div className="p-2.5 bg-[#FBF7EE] dark:bg-[#1A1612] rounded-xl border border-emerald-500/30">
                    <label className="block font-semibold mb-1 text-[11px] text-emerald-800 dark:text-emerald-400">
                      Precio al Mayor ($ USD) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      min="0.5"
                      value={prodWholesalePrice}
                      onChange={(e) => setProdWholesalePrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#12100E] border border-emerald-500/50 rounded-lg font-mono font-bold text-sm text-emerald-700 dark:text-emerald-400"
                    />
                    <div className="mt-1 pt-1 border-t border-emerald-500/20 text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      = {formatBs(calculateBs(prodWholesalePrice, bcvRate))}
                    </div>
                  </div>

                  {/* Costo de compra */}
                  <div className="p-2.5 bg-[#FBF7EE] dark:bg-[#1A1612] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                    <label className="block font-semibold mb-1 text-[11px]">Costo Mayorista ($ USD)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={prodCost}
                      onChange={(e) => setProdCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono text-sm"
                    />
                    <div className="mt-1 pt-1 border-t border-[#3B2A10]/10 text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-mono">
                      Margen: {prodPrice > 0 ? Math.round(((prodPrice - prodCost) / prodPrice) * 100) : 0}% (+${(prodPrice - prodCost).toFixed(1)})
                    </div>
                  </div>
                </div>

                {/* Dropshipping Negotiation Toggle */}
                <div className="flex items-center justify-between p-2 bg-[#FBF7EE] dark:bg-[#1A1612] rounded-lg border border-[#3B2A10]/10 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prod-negotiable-toggle"
                      checked={prodIsNegotiable}
                      onChange={(e) => setProdIsNegotiable(e.target.checked)}
                      className="w-4 h-4 rounded text-[#B8962E] cursor-pointer"
                    />
                    <label htmlFor="prod-negotiable-toggle" className="font-semibold cursor-pointer">
                      Habilitar botón "Negociar al Mayor por WhatsApp" (Dropshipping)
                    </label>
                  </div>
                  <span className="text-[10px] text-[#B8962E] font-bold">Recomendado</span>
                </div>
              </div>

              {/* 3. SECCIÓN: CANTIDAD & INVENTARIO */}
              <div className="p-3.5 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#B8962E] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <Sliders className="w-4 h-4" />
                    <span>3. Cantidad & Stock Disponible *</span>
                  </label>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    prodStock > 10
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : prodStock > 0
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {prodStock > 10 ? 'Stock Disponible' : prodStock > 0 ? 'Pocas Unidades' : 'Agotado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Unidades en Stock *</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        required
                        value={prodStock}
                        onChange={(e) => setProdStock(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono font-bold text-sm"
                      />
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setProdStock(s => Math.max(0, s - 1))}
                          className="px-2 py-1.5 bg-[#3B2A10]/10 hover:bg-[#3B2A10]/20 rounded font-bold cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdStock(s => s + 5)}
                          className="px-2 py-1.5 bg-[#3B2A10]/10 hover:bg-[#3B2A10]/20 rounded font-bold cursor-pointer"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdStock(s => s + 10)}
                          className="px-2 py-1.5 bg-[#3B2A10]/10 hover:bg-[#3B2A10]/20 rounded font-bold cursor-pointer"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[11px]">Mínimo para Precio al Mayor (Unidades)</label>
                    <input
                      type="number"
                      min="1"
                      value={prodMinWholesaleQty}
                      onChange={(e) => setProdMinWholesaleQty(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono font-bold text-sm"
                    />
                    <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 block mt-0.5">
                      Ej: 3 prendas o docena para acceder al descuento mayorista
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. SECCIÓN: DATOS DE LA PRENDA & ORIGEN */}
              <div className="p-3.5 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 space-y-3">
                <label className="font-bold text-[#B8962E] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span>4. Detalles de la Prenda & Proveedor</span>
                </label>

                <div>
                  <label className="block font-semibold mb-1">Nombre de la Prenda *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Ej: Conjunto Lencería Encaje Francés & Bralette"
                    className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Categoría</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg"
                    >
                      <option value="intima">Ropa Íntima Dama</option>
                      <option value="pantalones">Pantalones & Jeans Colombianos</option>
                      <option value="deportivo">Franelas & Deportivo Suplex</option>
                      <option value="caballero">Prendas para Caballeros</option>
                      <option value="mujer">Mujer / Vestidos</option>
                      <option value="encargo">Por Encargo (Atelier / Bespoke)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">SKU / Código</label>
                    <input
                      type="text"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Tallas Disponibles</label>
                    <input
                      type="text"
                      value={prodSizes}
                      onChange={(e) => setProdSizes(e.target.value)}
                      placeholder="S, M, L, XL"
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Colores Disponibles</label>
                    <input
                      type="text"
                      value={prodColors}
                      onChange={(e) => setProdColors(e.target.value)}
                      placeholder="Negro, Beige, Blanco"
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Origen / Galpón Mayorista</label>
                    <input
                      type="text"
                      value={prodSupplierOrigin}
                      onChange={(e) => setProdSupplierOrigin(e.target.value)}
                      placeholder="Galpones El Cementerio / La Hoyada Caracas"
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Aviso de Precio Referencial</label>
                    <input
                      type="text"
                      value={prodPricingNotice}
                      onChange={(e) => setProdPricingNotice(e.target.value)}
                      placeholder="Precio referencial sujeto a cambio..."
                      className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Descripción de la Prenda</label>
                  <textarea
                    rows={2}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Detalles de tela, ajuste, tipo de costura y recomendaciones para revendedores..."
                    className="w-full px-3 py-1.5 bg-[#FBF7EE] dark:bg-[#1A1612] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-xl hover:bg-[#3B2A10]/5 transition-colors cursor-pointer text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] font-bold rounded-xl shadow-md hover:bg-[#231809] dark:hover:bg-[#E7CE7F] transition-all cursor-pointer flex items-center gap-2 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Prenda en Catálogo</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VOUCHER INSPECTION MODAL */}
      {selectedOrderVoucher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white dark:bg-[#12100E] rounded-xl p-4 max-w-md w-full border border-[#D4B24C]/30 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-xs">Comprobante #{selectedOrderVoucher.id}</span>
              <button onClick={() => setSelectedOrderVoucher(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={selectedOrderVoucher.voucherUrl}
              alt="Comprobante"
              className="max-h-96 w-full object-contain rounded"
            />
            <div className="text-xs text-center">
              <p className="font-semibold">{selectedOrderVoucher.customerName}</p>
              <p className="font-mono text-xs">{selectedOrderVoucher.paymentMethod} · Ref: {selectedOrderVoucher.paymentRef || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN MODAL PARA QUITAR PRENDA */}
      {productToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#FBF7EE] dark:bg-[#1A1612] rounded-2xl p-5 max-w-md w-full border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 pb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>¿Quitar Prenda del Catálogo?</span>
              </div>
              <button
                onClick={() => setProductToDelete(null)}
                className="p-1 rounded-full hover:bg-black/10 cursor-pointer text-[#3B2A10]/60 dark:text-[#FBF7EE]/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-14 h-16 object-cover rounded-lg border border-[#3B2A10]/10 shrink-0 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = './images/lenceria_intima_dama_1793412626756.jpg';
                }}
              />
              <div className="text-xs space-y-0.5">
                <p className="font-bold line-clamp-1 text-[#3B2A10] dark:text-[#F4E7BD]">{productToDelete.name}</p>
                <p className="font-mono text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">SKU: {productToDelete.sku} · Cat: {productToDelete.category}</p>
                <p className="font-mono font-bold text-[#B8962E] dark:text-[#D4B24C]">
                  {formatUsd(productToDelete.salePriceUsd || productToDelete.priceUsd)} · {formatBs(calculateBs(productToDelete.salePriceUsd || productToDelete.priceUsd, bcvRate))}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
              ¿Confirmas que deseas retirar esta prenda? Dejará de mostrarse inmediatamente en la tienda web y en el catálogo para tus clientes.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-xl text-xs font-semibold hover:bg-[#3B2A10]/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Quitar del Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
