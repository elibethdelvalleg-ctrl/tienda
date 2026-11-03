import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

// Ensure HMR is disabled in container dev server to avoid broken WebSocket connections
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initial Store Configuration
let storeConfig = {
  storeName: "ELIBETH STORE",
  slogan: "El renacer de mi fuerza",
  whatsappNumber: "584220217446",
  whatsappDisplay: "+58 (422) 021-7446",
  contactEmail: "contacto@elibethdelvallestore.com",
  bcvRate: 889.26,
  lastBcvUpdate: new Date().toISOString(),
  bcvSource: "Banco Central de Venezuela (BCV Oficial)",
  autoSyncBcv: true,
  paymentMethods: {
    pagoMovil: {
      banco: "Banesco (0134)",
      telefono: "0422-021-7446",
      cedula: "V-24.567.890",
      titular: "Elibeth Del Valle G."
    },
    zelle: {
      email: "pagos@elibethdelvallestore.com",
      titular: "Elibeth Store LLC"
    },
    binance: {
      payId: "847291034",
      nickname: "ElibethDelValle_Pay",
      usdtNetwork: "TRC20 / BEP20"
    },
    transferencia: {
      banco: "Mercantil / BDV",
      cuenta: "0105-0000-00-0000000000",
      titular: "Elibeth Del Valle"
    }
  },
  shippingAgencies: [
    { id: "mrw", name: "MRW Venezuela", desc: "Envío nacional asegurado a agencia o dirección", feeUsd: 4.5 },
    { id: "zoom", name: "Grupo ZOOM", desc: "Entrega rápida garantizada a nivel nacional", feeUsd: 5.0 },
    { id: "tealca", name: "TEALCA Express", desc: "Servicio confiable con seguimiento en vivo", feeUsd: 4.0 },
    { id: "delivery", name: "Delivery Express Local", desc: "Zona metropolitana (Caracas / Valencia)", feeUsd: 3.0 }
  ],
  coupons: [
    { code: "RENACER10", discountPercent: 10, minPurchaseUsd: 40, active: true, desc: "10% de bienvenida a la nueva colección" },
    { code: "FUERZA15", discountPercent: 15, minPurchaseUsd: 90, active: true, desc: "15% especial por compras superiores a $90" }
  ]
};

interface ServerProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  priceUsd: number;
  wholesalePriceUsd?: number;
  salePriceUsd?: number | null;
  costUsd: number;
  sku: string;
  description: string;
  image: string;
  secondaryImage?: string;
  sizes: string[];
  colors: string[];
  stock: number;
  isBespoke: boolean;
  depositRequiredPercent?: number;
  deliveryDays: string;
  featured: boolean;
  tags: string[];
  isNegotiable?: boolean;
  minWholesaleQty?: number;
  supplierOrigin?: string;
  pricingNotice?: string;
}

// Seed initial products with authentic Venezuelan local wholesaler & volume sales catalog
let products: ServerProduct[] = [
  {
    id: "prod-intima-1",
    name: "Conjunto Lencería Fina Encaje Francés & Bralette Realce",
    slug: "conjunto-lenceria-encaje-frances-dama",
    category: "intima",
    priceUsd: 14.0,
    wholesalePriceUsd: 8.5,
    salePriceUsd: 12.5,
    costUsd: 6.0,
    sku: "MAY-INT-001",
    description: "Conjunto de 2 piezas (bralette con copa suave y panty hilo/semicachetero) en encaje de alta densidad con detalles dorado champaña. Producto estrella de alta rotación para tiendas y revendedores.",
    image: "./images/lenceria_intima_dama_1793412626756.jpg",
    secondaryImage: "./images/lenceria_intima_dama_1793412626756.jpg",
    sizes: ["32B (S)", "34B (M)", "36B (L)", "38C (XL)"],
    colors: ["Vino Tinto Dorado", "Negro Ónix", "Palo Rosa", "Blanco Marfil"],
    stock: 45,
    isBespoke: false,
    deliveryDays: "Despacho 24-48h",
    featured: true,
    tags: ["Ropa Íntima Damas", "Mayorista", "Top Ventas"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Mayoristas La Hoyada & Galpones El Cementerio, Caracas",
    pricingNotice: "Precio referencial sujeto a cambios según disponibilidad de mayoristas y tasa del día. Negociable por docena."
  },
  {
    id: "prod-intima-2",
    name: "Body Faja Reductora Colombiana Seamless Invisible",
    slug: "body-faja-reductora-colombiana-seamless",
    category: "intima",
    priceUsd: 22.0,
    wholesalePriceUsd: 14.0,
    salePriceUsd: 19.5,
    costUsd: 10.5,
    sku: "MAY-INT-002",
    description: "Body moldeador con compresión abdominal de alta resistencia, tecnología sin costuras que no se marca bajo vestidos o pantalones. Efecto reloj de arena.",
    image: "./images/lenceria_intima_dama_1793412626756.jpg",
    secondaryImage: "./images/lenceria_intima_dama_1793412626756.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Piel Beige", "Negro", "Café Mocca"],
    stock: 30,
    isBespoke: false,
    deliveryDays: "Despacho 24-48h",
    featured: true,
    tags: ["Fajas Reductoras", "Alta Demanda", "Ventas al Mayor"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Distribuidores directos San Cristóbal / Cúcuta",
    pricingNotice: "Precio referencial sujeto a cambio de proveedor. Negociable por volumen."
  },
  {
    id: "prod-pant-1",
    name: "Jeans Colombiano Levanta Cola Tiro Alto 3 Botones",
    slug: "jeans-colombiano-levanta-cola-tiro-alto",
    category: "pantalones",
    priceUsd: 28.0,
    wholesalePriceUsd: 18.5,
    salePriceUsd: 25.0,
    costUsd: 13.5,
    sku: "MAY-PAN-001",
    description: "Jeans de mezclilla stretch premium con pretina ancha faja levanta cola, confección con pinzas traseras moldeadoras y costuras reforzadas. El pantalón más pedido en Venezuela.",
    image: "./images/jeans_colombiano_dama_1793412627102.jpg",
    secondaryImage: "./images/jeans_colombiano_dama_1793412627102.jpg",
    sizes: ["Talla 4", "Talla 6", "Talla 8", "Talla 10", "Talla 12", "Talla 14"],
    colors: ["Azul Índigo Clásico", "Azul Hielo Claro", "Negro Deslavado"],
    stock: 38,
    isBespoke: false,
    deliveryDays: "Despacho 24-48h",
    featured: true,
    tags: ["Pantalones Dama", "Levanta Cola", "Mayorista"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Mayoristas Importadores Galpones El Cementerio, Caracas",
    pricingNotice: "Precio referencial de catálogo. Ajustable por compra de media docena o bulto cerrado."
  },
  {
    id: "prod-pant-2",
    name: "Pantalón Cargo Jogger Unisex Gabardina Strech",
    slug: "pantalon-cargo-jogger-unisex-gabardina",
    category: "pantalones",
    priceUsd: 24.0,
    wholesalePriceUsd: 15.0,
    salePriceUsd: 21.0,
    costUsd: 10.0,
    sku: "MAY-PAN-002",
    description: "Pantalón urbano con 6 bolsillos utilitarios funcionales, elástico ajustable en cintura y bota jogger. Gabardina suave de alto rendimiento.",
    image: "./images/jeans_colombiano_dama_1793412627102.jpg",
    secondaryImage: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    sizes: ["S (28-30)", "M (32)", "L (34)", "XL (36-38)"],
    colors: ["Negro Táctico", "Beige Arena", "Verde Militar", "Gris Plomo"],
    stock: 28,
    isBespoke: false,
    deliveryDays: "Despacho 24-48h",
    featured: false,
    tags: ["Pantalones Cargo", "Streetwear", "Unisex"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Confección Nacional & Mayoristas La Hoyada",
    pricingNotice: "Precio referencial sujeto a disponibilidad de stock y tallas del mayorista."
  },
  {
    id: "prod-dep-1",
    name: "Conjunto Deportivo Licra Suplex Biker & Top Compresión (Dama)",
    slug: "conjunto-deportivo-licra-suplex-biker-top",
    category: "deportivo",
    priceUsd: 18.0,
    wholesalePriceUsd: 11.5,
    salePriceUsd: 16.0,
    costUsd: 8.0,
    sku: "MAY-DEP-001",
    description: "Conjunto fitness fabricado en Suplex grueso antitransparencia, pretina alta con control de abdomen que no se baja al entrenar y top con almohadillas removibles.",
    image: "./images/conjunto_deportivo_suplex_1793412627777.jpg",
    secondaryImage: "./images/conjunto_deportivo_suplex_1793412627777.jpg",
    sizes: ["S/M (Strech)", "L/XL (Strech)"],
    colors: ["Verde Esmeralda Gym", "Negro Matte", "Azul Eléctrico", "Vinotinto"],
    stock: 50,
    isBespoke: false,
    deliveryDays: "Inmediato (24-48h)",
    featured: true,
    tags: ["Gymwear", "Suplex Colombiano", "Mayorista"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Mayoristas Deportivos Chacao & Valencia",
    pricingNotice: "Precio referencial de venta al detal. Precio especial al mayor a partir de 3 piezas."
  },
  {
    id: "prod-dep-2",
    name: "Franela Deportiva Dry-Fit Transpirable Microperforada (Caballero)",
    slug: "franela-deportiva-dry-fit-transpirable-caballero",
    category: "deportivo",
    priceUsd: 12.0,
    wholesalePriceUsd: 7.5,
    salePriceUsd: 10.0,
    costUsd: 4.8,
    sku: "MAY-DEP-002",
    description: "Franela técnica deportiva con tecnología de secado ultra rápido, tejido liviano microperforado en espalda y laterales. Perfecta para gimnasio, running y clima caluroso de Venezuela.",
    image: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    secondaryImage: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Gris Jaspeado", "Negro", "Azul Rey", "Blanco"],
    stock: 60,
    isBespoke: false,
    deliveryDays: "Inmediato (24-48h)",
    featured: true,
    tags: ["Deportivo Caballero", "Dry-Fit", "Super Ventas"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Galpones mayoristas La Candelaria / El Cementerio",
    pricingNotice: "Precio referencial. Negociable por docena o bulto para revendedores."
  },
  {
    id: "prod-dep-3",
    name: "Short Deportivo 2 en 1 con Licra Interna de Compresión",
    slug: "short-deportivo-2-en-1-licra-compresion",
    category: "caballero",
    priceUsd: 15.0,
    wholesalePriceUsd: 9.5,
    salePriceUsd: 13.5,
    costUsd: 6.5,
    sku: "MAY-HOM-001",
    description: "Bermuda deportiva con bolsillo secreto para celular en la licra interna, toallero posterior y bolsillos laterales con cierre sellado. Comodidad absoluta.",
    image: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    secondaryImage: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    sizes: ["M (30-32)", "L (34)", "XL (36)", "XXL (38)"],
    colors: ["Negro con Licra Gris", "Gris Oscuro", "Verde Militar"],
    stock: 35,
    isBespoke: false,
    deliveryDays: "Inmediato (24-48h)",
    featured: false,
    tags: ["Caballeros", "Short Gym", "Ventas al Mayor"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Mayoristas Importación Directa Panamá",
    pricingNotice: "Precio referencial sujeto a existencias de bodega."
  },
  {
    id: "prod-cab-2",
    name: "Pack x3 Boxers Briefs Algodón Licrado Elástico Ancho",
    slug: "pack-boxers-briefs-algodon-licrado-caballero",
    category: "caballero",
    priceUsd: 11.0,
    wholesalePriceUsd: 7.0,
    salePriceUsd: null,
    costUsd: 4.5,
    sku: "MAY-HOM-002",
    description: "Caja de 3 boxers masculinos en algodón peruano suave con 5% de spandex para ajuste anatómico perfecto. Elástico bordado que no maltrata la piel.",
    image: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    secondaryImage: "./images/ropa_deportiva_caballero_1793412628454.jpg",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Surtido (Negro, Gris, Azul Marino)"],
    stock: 55,
    isBespoke: false,
    deliveryDays: "Inmediato (24-48h)",
    featured: true,
    tags: ["Ropa Interior Caballero", "Pack Mayorista"],
    isNegotiable: true,
    minWholesaleQty: 3,
    supplierOrigin: "Mayoristas de La Hoyada, Caracas",
    pricingNotice: "Precio referencial. Descuentos por paquete de 6 y 12 unidades."
  },
  {
    id: "prod-gala-1",
    name: "Vestido Gala Renacer Dorado Satén de Seda",
    slug: "vestido-gala-renacer-dorado",
    category: "mujer",
    priceUsd: 65.0,
    wholesalePriceUsd: 45.0,
    salePriceUsd: 58.0,
    costUsd: 32.0,
    sku: "EDV-MUJ-001",
    description: "Vestido de noche confeccionado en satén de seda color champaña dorado con pliegues artesanales en el busto y abertura lateral de alta costura.",
    image: "./images/hero_luxury_fashion_1793411521589.jpg",
    secondaryImage: "./images/collection_woman_gold_1793411522165.jpg",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Dorado Champaña", "Esmeralda", "Negro"],
    stock: 14,
    isBespoke: false,
    deliveryDays: "Inmediato (24-48h)",
    featured: true,
    tags: ["Alta Costura", "Vestidos de Gala"],
    isNegotiable: true,
    minWholesaleQty: 2,
    supplierOrigin: "Atelier Elibeth Del Valle & Mayoristas Especializados",
    pricingNotice: "Precio referencial sujeto a confirmación de medidas y disponibilidad."
  },
  {
    id: "prod-bespoke-1",
    name: "Servicio Atelier: Confección Por Encargo con 50% Anticipo",
    slug: "confeccion-por-encargo-atelier-50-anticipo",
    category: "encargo",
    priceUsd: 85.0,
    wholesalePriceUsd: 60.0,
    salePriceUsd: null,
    costUsd: 40.0,
    sku: "EDV-ENC-001",
    description: "Servicio de confección personalizada y pedidos por encargo de prendas exclusivas de diseñador. Abonas el 50% de anticipo en Bolívares o Divisas y el saldo a la entrega.",
    image: "./images/collection_por_encargo_1793411524038.jpg",
    secondaryImage: "./images/collection_por_encargo_1793411524038.jpg",
    sizes: ["A Medida Exacta", "S", "M", "L", "XL"],
    colors: ["Según requerimiento del cliente"],
    stock: 10,
    isBespoke: true,
    depositRequiredPercent: 50,
    deliveryDays: "Confección 7 a 10 días",
    featured: true,
    tags: ["Por Encargo", "Bespoke", "Negociable"],
    isNegotiable: true,
    minWholesaleQty: 1,
    supplierOrigin: "Atelier Propio Caracas",
    pricingNotice: "Cotización referencial. El precio final se define según tela y medidas elegidas."
  }
];

// Seed initial orders
let orders = [
  {
    id: "ORD-9281",
    customerName: "María Valentina Silva",
    customerPhone: "+58 414 234-5678",
    customerEmail: "mvalentina.silva@gmail.com",
    customerDoc: "V-20.182.943",
    state: "Miranda",
    city: "Chacao / Caracas",
    deliveryAddress: "Av. Francisco de Miranda, Edif. Torre Cavendes, piso 7",
    shippingAgency: "delivery",
    shippingAgencyName: "Delivery Express Local",
    paymentMethod: "pagoMovil",
    paymentRef: "948271048",
    voucherUrl: "/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg",
    status: "pago_verificado",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: [
      {
        productId: "prod-1",
        productName: "Vestido Gala Renacer Dorado",
        size: "M",
        color: "Dorado Champaña",
        quantity: 1,
        priceUsd: 79.0,
        subtotalUsd: 79.0
      }
    ],
    totalUsd: 82.0,
    totalBs: 82.0 * storeConfig.bcvRate,
    notes: "Comprobante verificado con Banesco. Listo para entrega hoy en la tarde."
  },
  {
    id: "ORD-9280",
    customerName: "Carlos Eduardo Mendoza",
    customerPhone: "+58 412 889-1122",
    customerEmail: "cmendoza_ve@hotmail.com",
    customerDoc: "V-18.490.112",
    state: "Carabobo",
    city: "Valencia",
    deliveryAddress: "Agencia ZOOM El Viñedo, C.C. Caribbean Plaza",
    shippingAgency: "zoom",
    shippingAgencyName: "Grupo ZOOM",
    paymentMethod: "zelle",
    paymentRef: "CONF-ZLL-90314",
    voucherUrl: "",
    status: "preparando",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    items: [
      {
        productId: "prod-3",
        productName: "Camisa Resort Lino Marfil Caballero",
        size: "L",
        color: "Marfil Cálido",
        quantity: 1,
        priceUsd: 58.0,
        subtotalUsd: 58.0
      },
      {
        productId: "prod-8",
        productName: "Cinturón de Piel Grabada con Hebilla León León",
        size: "95cm (M)",
        color: "Marrón Miel",
        quantity: 1,
        priceUsd: 38.0,
        subtotalUsd: 38.0
      }
    ],
    totalUsd: 101.0,
    totalBs: 101.0 * storeConfig.bcvRate,
    notes: "Pago Zelle recibido a nombre de Carlos Mendoza."
  }
];

// Helper to get Gemini client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: storeConfig.storeName, time: new Date().toISOString() });
});

// Settings & BCV
app.get('/api/settings', (req, res) => {
  res.json(storeConfig);
});

// BCV Live Exchange Rate Service (Venezuela)
async function fetchOfficialBcvRate(): Promise<{ rate: number; source: string; updatedAt: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data: any = await res.json();
      const num = Number(data.promedio || data.venta || data.compra);
      if (num && num > 0) {
        return {
          rate: Number(num.toFixed(2)),
          source: "Banco Central de Venezuela (BCV Oficial)",
          updatedAt: data.fechaActualizacion || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.warn("[BCV Service] Primary API request error, keeping current rate:", err);
  }
  return null;
}

app.get('/api/settings/bcv/sync', async (req, res) => {
  const result = await fetchOfficialBcvRate();
  if (result) {
    storeConfig.bcvRate = result.rate;
    storeConfig.lastBcvUpdate = result.updatedAt;
    storeConfig.bcvSource = result.source;
    return res.json({
      success: true,
      bcvRate: storeConfig.bcvRate,
      lastBcvUpdate: storeConfig.lastBcvUpdate,
      source: storeConfig.bcvSource
    });
  }
  res.json({
    success: false,
    bcvRate: storeConfig.bcvRate,
    lastBcvUpdate: storeConfig.lastBcvUpdate,
    source: storeConfig.bcvSource || "BCV Oficial",
    message: "No se pudo conectar con la API de BCV en este momento. Se mantiene la última tasa registrada."
  });
});

app.post('/api/settings/bcv/sync', async (req, res) => {
  const result = await fetchOfficialBcvRate();
  if (result) {
    storeConfig.bcvRate = result.rate;
    storeConfig.lastBcvUpdate = result.updatedAt;
    storeConfig.bcvSource = result.source;
    return res.json({
      success: true,
      bcvRate: storeConfig.bcvRate,
      lastBcvUpdate: storeConfig.lastBcvUpdate,
      source: storeConfig.bcvSource
    });
  }
  res.json({
    success: false,
    bcvRate: storeConfig.bcvRate,
    lastBcvUpdate: storeConfig.lastBcvUpdate,
    source: storeConfig.bcvSource || "BCV Oficial",
    message: "No se pudo conectar con la API de BCV en este momento. Se mantiene la última tasa registrada."
  });
});

app.post('/api/settings/bcv', (req, res) => {
  const { rate, source } = req.body;
  const num = parseFloat(rate);
  if (!num || num <= 0) {
    return res.status(400).json({ error: "Tasa inválida" });
  }
  storeConfig.bcvRate = Number(num.toFixed(2));
  storeConfig.lastBcvUpdate = new Date().toISOString();
  if (source) storeConfig.bcvSource = source;
  res.json({
    success: true,
    bcvRate: storeConfig.bcvRate,
    lastBcvUpdate: storeConfig.lastBcvUpdate,
    source: storeConfig.bcvSource
  });
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  if (updates.whatsappNumber) storeConfig.whatsappNumber = updates.whatsappNumber;
  if (updates.whatsappDisplay) storeConfig.whatsappDisplay = updates.whatsappDisplay;
  if (updates.paymentMethods) storeConfig.paymentMethods = { ...storeConfig.paymentMethods, ...updates.paymentMethods };
  if (updates.coupons) storeConfig.coupons = updates.coupons;
  res.json({ success: true, settings: storeConfig });
});

// Products
app.get('/api/products', (req, res) => {
  const { category, search, bespoke } = req.query;
  let filtered = [...products];

  if (category && category !== 'todos') {
    filtered = filtered.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (bespoke === 'true') {
    filtered = filtered.filter(p => p.isBespoke);
  } else if (bespoke === 'false') {
    filtered = filtered.filter(p => !p.isBespoke);
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(filtered);
});

app.post('/api/products', (req, res) => {
  const newProduct: ServerProduct = {
    id: `prod-${Date.now()}`,
    name: req.body.name || "Nuevo Producto",
    slug: (req.body.name || "producto").toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: req.body.category || "intima",
    priceUsd: Number(req.body.priceUsd) || 20,
    wholesalePriceUsd: req.body.wholesalePriceUsd ? Number(req.body.wholesalePriceUsd) : Math.round(Number(req.body.priceUsd || 20) * 0.65),
    salePriceUsd: req.body.salePriceUsd ? Number(req.body.salePriceUsd) : null,
    costUsd: Number(req.body.costUsd) || 10,
    sku: req.body.sku || `MAY-${Math.floor(100 + Math.random() * 900)}`,
    description: req.body.description || "",
    image: req.body.image || "/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg",
    secondaryImage: req.body.secondaryImage || req.body.image || "/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg",
    sizes: Array.isArray(req.body.sizes) ? req.body.sizes : ["S", "M", "L"],
    colors: Array.isArray(req.body.colors) ? req.body.colors : ["Negro", "Beige"],
    stock: Number(req.body.stock) || 20,
    isBespoke: Boolean(req.body.isBespoke),
    depositRequiredPercent: req.body.depositRequiredPercent ? Number(req.body.depositRequiredPercent) : 50,
    deliveryDays: req.body.deliveryDays || "Inmediato (24-48h)",
    featured: Boolean(req.body.featured),
    tags: Array.isArray(req.body.tags) ? req.body.tags : ["Mayorista", "Top Ventas"],
    isNegotiable: req.body.isNegotiable !== undefined ? Boolean(req.body.isNegotiable) : true,
    minWholesaleQty: Number(req.body.minWholesaleQty) || 3,
    supplierOrigin: req.body.supplierOrigin || "Mayoristas Galpones El Cementerio / La Hoyada Caracas",
    pricingNotice: req.body.pricingNotice || "Precio referencial sujeto a cambios según disponibilidad de mayoristas y tasa del día. Negociable por volumen."
  };
  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  const deleted = products.splice(index, 1)[0];
  res.json({ success: true, deleted });
});

// Orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    customerDoc,
    state,
    city,
    deliveryAddress,
    shippingAgency,
    paymentMethod,
    paymentRef,
    voucherUrl,
    items,
    appliedCoupon
  } = req.body;

  if (!customerName || !customerPhone || !items || !items.length) {
    return res.status(400).json({ error: "Faltan datos obligatorios para registrar el pedido" });
  }

  // Calculate pricing
  let subtotalUsd = 0;
  for (const item of items) {
    subtotalUsd += (Number(item.priceUsd) || 0) * (Number(item.quantity) || 1);
  }

  let discountUsd = 0;
  if (appliedCoupon) {
    const coupon = storeConfig.coupons.find(c => c.code.toUpperCase() === appliedCoupon.toUpperCase() && c.active);
    if (coupon && subtotalUsd >= coupon.minPurchaseUsd) {
      discountUsd = (subtotalUsd * coupon.discountPercent) / 100;
    }
  }

  const agencyObj = storeConfig.shippingAgencies.find(a => a.id === shippingAgency);
  const shippingFeeUsd = agencyObj ? agencyObj.feeUsd : 4.0;
  const totalUsd = Number(Math.max(0, subtotalUsd - discountUsd + shippingFeeUsd).toFixed(2));
  const totalBs = Number((totalUsd * storeConfig.bcvRate).toFixed(2));

  const orderId = `EDV-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: orderId,
    customerName,
    customerPhone,
    customerEmail: customerEmail || "",
    customerDoc: customerDoc || "",
    state: state || "Distrito Capital",
    city: city || "Caracas",
    deliveryAddress: deliveryAddress || "",
    shippingAgency: shippingAgency || "mrw",
    shippingAgencyName: agencyObj ? agencyObj.name : "Envío Nacional",
    paymentMethod: paymentMethod || "pagoMovil",
    paymentRef: paymentRef || "",
    voucherUrl: voucherUrl || "",
    status: paymentRef ? "pago_verificado" : "pendiente",
    createdAt: new Date().toISOString(),
    items,
    subtotalUsd,
    discountUsd,
    shippingFeeUsd,
    totalUsd,
    totalBs,
    notes: ""
  };

  orders.unshift(newOrder);

  // Update inventory quantities if applicable
  for (const item of items) {
    const p = products.find(prod => prod.id === item.productId);
    if (p && !p.isBespoke) {
      p.stock = Math.max(0, p.stock - (item.quantity || 1));
    }
  }

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status, notes } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

  if (status) order.status = status;
  if (notes !== undefined) order.notes = notes;
  res.json({ success: true, order });
});

// Radar de Tendencias IA (Venezuela)
app.post('/api/trends/analyze', async (req, res) => {
  const { category = "todas", season = "Actual / Fiesta y Casual" } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      // Fallback with rich Venezuelan market intelligence
      return res.json({
        source: "cached_intelligence",
        timestamp: new Date().toISOString(),
        summary: "Radar de inteligencia comercial para Venezuela enfocado en ventas y reventa de mayoristas: ropa íntima de damas, jeans levanta cola, franelas deportivas y prendas para caballero.",
        insights: [
          {
            title: "Conjuntos de Lencería Encaje Francés & Bralette Realce",
            category: "intima",
            opportunityScore: 97,
            demandLevel: "Muy Alta",
            targetSeason: "Todo el año / Ventas continuas",
            targetAudience: "Damas 18-40 años en Caracas, Valencia y Maracaibo",
            whyTrending: "La ropa íntima femenina es el producto de mayor rotación y menor volumen para envíos por MRW/Zoom. Margen de ganancia supera el 65%.",
            targetPurchasePriceUsd: 6.0,
            suggestedRetailPriceUsd: 14.0,
            estimatedMarginPercent: 57,
            recommendedStockUnits: 50,
            sourcingLocations: "Galpones mayoristas de El Cementerio y La Hoyada en Caracas, o importación directa Colombia.",
            actionType: "catalog_add",
            badge: "Top Ventas"
          },
          {
            title: "Jeans Colombianos Levanta Cola con Pretina Ancha",
            category: "pantalones",
            opportunityScore: 95,
            demandLevel: "Muy Alta",
            targetSeason: "Todo el año / Mayor demanda",
            targetAudience: "Mujeres que buscan horma perfecta y realce",
            whyTrending: "Prenda fija en el guardarropa venezolano. Se negocian con los mayoristas por bulto cerrado o media docena.",
            targetPurchasePriceUsd: 13.5,
            suggestedRetailPriceUsd: 28.0,
            estimatedMarginPercent: 52,
            recommendedStockUnits: 30,
            sourcingLocations: "Distribuidores mayoristas en San Cristóbal y galpones de Caracas.",
            actionType: "catalog_add",
            badge: "Alta Demanda"
          },
          {
            title: "Franelas Deportivas Dry-Fit & Gymwear para Caballero",
            category: "caballero",
            opportunityScore: 92,
            demandLevel: "Alta",
            targetSeason: "Clima Cálido & Gimnasios",
            targetAudience: "Hombres activos, deportistas y uso casual diario",
            whyTrending: "El clima venezolano exige franelas frescas que no retengan sudor. Alta demanda en compras de 3 o más franelas por cliente.",
            targetPurchasePriceUsd: 4.8,
            suggestedRetailPriceUsd: 12.0,
            estimatedMarginPercent: 60,
            recommendedStockUnits: 40,
            sourcingLocations: "Mayoristas textiles de La Candelaria / El Cementerio.",
            actionType: "catalog_add",
            badge: "Rotación Rápida"
          },
          {
            title: "Conjuntos Deportivos de Licra Suplex Biker & Top",
            category: "deportivo",
            opportunityScore: 94,
            demandLevel: "Muy Alta",
            targetSeason: "Fitness & Estilo Diario",
            targetAudience: "Mujeres fitness y universitarias",
            whyTrending: "Tejido suplex antitransparencia con pretina alta. Excelente para promocionar en Instagram y TikTok.",
            targetPurchasePriceUsd: 8.0,
            suggestedRetailPriceUsd: 18.0,
            estimatedMarginPercent: 55,
            recommendedStockUnits: 40,
            sourcingLocations: "Talleres de confección en Valencia y mayoristas de Caracas.",
            actionType: "catalog_add",
            badge: "Viral en Redes"
          }
        ]
      });
    }

    const promptText = `Actúa como el consultor principal de moda, mayoristas y ventas comerciales para el mercado local venezolano en la tienda 'ELIBETH DEL VALLE STORE' (eslogan: 'El renacer de mi fuerza').
Analiza las prendas más demandadas y lucrativas en Venezuela para la categoría "${category}" y temporada "${season}".
Enfócate en:
1. Ropa íntima de dama (lencería, bralettes, fajas colombianas, panties al mayor).
2. Pantalones (jeans levanta cola, joggers, cargos).
3. Ropa y franelas deportivas de mayoristas (dry-fit, conjuntos suplex de dama y hombre).
4. Ropa para caballeros (shorts 2 en 1, franelas de gym, boxers).
5. Precios de compra al mayorista vs. precio de venta referencial con márgenes y precios negociables por volumen.
6. Proveedores reales en Venezuela (galpones en El Cementerio, La Hoyada, La Candelaria, San Cristóbal, o importación directa vía Panamá).

Devuelve EXACTAMENTE un JSON con esta estructura:
{
  "summary": "Resumen ejecutivo del momento comercial y oportunidades de ventas al mayor en Venezuela",
  "insights": [
    {
      "title": "Nombre de la prenda en tendencia",
      "category": "intima" | "pantalones" | "deportivo" | "caballero" | "mujer" | "encargo",
      "opportunityScore": número entre 80 y 99,
      "demandLevel": "Muy Alta" | "Alta" | "Crecimiento Rápido",
      "targetSeason": "descripción breve",
      "targetAudience": "perfil del comprador en Venezuela",
      "whyTrending": "por qué se vende tanto y margen de reventa",
      "targetPurchasePriceUsd": costo con el mayorista en USD número,
      "suggestedRetailPriceUsd": precio de venta al detal referencial en USD número,
      "estimatedMarginPercent": margen estimado en % número,
      "recommendedStockUnits": cantidad sugerida por pedido,
      "badge": "etiqueta como 'Top Ventas' o 'Alta Rotación'"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: "Eres un analista de negocios de moda experto en el mercado retail venezolano. Responde siempre con JSON limpio y preciso sin código markdown fuera del JSON.",
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      source: "gemini_live",
      timestamp: new Date().toISOString(),
      summary: parsed.summary || "Tendencias actualizadas con IA de Gemini para el mercado venezolano.",
      insights: parsed.insights || []
    });

  } catch (error: any) {
    console.error("Gemini trends analysis error:", error);
    // Return graceful intelligence
    return res.json({
      source: "fallback_intelligence",
      timestamp: new Date().toISOString(),
      summary: "Tendencias del mercado venezolano calculadas a partir del historial de ventas y demanda actual.",
      insights: [
        {
          title: "Blusas y Tops de Satén Cuello Halter en Tonos Metálicos",
          category: "mujer",
          opportunityScore: 94,
          demandLevel: "Muy Alta",
          targetSeason: "Todo el año / Salidas nocturnas",
          targetAudience: "Jóvenes y adultas en Caracas y Valencia",
          whyTrending: "El satén es fresco, no se arruga fácilmente y tiene alta aceptación en boutiques.",
          targetPurchasePriceUsd: 14.0,
          suggestedRetailPriceUsd: 48.0,
          estimatedMarginPercent: 70,
          recommendedStockUnits: 25,
          sourcingLocations: "La Candelaria (Caracas) o confección en talleres locales.",
          badge: "Alta Rotación"
        },
        {
          title: "Bermudas de Lino Italiano para Caballero",
          category: "hombre",
          opportunityScore: 89,
          demandLevel: "Alta",
          targetSeason: "Temporada de Calor y Playa",
          targetAudience: "Hombres de 25-50 años",
          whyTrending: "Prenda versátil para combinar con camisas de lino o franelas tipo polo.",
          targetPurchasePriceUsd: 16.0,
          suggestedRetailPriceUsd: 49.0,
          estimatedMarginPercent: 67,
          recommendedStockUnits: 20,
          sourcingLocations: "Importación Panamá o confección en telares de Barquisimeto.",
          badge: "Tendencia Masculina"
        }
      ]
    });
  }
});

// Asesor y Bot de Pedidos WhatsApp IA
app.post('/api/chat/assistant', async (req, res) => {
  const { message = '', history = [], cart = [] } = req.body;
  const currentBcv = storeConfig.bcvRate || 889.26;
  const whatsappNum = storeConfig.whatsappNumber || "584220217446";

  // Catalog summary for context
  const catalogSummary = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    priceUsd: p.priceUsd,
    priceBs: Number((p.priceUsd * currentBcv).toFixed(2)),
    wholesalePriceUsd: p.wholesalePriceUsd || null,
    stock: p.stock,
    isNegotiable: p.isNegotiable ?? true,
    tags: p.tags
  }));

  const cartSummary = (cart || []).map((c: any) => ({
    name: c.product?.name || c.productName || 'Prenda',
    size: c.size,
    color: c.color,
    quantity: c.quantity,
    priceUsd: c.priceUsd,
    totalUsd: (c.priceUsd * c.quantity).toFixed(2),
    totalBs: ((c.priceUsd * c.quantity) * currentBcv).toFixed(2)
  }));

  // Fallback engine if Gemini API is unavailable
  const generateFallbackResponse = (userText: string) => {
    const text = userText.toLowerCase();
    let reply = "";
    let suggestedIds: string[] = [];
    let isOrderReady = false;
    let orderSummary = "";
    let quickReplies = [
      "👗 Ver lencería en tendencia",
      "👖 Jeans Levanta Cola",
      "💼 Precios al mayor / Por volumen",
      "📲 Enviar Pedido a WhatsApp"
    ];

    if (text.includes("pedido") || text.includes("comprar") || text.includes("orden") || text.includes("carrito") || text.includes("whatsapp")) {
      isOrderReady = true;
      if (cartSummary.length > 0) {
        const totalUsd = cartSummary.reduce((acc: number, item: any) => acc + Number(item.totalUsd), 0);
        const totalBs = (totalUsd * currentBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 });
        
        orderSummary = `*¡HOLA ELIBETH DEL VALLE STORE! Deseo confirmar mi pedido:*%0A%0A` +
          cartSummary.map((item: any, idx: number) => `${idx + 1}. *${item.name}* (Talla: ${item.size}, Color: ${item.color}) x${item.quantity} = $${item.totalUsd}`).join('%0A') +
          `%0A%0A*Total USD:* $${totalUsd.toFixed(2)}` +
          `%0A*Total en Bolívares (Tasa BCV ${currentBcv}):* Bs. ${totalBs}` +
          `%0A*WhatsApp Oficial:* 0422-021-7446` +
          `%0A*Por favor indíquenme disponibilidad y datos para el pago.*`;

        reply = `¡Excelente elección! Tienes **${cartSummary.length} producto(s)** listos en tu carrito por un total de **$${totalUsd.toFixed(2)} USD** (equivale a **Bs. ${totalBs}** a la tasa oficial BCV de **${currentBcv} Bs./$**).\n\nHe preparado el resumen de tu pedido para despacharlo directamente al WhatsApp oficial **0422-0217446**. Solo pulsa el botón de abajo para enviarlo con un solo toque y una asesora verificará tu pago y despacho de inmediato.`;
      } else {
        reply = `¡Con mucho gusto gestiono tu pedido! Aún no has agregado prendas al carrito, pero puedo ayudarte a armarlo ahora mismo. ¿Qué estás buscando hoy? Tenemos lencería fina, jeans levanta cola colombianos, conjuntos suplex deportivos o franelas para caballero.\n\nTambién puedes escribir directamente a nuestro WhatsApp oficial **0422-0217446** (+58 422 021-7446) para atención personalizada.`;
      }
    } else if (text.includes("lenceria") || text.includes("intima") || text.includes("bralette") || text.includes("panties") || text.includes("faja")) {
      const lingerie = products.filter(p => p.category === 'intima');
      suggestedIds = lingerie.slice(0, 3).map(p => p.id);
      reply = `¡Nuestra línea de ropa íntima es un éxito total! Trabajamos con encajes franceses de tacto suave, bralettes de realce sin varilla y bodies moldeadores. Son perfectas tanto para uso diario como para revender con más del 60% de margen.\n\n💰 **Precios desde $${lingerie[0]?.priceUsd || 14} USD** (~Bs. ${((lingerie[0]?.priceUsd || 14) * currentBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })} al BCV). Además, ¡los precios son negociables por docena!`;
      quickReplies = ["Ver tallas disponibles", "Precios al mayor de lencería", "Agregar al carrito", "Pedir por WhatsApp 0422-0217446"];
    } else if (text.includes("jean") || text.includes("pantalon") || text.includes("levanta cola") || text.includes("colombian")) {
      const jeans = products.filter(p => p.category === 'pantalones');
      suggestedIds = jeans.slice(0, 3).map(p => p.id);
      reply = `¡Los Jeans Levanta Cola son nuestra especialidad estrella! Diseñados con pretina ancha moldeadora de 3 a 5 botones y mezclilla con elastano que estiliza la figura femenina de forma inmediata.\n\n📐 **Tallas:** 6, 8, 10, 12, 14, 16.\n💵 **Precio:** $${jeans[0]?.priceUsd || 28} USD (~Bs. ${((jeans[0]?.priceUsd || 28) * currentBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Tasa BCV).\n🤝 **Mayoristas / Por volumen:** Margen de reventa superior al 50%.`;
      quickReplies = ["Guía de medidas de Jeans", "Jeans color oscuro", "Armar pedido por WhatsApp", "Ver catálogo completo"];
    } else if (text.includes("deport") || text.includes("suplex") || text.includes("licra") || text.includes("gym")) {
      const sports = products.filter(p => p.category === 'deportivo');
      suggestedIds = sports.slice(0, 3).map(p => p.id);
      reply = `¡Los conjuntos deportivos en licra suplex pesada son súper pedidos! Cero transparencias, tiro alto antitranspirante y push-up en glúteos. Ideales para entrenar o para el día a día.\n\n🔥 **Precios de mayorista negociables:** $${sports[0]?.priceUsd || 18} USD (~Bs. ${((sports[0]?.priceUsd || 18) * currentBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })} BCV).`;
      quickReplies = ["Colores disponibles en Suplex", "Top con Biker", "Comprar al mayor", "Hablar con asesor WhatsApp"];
    } else if (text.includes("caballero") || text.includes("hombre") || text.includes("franela")) {
      const men = products.filter(p => p.category === 'caballero' || p.category === 'hombre');
      suggestedIds = men.slice(0, 3).map(p => p.id);
      reply = `Para caballeros disponemos de franelas dry-fit deportivas de alta ventilación, bermudas de lino frescas y conjuntos casuales. Son prendas de rotación constante con precios de mayorista.\n\n👕 Desde **$${men[0]?.priceUsd || 12} USD** (~Bs. ${((men[0]?.priceUsd || 12) * currentBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 })} BCV).`;
      quickReplies = ["Franelas Dry-Fit", "Tallas Caballero (M, L, XL)", "Pedir al mayor", "WhatsApp 0422-0217446"];
    } else if (text.includes("bcv") || text.includes("tasa") || text.includes("dolar") || text.includes("bolivar") || text.includes("bs")) {
      reply = `En **ELIBETH DEL VALLE STORE** calculamos todos los pagos estrictamente a la **tasa oficial del Banco Central de Venezuela (BCV)** del día:\n\n🇻🇪 **Tasa Oficial BCV:** Bs. **${currentBcv}** por USD.\n🔄 Se actualiza de forma automática en tiempo real.\n\nAceptamos **Pago Móvil (0422-021-7446)**, transferencias bancarias nacionales, Zelle y Binance USDT.`;
      quickReplies = ["Hacer un cálculo en Bs.", "Ver formas de pago", "Ver productos", "Hacer pedido por WhatsApp"];
    } else if (text.includes("mayor") || text.includes("reventa") || text.includes("emprend") || text.includes("negocia") || text.includes("volumen")) {
      reply = `💼 **¡Impulsa tu negocio con nuestras compras al Mayor y Reventa en Venezuela!**\n\n1. **Precios Negociables:** Ofrecemos descuentos especiales a partir de media docena (6 prendas surtidas) o por bulto cerrado.\n2. **Envíos Asegurados:** Despachamos directo a tu agencia por MRW, Zoom o Tealca.\n3. **Márgenes del 50% al 70%:** En lencería íntima, jeans levanta cola y ropa deportiva.\n\nEscríbenos al WhatsApp directo **0422-0217446** para recibir el listado exclusivo de mayoristas.`;
      quickReplies = ["Contactar al 04220217446", "Ver lencería al mayor", "Ver jeans al mayor", "Condiciones de envío nacional"];
    } else {
      reply = `¡Hola! Soy tu **Asesora Virtual de Estilo y Pedidos** en **ELIBETH DEL VALLE STORE** 🦁✨ (*El renacer de mi fuerza*).\n\nEstoy aquí para:\n👗 **Recomendarte la prenda ideal** (lencería de encaje, jeans colombianos levanta cola, suplex deportivo o ropa para caballeros).\n💵 **Calcular precios en Bolívares** según la tasa oficial BCV de hoy (**Bs. ${currentBcv} / $**).\n💼 **Guiarte en compras al mayor y pedidos por volumen** con precios negociables.\n📲 **Gestionar tu pedido** y enviarlo directamente a nuestro WhatsApp oficial **0422-0217446**.\n\n¿En qué te puedo asesorar hoy?`;
      suggestedIds = products.slice(0, 3).map(p => p.id);
    }

    const matchedProducts = products.filter(p => suggestedIds.includes(p.id));

    return {
      reply,
      suggestedProducts: matchedProducts,
      isOrderReady,
      orderSummary,
      whatsappUrl: orderSummary 
        ? `https://wa.me/${whatsappNum}?text=${orderSummary}`
        : `https://wa.me/${whatsappNum}?text=${encodeURIComponent('¡Hola Elibeth Del Valle Store! Deseo información y asesoría sobre prendas y pedidos.')}`,
      quickReplies,
      bcvRate: currentBcv,
      whatsappNumber: whatsappNum
    };
  };

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json(generateFallbackResponse(message));
    }

    const systemInstruction = `Eres "Elibeth Stylist Virtual", la asesora de compras, estilo y pedidos de WhatsApp de la boutique venezolana "ELIBETH DEL VALLE STORE" (Eslogan: "El renacer de mi fuerza").
WhatsApp Oficial de la tienda: 0422-0217446 (internacional: 584220217446).
Tasa Oficial BCV del día: Bs. ${currentBcv} por USD.
Todos los precios en bolívares se calculan con esta tasa oficial de forma exacta y transparente.

Catálogo de productos disponibles en tienda:
${JSON.stringify(catalogSummary, null, 2)}

Estado actual del carrito del cliente:
${JSON.stringify(cartSummary, null, 2)}

Tu misión:
1. Trato cercano, elegante, empoderado y muy venezolano ("¡Hola bella/o!", "excelente prenda", "horma espectacular", "tela fresca").
2. Recomienda prendas específicas del catálogo usando sus IDs exactos.
3. Asesora en tallas, telas (encaje francés, mezclilla colombiana levanta cola, licra suplex sin transparencia, dry-fit).
4. Explica ventajas de compras al mayor, precios por volumen y reventa (precios referenciales negociables por docena o bulto).
5. Si el usuario desea comprar, armar o finalizar su pedido, resume los productos elegidos, calcula los totales en USD y en Bs. (Tasa BCV ${currentBcv}), e indica que el pedido se gestionará por WhatsApp al 0422-0217446.

Debes responder OBLIGATORIAMENTE en formato JSON con las siguientes claves:
{
  "reply": "Texto de respuesta con formato Markdown profesional, cálido y conciso",
  "suggestedProductIds": ["id1", "id2"], // IDs de productos del catálogo recomendados (máximo 4)
  "isOrderReady": true / false, // true si el usuario pide comprar, ordenar o revisar su pedido
  "orderSummaryText": "Texto detallado para enviar a WhatsApp si isOrderReady es true",
  "quickReplies": ["Botón 1", "Botón 2", "Botón 3"]
}`;

    const conversationPrompt = `Historial reciente de la conversación:
${JSON.stringify(history.slice(-4), null, 2)}

Mensaje actual del cliente:
"${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: conversationPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const matchedProducts = products.filter(p => (parsed.suggestedProductIds || []).includes(p.id));

    let orderSummary = parsed.orderSummaryText || "";
    if (parsed.isOrderReady && !orderSummary && cartSummary.length > 0) {
      const totalUsd = cartSummary.reduce((acc: number, item: any) => acc + Number(item.totalUsd), 0);
      const totalBs = (totalUsd * currentBcv).toLocaleString('es-VE', { minimumFractionDigits: 2 });
      orderSummary = `*¡HOLA ELIBETH DEL VALLE STORE! Deseo confirmar mi pedido:*%0A%0A` +
        cartSummary.map((item: any, idx: number) => `${idx + 1}. *${item.name}* (Talla: ${item.size}, Color: ${item.color}) x${item.quantity} = $${item.totalUsd}`).join('%0A') +
        `%0A%0A*Total USD:* $${totalUsd.toFixed(2)}` +
        `%0A*Total en Bs. (BCV ${currentBcv}):* Bs. ${totalBs}` +
        `%0A*WhatsApp Oficial:* 0422-021-7446`;
    }

    const whatsappUrl = orderSummary
      ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent(orderSummary.replace(/%0A/g, '\n'))}`
      : `https://wa.me/${whatsappNum}?text=${encodeURIComponent(`¡Hola Elibeth Del Valle Store! Deseo información y asesoría sobre prendas y pedidos.`)}`;

    return res.json({
      reply: parsed.reply || "¡Hola! Con mucho gusto te asesoro con tu compra y pedidos en Elibeth Del Valle Store.",
      suggestedProducts: matchedProducts.length > 0 ? matchedProducts : products.slice(0, 3),
      isOrderReady: Boolean(parsed.isOrderReady),
      orderSummary,
      whatsappUrl,
      quickReplies: parsed.quickReplies || ["Ver Lencería", "Jeans Levanta Cola", "Precios al mayor", "WhatsApp 0422-0217446"],
      bcvRate: currentBcv,
      whatsappNumber: whatsappNum
    });

  } catch (err) {
    console.warn("AI Chat Assistant error, switching to rich fallback:", err);
    return res.json(generateFallbackResponse(message));
  }
});

// Dynamic Sitemap & Robots.txt for SEO
app.get('/sitemap.xml', (req, res) => {
  const host = req.get('host') || 'elibethdelvallestore.com';
  const proto = req.protocol;
  const baseUrl = `${proto}://${host}`;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?cat=mujer</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?cat=hombre</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?cat=ninos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/?cat=encargo</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const host = req.get('host') || 'elibethdelvallestore.com';
  const proto = req.protocol;
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Sitemap: ${proto}://${host}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(txt);
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`[ELIBETH DEL VALLE STORE] Server running on http://0.0.0.0:${PORT}`);
    
    // Initial BCV Official Sync on startup
    try {
      const initialBcv = await fetchOfficialBcvRate();
      if (initialBcv && initialBcv.rate > 0) {
        storeConfig.bcvRate = initialBcv.rate;
        storeConfig.lastBcvUpdate = initialBcv.updatedAt;
        storeConfig.bcvSource = initialBcv.source;
        console.log(`[BCV Service] Tasa oficial BCV inicializada en Bs. ${initialBcv.rate} / USD`);
      }
    } catch (e) {
      console.warn("[BCV Service] Startup sync error:", e);
    }

    // Refresh BCV rate every 30 minutes automatically
    setInterval(async () => {
      if (storeConfig.autoSyncBcv !== false) {
        const update = await fetchOfficialBcvRate();
        if (update && update.rate > 0) {
          storeConfig.bcvRate = update.rate;
          storeConfig.lastBcvUpdate = update.updatedAt;
          storeConfig.bcvSource = update.source;
          console.log(`[BCV Service] Actualización programada BCV: Bs. ${update.rate} / USD`);
        }
      }
    }, 30 * 60 * 1000);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
