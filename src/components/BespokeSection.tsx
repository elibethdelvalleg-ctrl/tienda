import React from 'react';
import { Clock, Scissors, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';

interface BespokeSectionProps {
  whatsappNumber: string;
  onExploreBespoke: () => void;
}

export const BespokeSection: React.FC<BespokeSectionProps> = ({
  whatsappNumber,
  onExploreBespoke,
}) => {
  const handleWhatsAppConsult = () => {
    const text = encodeURIComponent(
      "🦁 *CONSULTA SERVICIO POR ENCARGO - ELIBETH DEL VALLE STORE*\n" +
      "_El renacer de mi fuerza_\n\n" +
      "¡Hola! Deseo cotizar y coordinar la confección de una prenda personalizada por encargo."
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <section className="bg-gradient-to-r from-[#3B2A10] to-[#231809] text-[#FBF7EE] py-16 sm:py-20 border-y border-[#D4B24C]/30 relative overflow-hidden">
      {/* Decorative Golden Ambient Blur */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4B24C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Visual: Atelier Craftsmanship image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4B24C]/40 shadow-2xl aspect-[4/3] bg-black/40">
              <img
                src="/src/assets/images/collection_por_encargo_1793411524038.jpg"
                alt="Atelier de confección por encargo Elibeth Del Valle"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F4E7BD] flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-[#D4B24C]" />
                  <span>Bordados a mano & patrón exclusivo</span>
                </span>
                <span className="bg-[#D4B24C] text-[#12100E] font-bold px-2 py-0.5 rounded-md font-mono text-[10px]">
                  50% Anticipo
                </span>
              </div>
            </div>
          </div>

          {/* Right Text Column: Explanation & Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D4B24C] bg-[#D4B24C]/10 rounded-full border border-[#D4B24C]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Servicio Exclusivo de Atelier</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#FBF7EE] text-balance">
              Prendas Por Encargo: Diseñadas a tu medida exacta
            </h2>

            <p className="text-sm sm:text-base text-[#FBF7EE]/80 leading-relaxed">
              ¿Tienes un evento especial, boda, gala o deseas un modelo con medidas específicas? Confeccionamos piezas únicas en satén de seda, lino puro y terciopelo italiano con acabados de alta costura.
            </p>

            {/* 3 Step Process */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="font-mono text-xs font-bold text-[#D4B24C] mb-1">01. Medidas & Estilo</div>
                <p className="text-xs text-[#FBF7EE]/70">
                  Definimos tela, tonalidad y medidas exactas según tu silueta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="font-mono text-xs font-bold text-[#D4B24C] mb-1">02. 50% de Anticipo</div>
                <p className="text-xs text-[#FBF7EE]/70">
                  Abonas la mitad vía Pago Móvil o Zelle; el saldo al recibir.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <div className="font-mono text-xs font-bold text-[#D4B24C] mb-1">03. Entrega 7 a 10 Días</div>
                <p className="text-xs text-[#FBF7EE]/70">
                  Envío express nacional con garantía de ajuste perfecto.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={handleWhatsAppConsult}
                className="px-6 py-3 bg-[#D4B24C] hover:bg-[#E7CE7F] text-[#12100E] font-semibold text-xs sm:text-sm rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar Modista por WhatsApp</span>
              </button>

              <button
                onClick={onExploreBespoke}
                className="px-6 py-3 border border-[#D4B24C]/60 text-[#F4E7BD] hover:bg-white/5 font-semibold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
              >
                Ver Diseños Disponibles para Encargar
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
