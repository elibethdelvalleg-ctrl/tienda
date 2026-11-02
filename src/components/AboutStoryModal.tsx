import React from 'react';
import { X, Sparkles, Heart, ShieldCheck } from 'lucide-react';

interface AboutStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutStoryModal: React.FC<AboutStoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-2xl bg-[#FBF7EE] dark:bg-[#1A1612] text-[#3B2A10] dark:text-[#FBF7EE] rounded-2xl shadow-2xl border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 overflow-hidden my-6 p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#3B2A10]/10 dark:hover:bg-[#FBF7EE]/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#D4B24C] shadow-lg bg-white">
            <img
              src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg"
              alt="Logo Elibeth Del Valle Store"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#3B2A10] dark:text-[#FBF7EE]">
              ELIBETH DEL VALLE STORE
            </h2>
            <p className="text-xs sm:text-sm tracking-widest text-[#B8962E] dark:text-[#D4B24C] font-semibold uppercase mt-1">
              El renacer de mi fuerza
            </p>
          </div>
        </div>

        {/* Story Prose */}
        <div className="space-y-4 text-xs sm:text-sm text-[#3B2A10]/85 dark:text-[#FBF7EE]/85 leading-relaxed border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20 pt-6">
          <p>
            <strong>ELIBETH DEL VALLE STORE</strong> nace de un testimonio vivo de superación, valentía y reinvención en Venezuela. El león de nuestra insignia no es casualidad: simboliza la nobleza indomable y el coraje de levantarse frente a las adversidades y transformar cada desafío en una oportunidad para resurgir con mayor elegancia y poder.
          </p>

          <p>
            Creemos que la moda no es solo tela y costuras; es la armadura con la que cada mujer, hombre y niño afronta su jornada con la cabeza en alto. Por eso, combinamos el concepto de <em>lujo accesible</em>: prendas de confección impecable, satenes finos, lino puro y cortes de sastre pensados especialmente para el clima y la calidez del pueblo venezolano.
          </p>

          <p>
            Nuestro taller y servicio <strong>Por Encargo</strong> rinde homenaje a las manos artesanas locales, permitiendo que cada cliente disfrute de piezas personalizadas hechas a su medida exacta, con total transparencia en precios en USD y Bolívares oficiales del BCV.
          </p>
        </div>

        {/* Brand Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/20 text-center space-y-1">
            <Sparkles className="w-4 h-4 text-[#B8962E] mx-auto" />
            <h4 className="font-bold">Elegancia Auténtica</h4>
            <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Sin excesos, con distinción atemporal.</p>
          </div>

          <div className="p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/20 text-center space-y-1">
            <Heart className="w-4 h-4 text-[#B8962E] mx-auto" />
            <h4 className="font-bold">Hecho con Pasión</h4>
            <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Atención cálida y cercana por WhatsApp.</p>
          </div>

          <div className="p-3 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/20 text-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-[#B8962E] mx-auto" />
            <h4 className="font-bold">Confianza Total</h4>
            <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Tasa oficial BCV y envíos asegurados.</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] font-semibold text-xs rounded-lg cursor-pointer"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    </div>
  );
};
