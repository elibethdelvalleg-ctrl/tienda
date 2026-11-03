import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquarePlus, Sparkles, Filter, ChevronDown, Check, Send } from 'lucide-react';
import { Product, ProductReview } from '../types.ts';
import { getProductReviews, saveProductReviews } from '../utils/reviewStorage.ts';
import { StarRatingInput, StarRatingDisplay } from './StarRating.tsx';

interface ProductReviewsSectionProps {
  product: Product;
  whatsappNumber?: string;
  openFormSignal?: number;
  onReviewsChange?: (reviews: ProductReview[]) => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  whatsappNumber,
  openFormSignal,
  onReviewsChange,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>(() => getProductReviews(product));
  const [showForm, setShowForm] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [helpfulVoted, setHelpfulVoted] = useState<Record<string, boolean>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSubmittedReview, setLastSubmittedReview] = useState<ProductReview | null>(null);

  // Form states
  const [formRating, setFormRating] = useState<number>(5);
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formFit, setFormFit] = useState<'exacta' | 'pequena' | 'grande'>('exacta');
  const [formError, setFormError] = useState('');

  // Keep reviews synced when product changes
  useEffect(() => {
    const loaded = getProductReviews(product);
    setReviews(loaded);
    setShowForm(false);
    setSubmitSuccess(false);
    setFormError('');
  }, [product.id]);

  // Open form when signaled from outside
  useEffect(() => {
    if (openFormSignal && openFormSignal > 0) {
      setShowForm(true);
      setTimeout(() => {
        const input = document.getElementById('review-form-name');
        if (input) input.focus();
      }, 150);
    }
  }, [openFormSignal]);

  // Calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
    : 5.0;

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const exactFitCount = reviews.filter(r => r.fitFeedback === 'exacta').length;
  const exactFitPercent = totalReviews > 0 ? Math.round((exactFitCount / totalReviews) * 100) : 100;

  // Filtered & Sorted reviews
  const displayedReviews = reviews
    .filter(r => filterRating === 'all' || r.rating === filterRating)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'helpful') {
        return (b.helpfulCount || 0) - (a.helpfulCount || 0);
      }
      return 0;
    });

  const handleHelpfulClick = (reviewId: string) => {
    if (helpfulVoted[reviewId]) return;

    const updated = reviews.map(r => {
      if (r.id === reviewId) {
        return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
      }
      return r;
    });

    setReviews(updated);
    saveProductReviews(product.id, updated);
    setHelpfulVoted(prev => ({ ...prev, [reviewId]: true }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Por favor ingresa tu nombre o apodo.');
      return;
    }
    if (!formComment.trim() || formComment.trim().length < 10) {
      setFormError('Por favor escribe un comentario de al menos 10 caracteres.');
      return;
    }

    const newReview: ProductReview = {
      id: `rev-user-${Date.now()}`,
      productId: product.id,
      userName: formName.trim(),
      userCity: formCity.trim() || 'Venezuela',
      rating: formRating,
      comment: formComment.trim(),
      fitFeedback: formFit,
      verifiedBuyer: true,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    saveProductReviews(product.id, updatedReviews);
    setLastSubmittedReview(newReview);
    onReviewsChange?.(updatedReviews);

    try {
      window.dispatchEvent(new CustomEvent('edv-review-added', { detail: { productId: product.id, review: newReview } }));
    } catch {}

    // Reset form
    setFormName('');
    setFormCity('');
    setFormComment('');
    setFormRating(5);
    setFormFit('exacta');
    setFormError('');
    setSubmitSuccess(true);
    setShowForm(false);

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 8000);
  };

  const ratingLabels: Record<number, string> = {
    1: 'Mala',
    2: 'Regular',
    3: 'Buena',
    4: 'Muy buena',
    5: '¡Excelente!',
  };

  const quickCities = ['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'San Cristóbal', 'Maracay'];

  return (
    <div className="mt-8 pt-8 border-t border-[#3B2A10]/15 dark:border-[#D4B24C]/25 text-[#3B2A10] dark:text-[#FBF7EE]">
      
      {/* Header with Title and "Escribir Reseña" CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span>Opiniones y Calificaciones</span>
            <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#D4B24C]/20 text-[#8B6F38] dark:text-[#D4B24C] font-bold">
              {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Comentarios reales de clientes y mayoristas en Venezuela
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setFormError('');
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8B6F38] to-[#D4B24C] hover:from-[#765E2F] hover:to-[#B8962E] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{showForm ? 'Cancelar Opinión' : 'Escribir mi opinión'}</span>
        </button>
      </div>

      {submitSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 shadow-sm animate-in fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">¡Gracias por tu opinión!</p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Tu reseña con estrellas ha sido publicada y ayuda a otros compradores venezolanos.
              </p>
            </div>
          </div>

          {whatsappNumber && lastSubmittedReview && (
            <button
              type="button"
              onClick={() => {
                const message = encodeURIComponent(
                  `¡Hola Elibeth Del Valle Store! Acabo de calificar con ${lastSubmittedReview.rating}★ la prenda "${product.name}":\n\n"${lastSubmittedReview.comment}"\n- ${lastSubmittedReview.userName} (${lastSubmittedReview.userCity})`
                );
                window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Compartir al WhatsApp</span>
            </button>
          )}
        </div>
      )}

      {/* Breakdown Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-white/70 dark:bg-[#12100E]/70 rounded-2xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 mb-6">
        
        {/* Overall Score */}
        <div className="flex flex-col items-center justify-center text-center p-3 border-b md:border-b-0 md:border-r border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
          <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#3B2A10] dark:text-[#F4E7BD] leading-none">
            {averageRating}
          </span>
          <div className="my-2">
            <StarRatingDisplay rating={averageRating} size="md" />
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Basado en {totalReviews} calificaciones
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            <Check className="w-3 h-3" /> {exactFitPercent}% indica Talla Exacta
          </span>
        </div>

        {/* Rating Distribution Bars */}
        <div className="space-y-1.5 md:col-span-2 flex flex-col justify-center">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating as keyof typeof ratingCounts] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? 'all' : rating)}
                className={`flex items-center gap-3 text-xs w-full text-left py-0.5 px-2 rounded-md transition-colors ${
                  filterRating === rating ? 'bg-[#D4B24C]/20 font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="font-bold">{rating}</span>
                  <Star className="w-3 h-3 fill-[#D4B24C] text-[#D4B24C]" />
                </div>
                <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B8962E] to-[#D4B24C] rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Review Form Drawer */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mb-8 p-5 sm:p-6 bg-[#FAF5E8] dark:bg-[#1A1612] rounded-2xl border-2 border-[#D4B24C]/40 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4B24C]" />
              <span>Deja tu calificación para esta prenda</span>
            </h4>
            <span className="text-xs text-stone-500">* Campos requeridos</span>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Star selector with StarRatingInput */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Calificación General con Estrellas *
            </label>
            <StarRatingInput
              value={formRating}
              onChange={(val) => setFormRating(val)}
              size="md"
            />
          </div>

          {/* User Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tu Nombre o Apodo *
              </label>
              <input
                id="review-form-name"
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej. Gabriela Morales"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100E] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D4B24C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Ciudad / Estado (Venezuela)
              </label>
              <input
                type="text"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="Ej. Caracas, Valencia, Maracay..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100E] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D4B24C]"
              />
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                <span className="text-[10px] text-stone-500">Sugerencias:</span>
                {quickCities.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setFormCity(city)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#D4B24C]/20 cursor-pointer"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fit Feedback */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              ¿Cómo sentiste la talla / horma de la prenda?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'pequena', label: 'Corre Pequeña' },
                { id: 'exacta', label: 'Talla Exacta' },
                { id: 'grande', label: 'Corre Holgada' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormFit(opt.id as any)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition cursor-pointer ${
                    formFit === opt.id
                      ? 'border-[#8B6F38] bg-[#3B2A10] text-[#FBF7EE] dark:bg-[#D4B24C] dark:text-[#12100E] font-bold shadow-xs'
                      : 'border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100E] text-stone-700 dark:text-stone-300 hover:border-[#D4B24C]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Tu Reseña / Experiencia *
              </label>
              <span className="text-[10px] text-stone-400">Mínimo 10 caracteres</span>
            </div>
            <textarea
              required
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Cuéntale a otras compradoras sobre la calidad de la tela, la costura, el color, el empaque o la rapidez del envío por MRW/Zoom..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100E] text-xs focus:outline-hidden focus:ring-2 focus:ring-[#D4B24C]"
            />

            {/* Quick tags to append to comment */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] text-stone-400 font-medium">Frases rápidas:</span>
              {[
                'Tela suave y de calidad',
                'Horma perfecta levanta cola',
                'Envío rápido por MRW',
                'Excelente para revender',
                '100% recomendado'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setFormComment(prev => prev ? `${prev}. ${tag}` : tag);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-[#D4B24C]/25 cursor-pointer transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B6F38] via-[#B8962E] to-[#D4B24C] hover:from-[#765E2F] hover:to-[#B8962E] text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Publicar Reseña</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#3B2A10]/10 dark:border-[#D4B24C]/20">
        
        {/* Rating filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-stone-500 dark:text-stone-400 text-xs flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition ${
              filterRating === 'all'
                ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E] font-bold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            Todas ({totalReviews})
          </button>
          {[5, 4, 3].map(num => (
            <button
              key={num}
              onClick={() => setFilterRating(num)}
              className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition flex items-center gap-1 ${
                filterRating === num
                  ? 'bg-[#3B2A10] text-white dark:bg-[#D4B24C] dark:text-[#12100E] font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <span>{num}</span>
              <Star className="w-3 h-3 fill-[#D4B24C] text-[#D4B24C]" />
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
          <span className="text-stone-500 dark:text-stone-400">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100E] text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-[#D4B24C]"
          >
            <option value="recent">Más recientes</option>
            <option value="highest">Mayor puntuación</option>
            <option value="helpful">Más útiles</option>
          </select>
        </div>
      </div>

      {/* Review List */}
      {displayedReviews.length === 0 ? (
        <div className="text-center py-8 bg-stone-50 dark:bg-[#16120E] rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <p className="text-stone-500 dark:text-stone-400 text-xs">
            No hay reseñas con este filtro de estrellas.
          </p>
          <button
            onClick={() => setFilterRating('all')}
            className="mt-2 text-xs font-bold text-[#8B6F38] dark:text-[#D4B24C] hover:underline cursor-pointer"
          >
            Ver todas las reseñas
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((rev) => {
            const formattedDate = new Date(rev.createdAt).toLocaleDateString('es-VE', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const initial = rev.userName.charAt(0).toUpperCase();
            const isVoted = helpfulVoted[rev.id];

            return (
              <div
                key={rev.id}
                className="p-4 sm:p-5 bg-white dark:bg-[#12100E] rounded-2xl border border-[#3B2A10]/10 dark:border-[#D4B24C]/20 shadow-xs hover:border-[#D4B24C]/40 transition"
              >
                {/* Header: User, Stars, Badges, Date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B6F38] to-[#D4B24C] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {initial}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          {rev.userName}
                        </span>
                        {rev.verifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Compra Verificada</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {rev.userCity && <span>📍 {rev.userCity}</span>}
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-[#D4B24C] text-[#D4B24C]'
                            : 'text-stone-300 dark:text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Fit pill if specified */}
                {rev.fitFeedback && (
                  <div className="mt-2.5">
                    <span className="inline-block text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
                      👗 Calce: {rev.fitFeedback === 'exacta' ? 'Talla exacta' : rev.fitFeedback === 'pequena' ? 'Corre pequeña' : 'Corre holgada'}
                    </span>
                  </div>
                )}

                {/* Review Text */}
                <p className="mt-2.5 text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                  {rev.comment}
                </p>

                {/* Footer: Helpful button */}
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">
                    ¿Te resultó útil esta opinión?
                  </span>

                  <button
                    onClick={() => handleHelpfulClick(rev.id)}
                    disabled={isVoted}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                      isVoted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                    <span>{isVoted ? '¡Gracias!' : 'Útil'}</span>
                    {(rev.helpfulCount || 0) > 0 && (
                      <span className="font-mono font-bold">({rev.helpfulCount})</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
