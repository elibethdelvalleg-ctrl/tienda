import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, ShieldCheck, Sun, Moon, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';
import { formatBs } from '../utils/formatters.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface NavbarProps {
  bcvRate: number;
  cartCount: number;
  favoritesCount: number;
  activeCategory: string;
  currencyMode: 'both' | 'usd' | 'bs';
  isDarkMode: boolean;
  onSelectCategory: (cat: string) => void;
  onToggleCurrencyMode: () => void;
  onToggleTheme: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenAbout: () => void;
  onSyncBcv?: () => Promise<{ success: boolean; rate?: number }>;
}

export const Navbar: React.FC<NavbarProps> = ({
  bcvRate,
  cartCount,
  favoritesCount,
  activeCategory,
  currencyMode,
  isDarkMode,
  onSelectCategory,
  onToggleCurrencyMode,
  onToggleTheme,
  onOpenCart,
  onOpenFavorites,
  onOpenSearch,
  onOpenAdmin,
  onOpenAbout,
  onSyncBcv,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncingBcv, setSyncingBcv] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const handleTriggerSync = async () => {
    if (!onSyncBcv || syncingBcv) return;
    setSyncingBcv(true);
    const res = await onSyncBcv();
    setSyncingBcv(false);
    if (res.success && res.rate) {
      setSyncNotice(`¡BCV actualizado: Bs. ${res.rate.toFixed(2)}!`);
      setTimeout(() => setSyncNotice(null), 3000);
    }
  };

  const navCategories = [
    { id: 'todos', label: 'Todo' },
    { id: 'intima', label: 'Ropa Íntima Dama' },
    { id: 'pantalones', label: 'Pantalones & Jeans' },
    { id: 'deportivo', label: 'Franelas & Deportivo' },
    { id: 'caballero', label: 'Caballeros' },
    { id: 'encargo', label: 'Por Encargo' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FBF7EE]/90 dark:bg-[#12100E]/90 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 transition-colors">
      {/* Top Utility Announcement Bar */}
      <div className="bg-[#3B2A10] dark:bg-[#1E1710] text-[#FBF7EE] text-xs px-4 py-1.5 flex items-center justify-between border-b border-[#D4B24C]/20">
        <div className="flex items-center gap-3 text-xs tracking-wide">
          <div className="flex items-center gap-1.5 font-medium text-[#D4B24C]">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Tasa BCV:</span>
            <span className="font-mono tabular-nums font-bold text-white">
              {formatBs(bcvRate)} / $1
            </span>
            {onSyncBcv && (
              <button
                type="button"
                onClick={handleTriggerSync}
                disabled={syncingBcv}
                title="Sincronizar con API oficial de BCV"
                className="p-1 hover:text-white rounded-sm transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${syncingBcv ? 'animate-spin text-white' : ''}`} />
              </button>
            )}
            {syncNotice && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {syncNotice}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden lg:inline text-amber-200/90 font-medium">
            Precios referenciales · ¡Negociables por volumen o compras al mayor!
          </span>
          <span className="hidden sm:inline text-white/40">|</span>
          <button
            onClick={onToggleCurrencyMode}
            className="hidden sm:inline-flex items-center gap-1 text-white/80 hover:text-[#D4B24C] transition-colors cursor-pointer"
            title="Cambiar formato de precios"
          >
            <span>Ver precios en:</span>
            <span className="font-semibold underline underline-offset-2">
              {currencyMode === 'both' ? 'USD + Bs.' : currencyMode === 'usd' ? 'Solo USD ($)' : 'Solo Bs.'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="hidden md:inline text-white/70">
            Envíos asegurados por MRW, Zoom y Tealca a todo el país
          </span>
          <a
            href="https://wa.me/584120000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#D4B24C] hover:text-white transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="font-medium">WhatsApp VIP</span>
          </a>
        </div>
      </div>

      {/* Main Top Bar Contract: Brand - Nav Links - Primary Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with Lion Insignia */}
        <button
          onClick={() => onSelectCategory('todos')}
          className="flex items-center gap-3 text-left group cursor-pointer shrink-0"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4B24C] shadow-sm bg-white shrink-0 group-hover:scale-105 transition-transform">
            <img
              src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg"
              alt="Logo Elibeth Del Valle"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#3B2A10] dark:text-[#F4E7BD] leading-tight whitespace-nowrap">
              ELIBETH STORE
            </span>
            <span className="text-[10px] tracking-widest text-[#B8962E] dark:text-[#D4B24C] font-semibold uppercase whitespace-nowrap">
              El renacer de mi fuerza
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (single line, clean typography) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navCategories.map((item) => {
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectCategory(item.id)}
                className={`transition-colors whitespace-nowrap py-1 border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-[#B8962E] text-[#B8962E] dark:text-[#D4B24C] font-semibold'
                    : 'border-transparent text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 hover:text-[#B8962E] dark:hover:text-[#D4B24C]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={onOpenAbout}
            className="text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:text-[#B8962E] dark:hover:text-[#D4B24C] transition-colors whitespace-nowrap py-1 border-b-2 border-transparent cursor-pointer"
          >
            Nuestra Historia
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 text-[#3B2A10]/70 dark:text-[#FBF7EE]/80 hover:text-[#B8962E] hover:bg-[#3B2A10]/5 dark:hover:bg-[#FBF7EE]/5 rounded-full transition-colors cursor-pointer"
            aria-label="Buscar prendas"
            title="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Currency Toggle (Mobile friendly) */}
          <button
            onClick={onToggleCurrencyMode}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border border-[#D4B24C]/40 text-[#3B2A10] dark:text-[#F4E7BD] hover:bg-[#D4B24C]/10 transition-colors cursor-pointer"
            title="Alternar moneda"
          >
            <RefreshCw className="w-3 h-3 text-[#B8962E]" />
            <span className="uppercase font-mono">{currencyMode}</span>
          </button>

          {/* Favorites Wishlist */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2 text-[#3B2A10]/70 dark:text-[#FBF7EE]/80 hover:text-[#B8962E] hover:bg-[#3B2A10]/5 dark:hover:bg-[#FBF7EE]/5 rounded-full transition-colors cursor-pointer"
            aria-label="Lista de deseos"
            title="Favoritos"
          >
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#B8962E] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Toggle */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 py-2 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] hover:bg-[#231809] dark:hover:bg-[#E7CE7F] rounded-lg shadow-sm transition-all cursor-pointer font-medium text-xs sm:text-sm whitespace-nowrap"
            aria-label="Carrito de compras"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4B24C] dark:text-[#12100E]" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 bg-[#D4B24C] dark:bg-[#3B2A10] text-[#3B2A10] dark:text-[#D4B24C] text-xs font-bold rounded-full flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-[#3B2A10]/70 dark:text-[#FBF7EE]/80 hover:text-[#B8962E] rounded-full transition-colors cursor-pointer"
            aria-label="Alternar tema claro y oscuro"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-[#D4B24C]" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* PWA / Android Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Admin Panel launcher (Poner y quitar productos) */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#3B2A10] dark:bg-[#2A1F13] hover:bg-[#231809] dark:hover:bg-[#382B1B] text-[#D4B24C] border border-[#D4B24C]/60 hover:border-[#D4B24C] rounded-lg shadow-xs transition-all cursor-pointer text-xs font-bold"
            title="Panel de Administración: Poner y Quitar Productos a voluntad"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4B24C]" />
            <span className="hidden sm:inline">Panel Admin</span>
            <span className="sm:hidden text-[11px]">Admin</span>
          </button>
        </div>
      </div>

      {/* Mobile Submenu Categories Bar */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 gap-4 border-t border-[#3B2A10]/5 dark:border-[#D4B24C]/10 no-scrollbar text-xs font-medium bg-[#FBF7EE]/60 dark:bg-[#12100E]/60">
        {navCategories.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectCategory(item.id)}
            className={`whitespace-nowrap pb-1 border-b-2 cursor-pointer ${
              activeCategory === item.id
                ? 'border-[#B8962E] text-[#B8962E] dark:text-[#D4B24C] font-semibold'
                : 'border-transparent text-[#3B2A10]/70 dark:text-[#FBF7EE]/70'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={onOpenAbout}
          className="whitespace-nowrap pb-1 border-b-2 border-transparent text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 cursor-pointer"
        >
          Historia
        </button>
      </div>
    </header>
  );
};
