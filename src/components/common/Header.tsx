import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Scissors,
  LogOut,
  ShoppingBag,
  Menu,
  X,
  Home,
  Smartphone,
  ShieldCheck,
  Instagram,
  MessageCircle,
  ChevronRight,
  Download,
  CheckCircle2,
  HelpCircle,
  Info,
  MapPin,
  Phone,
  Clock,
  Mail,
  Store,
  Briefcase,
} from 'lucide-react';
import { AppRole, PublicTab } from '../../types';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export interface HeaderProps {
  currentRole: AppRole;
  onSelectRole: (role: AppRole) => void;
  activePublicTab?: PublicTab;
  onSelectPublicTab?: (tab: PublicTab) => void;
  onOpenBookingModal?: () => void;
  authUserEmail?: string | null;
  authUserName?: string | null;
  onOpenAuthView?: (mode?: 'login' | 'signup') => void;
  onLogout?: () => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
  show3dParticles?: boolean;
  onToggle3dParticles?: () => void;
  onOpenClientAuth?: () => void;
  onOpenProAuth?: () => void;
  onOpenSupportChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  activePublicTab = 'home',
  onSelectPublicTab,
  authUserEmail,
  authUserName,
  onLogout,
  cartItemCount = 0,
  onOpenCart,
  show3dParticles = true,
  onToggle3dParticles,
  onOpenClientAuth,
  onOpenProAuth,
  onOpenSupportChat,
  onOpenAuthView,
}) => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInfoModal) {
          setShowInfoModal(false);
          return;
        }
        if (showIOSGuide) {
          setShowIOSGuide(false);
          return;
        }
        if (isSideMenuOpen) {
          setIsSideMenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSideMenuOpen, showIOSGuide, showInfoModal]);

  const handleInstallClick = async () => {
    if (isInstalled) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 3000);
      return;
    }
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (isInstallable) {
      await install();
      return;
    }
    setShowIOSGuide(true);
  };

  const handleTriggerSupport = () => {
    setIsSideMenuOpen(false);
    if (onOpenSupportChat) {
      onOpenSupportChat();
    } else {
      const chatBtn = (document.querySelector('[data-chat-launcher="true"]') ||
        document.querySelector('[aria-label*="Consultora"]') ||
        document.querySelector('[aria-label*="chat"]')) as HTMLButtonElement;
      if (chatBtn) chatBtn.click();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#08080a]/95 backdrop-blur-md border-b border-[#d4af37]/25 shadow-lg shrink-0">
        {/* Top Tagline Strip */}
        <div className="bg-gradient-to-r from-[#08080a] via-[#14141c] to-[#08080a] border-b border-[#d4af37]/20 py-1 px-4 text-center">
          <p className="text-[11px] sm:text-xs text-[#f3e5ab] font-serif tracking-wider flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-[#d4af37]" />
            <span>A Arte da Transformação com Precisão e Luxo · Jardins, São Paulo</span>
            <Sparkles size={12} className="text-[#d4af37]" />
          </p>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          
          {/* ZONE 1: Logo & Identidade Visual */}
          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectPublicTab?.('home');
            }}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group cursor-pointer"
            title="Ir para o Início do Atelier"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black font-bold shadow-md shadow-[#d4af37]/20 group-hover:scale-105 transition-transform">
              <Sparkles size={18} className="sm:hidden" />
              <Sparkles size={20} className="hidden sm:block" />
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-serif font-bold tracking-wider text-white group-hover:text-[#f3e5ab] transition-colors">
                Sra. Bela Mulher
              </span>
              <span className="hidden sm:block text-[10px] tracking-[0.2em] text-[#d4af37] font-sans uppercase font-medium">
                Atelier de Beleza & Gestão
              </span>
            </div>
          </button>

          {/* ZONE 2: SOMENTE DOIS BOTÕES DE AÇÃO À DIREITA (Sacola & Menu Lateral) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 1. Sacola de compras (carrinho) */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#14141c] hover:bg-[#d4af37] text-neutral-200 hover:text-black border border-white/10 hover:border-[#d4af37] transition-all cursor-pointer flex items-center justify-center shadow-md group shrink-0"
                title="Sacola de Compras"
                aria-label="Sacola de Compras"
              >
                <ShoppingBag size={15} className="group-hover:scale-105 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d4af37] text-black text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#08080a] animate-in zoom-in duration-200 shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* 2. Menu lateral (ícone sanduíche) */}
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#14141c] hover:bg-[#d4af37] text-[#f3e5ab] hover:text-black border border-[#d4af37]/50 transition-all cursor-pointer shadow-md group h-8 sm:h-9"
              title="Abrir Menu do Atelier"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wider uppercase hidden sm:inline">Menu</span>
            </button>
          </div>

        </div>
      </header>

      {/* SIDE MENU DRAWER (COMPACTO E ELEGANTE) */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSideMenuOpen(false);
          }}
        >
          <div
            className="w-[280px] sm:max-w-xs bg-[#0c0c10] border-l border-[#d4af37]/35 max-h-[85vh] rounded-2xl flex flex-col p-4 shadow-2xl relative overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa8422] flex items-center justify-center text-black font-bold shadow-sm">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-serif font-bold text-white tracking-wide">Sra. Bela Mulher</h3>
                  <span className="text-[9px] text-[#d4af37] tracking-widest uppercase font-semibold">Menu Atelier</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSideMenuOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar Menu"
                  aria-label="Fechar Menu"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Menu Items List (Compact & Elegant) */}
            <div className="flex flex-col gap-2.5 text-xs">

              {/* 1. PERFIL DO USUÁRIO */}
              <div className="space-y-1">
                <div className="text-[9px] font-semibold tracking-wider text-[#d4af37] uppercase px-1">
                  Perfil
                </div>

                {authUserEmail ? (
                  <div className="p-2.5 rounded-lg bg-[#14141c] border border-[#d4af37]/40 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#d4af37] to-[#aa8422] text-black font-bold flex items-center justify-center text-[11px] shrink-0">
                        {(authUserName || authUserEmail).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-xs font-semibold text-white truncate">
                          {authUserName || authUserEmail.split('@')[0]}
                        </span>
                        <span className="text-[9px] text-[#d4af37] uppercase font-semibold truncate">
                          {currentRole} · Ativo
                        </span>
                      </div>
                    </div>

                    {onLogout && (
                      <button
                        onClick={() => {
                          setIsSideMenuOpen(false);
                          onLogout();
                        }}
                        className="p-1.5 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        title="Sair da Conta"
                      >
                        <LogOut size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsSideMenuOpen(false);
                      if (onOpenAuthView) {
                        onOpenAuthView('login');
                      } else if (onOpenClientAuth) {
                        onOpenClientAuth();
                      }
                    }}
                    className="w-full p-2.5 rounded-lg bg-[#14141c] border border-white/10 hover:border-[#d4af37]/60 text-left flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-[#d4af37]/15 text-[#d4af37]">
                        <User size={15} />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-white">Entrar ou Cadastrar</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-neutral-500 group-hover:text-[#d4af37]" />
                  </button>
                )}
              </div>

              {/* 2. EXPERIÊNCIA VISUAL 3D */}
              {onToggle3dParticles && (
                <div className="space-y-1">
                  <div className="text-[9px] font-semibold tracking-wider text-[#d4af37] uppercase px-1">
                    Visual
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#14141c] border border-[#d4af37]/30 flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-[#d4af37]/15 text-[#d4af37]">
                        <Sparkles size={15} className={show3dParticles ? 'animate-pulse' : ''} />
                      </div>
                      <span className="text-xs font-semibold text-white">Efeitos 3D</span>
                    </div>

                    <button
                      onClick={onToggle3dParticles}
                      className={`px-2.5 py-1 rounded border text-[10px] font-bold transition-all cursor-pointer shrink-0 ${
                        show3dParticles
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8422] text-black border-[#d4af37]'
                          : 'bg-[#08080a] text-neutral-400 border-white/10'
                      }`}
                    >
                      {show3dParticles ? 'LIGADO' : 'DESLIGADO'}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. NAVEGAÇÃO & SACOLA */}
              <div className="space-y-1">
                <div className="text-[9px] font-semibold tracking-wider text-neutral-400 uppercase px-1">
                  Navegação
                </div>

                {onOpenCart && (
                  <button
                    onClick={() => {
                      setIsSideMenuOpen(false);
                      onOpenCart();
                    }}
                    className="w-full p-2.5 rounded-lg bg-[#14141c] border border-white/10 hover:border-[#d4af37]/60 text-left flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={15} className="text-[#d4af37]" />
                      <span className="text-xs font-semibold text-white">Sacola de Compras</span>
                    </div>
                    {cartItemCount > 0 && (
                      <span className="bg-[#d4af37] text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    onSelectRole('visitor');
                    onSelectPublicTab?.('home');
                  }}
                  className="w-full p-2.5 rounded-lg bg-[#14141c] border border-white/10 hover:border-[#d4af37]/60 text-left flex items-center gap-2 transition-all group cursor-pointer shadow-sm"
                >
                  <Home size={15} className="text-[#d4af37]" />
                  <span className="text-xs font-semibold text-white">Início</span>
                </button>

                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    if (!authUserEmail && onOpenClientAuth) {
                      onOpenClientAuth();
                    } else {
                      onSelectRole('client');
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-[#14141c] border border-white/10 hover:border-[#d4af37]/60 text-left flex items-center gap-2 transition-all group cursor-pointer shadow-sm"
                >
                  <User size={15} className="text-[#d4af37]" />
                  <span className="text-xs font-semibold text-white">Área da Cliente</span>
                </button>

                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    if (!authUserEmail && onOpenProAuth) {
                      onOpenProAuth();
                    } else {
                      onSelectRole('professional');
                    }
                  }}
                  className="w-full p-2.5 rounded-lg bg-[#14141c] border border-white/10 hover:border-[#d4af37]/60 text-left flex items-center gap-2 transition-all group cursor-pointer shadow-sm"
                >
                  <Scissors size={15} className="text-[#d4af37]" />
                  <span className="text-xs font-semibold text-white">Área do Profissional</span>
                </button>
              </div>

              {/* 4. APLICATIVO & GESTÃO */}
              <div className="space-y-1">
                <div className="text-[9px] font-semibold tracking-wider text-neutral-400 uppercase px-1">
                  Atelier
                </div>

                {/* BOTÃO ÚNICO DE INFORMAÇÕES (RODAPÉ CONSOLIDADO) */}
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="w-full p-2.5 rounded-lg bg-[#14141c] border border-[#d4af37]/40 hover:border-[#d4af37] text-left flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Info size={15} className="text-[#d4af37]" />
                    <span className="text-xs font-semibold text-white">Informações do Salão</span>
                  </div>
                  <ChevronRight size={14} className="text-neutral-500 group-hover:text-[#d4af37]" />
                </button>

                <button
                  onClick={handleInstallClick}
                  className="w-full p-2.5 rounded-lg bg-[#14141c] border border-white/10 hover:border-[#d4af37]/60 text-left flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone size={15} className="text-[#d4af37]" />
                    <span className="text-xs font-semibold text-white">
                      {isInstalled ? 'Aplicativo Instalado' : 'Instalar App (PWA)'}
                    </span>
                  </div>
                  <Download size={14} className="text-[#d4af37]" />
                </button>

                <button
                  onClick={() => {
                    setIsSideMenuOpen(false);
                    onSelectRole('admin');
                  }}
                  className="w-full p-2.5 rounded-lg bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-[#d4af37]/40 hover:border-[#d4af37] text-left flex items-center justify-between transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#d4af37]" />
                    <span className="text-xs font-semibold text-white">Painel Administrativo</span>
                  </div>
                  <ChevronRight size={14} className="text-[#d4af37]" />
                </button>
              </div>

            </div>

            {/* Footer note */}
            <div className="mt-auto pt-3 border-t border-white/10 text-center text-[9px] text-neutral-500">
              Sra. Bela Mulher &copy; 2026
            </div>

          </div>
        </div>
      )}

      {/* INFORMATIONS MODAL (INSTITUTIONAL INFO MOVED FROM PAGE FOOTER TO SIDE MENU) */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#0e0e12] border border-[#d4af37]/50 p-6 shadow-2xl relative text-neutral-100 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#aa8422] text-black font-bold flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white">Sra. Bela Mulher Atelier</h3>
                  <span className="text-[10px] text-[#d4af37] uppercase font-semibold">Informações Institucionais</span>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Localização</span>
                  <span className="text-neutral-400">Alameda Gabriel Monteiro da Silva, 1420<br />Jardins · São Paulo - SP</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Telefone & WhatsApp</span>
                  <span className="text-neutral-400">(11) 98765-4321</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">E-mail de Contato</span>
                  <span className="text-neutral-400">contato@belamulher.com.br</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Horário de Atendimento</span>
                  <span className="text-neutral-400">Terça a Sábado: 09h às 20h<br />Domingos e Segundas: Fechado</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Instagram size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <span className="block font-semibold text-white">Redes Sociais</span>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline">
                    @sra.belamulher
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-black font-semibold text-xs shadow-md cursor-pointer hover:brightness-105 mt-2"
            >
              Fechar Informações
            </button>
          </div>
        </div>
      )}

      {/* iOS / Direct Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f0f15] border border-[#d4af37]/40 p-6 shadow-2xl text-center relative">
            <div className="w-12 h-12 rounded-xl bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center mx-auto mb-3 border border-[#d4af37]/30">
              <Smartphone size={24} />
            </div>
            <h3 className="text-base font-serif font-bold text-white">Instalação no Dispositivo</h3>
            <p className="text-xs text-neutral-300 mt-2 mb-4 leading-relaxed">
              Para instalar o Sra. Bela Mulher Atelier na tela inicial do seu celular ou tablet:
            </p>
            <div className="bg-[#15151f] rounded-xl p-3 text-left text-xs text-neutral-200 space-y-2 border border-white/10 mb-4">
              <p><strong>1.</strong> Toque no ícone de <strong>Compartilhar</strong> (no Safari) ou no <strong>Menu (3 pontos)</strong> (no Chrome).</p>
              <p><strong>2.</strong> Selecione <strong>"Adicionar à Tela Inicial"</strong> ou <strong>"Instalar Aplicativo"</strong>.</p>
              <p><strong>3.</strong> Confirme para ter acesso rápido com um toque.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-black font-semibold text-xs shadow-md cursor-pointer hover:brightness-105"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
