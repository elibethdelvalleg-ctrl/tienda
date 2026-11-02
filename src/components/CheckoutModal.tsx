import React, { useState } from 'react';
import { X, Check, Copy, Upload, ArrowRight, MessageCircle, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { CartItem, StoreConfig } from '../types.ts';
import { formatUsd, formatBs, calculateBs, VENEZUELA_STATES, buildWhatsAppOrderMessage } from '../utils/formatters.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  bcvRate: number;
  config: StoreConfig;
  appliedCoupon: string | null;
  onClose: () => void;
  onOrderSuccess: (order: any) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  bcvRate,
  config,
  appliedCoupon,
  onClose,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+58 4');
  const [customerDoc, setCustomerDoc] = useState('V-');
  const [customerEmail, setCustomerEmail] = useState('');
  const [state, setState] = useState(VENEZUELA_STATES[0]);
  const [city, setCity] = useState('Caracas');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [shippingAgency, setShippingAgency] = useState('mrw');
  const [paymentMethod, setPaymentMethod] = useState<'pagoMovil' | 'zelle' | 'binance' | 'transferencia'>('pagoMovil');
  const [paymentRef, setPaymentRef] = useState('');
  const [voucherUrl, setVoucherUrl] = useState('');
  const [voucherFileName, setVoucherFileName] = useState('');

  // Math
  const subtotalUsd = items.reduce((acc, item) => acc + item.subtotalUsd, 0);
  let discountUsd = 0;
  if (appliedCoupon) {
    const couponObj = config.coupons.find(c => c.code.toUpperCase() === appliedCoupon.toUpperCase() && c.active);
    if (couponObj && subtotalUsd >= couponObj.minPurchaseUsd) {
      discountUsd = (subtotalUsd * couponObj.discountPercent) / 100;
    }
  }

  const agencyObj = config.shippingAgencies.find(a => a.id === shippingAgency);
  const shippingFeeUsd = agencyObj ? agencyObj.feeUsd : 4.5;
  const totalUsd = Number((Math.max(0, subtotalUsd - discountUsd) + shippingFeeUsd).toFixed(2));
  const totalBs = calculateBs(totalUsd, bcvRate);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVoucherFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setVoucherUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert("Por favor completa los campos de contacto y dirección");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName,
        customerPhone,
        customerDoc,
        customerEmail,
        state,
        city,
        deliveryAddress,
        shippingAgency,
        paymentMethod,
        paymentRef,
        voucherUrl,
        appliedCoupon,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.product.name,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          priceUsd: i.priceUsd,
          subtotalUsd: i.subtotalUsd
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setCompletedOrder(data.order);
        onOrderSuccess(data.order);
        setStep(4);
      } else {
        alert(data.error || "Error al registrar el pedido");
      }
    } catch (err) {
      console.error(err);
      // Fallback local order creation if offline
      const mockOrder = {
        id: `EDV-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        customerPhone,
        customerDoc,
        totalUsd,
        totalBs,
        items
      };
      setCompletedOrder(mockOrder);
      onOrderSuccess(mockOrder);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsAppConfirmation = () => {
    if (!completedOrder) return;
    const encoded = buildWhatsAppOrderMessage({
      orderId: completedOrder.id,
      customerName,
      customerPhone,
      customerDoc,
      state,
      city,
      deliveryAddress,
      shippingAgencyName: agencyObj ? agencyObj.name : "Envío Nacional",
      paymentMethod,
      paymentRef,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-2xl bg-[#FBF7EE] dark:bg-[#1A1612] text-[#3B2A10] dark:text-[#FBF7EE] rounded-2xl shadow-2xl border border-[#3B2A10]/15 dark:border-[#D4B24C]/30 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 flex items-center justify-between bg-white dark:bg-[#12100E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#D4B24C]">
              <img src="/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold">
                {step === 4 ? '¡Pedido Confirmado!' : 'Checkout y Pago Venezuela'}
              </h2>
              <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">
                Tasa Oficial BCV: {formatBs(bcvRate)} / $1 USD
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3B2A10]/10 dark:hover:bg-[#FBF7EE]/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="flex items-center justify-between px-6 py-2.5 bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/10 text-xs font-semibold">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 cursor-pointer ${step === 1 ? 'text-[#B8962E] dark:text-[#D4B24C]' : 'opacity-60'}`}
            >
              <span className="w-5 h-5 rounded-full bg-[#B8962E]/20 flex items-center justify-center text-[10px]">1</span>
              <span>Datos Personales</span>
            </button>
            <span className="text-[#3B2A10]/30">/</span>
            <button
              onClick={() => customerName && setStep(2)}
              className={`flex items-center gap-1.5 cursor-pointer ${step === 2 ? 'text-[#B8962E] dark:text-[#D4B24C]' : 'opacity-60'}`}
            >
              <span className="w-5 h-5 rounded-full bg-[#B8962E]/20 flex items-center justify-center text-[10px]">2</span>
              <span>Envío</span>
            </button>
            <span className="text-[#3B2A10]/30">/</span>
            <button
              onClick={() => customerName && deliveryAddress && setStep(3)}
              className={`flex items-center gap-1.5 cursor-pointer ${step === 3 ? 'text-[#B8962E] dark:text-[#D4B24C]' : 'opacity-60'}`}
            >
              <span className="w-5 h-5 rounded-full bg-[#B8962E]/20 flex items-center justify-center text-[10px]">3</span>
              <span>Pago & Comprobante</span>
            </button>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: Customer Data */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-display text-base font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
                1. Datos del Comprador
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej: Carmen Gómez"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Cédula de Identidad / RIF *</label>
                  <input
                    type="text"
                    required
                    value={customerDoc}
                    onChange={(e) => setCustomerDoc(e.target.value)}
                    placeholder="V-18.456.789"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">WhatsApp para Notificaciones *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+58 412 1234567"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="cliente@gmail.com"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!customerName || !customerPhone || !customerDoc}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] disabled:opacity-50 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Continuar a Envío</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Destination */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-display text-base font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
                2. Destino y Medio de Envío en Venezuela
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Estado de Venezuela *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  >
                    {VENEZUELA_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Ciudad / Municipio *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej: Valencia / Chacao"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    Dirección exacta o Código de Agencia (MRW / ZOOM / TEALCA) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ej: Agencia MRW Las Mercedes, o Av. Bolívar Norte Edif. X piso 3..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>
              </div>

              {/* Shipping Agency selection */}
              <div>
                <label className="block text-xs font-semibold mb-2">Selecciona Empresa de Envío:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {config.shippingAgencies.map((agency) => {
                    const isSelected = shippingAgency === agency.id;
                    return (
                      <div
                        key={agency.id}
                        onClick={() => setShippingAgency(agency.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-[#B8962E] bg-[#D4B24C]/10 font-medium'
                            : 'border-[#3B2A10]/15 dark:border-[#D4B24C]/20 bg-white dark:bg-[#12100E]'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[#3B2A10] dark:text-[#FBF7EE]">{agency.name}</p>
                          <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">{agency.desc}</p>
                        </div>
                        <span className="font-mono font-bold text-[#B8962E] dark:text-[#D4B24C]">
                          +${agency.feeUsd.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:underline cursor-pointer"
                >
                  ← Volver a Datos
                </button>
                <button
                  type="button"
                  disabled={!deliveryAddress.trim()}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] disabled:opacity-50 text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer"
                >
                  <span>Continuar a Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method & Proof Upload */}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="font-display text-base font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
                3. Método de Pago & Confirmación
              </h3>

              {/* Payment selector tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pagoMovil')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'pagoMovil'
                      ? 'border-[#B8962E] bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                      : 'border-[#3B2A10]/20 dark:border-[#D4B24C]/30 bg-white dark:bg-[#12100E]'
                  }`}
                >
                  Pago Móvil
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('zelle')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'zelle'
                      ? 'border-[#B8962E] bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                      : 'border-[#3B2A10]/20 dark:border-[#D4B24C]/30 bg-white dark:bg-[#12100E]'
                  }`}
                >
                  Zelle ($)
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'binance'
                      ? 'border-[#B8962E] bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                      : 'border-[#3B2A10]/20 dark:border-[#D4B24C]/30 bg-white dark:bg-[#12100E]'
                  }`}
                >
                  Binance Pay
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'transferencia'
                      ? 'border-[#B8962E] bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E]'
                      : 'border-[#3B2A10]/20 dark:border-[#D4B24C]/30 bg-white dark:bg-[#12100E]'
                  }`}
                >
                  Transferencia
                </button>
              </div>

              {/* Payment Details Box with 1-click copy */}
              <div className="p-4 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 text-xs space-y-2">
                {paymentMethod === 'pagoMovil' && (
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 mb-2">
                      <div>
                        <span className="font-bold text-[#B8962E] block">Datos para Pago Móvil (Bs.):</span>
                        <span className="text-[10px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 font-mono">
                          Tasa oficial BCV: {formatBs(bcvRate)} / $1
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#D4B24C]/10 px-2.5 py-1 rounded-lg border border-[#D4B24C]/30">
                        <span className="font-mono font-bold text-sm text-[#3B2A10] dark:text-[#F4E7BD]">
                          {formatBs(totalBs)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(formatBs(totalBs), 'pmTotalBs')}
                          title="Copiar monto en Bs."
                          className="p-0.5 text-[#B8962E] hover:scale-110 transition-transform cursor-pointer"
                        >
                          {copiedKey === 'pmTotalBs' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Banco:</span>
                        <p className="font-semibold">{config.paymentMethods.pagoMovil.banco}</p>
                      </div>
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Teléfono:</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <span>{config.paymentMethods.pagoMovil.telefono}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(config.paymentMethods.pagoMovil.telefono, 'pmPhone')}
                            className="text-[#B8962E] hover:underline"
                          >
                            {copiedKey === 'pmPhone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Cédula:</span>
                        <div className="flex items-center gap-1 font-semibold">
                          <span>{config.paymentMethods.pagoMovil.cedula}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(config.paymentMethods.pagoMovil.cedula, 'pmDoc')}
                            className="text-[#B8962E] hover:underline"
                          >
                            {copiedKey === 'pmDoc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Titular:</span>
                        <p className="font-semibold">{config.paymentMethods.pagoMovil.titular}</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'zelle' && (
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 mb-2">
                      <span className="font-bold text-[#B8962E]">Datos Zelle ($ USD):</span>
                      <span className="font-mono font-bold text-sm text-[#3B2A10] dark:text-[#F4E7BD]">
                        Monto: {formatUsd(totalUsd)} USD
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Correo Zelle:</span>
                        <div className="flex items-center gap-2 font-mono font-semibold">
                          <span>{config.paymentMethods.zelle.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(config.paymentMethods.zelle.email, 'zelleEmail')}
                            className="text-[#B8962E]"
                          >
                            {copiedKey === 'zelleEmail' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Titular:</span>
                        <p className="font-semibold">{config.paymentMethods.zelle.titular}</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'binance' && (
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 mb-2">
                      <span className="font-bold text-[#B8962E]">Binance Pay (USDT):</span>
                      <span className="font-mono font-bold text-sm text-[#3B2A10] dark:text-[#F4E7BD]">
                        Monto: {formatUsd(totalUsd)} USDT
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Binance Pay ID:</span>
                        <div className="flex items-center gap-2 font-mono font-bold">
                          <span>{config.paymentMethods.binance.payId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(config.paymentMethods.binance.payId, 'binancePay')}
                            className="text-[#B8962E]"
                          >
                            {copiedKey === 'binancePay' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Usuario:</span>
                        <p className="font-semibold">{config.paymentMethods.binance.nickname}</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'transferencia' && (
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20 mb-2">
                      <span className="font-bold text-[#B8962E]">Transferencia Bancaria Nacional:</span>
                      <span className="font-mono font-bold text-sm text-[#3B2A10] dark:text-[#F4E7BD]">
                        Monto: {formatBs(totalBs)}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <p><strong>Banco:</strong> {config.paymentMethods.transferencia.banco}</p>
                      <p className="font-mono"><strong>Cuenta:</strong> {config.paymentMethods.transferencia.cuenta}</p>
                      <p><strong>Titular:</strong> {config.paymentMethods.transferencia.titular}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference & Voucher Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Número de Referencia Bancaria (opcional)
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="Ej: 984371"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-[#12100E] border border-[#3B2A10]/20 dark:border-[#D4B24C]/30 rounded-lg text-[#3B2A10] dark:text-[#FBF7EE] focus:outline-hidden focus:border-[#B8962E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Adjuntar Captura / Comprobante
                  </label>
                  <label className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#12100E] border border-dashed border-[#3B2A10]/30 dark:border-[#D4B24C]/40 rounded-lg cursor-pointer text-xs text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:border-[#B8962E]">
                    <Upload className="w-4 h-4 text-[#B8962E]" />
                    <span className="truncate">{voucherFileName || 'Subir comprobante'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Total Calculation Review */}
              <div className="p-3 bg-[#3B2A10]/5 dark:bg-[#FBF7EE]/5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Prendas ({items.length}):</span>
                  <span className="font-mono">{formatUsd(subtotalUsd)}</span>
                </div>
                {discountUsd > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Descuento cupón:</span>
                    <span className="font-mono">-{formatUsd(discountUsd)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Envío ({agencyObj?.name}):</span>
                  <span className="font-mono">+{formatUsd(shippingFeeUsd)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#3B2A10]/10 dark:border-[#D4B24C]/20 font-bold text-sm">
                  <span>Total Final:</span>
                  <div className="text-right">
                    <span className="font-mono text-base text-[#3B2A10] dark:text-[#F4E7BD]">
                      {formatUsd(totalUsd)} USD
                    </span>
                    <p className="font-mono text-xs text-[#B8962E] dark:text-[#D4B24C]">
                      {formatBs(totalBs)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 hover:underline cursor-pointer"
                >
                  ← Volver a Envío
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitOrder}
                  className="px-6 py-3 bg-[#3B2A10] dark:bg-[#D4B24C] text-[#FBF7EE] dark:text-[#12100E] font-semibold text-xs sm:text-sm rounded-xl shadow-md hover:bg-[#231809] dark:hover:bg-[#E7CE7F] disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-all"
                >
                  {submitting ? 'Procesando pedido...' : 'Confirmar y Enviar Pedido'}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Success & WhatsApp Order Trigger */}
          {step === 4 && completedOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-display text-2xl font-bold text-[#3B2A10] dark:text-[#FBF7EE]">
                  ¡Gracias por tu compra, {customerName}!
                </h3>
                <p className="text-xs text-[#3B2A10]/70 dark:text-[#FBF7EE]/70 mt-1">
                  Tu orden ha sido registrada con el código: <strong className="font-mono text-sm text-[#B8962E] dark:text-[#D4B24C]">#{completedOrder.id}</strong>
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#12100E] rounded-xl border border-[#D4B24C]/30 text-xs max-w-md mx-auto text-left space-y-2">
                <div className="flex justify-between border-b border-[#3B2A10]/5 dark:border-[#D4B24C]/10 pb-2">
                  <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Total a Pagar:</span>
                  <span className="font-mono font-bold">{formatUsd(totalUsd)} / {formatBs(totalBs)}</span>
                </div>
                <div className="flex justify-between border-b border-[#3B2A10]/5 dark:border-[#D4B24C]/10 pb-2">
                  <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Destino:</span>
                  <span className="font-semibold">{state} · {city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#3B2A10]/60 dark:text-[#FBF7EE]/60">Agencia:</span>
                  <span className="font-semibold">{agencyObj?.name}</span>
                </div>
              </div>

              {/* Crucial Action: WhatsApp Direct Confirmation */}
              <div className="space-y-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={openWhatsAppConfirmation}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Detalles a WhatsApp para Despacho</span>
                </button>

                <p className="text-[11px] text-[#3B2A10]/60 dark:text-[#FBF7EE]/60 leading-normal">
                  Al presionar el botón se abrirá WhatsApp con el resumen de tu compra para confirmar el pago y recibir la guía de envío de inmediato.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-[#B8962E] dark:text-[#D4B24C] hover:underline cursor-pointer pt-2"
                >
                  Seguir viendo la tienda
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
