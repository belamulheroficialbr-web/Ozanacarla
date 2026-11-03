import React, { useState, useEffect } from 'react';
import {
  Home,
  User,
  Briefcase,
  Store,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Instagram,
  MapPin,
  Phone,
  Clock,
  Mail,
  Calendar,
  ShoppingBag,
  Star,
  CheckCircle2,
  Coffee,
  ShieldCheck,
  ArrowRight,
  Heart,
  Scissors,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { AppRole, PublicTab, Service, Product, Professional } from '../../types';
import { Opening3dEffect } from '../common/Opening3dEffect';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface PublicHomePageProps {
  services: Service[];
  products: Product[];
  professionals: Professional[];
  activeTab: PublicTab;
  onSelectTab: (tab: PublicTab) => void;
  onSelectRole: (role: AppRole) => void;
  onOpenBookingModal: (serviceId?: string, professionalId?: string) => void;
  show3dParticles: boolean;
  onAddToCart?: (product: Product) => void;
  onOpenCart?: () => void;
  currentRole?: AppRole;
  onOpenClientAuth?: () => void;
  onOpenProAuth?: () => void;
  onOpenChat?: () => void;
  hasAuthUser?: boolean;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  services,
  products,
  professionals,
  activeTab,
  onSelectTab,
  onSelectRole,
  onOpenBookingModal,
  show3dParticles,
  onAddToCart,
  onOpenCart,
  currentRole = 'visitor',
  onOpenClientAuth,
  onOpenProAuth,
  onOpenChat,
  hasAuthUser = false,
}) => {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroSlides = [
    {
      image: '/src/assets/images/hero_salon_luxury_interior_1793577409043.jpg',
      kicker: 'ATELIER DE ALTA BELEZA · JARDINS, SÃO PAULO',
      title: 'A Arte da Transformação com Precisão e Luxo',
      subtitle: 'Visagismo arquitetônico, mechas autorais e rituais sensoriais em um ambiente exclusivo de bem-estar.',
      serviceId: 'srv-1',
    },
    {
      image: '/src/assets/images/service_luxury_haircare_1793577408044.jpg',
      kicker: 'COLORIMETRIA SIGNATURE & MECHAS NOBRES',
      title: 'Balayage Dourada & Morena Iluminada',
      subtitle: 'Iluminação tridimensional personalizada com preservação absoluta da fibra capilar e tons caramelo e mel.',
      serviceId: 'srv-1',
    },
    {
      image: '/src/assets/images/service_nail_art_champagne_1793577410058.jpg',
      kicker: 'NAIL COUTURE & SPA DE MÃOS',
      title: 'Spa de Unhas & Esmaltação Champagne',
      subtitle: 'Cutilagem russa combinada, esfoliação com óleos essenciais e acabamento de alta durabilidade.',
      serviceId: 'srv-3',
    },
    {
      image: '/src/assets/images/service_aesthetic_facial_1793577409868.jpg',
      kicker: 'ESTÉTICA AVANÇADA & REJUVENESCIMENTO',
      title: 'Revitalização Facial Peptídeos Dourados',
      subtitle: 'Protocolo de infusão profunda com ácido hialurônico fracionado e partículas iluminadoras de ouro.',
      serviceId: 'srv-5',
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  // Featured services & products
  const featuredServices = services.filter(s => s.active && s.featuredInVitrine).slice(0, 3);
  const displayServices = featuredServices.length > 0 ? featuredServices : services.slice(0, 3);

  const featuredProducts = products.filter(p => p.active && p.featuredInVitrine).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  return (
    <div className="bg-[#08080a] text-neutral-100 flex flex-col pt-24 sm:pt-28">
      
      {/* 1. FAIXA SUPERIOR — BANNER COM PALAVRAS DE BELEZA, ELEGÂNCIA, PENTEADOS E AUTOESTIMA */}
      <div className="w-full bg-gradient-to-r from-[#08080a] via-[#14141c] to-[#08080a] border-b border-[#d4af37]/30 py-2.5 px-4 overflow-hidden shadow-md shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-serif text-[#f3e5ab] tracking-wider uppercase whitespace-nowrap overflow-x-auto no-scrollbar py-0.5 w-full justify-around">
            <span className="flex items-center gap-2">
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>Visagismo Arquitetônico</span>
            </span>
            <span className="text-[#d4af37]/40 font-mono">•</span>
            <span className="flex items-center gap-2">
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>Alta Colorimetria & Mechas Autorais</span>
            </span>
            <span className="text-[#d4af37]/40 font-mono hidden sm:inline">•</span>
            <span className="flex items-center gap-2 hidden sm:flex">
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>Penteados & Cordoaria Nobre</span>
            </span>
            <span className="text-[#d4af37]/40 font-mono hidden md:inline">•</span>
            <span className="flex items-center gap-2 hidden md:flex">
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>Rituais Kérastase</span>
            </span>
            <span className="text-[#d4af37]/40 font-mono hidden lg:inline">•</span>
            <span className="flex items-center gap-2 hidden lg:flex">
              <Sparkles size={13} className="text-[#d4af37]" />
              <span>Autoestima & Sofisticação</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. CARROSSEL HORIZONTAL EM FORMATO BANNER */}
      <section
        className="relative w-full h-[300px] sm:h-[400px] lg:h-[440px] overflow-hidden bg-[#08080a] shrink-0"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transition-transform duration-10000 ${
                idx === currentSlide ? 'scale-105' : 'scale-100'
              }`}
              referrerPolicy="no-referrer"
            />
            {/* Scrim Gradiente sofisticado */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/65 to-[#08080a]/35" />

            {/* Conteúdo Central Impactante */}
            <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-left z-20 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#f3e5ab] text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] backdrop-blur-md shadow-lg shadow-[#d4af37]/10 animate-in fade-in slide-in-from-top-2 duration-500">
                <Sparkles size={12} className="text-[#d4af37]" />
                <span>{slide.kicker}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal text-white max-w-2xl leading-[1.2] tracking-tight">
                {slide.title}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg font-light leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Botões de Ação Imediata */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Button
                  size="md"
                  onClick={() => onOpenBookingModal(slide.serviceId)}
                  icon={<Calendar size={15} />}
                  className="shadow-xl shadow-[#d4af37]/20 uppercase tracking-wider text-xs font-semibold"
                >
                  Agendar Procedimento VIP
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onSelectTab('vitrine')}
                  icon={<ShoppingBag size={15} />}
                  className="uppercase tracking-wider text-xs"
                >
                  Ver Vitrine & Produtos
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Controls */}
        <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto pointer-events-auto">
          <button
            onClick={() => setCurrentSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
            className="p-2 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer shadow-lg"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  i === currentSlide
                    ? 'w-6 bg-[#d4af37] shadow-sm shadow-[#d4af37]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Ir para slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((currentSlide + 1) % heroSlides.length)}
            className="p-2 rounded-full bg-[#121217]/80 hover:bg-[#1a1a24] text-neutral-200 hover:text-[#f3e5ab] border border-white/10 transition-colors cursor-pointer shadow-lg"
            aria-label="Próximo slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      {/* 3. ÁREA 3D PRINCIPAL (FORMATO VERTICAL 9:16 NO CELULAR) & PROCEDIMENTOS */}
      <section className="relative w-full py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#08080a] via-[#101018] to-[#08080a] border-b border-[#d4af37]/25 space-y-6">
        
        {/* Contêiner da Experiência Visual 3D — Proporção Vertical 9:16 no Mobile, Altura Limitada */}
        <div className="relative w-full max-w-[340px] sm:max-w-4xl h-[400px] sm:h-[440px] rounded-3xl border border-[#d4af37]/40 overflow-hidden shadow-2xl shadow-black/90 flex items-center justify-center mx-auto">
          <div className="absolute inset-0 z-0">
            <Opening3dEffect />
          </div>

          <div className="relative z-10 text-center px-4 py-4 max-w-xl mx-auto space-y-2.5 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/75 border border-[#d4af37]/50 text-[#f3e5ab] text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur-md shadow-xl">
              <Sparkles size={13} className="text-[#d4af37] animate-pulse" />
              <span>Experiência Sensorial 3D</span>
            </div>

            <h2 className="text-xl sm:text-3xl font-serif font-normal text-white leading-tight">
              A Essência da Beleza & Cordoaria em 3D
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-md mx-auto leading-relaxed">
              Diagnosticador capilar, visagismo exclusivo e rituais tridimensionais nos Jardins.
            </p>

            <div className="pt-1 pointer-events-auto flex justify-center">
              <Button
                size="sm"
                onClick={() => onOpenBookingModal()}
                icon={<Calendar size={13} />}
                className="uppercase tracking-wider font-semibold text-xs shadow-lg shadow-[#d4af37]/20"
              >
                Agendar Diagnóstico VIP
              </Button>
            </div>
          </div>
        </div>

        {/* Procedimentos em Destaque */}
        <div className="max-w-7xl mx-auto w-full space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37] block">
                Rituais de Assinatura
              </span>
              <h3 className="text-lg sm:text-2xl font-serif font-normal text-white mt-0.5">
                Procedimentos em Destaque
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTab('servicos')}
              icon={<ArrowRight size={13} />}
              className="text-xs"
            >
              Ver Tabela Completa
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayServices.map(service => (
              <Card
                key={service.id}
                hoverable
                padding="none"
                className="overflow-hidden group flex flex-col justify-between bg-[#111116] border border-white/[0.08] hover:border-[#d4af37]/50 transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#181820]">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/src/assets/images/service_luxury_haircare_1793577408044.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-transparent to-transparent opacity-80" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-black/75 text-[#f3e5ab] border border-[#d4af37]/40 backdrop-blur-md uppercase tracking-wider">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <h4 className="text-sm font-serif font-semibold text-white group-hover:text-[#f3e5ab] transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 font-light leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#0d0d12] border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-serif font-bold text-[#f3e5ab] font-mono">
                    R$ {service.priceBRL.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onOpenBookingModal(service.id)}
                    icon={<Calendar size={12} />}
                    className="text-[11px] font-semibold py-1.5 px-3"
                  >
                    AGENDAR
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </section>


    </div>
  );
};
