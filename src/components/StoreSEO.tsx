import React, { useEffect } from 'react';
import { Product, StoreConfig } from '../types.ts';
import { getProductReviews } from '../utils/reviewStorage.ts';

interface StoreSEOProps {
  products: Product[];
  config: StoreConfig;
  bcvRate: number;
}

export const StoreSEO: React.FC<StoreSEOProps> = ({ products, config, bcvRate }) => {
  useEffect(() => {
    // 1. Organization & ClothingStore Schema
    const storeScriptId = 'store-organization-jsonld';
    let storeScript = document.getElementById(storeScriptId) as HTMLScriptElement | null;
    if (!storeScript) {
      storeScript = document.createElement('script');
      storeScript.id = storeScriptId;
      storeScript.type = 'application/ld+json';
      document.head.appendChild(storeScript);
    }

    const organizationData = {
      "@context": "https://schema.org",
      "@type": "ClothingStore",
      "name": config.storeName || "ELIBETH STORE",
      "alternateName": "Elibeth Store",
      "description": "Boutique de moda y ventas al mayor en Venezuela: lencería fina para damas, jeans colombianos levanta cola, franelas deportivas de mayoristas y prendas para caballeros. Precios negociables en USD y Bolívares con tasa oficial BCV.",
      "url": window.location.origin,
      "logo": `${window.location.origin}/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg`,
      "image": `${window.location.origin}/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg`,
      "telephone": "+58 422 021-7446",
      "email": config.contactEmail || "contacto@elibethdelvallestore.com",
      "priceRange": "$$",
      "currenciesAccepted": "USD, VES",
      "paymentAccepted": "Pago Móvil, Transferencia Bancaria, Zelle, Binance Pay (USDT), Efectivo",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Caracas",
        "addressRegion": "Distrito Capital",
        "addressCountry": "VE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 10.4806,
        "longitude": -66.9036
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "20:00"
        }
      ]
    };

    storeScript.textContent = JSON.stringify(organizationData, null, 2);

    // 2. ItemList Schema for Product Catalog
    const catalogScriptId = 'store-catalog-itemlist-jsonld';
    let catalogScript = document.getElementById(catalogScriptId) as HTMLScriptElement | null;
    if (!catalogScript) {
      catalogScript = document.createElement('script');
      catalogScript.id = catalogScriptId;
      catalogScript.type = 'application/ld+json';
      document.head.appendChild(catalogScript);
    }

    const itemListData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Catálogo de Moda y Prendas Mayoristas - ELIBETH STORE",
      "description": "Prendas de alta rotación para compras al detal, mayor y revendedores en Venezuela.",
      "numberOfItems": products.length,
      "itemListElement": products.map((prod, index) => {
        const effectivePrice = prod.salePriceUsd || prod.priceUsd;
        const reviews = getProductReviews(prod);
        const avg = reviews.length > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
          : 5.0;

        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": prod.name,
            "description": prod.description,
            "sku": prod.sku,
            "image": prod.image,
            "category": prod.category,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "USD",
              "price": effectivePrice.toFixed(2),
              "availability": prod.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": avg.toString(),
              "reviewCount": reviews.length.toString(),
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        };
      })
    };

    catalogScript.textContent = JSON.stringify(itemListData, null, 2);

    return () => {
      const s1 = document.getElementById(storeScriptId);
      if (s1) s1.remove();
      const s2 = document.getElementById(catalogScriptId);
      if (s2) s2.remove();
    };
  }, [products, config, bcvRate]);

  return null;
};
