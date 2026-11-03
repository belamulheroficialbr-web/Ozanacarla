import React from 'react';
import { Home, User, Briefcase, Store, MessageCircle } from 'lucide-react';
import { AppRole, PublicTab } from '../../types';

interface BottomNavProps {
  onSelectRole: (role: AppRole) => void;
  onSelectTab: (tab: PublicTab) => void;
  onOpenClientAuth?: () => void;
  onOpenProAuth?: () => void;
  onOpenChat?: () => void;
  hasAuthUser?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onSelectRole,
  onSelectTab,
  onOpenClientAuth,
  onOpenProAuth,
  onOpenChat,
  hasAuthUser = false,
}) => {
  return (
    <section className="py-2 bg-[#0b0b0f] border-t border-[#d4af37]/35 shrink-0 fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-1">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectTab('home');
            }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl bg-[#14141c] hover:bg-[#1a1a26] text-neutral-300 hover:text-white border border-[#d4af37]/30 hover:border-[#d4af37] text-[10px] font-medium tracking-wide transition-all cursor-pointer shadow-md min-w-[65px]"
            title="Ir para o Início"
          >
            <Home size={16} className="text-[#d4af37]" />
            <span className="uppercase tracking-wider">Início</span>
          </button>
          <button
            onClick={() => {
              if (!hasAuthUser && onOpenClientAuth) onOpenClientAuth();
              else onSelectRole('client');
            }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl bg-[#14141c] hover:bg-[#1a1a26] text-neutral-300 hover:text-white border border-white/10 hover:border-[#d4af37]/50 text-[10px] font-medium tracking-wide transition-all cursor-pointer shadow-md min-w-[65px]"
            title="Acessar Área da Cliente"
          >
            <User size={16} className="text-[#d4af37]" />
            <span className="uppercase tracking-wider">Cliente</span>
          </button>
          <button
            onClick={() => {
              if (!hasAuthUser && onOpenProAuth) onOpenProAuth();
              else onSelectRole('professional');
            }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl bg-[#14141c] hover:bg-[#1a1a26] text-neutral-300 hover:text-white border border-white/10 hover:border-[#d4af37]/50 text-[10px] font-medium tracking-wide transition-all cursor-pointer shadow-md min-w-[65px]"
            title="Acessar Área do Profissional"
          >
            <Briefcase size={16} className="text-[#d4af37]" />
            <span className="uppercase tracking-wider">Profissional</span>
          </button>
          <button
            onClick={() => {
              onSelectRole('visitor');
              onSelectTab('vitrine');
            }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl bg-[#14141c] hover:bg-[#1a1a26] text-neutral-300 hover:text-white border border-white/10 hover:border-[#d4af37]/50 text-[10px] font-medium tracking-wide transition-all cursor-pointer shadow-md min-w-[65px]"
            title="Explorar Vitrine"
          >
            <Store size={16} className="text-[#d4af37]" />
            <span className="uppercase tracking-wider">Vitrine</span>
          </button>
          <button
            onClick={() => {
              if (onOpenChat) onOpenChat();
              else {
                const chatBtn = (document.querySelector('[aria-label*="Consultora"]') ||
                  document.querySelector('[aria-label*="chat"]')) as HTMLButtonElement;
                if (chatBtn) chatBtn.click();
              }
            }}
            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl bg-[#14141c] hover:bg-[#1a1a26] text-neutral-300 hover:text-white border border-white/10 hover:border-[#d4af37]/50 text-[10px] font-medium tracking-wide transition-all cursor-pointer shadow-md min-w-[65px]"
            title="Abrir Chat"
          >
            <MessageCircle size={16} className="text-[#d4af37]" />
            <span className="uppercase tracking-wider">Chat</span>
          </button>
        </div>
      </div>
    </section>
  );
};
