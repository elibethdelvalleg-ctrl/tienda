import { useEffect } from 'react';
import { Product } from '../types.ts';
import { getProductReviews } from '../utils/reviewStorage.ts';

/**
 * Dynamically updates document metadata, OpenGraph tags, Twitter cards,
 * and injects Schema.org/Product JSON-LD structured data for search engines.
 */
export function useProductSEO(product: Product | null, bcvRate: number) {
  useEffect(() => {
    if (!product) return;

    // Save previous meta tags to restore on unmount
    const previousTitle = document.title;
    const defaultDescription = "Plataforma e-commerce y venta de moda al mayor y detal en Venezuela: ropa íntima, pantalones colombianos, franelas deportivas de mayoristas y caballeros, precios referenciales y negociables con conversión oficial BCV.";
    const defaultImage = "/assets/aistudio/logoemprendimientoropa_9eefadce.jpeg";

    const effectivePriceUsd = product.salePriceUsd || product.priceUsd;
    const effectivePriceBs = Number((effectivePriceUsd * bcvRate).toFixed(2));
    const reviews = getProductReviews(product);
    const avgRating = reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 5.0;

    // 1. Update Title & Meta Description
    const newTitle = `${product.name} - ELIBETH DEL VALLE STORE`;
    document.title = newTitle;

    const setMetaTag = (selector: string, attr: string, value: string) => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (selector.includes('property=')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) tag.setAttribute('property', prop);
        } else if (selector.includes('name=')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, value);
    };

    const productDescription = `${product.description} Precio: $${effectivePriceUsd.toFixed(2)} USD (~Bs. ${effectivePriceBs.toLocaleString('es-VE')}) con tasa oficial BCV. Envíos a toda Venezuela.`;
    
    setMetaTag('meta[name="description"]', 'content', productDescription);
    setMetaTag('meta[property="og:title"]', 'content', newTitle);
    setMetaTag('meta[property="og:description"]', 'content', productDescription);
    setMetaTag('meta[property="og:image"]', 'content', product.image);
    setMetaTag('meta[property="og:type"]', 'content', 'product');
    setMetaTag('meta[property="og:url"]', 'content', window.location.href);

    // Twitter card
    setMetaTag('meta[name="twitter:title"]', 'content', newTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', productDescription);
    setMetaTag('meta[name="twitter:image"]', 'content', product.image);

    // 2. Inject or update Schema.org Product JSON-LD structured data
    const scriptId = 'product-schema-jsonld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const jsonLdData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": [product.image, product.secondaryImage].filter(Boolean),
      "description": product.description,
      "sku": product.sku,
      "mpn": product.sku,
      "brand": {
        "@type": "Brand",
        "name": "ELIBETH DEL VALLE STORE"
      },
      "category": product.category,
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "USD",
        "price": effectivePriceUsd.toFixed(2),
        "priceValidUntil": "2027-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "ELIBETH DEL VALLE STORE"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating.toString(),
        "reviewCount": reviews.length.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": reviews.map(r => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": r.userName
        },
        "datePublished": r.createdAt ? r.createdAt.split('T')[0] : '2026-10-24',
        "reviewBody": r.comment,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": r.rating.toString(),
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    };

    scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);

    // Cleanup on modal close or unmount
    return () => {
      document.title = previousTitle;
      setMetaTag('meta[name="description"]', 'content', defaultDescription);
      setMetaTag('meta[property="og:title"]', 'content', previousTitle);
      setMetaTag('meta[property="og:description"]', 'content', defaultDescription);
      setMetaTag('meta[property="og:image"]', 'content', defaultImage);
      setMetaTag('meta[property="og:type"]', 'content', 'website');
      setMetaTag('meta[name="twitter:title"]', 'content', previousTitle);
      setMetaTag('meta[name="twitter:description"]', 'content', defaultDescription);
      setMetaTag('meta[name="twitter:image"]', 'content', defaultImage);

      const sTag = document.getElementById(scriptId);
      if (sTag) {
        sTag.remove();
      }
    };
  }, [product, bcvRate]);
}
