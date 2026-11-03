import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  ShoppingBag, 
  ExternalLink, 
  Plus, 
  Check, 
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { Product, CartItem, StoreConfig } from '../types.ts';

interface Message {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  suggestedProducts?: Product[];
  whatsappUrl?: string;
  isOrderReady?: boolean;
}

interface AIAssistantBotProps {
  products: Product[];
  cart: CartItem[];
  bcvRate: number;
  config: StoreConfig;
  onAddToCart: (product: Product, size?: string, color?: string, qty?: number) => void;
  onOpenCart: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const AIAssistantBot: React.FC<AIAssistantBotProps> = ({
  products,
  cart,
  bcvRate,
  config,
  onAddToCart,
  onOpenCart,
  onSelectProduct
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPromptedGreeting, setHasPromptedGreeting] = useState(false);
  const [addedItemNotification, setAddedItemNotification] = useState<string | null>(null);
  
  const whatsappNumber = config.whatsappNumber || "584220217446";
  const whatsappDisplay = config.whatsappDisplay || "+58 (422) 021-7446";

  const initialGreeting: Message = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `¡Hola bella/o! Bienvenida(o) a **ELIBETH DEL VALLE STORE** 🦁✨ (*El renacer de mi fuerza*).\n\nSoy tu **Asesora Virtual de Moda y Pedidos**. Te ayudo a:\n• 👗 Encontrar la prenda ideal (lencería, jeans levanta cola, suplex deportivo o ropa para caballero).\n• 💵 Calcular precios en **Bolívares a Tasa Oficial BCV** (Hoy: **Bs. ${bcvRate.toFixed(2)} / $**).\n• 💼 Guiarte en **compras al mayor y precios por volumen** negociables.\n• 📲 **Gestionar y enviar tu pedido** directo a nuestro WhatsApp oficial **0422-0217446**.\n\n¿En qué te puedo asesorar hoy?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedProducts: products.slice(0, 3)
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [quickReplies, setQuickReplies] = useState<string[]>([
    "👗 Ver lencería en tendencia",
    "👖 Jeans Levanta Cola",
    "💼 Comprar al mayor / Precios por volumen",
    "📲 Gestionar pedido a WhatsApp",
    "💵 Tasa oficial BCV"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Show a gentle greeting bubble if the user hasn't opened the bot yet
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasPromptedGreeting(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          cart
        })
      });

      if (!res.ok) throw new Error("Error en servidor");
      const data = await res.json();

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "¡Con gusto te atiendo! Escríbenos directamente a nuestro WhatsApp oficial 0422-0217446.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProducts || [],
        whatsappUrl: data.whatsappUrl,
        isOrderReady: data.isOrderReady
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.quickReplies && Array.isArray(data.quickReplies)) {
        setQuickReplies(data.quickReplies);
      }
    } catch {
      // Full client-side intelligent assistant engine (perfect for static GitHub Pages)
      const lower = text.toLowerCase();
      let reply = "";
      let suggested: Product[] = [];
      let isOrderReady = false;
      let orderSummary = "";
      let replies = [
        "👗 Ver lencería en tendencia",
        "👖 Jeans Levanta Cola",
        "💼 Precios al mayor / Por volumen",
        "📲 Enviar Pedido a WhatsApp"
      ];

      if (lower.includes("pedido") || lower.includes("comprar") || lower.includes("orden") || lower.includes("carrito") || lower.includes("whatsapp")) {
        isOrderReady = true;
        if (cart.length > 0) {
          const totalUsd = cart.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
          const totalBs = (totalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 });
          orderSummary = `*¡HOLA ELIBETH DEL VALLE STORE! Deseo confirmar mi pedido:*%0A%0A` +
            cart.map((item, idx) => `${idx + 1}. *${item.product.name}* (Talla: ${item.size}, Color: ${item.color}) x${item.quantity} = $${(item.priceUsd * item.quantity).toFixed(2)}`).join('%0A') +
            `%0A%0A*Total USD:* $${totalUsd.toFixed(2)}` +
            `%0A*Total en Bolívares (Tasa BCV ${bcvRate.toFixed(2)}):* Bs. ${totalBs}` +
            `%0A*WhatsApp Oficial:* 0422-021-7446` +
            `%0A*Por favor indíquenme disponibilidad y datos de pago.*`;

          reply = `¡Excelente elección! Tienes **${cart.length} prenda(s)** en tu carrito por un total de **$${totalUsd.toFixed(2)} USD** (equivale a **Bs. ${totalBs}** a la tasa oficial BCV de **${bcvRate.toFixed(2)} Bs./$**).\n\nHe preparado el resumen de tu pedido listo para despacharlo a nuestro WhatsApp oficial **0422-0217446**. Pulsa el botón de abajo para enviarlo.`;
        } else {
          reply = `¡Con mucho gusto te ayudo con tu pedido! Aún no has agregado prendas al carrito. Puedes explorar nuestra lencería fina, jeans colombianos levanta cola, licras suplex o franelas de caballero.\n\nTambién puedes chatear directo al WhatsApp oficial **0422-0217446** (+58 422 021-7446).`;
        }
      } else if (lower.includes("lenceria") || lower.includes("intima") || lower.includes("bralette") || lower.includes("panties") || lower.includes("faja")) {
        suggested = products.filter(p => p.category === 'intima').slice(0, 3);
        const p1 = suggested[0];
        const bsPrice = p1 ? (p1.priceUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "12.450,00";
        reply = `¡Nuestra línea de ropa íntima femenina es sensacional! Confeccionada con encajes franceses de tacto suave, bralettes de realce sin varilla y fajas moldeadoras.\n\n💰 **Precios desde $${p1?.priceUsd || 14} USD** (~Bs. ${bsPrice} al BCV). ¡Precios especiales negociables por docena o para revendedores!`;
        replies = ["Ver tallas disponibles", "Precios al mayor", "Agregar al carrito", "WhatsApp 0422-0217446"];
      } else if (lower.includes("jean") || lower.includes("pantalon") || lower.includes("levanta cola") || lower.includes("colombian")) {
        suggested = products.filter(p => p.category === 'pantalones').slice(0, 3);
        const p1 = suggested[0];
        const bsPrice = p1 ? (p1.priceUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "24.900,00";
        reply = `¡Los Jeans Levanta Cola colombianos son los favoritos en Venezuela! Vienen con pretina ancha faja de 3 a 5 botones y pinzas traseras que realzan y estilizan la silueta.\n\n📐 **Tallas:** 4, 6, 8, 10, 12, 14.\n💵 **Precio:** $${p1?.priceUsd || 28} USD (~Bs. ${bsPrice} Tasa BCV).\n🤝 **Mayoristas / Por volumen:** Margen superior al 50%.`;
        replies = ["Guía de medidas", "Jeans oscuros", "Armar pedido por WhatsApp", "Ver catálogo completo"];
      } else if (lower.includes("deport") || lower.includes("suplex") || lower.includes("licra") || lower.includes("gym")) {
        suggested = products.filter(p => p.category === 'deportivo').slice(0, 3);
        const p1 = suggested[0];
        const bsPrice = p1 ? (p1.priceUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 }) : "16.000,00";
        reply = `¡Nuestros conjuntos deportivos en licra suplex pesada no se transparentan y tienen control de abdomen! Ideales para el gimnasio o uso diario casual.\n\n🔥 **Precios de mayorista negociables:** Desde $${p1?.priceUsd || 18} USD (~Bs. ${bsPrice} BCV).`;
        replies = ["Colores en Suplex", "Top con Biker", "Comprar al mayor", "Hablar con asesora"];
      } else if (lower.includes("caballero") || lower.includes("hombre") || lower.includes("franela")) {
        suggested = products.filter(p => p.category === 'caballero' || p.category === 'deportivo').slice(0, 3);
        reply = `Para caballeros disponemos de franelas dry-fit transpirables, shorts 2 en 1 y packs de boxers en algodón licrado de gran frescura.\n\n👕 Desde **$11.00 USD** con descuentos por volumen.`;
        replies = ["Franelas Dry-Fit", "Tallas M, L, XL", "Pedir al mayor", "WhatsApp 0422-0217446"];
      } else if (lower.includes("bcv") || lower.includes("tasa") || lower.includes("dolar") || lower.includes("bolivar") || lower.includes("bs")) {
        reply = `En **ELIBETH DEL VALLE STORE** calculamos todos los precios estrictamente a la **tasa oficial del BCV**:\n\n🇻🇪 **Tasa Oficial BCV:** Bs. **${bcvRate.toFixed(2)}** por USD.\n\nAceptamos **Pago Móvil (0422-021-7446)**, transferencias bancarias, Zelle y Binance USDT.`;
        replies = ["Ver productos", "Formas de pago", "Calcular pedido en Bs.", "WhatsApp 0422-0217446"];
      } else if (lower.includes("mayor") || lower.includes("reventa") || lower.includes("emprend") || lower.includes("negocia") || lower.includes("volumen")) {
        reply = `💼 **¡Impulsa tus ventas con nuestros precios de Mayorista y Reventa en Venezuela!**\n\n1. **Precios Negociables:** Descuentos a partir de 3 o 6 prendas surtidas o por bulto cerrado.\n2. **Envíos Nacionales:** Despachamos directo a tu dirección o agencia por MRW, Zoom o Tealca con seguro.\n3. **Márgenes del 50% al 70%** en lencería y jeans.\n\nEscríbenos al WhatsApp directo **0422-0217446** para darte la lista de precios mayorista.`;
        replies = ["Contactar al 04220217446", "Ver lencería al mayor", "Ver jeans al mayor", "Envíos nacionales"];
      } else {
        suggested = products.slice(0, 3);
        reply = `¡Hola bella/o! Estoy para ayudarte en **ELIBETH DEL VALLE STORE** 🦁 (*El renacer de mi fuerza*).\n\nPuedo ayudarte con:\n• 👗 Recomendaciones de estilo y tallas.\n• 💵 Precios en Bolívares a tasa oficial BCV (**Bs. ${bcvRate.toFixed(2)} / $**).\n• 💼 Descuentos de compras al mayor y por volumen.\n• 📲 Enviar tu pedido directo al WhatsApp **0422-0217446**.\n\n¿Qué te gustaría ver hoy?`;
      }

      const whatsappUrl = orderSummary
        ? `https://wa.me/${whatsappNumber}?text=${orderSummary}`
        : `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola Elibeth Del Valle Store! Deseo información y asesoría sobre: ${text}`)}`;

      setMessages(prev => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedProducts: suggested,
          whatsappUrl,
          isOrderReady
        }
      ]);
      setQuickReplies(replies);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProductFromBot = (product: Product) => {
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Única';
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Original';
    onAddToCart(product, defaultSize, defaultColor, 1);
    
    setAddedItemNotification(`¡"${product.name}" agregado al carrito!`);
    setTimeout(() => setAddedItemNotification(null), 3000);
  };

  // Helper to compile cart into WhatsApp message directly
  const handleCheckoutViaWhatsApp = () => {
    if (cart.length === 0) {
      handleSendMessage("Quiero hacer un pedido");
      return;
    }

    const totalUsd = cart.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
    const totalBs = (totalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 });
    
    let text = `*¡HOLA ELIBETH DEL VALLE STORE! Deseo confirmar mi pedido:*%0A%0A`;
    cart.forEach((item, index) => {
      text += `${index + 1}. *${item.product.name}*%0A   - Talla: ${item.size} | Color: ${item.color}%0A   - Cantidad: ${item.quantity} x $${item.priceUsd.toFixed(2)} = $${(item.priceUsd * item.quantity).toFixed(2)}%0A`;
    });

    text += `%0A*Total USD:* $${totalUsd.toFixed(2)}%0A*Total en Bolívares (Tasa BCV ${bcvRate.toFixed(2)}):* Bs. ${totalBs}%0A%0A*WhatsApp Receptor:* 0422-0217446%0A*Por favor confirmar disponibilidad y método de pago.*`;

    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Toast Notification when adding item from chat */}
      {addedItemNotification && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#161616] text-[#E5D7B7] border border-[#C5A059] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-sm">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{addedItemNotification}</span>
        </div>
      )}

      {/* Floating Widget Button & Welcome Tooltip */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {!isOpen && hasPromptedGreeting && (
          <div 
            onClick={() => setIsOpen(true)}
            className="mb-3 max-w-[260px] bg-[#161616] text-stone-200 border border-[#C5A059]/40 p-3 rounded-2xl shadow-2xl cursor-pointer hover:border-[#C5A059] transition-all transform hover:-translate-y-1 relative group"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <p className="text-xs font-semibold text-[#C5A059] tracking-wider uppercase">Elibeth Bot Activo</p>
            </div>
            <p className="text-xs text-stone-300">
              ¿Deseas ayuda con tallas, precios al mayor o enviar tu pedido a **WhatsApp 0422-0217446**?
            </p>
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#161616] border-r border-b border-[#C5A059]/40 transform rotate-45"></div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir Asesor y Gestor de Pedidos WhatsApp"
          className="relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#1c1a16] via-[#24211a] to-[#12110e] text-[#F9F6F0] border-2 border-[#C5A059] shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_35px_rgba(197,160,89,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 group"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#C5A059]/20 flex items-center justify-center border border-[#C5A059]/60">
              <Sparkles className="w-5 h-5 text-[#C5A059] group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#12110e]"></span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold tracking-wider text-[#C5A059] uppercase flex items-center gap-1.5">
              <span>Asesora & Pedidos</span>
              <span className="bg-emerald-950/80 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded border border-emerald-500/30">WhatsApp</span>
            </div>
            <div className="text-[11px] text-stone-400">
              0422-0217446 • Tasa BCV
            </div>
          </div>

          <div className="sm:hidden text-xs font-bold text-[#C5A059]">
            Bot 0422
          </div>
        </button>
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-h-[88vh] h-[650px] bg-[#141414] border border-[#C5A059]/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1c1a16] via-[#2a2419] to-[#141414] border-b border-[#C5A059]/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#201d18] border border-[#C5A059] flex items-center justify-center shadow-inner overflow-hidden">
                <img 
                  src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg" 
                  alt="Elibeth Del Valle Store" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#141414]"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#F9F6F0] tracking-wide">Elibeth Stylist & Pedidos</h3>
                  <span className="bg-[#C5A059]/20 text-[#C5A059] text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#C5A059]/40">
                    IA Concierge
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    0422-0217446
                  </span>
                  <span>•</span>
                  <span className="text-[#C5A059] font-mono font-medium">
                    BCV: Bs. {bcvRate.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                title="Abrir WhatsApp directo"
                className="p-1.5 text-stone-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-stone-800"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Cart Summary Bar if Cart Has Items */}
          {cart.length > 0 && (
            <div className="bg-[#1f1b13] border-b border-[#C5A059]/20 px-4 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>
                  <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong> en carrito
                </span>
                <span>•</span>
                <span className="text-[#C5A059] font-semibold">
                  ${cart.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0).toFixed(2)} USD
                </span>
              </div>
              <button
                onClick={handleCheckoutViaWhatsApp}
                className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Pedir x WhatsApp</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#141414] via-[#111111] to-[#0c0c0c] text-stone-200">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#C5A059] to-[#b38e47] text-stone-950 font-medium rounded-tr-none'
                      : 'bg-[#1b1916] border border-[#C5A059]/25 text-stone-200 rounded-tl-none'
                  }`}
                >
                  {/* Markdown formatted text rendering */}
                  <div className="space-y-2 whitespace-pre-line">
                    {msg.text.split('\n').map((line, idx) => {
                      // bold text replacement **bold**
                      const boldFormatted = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i} className={msg.sender === 'user' ? 'text-black' : 'text-[#E5D7B7]'}>{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });
                      return <p key={idx}>{boldFormatted}</p>;
                    })}
                  </div>

                  {/* Render Suggested Products Carousel Cards if present */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-stone-700/50 space-y-2">
                      <p className="text-[11px] font-semibold text-[#C5A059] tracking-wider uppercase flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Prendas recomendadas:
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggestedProducts.map((p) => {
                          const priceBs = (p.priceUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 });
                          return (
                            <div 
                              key={p.id}
                              className="bg-[#12110e] border border-[#C5A059]/30 rounded-xl p-2.5 flex items-center gap-3 hover:border-[#C5A059] transition-all group"
                            >
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-14 h-14 object-cover rounded-lg border border-stone-800"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-stone-100 truncate group-hover:text-[#C5A059] transition-colors">
                                  {p.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-bold text-[#C5A059]">
                                    ${p.priceUsd.toFixed(2)}
                                  </span>
                                  <span className="text-[10px] text-stone-400">
                                    Bs. {priceBs}
                                  </span>
                                </div>
                                <div className="text-[10px] text-stone-400 mt-0.5">
                                  Tallas: {p.sizes?.slice(0, 3).join(', ') || 'S, M, L'}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleAddProductFromBot(p)}
                                  title="Añadir al Carrito"
                                  className="p-1.5 bg-[#C5A059]/20 hover:bg-[#C5A059] text-[#C5A059] hover:text-stone-950 rounded-lg transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                                <a
                                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`¡Hola Elibeth Store! Deseo ordenar la prenda "${p.name}" ($${p.priceUsd.toFixed(2)} / Bs. ${priceBs}). ¿Tienen disponibilidad en mi talla?`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Pedir directo a WhatsApp"
                                  className="p-1.5 bg-emerald-950/80 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Render WhatsApp Order Action CTA Button if order ready or link generated */}
                  {msg.whatsappUrl && (
                    <div className="mt-3 pt-2">
                      <a
                        href={msg.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs tracking-wide shadow-lg hover:shadow-emerald-900/40 transition-all text-center"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>Enviar Pedido a WhatsApp (0422-0217446)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  <span className={`block text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-stone-800 text-right' : 'text-stone-500'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-400 text-xs py-2 px-3 bg-[#181613] rounded-2xl w-fit border border-[#C5A059]/20">
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] text-[#C5A059] font-medium ml-1">Consultando catálogo y tasa BCV...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="bg-[#12110e] border-t border-stone-800/80 px-3 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
            {quickReplies.map((chip, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1c1a16] hover:bg-[#28241d] text-stone-300 hover:text-[#C5A059] border border-stone-700/60 hover:border-[#C5A059]/60 text-xs font-medium transition-all shadow-sm active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#161616] border-t border-[#C5A059]/30 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pregunta por tallas, lencería, precios o pide tu pedido..."
              className="flex-1 bg-[#0f0f0f] border border-stone-700 focus:border-[#C5A059] text-stone-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none transition-colors placeholder:text-stone-500"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-[#C5A059] to-[#b38e47] hover:from-[#d4b069] hover:to-[#c5a059] disabled:opacity-40 text-stone-950 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer status notice */}
          <div className="bg-[#0e0e0e] py-1 px-4 text-center text-[10px] text-stone-500 border-t border-stone-900 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Atención humana de respaldo: 0422-0217446
            </span>
            <span className="text-[#C5A059]">El renacer de mi fuerza</span>
          </div>

        </div>
      )}
    </>
  );
};
