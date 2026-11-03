export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatBs(amountBs: number): string {
  // Venezuelan standard: dots for thousands, comma for decimals
  const formatted = new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountBs);
  return `Bs. ${formatted}`;
}

export function calculateBs(amountUsd: number, bcvRate: number): number {
  return Number((amountUsd * bcvRate).toFixed(2));
}

export const VENEZUELA_STATES = [
  "Distrito Capital (Caracas)",
  "Miranda",
  "Carabobo (Valencia)",
  "Zulia (Maracaibo)",
  "Lara (Barquisimeto)",
  "Anzoátegui (Lechería / Puerto La Cruz)",
  "Aragua (Maracay)",
  "Bolívar (Puerto Ordaz)",
  "Táchira (San Cristóbal)",
  "Mérida",
  "Nueva Esparta (Margarita)",
  "Falcón",
  "Monagas (Maturín)",
  "Sucre",
  "Guárico",
  "Portuguesa",
  "Barinas",
  "Trujillo",
  "Yaracuy",
  "Apure",
  "Amazonas",
  "Cojedes",
  "Delta Amacuro",
  "La Guaira"
];

export function buildWhatsAppOrderMessage(orderData: {
  orderId?: string;
  customerName: string;
  customerPhone: string;
  customerDoc: string;
  state: string;
  city: string;
  deliveryAddress: string;
  shippingAgencyName: string;
  paymentMethod: string;
  paymentRef?: string;
  items: {
    productName: string;
    size: string;
    color: string;
    quantity: number;
    priceUsd: number;
  }[];
  totalUsd: number;
  totalBs: number;
  bcvRate: number;
}): string {
  const paymentLabels: Record<string, string> = {
    pagoMovil: "Pago Móvil (Banesco)",
    zelle: "Zelle",
    binance: "Binance Pay (USDT)",
    transferencia: "Transferencia Bancaria",
    efectivo: "Efectivo / Entrega Personal"
  };

  const lines = [
    `🦁 *NUEVO PEDIDO - ELIBETH DEL VALLE STORE*`,
    `_El renacer de mi fuerza_`,
    ``,
    `*Código de Pedido:* #${orderData.orderId || 'EDV-NUEVO'}`,
    `*Cliente:* ${orderData.customerName}`,
    `*Cédula/RIF:* ${orderData.customerDoc}`,
    `*Teléfono:* ${orderData.customerPhone}`,
    ``,
    `📍 *DESTINO Y ENVÍO:*`,
    `• Estado/Ciudad: ${orderData.state} - ${orderData.city}`,
    `• Dirección/Agencia: ${orderData.deliveryAddress}`,
    `• Medio de Envío: ${orderData.shippingAgencyName}`,
    ``,
    `🛍️ *PRENDAS SELECCIONADAS:*`
  ];

  orderData.items.forEach((item, index) => {
    lines.push(
      `${index + 1}. *${item.productName}* x${item.quantity}`,
      `   Talla: ${item.size} | Color: ${item.color} | $${item.priceUsd.toFixed(2)} c/u`
    );
  });

  lines.push(
    ``,
    `💰 *TOTAL A PAGAR:*`,
    `• Total USD: *$${orderData.totalUsd.toFixed(2)} USD*`,
    `• Total Bolívares: *${formatBs(orderData.totalBs)}* (Tasa BCV: ${orderData.bcvRate.toFixed(2)} Bs/$)`,
    ``,
    `💳 *MÉTODO DE PAGO:*`,
    `• Opción: ${paymentLabels[orderData.paymentMethod] || orderData.paymentMethod}`
  );

  if (orderData.paymentRef) {
    lines.push(`• Ref / Comprobante: *${orderData.paymentRef}*`);
  }

  lines.push(
    ``,
    `✨ _Por favor confirmen recepción para procesar el empaque y despacho inmediato._`
  );

  return encodeURIComponent(lines.join('\n'));
}

export function buildWhatsAppNegotiationMessage(data: {
  productName: string;
  sku: string;
  refPriceUsd: number;
  wholesalePriceUsd?: number;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
  bcvRate: number;
}): string {
  const qty = data.quantity || 3;
  const lines = [
    `🦁 *NEGOCIACIÓN / COMPRAS AL MAYOR - ELIBETH DEL VALLE STORE*`,
    `_El renacer de mi fuerza_`,
    ``,
    `¡Hola! Estoy interesado(a) en negociar precio de mayorista / compra por volumen:`,
    ``,
    `🛍️ *Prenda:* ${data.productName}`,
    `📌 *Código/SKU:* ${data.sku}`,
    data.selectedSize ? `📏 *Talla de interés:* ${data.selectedSize}` : '',
    data.selectedColor ? `🎨 *Color:* ${data.selectedColor}` : '',
    `📦 *Cantidad estimada:* ${qty} unidades`,
    ``,
    `💰 *Precios Referenciales:*`,
    `• Precio Detal Ref: $${data.refPriceUsd.toFixed(2)} USD`,
    data.wholesalePriceUsd ? `• Precio Mayorista Sugerido: $${data.wholesalePriceUsd.toFixed(2)} USD c/u (Bs. ${formatBs(data.wholesalePriceUsd * data.bcvRate)})` : '',
    ``,
    `🤝 *Consulta:*`,
    `¿Qué precio especial o descuento por volumen me pueden dejar hoy con el mayorista? ¿Tienen disponibilidad inmediata para despacho?`
  ].filter(Boolean);

  return encodeURIComponent(lines.join('\n'));
}
