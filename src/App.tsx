/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { ProductGrid } from './components/ProductGrid.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { BespokeSection } from './components/BespokeSection.tsx';
import { AboutStoryModal } from './components/AboutStoryModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { FavoritesModal } from './components/FavoritesModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AIAssistantBot } from './components/AIAssistantBot.tsx';
import { Footer } from './components/Footer.tsx';
import { PWAInstallButton } from './components/PWAInstallButton.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { Product, CartItem, Order, StoreConfig } from './types.ts';
import { initialProducts, initialStoreConfig } from './data/initialCatalog.ts';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('edv_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not load products from localStorage", e);
    }
    return initialProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('edv_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [config, setConfig] = useState<StoreConfig>(() => {
    try {
      const saved = localStorage.getItem('edv_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialStoreConfig;
  });

  const [bcvRate, setBcvRate] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('edv_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bcvRate) return parsed.bcvRate;
      }
    } catch {}
    return initialStoreConfig.bcvRate;
  });
  
  // UI & Filter States
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currencyMode, setCurrencyMode] = useState<'both' | 'usd' | 'bs'>('both');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User Cart & Wishlist
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('edv_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('edv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [favoritesOpen, setFavoritesOpen] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('edv_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Save favorites to local storage
  useEffect(() => {
    try {
      localStorage.setItem('edv_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Save products to local storage when updated
  useEffect(() => {
    try {
      localStorage.setItem('edv_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  // Save config to local storage when updated
  useEffect(() => {
    try {
      localStorage.setItem('edv_config', JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }, [config]);

  // Save orders to local storage when updated
  useEffect(() => {
    try {
      localStorage.setItem('edv_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Fetch initial data from server
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, confRes, ordRes] = await Promise.all([
          fetch('/api/products').catch(() => null),
          fetch('/api/settings').catch(() => null),
          fetch('/api/orders').catch(() => null)
        ]);

        if (prodRes && prodRes.ok) {
          const prods = await prodRes.json();
          const localSaved = localStorage.getItem('edv_products');
          // Only populate from server if admin hasn't customized products locally
          if (!localSaved && Array.isArray(prods) && prods.length > 0) {
            setProducts(prods);
          }
        }

        if (confRes && confRes.ok) {
          const conf = await confRes.json();
          setConfig(conf);
          if (conf.bcvRate) setBcvRate(conf.bcvRate);
        }

        if (ordRes && ordRes.ok) {
          const ords = await ordRes.json();
          if (Array.isArray(ords)) setOrders(ords);
        }
      } catch (err) {
        console.error("Error loading server data:", err);
      }
    }
    loadData();
  }, []);

  // Update BCV Rate manually
  const handleUpdateBcv = async (newRate: number) => {
    try {
      const res = await fetch('/api/settings/bcv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newRate })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setBcvRate(data.bcvRate);
          setConfig(prev => ({ ...prev, bcvRate: data.bcvRate, lastBcvUpdate: data.lastBcvUpdate }));
          return;
        }
      }
    } catch {}
    setBcvRate(newRate);
    setConfig(prev => ({ ...prev, bcvRate: newRate, lastBcvUpdate: new Date().toISOString() }));
  };

  // Sync BCV Rate from official BCV API (with client-side fallback for GitHub Pages)
  const handleSyncBcv = async (): Promise<{ success: boolean; rate?: number; error?: string }> => {
    // 1. Try server route
    try {
      const res = await fetch('/api/settings/bcv/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.bcvRate) {
          setBcvRate(data.bcvRate);
          setConfig(prev => ({
            ...prev,
            bcvRate: data.bcvRate,
            lastBcvUpdate: data.lastBcvUpdate,
            bcvSource: data.source || "Banco Central de Venezuela (BCV Oficial)"
          }));
          return { success: true, rate: data.bcvRate };
        }
      }
    } catch {}

    // 2. Direct client-side fetch (CORS allowed on DolarApi)
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (res.ok) {
        const data = await res.json();
        const num = Number(data.promedio || data.venta || data.compra);
        if (num && num > 0) {
          const rate = Number(num.toFixed(2));
          const dateStr = data.fechaActualizacion || new Date().toISOString();
          setBcvRate(rate);
          setConfig(prev => ({
            ...prev,
            bcvRate: rate,
            lastBcvUpdate: dateStr,
            bcvSource: "Banco Central de Venezuela (BCV Oficial - DolarApi)"
          }));
          return { success: true, rate };
        }
      }
    } catch (e: any) {
      return { success: false, error: e.message || "Error al conectar con la API del BCV" };
    }

    return { success: false, error: "No se pudo actualizar la tasa BCV" };
  };

  // Add to cart
  const handleAddToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.size === size && item.color === color
      );
      const effectivePrice = product.salePriceUsd || product.priceUsd;

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          subtotalUsd: newQty * effectivePrice
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            size,
            color,
            quantity: qty,
            priceUsd: effectivePrice,
            subtotalUsd: qty * effectivePrice
          }
        ];
      }
    });
  };

  const handleUpdateCartQty = (productId: string, size: string, color: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId, size, color);
      return;
    }
    setCartItems(prev =>
      prev.map(item => {
        if (item.productId === productId && item.size === size && item.color === color) {
          return {
            ...item,
            quantity: newQty,
            subtotalUsd: newQty * item.priceUsd
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string, size: string, color: string) => {
    setCartItems(prev =>
      prev.filter(
        item => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  // Wishlist toggle
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Coupon handling
  const handleApplyCoupon = (code: string) => {
    const coupon = config.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) {
      return { success: false, message: "Código de cupón no válido o expirado." };
    }
    setAppliedCoupon(coupon.code);
    return { success: true, message: `¡Cupón ${coupon.code} aplicado con éxito!` };
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const totalCartUnits = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleResetCatalog = () => {
    if (window.confirm("¿Deseas restablecer el catálogo de fábrica? Esto volverá a cargar las prendas iniciales de mayoristas venezolanos con sus precios y fotos.")) {
      setProducts(initialProducts);
      localStorage.setItem('edv_products', JSON.stringify(initialProducts));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7EE] dark:bg-[#12100E] text-[#3B2A10] dark:text-[#FBF7EE] transition-colors duration-300">
      
      {/* Banner de instalación en Android / PWA para usuarios móviles */}
      <PWAInstallButton variant="banner" />

      {/* Navbar with brand identity, lion logo & live BCV rate */}
      <Navbar
        bcvRate={bcvRate}
        cartCount={totalCartUnits}
        favoritesCount={favorites.length}
        activeCategory={activeCategory}
        currencyMode={currencyMode}
        isDarkMode={isDarkMode}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onToggleCurrencyMode={() => {
          setCurrencyMode(curr => curr === 'both' ? 'usd' : curr === 'usd' ? 'bs' : 'both');
        }}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenCart={() => setCartOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onSyncBcv={handleSyncBcv}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Editorial Hero Banner */}
        <HeroBanner
          onExplore={(cat) => {
            setActiveCategory(cat);
            const el = document.getElementById('catalogo');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenStory={() => setAboutOpen(true)}
        />

        {/* Product Catalog & Venezuelan Pricing Grid */}
        <ProductGrid
          products={products}
          bcvRate={bcvRate}
          currencyMode={currencyMode}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          favorites={favorites}
          whatsappNumber={config.whatsappNumber}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          onClearSearch={() => setSearchQuery('')}
          onToggleFavorite={handleToggleFavorite}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={handleAddToCart}
        />

        {/* Bespoke Atelier Section (Por Encargo) */}
        <BespokeSection
          whatsappNumber={config.whatsappNumber}
          onExploreBespoke={() => {
            setActiveCategory('encargo');
            const el = document.getElementById('catalogo');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

      </main>

      {/* Luxury Footer with Venezuelan Trust Seals */}
      <Footer
        bcvRate={bcvRate}
        whatsappNumber={config.whatsappNumber}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenStory={() => setAboutOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={quickViewProduct}
        bcvRate={bcvRate}
        currencyMode={currencyMode}
        isFavorite={quickViewProduct ? favorites.includes(quickViewProduct.id) : false}
        whatsappNumber={config.whatsappNumber}
        onClose={() => setQuickViewProduct(null)}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        bcvRate={bcvRate}
        config={config}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={() => setAppliedCoupon(null)}
        onSyncBcv={handleSyncBcv}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        items={cartItems}
        bcvRate={bcvRate}
        config={config}
        appliedCoupon={appliedCoupon}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <SearchModal
        isOpen={searchOpen}
        products={products}
        onClose={() => setSearchOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      <FavoritesModal
        isOpen={favoritesOpen}
        favorites={favorites}
        products={products}
        onClose={() => setFavoritesOpen(false)}
        onRemoveFavorite={handleToggleFavorite}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      <AboutStoryModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        orders={orders}
        config={config}
        bcvRate={bcvRate}
        onUpdateBcv={handleUpdateBcv}
        onSyncBcv={handleSyncBcv}
        onUpdateProducts={(prods) => setProducts(prods)}
        onUpdateOrders={(ords) => setOrders(ords)}
        onUpdateConfig={(cfg) => setConfig(cfg)}
        onResetCatalog={handleResetCatalog}
      />

      {/* Bot Asesor de Estilo y Gestor de Pedidos WhatsApp (0422-0217446) */}
      <AIAssistantBot
        products={products}
        cart={cartItems}
        bcvRate={bcvRate}
        config={config}
        onAddToCart={(prod, size, color, qty) => {
          const chosenSize = size || (prod.sizes?.[0] || 'Única');
          const chosenColor = color || (prod.colors?.[0] || 'Original');
          handleAddToCart(prod, chosenSize, chosenColor, qty || 1);
        }}
        onOpenCart={() => setCartOpen(true)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
      />

      {/* Botón Flotante de Acceso Rápido al Panel Admin (Poner y quitar productos) */}
      <button
        onClick={() => setAdminOpen(true)}
        className="fixed bottom-6 left-5 z-30 flex items-center gap-2 px-3.5 py-2.5 bg-[#3B2A10]/95 hover:bg-[#231809] text-[#D4B24C] hover:text-white border border-[#D4B24C]/60 hover:border-[#D4B24C] rounded-full shadow-lg backdrop-blur-md text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Panel Admin: Poner y Quitar Productos a voluntad"
      >
        <Sliders className="w-3.5 h-3.5 text-[#D4B24C]" />
        <span className="hidden sm:inline">Poner / Quitar Prendas</span>
        <span className="sm:hidden">Admin</span>
      </button>

      {/* Botón flotante para instalar App en Android en móviles */}
      <PWAInstallButton variant="floating" />

      {/* Indicador de conexión / offline */}
      <OfflineIndicator />

    </div>
  );
}
