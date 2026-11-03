import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Store,
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Search,
  Filter,
  Check,
  Package,
  X,
} from 'lucide-react';
import { Service, Product, Professional, Vitrine } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { SupabaseDataService } from '../../services/supabaseDataService';

interface VitrineViewProps {
  services: Service[];
  products: Product[];
  professionals: Professional[];
  vitrines?: Vitrine[];
  onOpenBookingModal: (serviceId?: string, professionalId?: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const VitrineView: React.FC<VitrineViewProps> = ({
  services,
  products,
  professionals,
  vitrines: initialVitrines,
  onOpenBookingModal,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const categories = ['Todos', 'Cabelos', 'Unhas', 'Estética', 'Noivas', 'Home Care'];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Multiple Vitrines State
  const [vitrinesList, setVitrinesList] = useState<Vitrine[]>(initialVitrines || []);
  const [selectedVitrineId, setSelectedVitrineId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Load vitrines if not provided in props
  useEffect(() => {
    if (initialVitrines && initialVitrines.length > 0) {
      setVitrinesList(initialVitrines);
    } else {
      SupabaseDataService.fetchVitrines().then(data => {
        setVitrinesList(data);
      });
    }
  }, [initialVitrines]);

  const bannerSlides = [
    {
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
      title: 'Vitrine Comercial & Procedimentos de Alta Gestão',
      subtitle: 'Conheça nossos rituais capilares, estética avançada e a boutique Home Care exclusiva.',
    },
    {
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      title: 'Balayage & Morena Iluminada Signature',
      subtitle: 'Especialistas em mechas de alto padrão com preservação absoluta da fibra capilar.',
    },
    {
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80',
      title: 'Nail Couture & Spa Champagne',
      subtitle: 'Tratamentos de unhas com cutilagem russa e acabamento duradouro.',
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => setCurrentSlide(prev => (prev + 1) % bannerSlides.length), 5500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, bannerSlides.length]);

  // Scroll Carousel Handlers
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.75;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  const handleBuyProduct = (product: Product) => {
    setAddedProductId(product.id);
    onAddToCart?.(product);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1800);
  };

  // Filtered lists
  const publishedVitrines = vitrinesList.filter(v => v.ativo).sort((a, b) => a.displayOrder - b.displayOrder);
  const selectedVitrine = publishedVitrines.find(v => v.id === selectedVitrineId);

  // Filter services by category and search
  const filteredServices = services
    .filter(s => s.active)
    .filter(s => {
      if (selectedCategory === 'Home Care') return false; // Home care is for products
      if (selectedCategory === 'Todos') return true;
      return s.category.toLowerCase().includes(selectedCategory.toLowerCase());
    })
    .filter(s => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });

  // Filter products by category and search
  const activeProducts = products
    .filter(p => p.active)
    .filter(p => {
      if (selectedCategory === 'Todos' || selectedCategory === 'Home Care') return true;
      return p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    });

  // ---------------------------------------------------------------------------
  // TELA INDIVIDUAL DE UMA VITRINE ESPECÍFICA
  // ---------------------------------------------------------------------------
  if (selectedVitrine) {
    const vitrineProducts = (selectedVitrine.productIds && selectedVitrine.productIds.length > 0)
      ? selectedVitrine.productIds
          .map(id => products.find(p => p.id === id))
          .filter((p): p is Product => p !== undefined && p.active)
      : activeProducts;

    return (
      <div className="bg-[#08080a] text-neutral-100 flex flex-col pt-24 sm:pt-28 pb-16">
        {/* Banner Individual da Vitrine */}
        <section className="relative w-full h-[360px] sm:h-[440px] overflow-hidden bg-[#08080a] border-b border-white/10">
          <img
            src={selectedVitrine.coverImageUrl || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80'}
            alt={selectedVitrine.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-[#08080a]/35" />

          {/* Controls & Title */}
          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-8 z-10">
            <div>
              <button
                onClick={() => setSelectedVitrineId(null)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-xs font-semibold text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Voltar para Nossas Vitrines</span>
              </button>
            </div>

            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
                <Store size={15} />
                <span>Vitrine Especializada</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-normal text-white">{selectedVitrine.name}</h1>
              {selectedVitrine.description && (
                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed max-w-2xl">
                  {selectedVitrine.description}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Conteúdo da Vitrine Individual */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-12 space-y-14">
          {/* Produtos Exclusivos desta Vitrine */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Boutique Selecionada</span>
                <h2 className="text-2xl font-serif font-normal text-white mt-1">Produtos desta Coleção</h2>
              </div>
              <span className="text-xs text-neutral-400 font-mono">
                {vitrineProducts.length} {vitrineProducts.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {vitrineProducts.length === 0 ? (
              <div className="p-8 text-center bg-[#111116] border border-white/10 rounded-xl text-xs text-neutral-400">
                Nenhum produto associado a esta vitrine no momento.
              </div>
            ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {vitrineProducts.map(product => (
                  <Card key={product.id} hoverable padding="none" className="overflow-hidden bg-[#111116] border border-white/[0.08] flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-square w-full bg-[#181820] overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1608248597262-838249719153?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-black/75 text-[#f3e5ab] border border-white/10 backdrop-blur-md uppercase tracking-wider">
                            {product.brand}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <span className="text-[10px] text-[#d4af37] font-medium uppercase">{product.category}</span>
                        <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{product.name}</h4>
                      </div>
                    </div>

                    <div className="p-4 pt-3 bg-[#0d0d12] border-t border-white/[0.06] flex flex-col gap-2">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-[10px] text-neutral-500 uppercase font-medium">Preço</span>
                        <div className="flex gap-2 items-center">
                          {product.promotionalPriceBRL ? (
                            <>
                              <span className="text-xs text-red-400 line-through">R$ {product.salePriceBRL.toFixed(2)}</span>
                              <span className="text-sm font-bold text-[#f3e5ab]">R$ {product.promotionalPriceBRL.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-[#f3e5ab]">R$ {product.salePriceBRL.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleBuyProduct(product)}
                        className={`w-full uppercase font-semibold text-xs tracking-wider transition-all ${
                          addedProductId === product.id ? 'bg-emerald-500 text-black' : ''
                        }`}
                        icon={addedProductId === product.id ? <Check size={14} /> : <ShoppingBag size={14} />}
                      >
                        {addedProductId === product.id ? 'ADICIONADO!' : 'COMPRAR'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Procedimentos desta Coleção */}
          <section className="space-y-6 pt-4 border-t border-white/10">
            <div className="border-b border-white/10 pb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Procedimentos desta Coleção</span>
              <h2 className="text-2xl font-serif font-normal text-white mt-1">Serviços e Rituais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Card
                  key={service.id}
                  hoverable
                  padding="none"
                  className="overflow-hidden group flex flex-col justify-between bg-[#111116] border border-white/[0.08] hover:border-[#d4af37]/40 transition-all duration-300"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181820]">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = '/src/assets/images/service_luxury_haircare_1793577408044.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-black/75 text-[#f3e5ab] border border-white/10 uppercase tracking-wider">
                          {service.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 bg-black/75 border border-white/10 flex items-center gap-1">
                          <Clock size={11} className="text-[#d4af37]" />
                          <span>{service.durationMinutes} min</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-serif font-semibold text-white group-hover:text-[#f3e5ab] transition-colors leading-snug">
                        {service.name}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">{service.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-4 bg-[#0d0d12] border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase font-medium block">Investimento</span>
                      <div className="flex gap-2 items-center font-mono">
                        {service.promotionalPriceBRL ? (
                          <>
                            <span className="text-xs text-red-400 line-through">R$ {service.priceBRL.toFixed(2)}</span>
                            <span className="text-base font-bold text-[#f3e5ab]">R$ {service.promotionalPriceBRL.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-base font-bold text-[#f3e5ab]">R$ {service.priceBRL.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => onOpenBookingModal(service.id)} icon={<Calendar size={14} />}>
                      AGENDAR
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PÁGINA PRINCIPAL DA VITRINE (COM BANNER E CARROSSEL HORIZONTAL)
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-[#08080a] text-neutral-100 flex flex-col pt-24 sm:pt-28 pb-16">
      {/* 1. HERO BANNER PRINCIPAL */}
      <section
        className="relative w-full h-[380px] sm:h-[460px] overflow-hidden bg-[#08080a] mb-8 border-b border-white/10"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {bannerSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-[#08080a]/30" />
            <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center z-10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
                <Sparkles size={15} />
                <span>Cardápio & Boutique Sra. Bela Mulher</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-white max-w-3xl">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-light">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-16">
        {/* 2. BARRA DE BUSCA E FILTROS DINÂMICOS */}
        <div className="p-4 bg-[#111116] border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar procedimento ou produto..."
              className="w-full bg-[#181822] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#d4af37] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#181822] border border-white/10 rounded-xl overflow-x-auto w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#d4af37] text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. SEÇÃO: NOSSAS VITRINES (CARROSSEL HORIZONTAL PERSONALIZADO) */}
        {publishedVitrines.length > 0 && !searchQuery && (
          <section className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                  <Store size={15} />
                  <span>Curadoria de Ambientes</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">Nossas Vitrines</h2>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  Explore nossas coleções temáticas e rituais exclusivos preparados para cada ocasião.
                </p>
              </div>

              {/* Botões de Navegação Lateral */}
              <div className="flex items-center gap-2 self-end">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-2.5 rounded-full bg-[#14141c] hover:bg-[#d4af37] hover:text-black border border-white/15 text-neutral-300 transition-all cursor-pointer shadow-md"
                  aria-label="Vitrine anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-2.5 rounded-full bg-[#14141c] hover:bg-[#d4af37] hover:text-black border border-white/15 text-neutral-300 transition-all cursor-pointer shadow-md"
                  aria-label="Próxima vitrine"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Carrossel Horizontal com Deslize */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 px-1 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {publishedVitrines.map(vitrine => (
                <div
                  key={vitrine.id}
                  onClick={() => setSelectedVitrineId(vitrine.id)}
                  className="w-[82vw] sm:w-[380px] shrink-0 snap-start group cursor-pointer"
                >
                  <Card
                    hoverable
                    padding="none"
                    className="overflow-hidden h-full bg-[#111116] border border-white/10 group-hover:border-[#d4af37]/50 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#181820]">
                        <img
                          src={
                            vitrine.coverImageUrl ||
                            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={vitrine.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-[#111116]/30 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-black/60 text-[#f3e5ab] border border-[#d4af37]/30 backdrop-blur-md uppercase tracking-wider">
                            Coleção Especial
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-lg font-serif font-semibold text-white group-hover:text-[#f3e5ab] transition-colors leading-snug">
                          {vitrine.name}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {vitrine.description || 'Clique para ver os procedimentos e tratamentos exclusivos.'}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-4 bg-[#0d0d12] border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-[#d4af37] group-hover:text-white transition-colors">
                      <span>Explorar Vitrine</span>
                      <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. PROCEDIMENTOS COM BOTÃO AGENDAR */}
        {selectedCategory !== 'Home Care' && (
          <section className="space-y-8 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Procedimentos & Rituais</span>
                <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">Serviços Exclusivos</h2>
                <p className="text-xs text-neutral-400 mt-1 font-light">
                  {filteredServices.length} {filteredServices.length === 1 ? 'procedimento disponível' : 'procedimentos disponíveis'}
                </p>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="p-10 text-center bg-[#111116] border border-white/10 rounded-2xl text-xs text-neutral-400">
                Nenhum procedimento encontrado para os critérios selecionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.sort((a, b) => a.displayOrder - b.displayOrder).map(service => (
                  <Card
                    key={service.id}
                    hoverable
                    padding="none"
                    className="overflow-hidden group flex flex-col justify-between h-full bg-[#111116] border border-white/[0.08] hover:border-[#d4af37]/40 transition-all duration-300"
                  >
                    <div>
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#181820]">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = '/src/assets/images/service_luxury_haircare_1793577408044.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-black/75 text-[#f3e5ab] border border-[#d4af37]/40 backdrop-blur-md uppercase tracking-wider">
                            {service.category}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-300 bg-black/75 border border-white/10 flex items-center gap-1">
                            <Clock size={11} className="text-[#d4af37]" />
                            <span>{service.durationMinutes} min</span>
                          </span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="text-lg font-serif font-semibold text-white group-hover:text-[#f3e5ab] transition-colors leading-snug">
                          {service.name}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed font-light">{service.description}</p>
                      </div>
                    </div>

                    <div className="p-5 pt-4 bg-[#0d0d12] border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase font-medium block">Investimento</span>
                        <div className="flex gap-2 items-center font-mono">
                          {service.promotionalPriceBRL ? (
                            <>
                              <span className="text-xs text-red-400 line-through">R$ {service.priceBRL.toFixed(2)}</span>
                              <span className="text-base font-bold text-[#f3e5ab]">R$ {service.promotionalPriceBRL.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="text-base font-bold text-[#f3e5ab]">R$ {service.priceBRL.toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <Button size="sm" variant="secondary" onClick={() => onOpenBookingModal(service.id)} icon={<Calendar size={13} />}>
                        AGENDAR
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 5. BOUTIQUE HOME CARE COM BOTÃO COMPRAR */}
        <section className="space-y-8 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">Manutenção em Casa</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white mt-1">Boutique Home Care</h2>
              <p className="text-xs text-neutral-400 mt-1 font-light">
                {activeProducts.length} {activeProducts.length === 1 ? 'produto no catálogo' : 'produtos no catálogo'}
              </p>
            </div>
          </div>

          {activeProducts.length === 0 ? (
            <div className="p-10 text-center bg-[#111116] border border-white/10 rounded-2xl text-xs text-neutral-400">
              Nenhum produto encontrado na boutique.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {activeProducts.sort((a, b) => a.displayOrder - b.displayOrder).map(product => (
                <Card
                  key={product.id}
                  hoverable
                  padding="none"
                  className="overflow-hidden bg-[#111116] border border-white/[0.08] hover:border-[#d4af37]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square w-full bg-[#181820] overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1608248597262-838249719153?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-black/75 text-[#f3e5ab] border border-white/10 uppercase tracking-wider">
                          {product.brand}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <div className="text-[10px] text-[#d4af37] font-medium uppercase">{product.category}</div>
                      <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{product.name}</h4>
                    </div>
                  </div>

                  <div className="p-4 pt-3 bg-[#0d0d12] border-t border-white/[0.06] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[10px] text-neutral-500 uppercase font-medium">Preço</span>
                      <div className="flex gap-2 items-center">
                        {product.promotionalPriceBRL ? (
                          <>
                            <span className="text-xs text-red-400 line-through font-mono">R$ {product.salePriceBRL.toFixed(2)}</span>
                            <span className="text-sm font-bold text-[#f3e5ab] font-mono">R$ {product.promotionalPriceBRL.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-[#f3e5ab] font-mono">R$ {product.salePriceBRL.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleBuyProduct(product)}
                      className={`w-full uppercase font-semibold text-xs tracking-wider transition-all ${
                        addedProductId === product.id ? 'bg-emerald-500 text-black' : ''
                      }`}
                      icon={addedProductId === product.id ? <Check size={14} /> : <ShoppingBag size={14} />}
                    >
                      {addedProductId === product.id ? 'ADICIONADO!' : 'COMPRAR'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 6. CORPO DE ESPECIALISTAS */}
        <section className="space-y-8 pt-6 border-t border-white/10 text-center">
          <h2 className="text-2xl font-serif font-normal text-white">Corpo de Especialistas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionals.map(pro => (
              <Card key={pro.id} padding="md" className="bg-[#111116] border border-white/[0.08] text-center flex flex-col items-center">
                <img src={pro.avatarUrl} alt={pro.name} className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#d4af37]/40" />
                <h4 className="text-base font-serif font-semibold text-white">{pro.name}</h4>
                <div className="text-xs text-[#d4af37]">{pro.roleTitle}</div>
                <Button size="sm" variant="secondary" className="w-full mt-4 text-xs" onClick={() => onOpenBookingModal(undefined, pro.id)}>
                  Agendar com {pro.name.split(' ')[0]}
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
