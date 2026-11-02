import { ProductReview, Product } from '../types.ts';

// Default authentic Venezuelan reviews seeded per category/product
export const defaultReviewsMap: Record<string, ProductReview[]> = {
  'prod-intima-1': [
    {
      id: 'rev-int-1',
      productId: 'prod-intima-1',
      userName: 'Valeria C.',
      userCity: 'Caracas, Miranda',
      rating: 5,
      comment: '¡Quedé enamorada del encaje! Es súper suave al tacto y los detalles dorados se ven elegantes como de boutique cara. Compré 3 piezas para revender y a mis clientas les encantó. El envío por MRW llegó asegurado en 2 días.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-24T14:30:00.000Z',
      helpfulCount: 16
    },
    {
      id: 'rev-int-2',
      productId: 'prod-intima-1',
      userName: 'Dayana M.',
      userCity: 'Barquisimeto, Lara',
      rating: 5,
      comment: 'La copa arma bellísimo el busto sin maltratar ni apretar. Pagué en bolívares por Pago Móvil con la tasa oficial BCV de la página y la atención por WhatsApp de la asesora fue un 10/10.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-18T09:15:00.000Z',
      helpfulCount: 9
    },
    {
      id: 'rev-int-3',
      productId: 'prod-intima-1',
      userName: 'Katiuska P.',
      userCity: 'Valencia, Carabobo',
      rating: 4,
      comment: 'Muy buena confección, el color Vino Tinto Dorado es idéntico a las fotos. Recomiendo pedir la talla habitual.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-05T16:40:00.000Z',
      helpfulCount: 4
    }
  ],
  'prod-intima-2': [
    {
      id: 'rev-faja-1',
      productId: 'prod-intima-2',
      userName: 'Andreina P.',
      userCity: 'Valencia, Carabobo',
      rating: 5,
      comment: '¡Excelente compresión! Te recoge todo el abdomen sin ahogarte y bajo los vestidos no se marca absolutamente nada de costura. Es la mejor faja colombiana que he probado.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-22T11:20:00.000Z',
      helpfulCount: 22
    },
    {
      id: 'rev-faja-2',
      productId: 'prod-intima-2',
      userName: 'Corina S.',
      userCity: 'Maracay, Aragua',
      rating: 5,
      comment: 'La tela es suave pero firme. Me guié por la tabla de medidas del modal y la talla M me quedó perfecta. Despacho rápido por Zoom.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-12T18:00:00.000Z',
      helpfulCount: 11
    }
  ],
  'prod-pant-1': [
    {
      id: 'rev-jean-1',
      productId: 'prod-pant-1',
      userName: 'Mariangel T.',
      userCity: 'San Cristóbal, Táchira',
      rating: 5,
      comment: '¡La horma es BRUTAL! Levanta cola de verdad y la mezclilla stretch amolda la cintura sin apretar. La pretina ancha de 3 botones disimula el abdomen al instante.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-25T13:45:00.000Z',
      helpfulCount: 28
    },
    {
      id: 'rev-jean-2',
      productId: 'prod-pant-1',
      userName: 'Karelis B.',
      userCity: 'Maracaibo, Zulia',
      rating: 5,
      comment: 'Calidad 100% colombiana original. Compré talla 8 y me quedó impecable. Los bolsillos traseros están ubicados en el lugar exacto para estilizar.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-19T20:10:00.000Z',
      helpfulCount: 14
    }
  ],
  'prod-pant-2': [
    {
      id: 'rev-cargo-1',
      productId: 'prod-pant-2',
      userName: 'Javier M.',
      userCity: 'Caracas, Distrito Capital',
      rating: 5,
      comment: 'Gabardina fresca y resistente. Los bolsillos cargo tienen buen espacio para el teléfono y la billetera. Muy buen jogger urbano.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-20T17:30:00.000Z',
      helpfulCount: 8
    }
  ],
  'prod-dep-1': [
    {
      id: 'rev-dep-1',
      productId: 'prod-dep-1',
      userName: 'Fabiana G.',
      userCity: 'Caracas, Miranda',
      rating: 5,
      comment: '¡Cero transparencias! Puedes hacer sentadillas pesadas en el gym y no se ve nada. La pretina alta no se dobla ni se baja. Muy contenta con la compra.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-27T10:00:00.000Z',
      helpfulCount: 19
    },
    {
      id: 'rev-dep-2',
      productId: 'prod-dep-1',
      userName: 'Genesis L.',
      userCity: 'Puerto La Cruz, Anzoátegui',
      rating: 5,
      comment: 'El suplex es grueso y el color Verde Esmeralda es divino. Compré al mayor 4 conjuntos para emprender y los vendí en una semana.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-15T15:20:00.000Z',
      helpfulCount: 13
    }
  ],
  'prod-dep-2': [
    {
      id: 'rev-dryfit-1',
      productId: 'prod-dep-2',
      userName: 'Ricardo V.',
      userCity: 'Lechería, Anzoátegui',
      rating: 5,
      comment: 'Súper fresca para correr en el calor de oriente. La tela no retiene sudor ni malos olores. Compré 3 franelas con el descuento de mayorista.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-26T12:00:00.000Z',
      helpfulCount: 12
    }
  ],
  'prod-bespoke-1': [
    {
      id: 'rev-bespoke-1',
      productId: 'prod-bespoke-1',
      userName: 'Rosario D.',
      userCity: 'Caracas, Miranda',
      rating: 5,
      comment: 'Mandé a confeccionar un vestido para el grado de mi hija. Aboné el 50% de anticipo por Pago Móvil y a los 8 días ya estaba listo para la prueba. La caída de la tela de satén y las costuras son de alta costura.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: '2026-10-21T18:40:00.000Z',
      helpfulCount: 25
    }
  ]
};

// Generic fallback reviews for any newly created products
export function generateGenericReviews(product: Product): ProductReview[] {
  return [
    {
      id: `rev-gen-${product.id}-1`,
      productId: product.id,
      userName: 'Gabriela Morales',
      userCity: 'Caracas, Miranda',
      rating: 5,
      comment: `¡Excelente prenda! La calidad de confección de ${product.name} superó mis expectativas. El despacho por agencia fue muy puntual y la atención por WhatsApp excelente.`,
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      helpfulCount: 7
    },
    {
      id: `rev-gen-${product.id}-2`,
      productId: product.id,
      userName: 'Yelitza R.',
      userCity: 'Valencia, Carabobo',
      rating: 5,
      comment: 'Muy buena relación precio-calidad. El precio negociable por volumen es perfecto para emprender. Recomiendo 100%.',
      fitFeedback: 'exacta',
      verifiedBuyer: true,
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      helpfulCount: 4
    }
  ];
}

// Retrieve reviews for a product from localStorage or defaults
export function getProductReviews(product: Product): ProductReview[] {
  try {
    const key = `edv_reviews_${product.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read reviews from localStorage:', err);
  }

  // Fallback to static catalog reviews or generated ones
  const seeded = defaultReviewsMap[product.id];
  if (seeded && seeded.length > 0) {
    return seeded;
  }

  return generateGenericReviews(product);
}

// Save reviews for a product to localStorage
export function saveProductReviews(productId: string, reviews: ProductReview[]): void {
  try {
    const key = `edv_reviews_${productId}`;
    localStorage.setItem(key, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Could not save reviews to localStorage:', err);
  }
}
