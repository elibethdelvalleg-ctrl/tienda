import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, X, Share2, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'banner' | 'floating' | 'modal-only';
  onOpenModal?: () => void;
}

export const PWAInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const result = await install();
    setInstalling(false);
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A1612] rounded-3xl shadow-2xl border border-[#D4B24C]/40 overflow-hidden transform transition-all p-6 text-[#3B2A10] dark:text-[#F7F2E7]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-5">
          <div className="relative mx-auto w-20 h-20 mb-3 rounded-2xl p-1 bg-gradient-to-tr from-[#8B6F38] via-[#D4B24C] to-[#F1DE93] shadow-lg shadow-[#D4B24C]/20">
            <img
              src="./pwa-192x192.png"
              alt="Elibeth Del Valle Store"
              className="w-full h-full object-cover rounded-xl bg-[#FBF7EE]"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white dark:border-[#1A1612]">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <h3 className="text-xl font-bold font-serif text-[#3B2A10] dark:text-[#F5E6BE]">
            Instalar en Android
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            ELIBETH DEL VALLE STORE • Versión App Móvil
          </p>
        </div>

        {/* Benefits list */}
        <div className="space-y-2.5 mb-6 bg-[#FAF5E8] dark:bg-[#251F19] p-4 rounded-2xl border border-[#D4B24C]/20 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">Acceso ultrarrápido</p>
              <p className="text-stone-500 dark:text-stone-400">Abre directo desde tu pantalla de inicio sin escribir enlaces.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#D4B24C]/20 text-[#8B6F38] dark:text-[#D4B24C]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">Experiencia App Nativa</p>
              <p className="text-stone-500 dark:text-stone-400">Pantalla completa, sin barras de navegación molestas.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-stone-800 dark:text-stone-200">Precios y BCV al instante</p>
              <p className="text-stone-500 dark:text-stone-400">Calculadora en Bolívares y pedidos automáticos por WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* Installation Action based on platform */}
        {success || isInstalled ? (
          <div className="text-center py-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
              ¡App instalada con éxito!
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              Revisa la pantalla de inicio de tu celular.
            </p>
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-[#8B6F38] via-[#B8963D] to-[#D4B24C] hover:from-[#765E2F] hover:to-[#B8963D] text-white font-semibold rounded-2xl shadow-lg shadow-[#D4B24C]/30 active:scale-95 transition transform duration-150"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>{installing ? 'Instalando en Android...' : 'Instalar App en Android'}</span>
            </button>
            <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
              Instalación directa segura garantizada por Google Chrome / Android.
            </p>
          </div>
        ) : isIOS ? (
          <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-left text-xs space-y-2">
            <p className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-[#8B6F38] dark:text-[#D4B24C]" /> Pasos para iPhone / iPad (Safari):
            </p>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 pl-1">
              <li>Pulsa el botón de <strong>Compartir</strong> <span className="font-mono text-stone-500">[ ⎋ ]</span> en la barra de Safari.</li>
              <li>Desliza hacia abajo y presiona <strong>"Agregar a pantalla de inicio"</strong>.</li>
              <li>Toca <strong>"Agregar"</strong> en la esquina superior.</li>
            </ol>
          </div>
        ) : (
          /* Android Fallback guide when prompt hasn't triggered or using secondary browser */
          <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 text-left text-xs space-y-2">
            <p className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" /> Pasos para instalar en Android (Chrome/Navegador):
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-stone-600 dark:text-stone-300 pl-1">
              <li>Abre el menú de opciones tocando los <strong>tres puntos (⋮)</strong> en la esquina superior derecha de tu navegador.</li>
              <li>Toca la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla principal"</strong>.</li>
              <li>Confirma en <strong>"Instalar"</strong> y el ícono de Elibeth Store se creará en tu Android.</li>
            </ol>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-medium py-1 px-3"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstalled, isStandalone, isAndroid } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running in standalone mode (already installed), no need to display
  if (isInstalled || isStandalone) {
    return null;
  }

  if (variant === 'banner') {
    return (
      <>
        <div className="bg-gradient-to-r from-[#291F0D] via-[#463518] to-[#291F0D] text-[#F5E6BE] px-4 py-2 text-xs flex items-center justify-between shadow-md border-b border-[#D4B24C]/30">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="p-1 rounded-lg bg-[#D4B24C]/20 text-[#F1DE93]">
              <Smartphone className="w-4 h-4" />
            </span>
            <span className="truncate">
              ¿Usas Android? <strong>Instala la App de Elibeth Store</strong> para comprar más rápido.
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="ml-3 shrink-0 px-3 py-1 bg-gradient-to-r from-[#D4B24C] to-[#F1DE93] text-[#291F0D] font-bold rounded-lg shadow hover:opacity-90 active:scale-95 transition flex items-center gap-1.5 text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar App
          </button>
        </div>
        <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#1A1612] text-[#F5E6BE] border border-[#D4B24C]/60 shadow-xl shadow-black/40 hover:scale-105 active:scale-95 transition group"
          title="Instalar App en Android"
        >
          <div className="relative">
            <Smartphone className="w-5 h-5 text-emerald-400 group-hover:animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-semibold pr-1">
            {isAndroid ? 'Instalar en Android' : 'Instalar App'}
          </span>
          <Download className="w-4 h-4 text-[#D4B24C]" />
        </button>
        <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Default: Navbar button
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-600/90 to-teal-700/90 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm hover:shadow transition active:scale-95 border border-emerald-400/30"
        title="Instalar Elibeth Store en tu dispositivo móvil"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
        <span className="hidden sm:inline">Instalar en</span> Android
        <Download className="w-3 h-3 text-emerald-200" />
      </button>
      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
