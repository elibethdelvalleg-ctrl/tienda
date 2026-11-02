import React from 'react';
import { Sparkles, ShieldCheck, Truck, CreditCard, ChevronRight } from 'lucide-react';

interface HeroBannerProps {
  onExplore: (cat: string) => void;
  onOpenStory: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore, onOpenStory }) => {
  return (
    <section className="relative overflow-hidden border-b border-[#D4B24C]/20 bg-gradient-to-b from-[#FBF7EE] to-[#F5EFE1] dark:from-[#12100E] dark:to-[#1A1612]">
      {/* Background Decorative Lion Watermark */}
      <div className="absolute right-[-80px] top-[-60px] w-96 h-96 opacity-[0.04] dark:opacity-[0.06] pointer-events-none select-none">
        <img
          src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg"
          alt=""
          className="w-full h-full object-contain filter grayscale"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Message & Editorial Invitation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#B8962E] dark:text-[#D4B24C] bg-[#D4B24C]/10 rounded-full border border-[#D4B24C]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mercado Local Mayorista & Dropshipping Venezuela</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#3B2A10] dark:text-[#FBF7EE] leading-[1.1] text-balance">
                El renacer de <span className="italic font-normal text-gold-gradient">mi fuerza</span>
              </h1>
              <p className="text-base sm:text-lg text-[#3B2A10]/80 dark:text-[#FBF7EE]/80 max-w-xl leading-relaxed">
                Ropa íntima de dama, jeans colombianos, pantalones cargo, franelas deportivas y prendas para caballero directo de mayoristas venezolanos. 
                <span className="block mt-1 font-semibold text-[#B8962E] dark:text-[#D4B24C]">
                  * Precios referenciales sujetos a cambio · ¡Totalmente negociables al mayor y por docena!
                </span>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onExplore('intima')}
                className="px-6 py-3.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] hover:bg-[#231809] dark:hover:bg-[#E7CE7F] font-semibold text-sm rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>Ver Ropa Íntima Dama</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onExplore('deportivo')}
                className="px-6 py-3.5 border border-[#B8962E] text-[#3B2A10] dark:text-[#F4E7BD] hover:bg-[#D4B24C]/10 font-semibold text-sm rounded-lg transition-colors cursor-pointer"
              >
                Franelas & Deportivo Mayorista
              </button>

              <button
                onClick={() => onExplore('pantalones')}
                className="text-xs font-semibold text-[#B8962E] dark:text-[#D4B24C] hover:underline underline-offset-4 cursor-pointer py-2"
              >
                Ver Pantalones & Jeans →
              </button>
            </div>

            {/* Venezuelan Realities & Trust Badges Strip */}
            <div className="pt-6 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-[#3B2A10]/80 dark:text-[#FBF7EE]/80">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B8962E] shrink-0" />
                <span>MRW, Zoom, Tealca & Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B8962E] shrink-0" />
                <span>Pago Móvil, Zelle & Binance</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-[#B8962E] shrink-0" />
                <span>Tasa Oficial BCV al día</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Editorial Showcase Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Golden Border Offset Frame */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border-2 border-[#D4B24C]/40 pointer-events-none" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] bg-[#3B2A10]/5">
                <img
                  src="/src/assets/images/hero_luxury_fashion_1793411521589.jpg"
                  alt="Campaña Elibeth Del Valle Store - Vestido dorado de alta costura"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Brand Stamp */}
                <div className="absolute bottom-4 left-4 right-4 p-4 backdrop-blur-md bg-white/80 dark:bg-[#12100E]/80 rounded-xl border border-white/20 dark:border-[#D4B24C]/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg"
                      alt=""
                      className="w-10 h-10 rounded-full border border-[#D4B24C] object-cover"
                    />
                    <div>
                      <p className="font-display text-sm font-bold text-[#3B2A10] dark:text-[#F4E7BD]">
                        Nueva Colección Gala & Lino
                      </p>
                      <p className="text-[11px] text-[#3B2A10]/70 dark:text-[#FBF7EE]/70">
                        Edición Limitada 2026 · Envíos Nacionales
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B8962E] dark:text-[#D4B24C] tabular-nums">
                    Desde $38
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
