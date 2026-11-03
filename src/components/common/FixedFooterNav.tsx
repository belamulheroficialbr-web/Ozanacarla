import React from 'react';
import { Home, User, Briefcase, Store, MessageCircle } from 'lucide-react';
import { AppRole, PublicTab } from '../../types';

interface FixedFooterNavProps {
  currentRole: AppRole;
  activePublicTab: PublicTab;
  onSelectRole: (role: AppRole) => void;
  onSelectPublicTab: (tab: PublicTab) => void;
  onOpenClientAuth: () => void;
  onOpenProAuth: () => void;
  onOpenChat: () => void;
  hasAuthUser: boolean;
}

export const FixedFooterNav: React.FC<FixedFooterNavProps> = ({
  currentRole,
  activePublicTab,
  onSelectRole,
  onSelectPublicTab,
  onOpenClientAuth,
  onOpenProAuth,
  onOpenChat,
  hasAuthUser,
}) => {
  const isInicioActive = currentRole === 'visitor' && activePublicTab === 'home';
  const isVitrineActive = currentRole === 'visitor' && (activePublicTab === 'vitrine' || activePublicTab === 'servicos');
  const isClientActive = currentRole === 'client';
  const isProActive = currentRole === 'professional';

  return (
    <nav aria-label="Navegação Principal" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#08080a]/95 backdrop-blur-md border-t border-[#d4af37]/25 shadow-2xl py-2 px-3">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* 1. Início */}
        <button
          onClick={() => {
            onSelectRole('visitor');
            onSelectPublicTab('home');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            isInicioActive
              ? 'text-[#f3e5ab] font-medium bg-[#14141c] border border-[#d4af37]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Início"
        >
          <Home size={18} className={isInicioActive ? 'text-[#d4af37]' : 'text-neutral-400'} />
          <span className="text-[10px] tracking-wide uppercase font-sans">Início</span>
        </button>

        {/* 2. Cliente */}
        <button
          onClick={() => {
            if (!hasAuthUser && currentRole !== 'client') {
              onOpenClientAuth();
            } else {
              onSelectRole('client');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            isClientActive
              ? 'text-[#f3e5ab] font-medium bg-[#14141c] border border-[#d4af37]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Área da Cliente"
        >
          <User size={18} className={isClientActive ? 'text-[#d4af37]' : 'text-neutral-400'} />
          <span className="text-[10px] tracking-wide uppercase font-sans">Cliente</span>
        </button>

        {/* 3. Profissional */}
        <button
          onClick={() => {
            if (!hasAuthUser && currentRole !== 'professional') {
              onOpenProAuth();
            } else {
              onSelectRole('professional');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            isProActive
              ? 'text-[#f3e5ab] font-medium bg-[#14141c] border border-[#d4af37]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Área do Profissional"
        >
          <Briefcase size={18} className={isProActive ? 'text-[#d4af37]' : 'text-neutral-400'} />
          <span className="text-[10px] tracking-wide uppercase font-sans">Profissional</span>
        </button>

        {/* 4. Vitrine */}
        <button
          onClick={() => {
            onSelectRole('visitor');
            onSelectPublicTab('vitrine');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            isVitrineActive
              ? 'text-[#f3e5ab] font-medium bg-[#14141c] border border-[#d4af37]/40 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
          title="Vitrine"
        >
          <Store size={18} className={isVitrineActive ? 'text-[#d4af37]' : 'text-neutral-400'} />
          <span className="text-[10px] tracking-wide uppercase font-sans">Vitrine</span>
        </button>

        {/* 5. Chat */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all text-neutral-400 hover:text-white hover:bg-[#14141c] cursor-pointer"
          title="Chat Concierge"
        >
          <MessageCircle size={18} className="text-[#d4af37]" />
          <span className="text-[10px] tracking-wide uppercase font-sans">Chat</span>
        </button>

      </div>
    </nav>
  );
};
