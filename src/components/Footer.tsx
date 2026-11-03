import React from 'react';
import { MessageCircle, ShieldCheck, Truck, CreditCard, Sparkles, Code2, Phone, Mail } from 'lucide-react';
import { formatBs } from '../utils/formatters.ts';

interface FooterProps {
  bcvRate: number;
  whatsappNumber: string;
  onSelectCategory: (cat: string) => void;
  onOpenStory: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  bcvRate,
  whatsappNumber,
  onSelectCategory,
  onOpenStory,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-[#231809] text-[#FBF7EE] border-t border-[#D4B24C]/25 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D4B24C] bg-white shrink-0">
                <img
                  src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg"
                  alt="Logo Elibeth Del Valle"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-tight text-[#FBF7EE]">
                  ELIBETH STORE
                </h3>
                <p className="text-xs text-[#D4B24C] font-semibold uppercase tracking-widest">
                  El renacer de mi fuerza
                </p>
              </div>
            </div>

            <p className="text-xs text-[#FBF7EE]/70 max-w-sm leading-relaxed">
              Boutique de moda y alta costura en Venezuela. Creamos y seleccionamos piezas con distinción, elegancia accesible y cortes a medida para mujeres, hombres y niños.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-[#D4B24C]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tasa Oficial BCV: {formatBs(bcvRate)} / $1 USD</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-[#F4E7BD] uppercase tracking-wider">
              Colecciones
            </h4>
            <ul className="space-y-2 text-xs text-[#FBF7EE]/80">
              <li>
                <button
                  onClick={() => onSelectCategory('mujer')}
                  className="hover:text-[#D4B24C] transition-colors cursor-pointer"
                >
                  Colección Mujer (Vestidos & Lino)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('hombre')}
                  className="hover:text-[#D4B24C] transition-colors cursor-pointer"
                >
                  Moda Hombre & Guayaberas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('ninos')}
                  className="hover:text-[#D4B24C] transition-colors cursor-pointer"
                >
                  Colección Niños & Niñas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('encargo')}
                  className="hover:text-[#D4B24C] transition-colors cursor-pointer"
                >
                  Servicio Por Encargo (Bespoke)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service & WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-[#F4E7BD] uppercase tracking-wider">
              Atención & Envíos
            </h4>
            <ul className="space-y-2 text-xs text-[#FBF7EE]/80">
              <li>
                <button onClick={onOpenStory} className="hover:text-[#D4B24C] transition-colors cursor-pointer">
                  Nuestra Historia
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-[#D4B24C] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp VIP (0422-0217446)</span>
                </a>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="text-[#FBF7EE]/50 hover:text-[#D4B24C] transition-colors text-[11px] cursor-pointer">
                  Acceso Panel Administrador
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Venezuela Trust Seals */}
        <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#FBF7EE]/60 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Truck className="w-4 h-4 text-[#D4B24C]" />
            <span>Envíos: MRW, ZOOM, TEALCA & Delivery Express</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <CreditCard className="w-4 h-4 text-[#D4B24C]" />
            <span>Pagos: Pago Móvil, Zelle, Binance Pay & Efectivo</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4B24C]" />
            <span>Sitio Seguro y Verificado · Hecho en Venezuela</span>
          </div>
        </div>

        {/* Bottom copyright & Programmer Signature */}
        <div className="pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-[#FBF7EE]/60">
          <div className="text-center lg:text-left space-y-0.5">
            <p>© 2026 ELIBETH STORE. Todos los derechos reservados. "El renacer de mi fuerza".</p>
            <p className="text-[11px] text-[#FBF7EE]/40">Boutique & Ventas al Mayor · Caracas, Venezuela</p>
          </div>

          {/* Firma de Programador: Smith Business Solutions 2026 */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-black/40 px-4 py-2.5 rounded-2xl border border-[#D4B24C]/30 text-[11px] text-center sm:text-left shadow-inner">
            <div className="flex items-center gap-1.5 text-[#F4E7BD] font-semibold">
              <Code2 className="w-3.5 h-3.5 text-[#D4B24C] shrink-0" />
              <span>Firma de Programador: <strong className="text-[#D4B24C] font-bold">Smith Business Solutions 2026</strong></span>
            </div>

            <div className="flex items-center gap-2.5 text-[#FBF7EE]/80">
              <span className="hidden sm:inline text-white/20">|</span>
              <a
                href="https://wa.me/584220273766"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[#D4B24C] transition-colors font-mono"
                title="Contactar al programador por teléfono / WhatsApp"
              >
                <Phone className="w-3 h-3 text-[#D4B24C] shrink-0" />
                <span>04220273766</span>
              </a>

              <span className="text-white/20">|</span>
              <a
                href="mailto:empresaalhadiqainvest@gmail.com"
                className="flex items-center gap-1 hover:text-[#D4B24C] transition-colors"
                title="Escribir al correo de Smith Business Solutions"
              >
                <Mail className="w-3 h-3 text-[#D4B24C] shrink-0" />
                <span>empresaalhadiqainvest@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
