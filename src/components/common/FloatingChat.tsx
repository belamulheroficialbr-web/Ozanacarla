import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Clock,
  CheckCheck,
  Minimize2,
  ChevronLeft,
  Camera,
  ShoppingBag,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  Tag,
  Mic,
  MicOff,
  Maximize2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ChatMessage, Product, Service } from '../../types';
import { Button } from './Button';

interface FloatingChatProps {
  currentUserId?: string;
  currentUserName?: string;
  userRole?: 'visitor' | 'client' | 'professional' | 'admin';
  products?: Product[];
  services?: Service[];
  onAddToCart?: (product: Product) => void;
  onOpenBookingModal?: (serviceId?: string, professionalId?: string) => void;
}

export const FloatingChat: React.FC<FloatingChatProps> = ({
  currentUserId = 'visitor-guest',
  currentUserName = 'Visitante',
  userRole = 'visitor',
  products = [],
  services = [],
  onAddToCart,
  onOpenBookingModal,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Attached image state
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Lightbox Image Zoom State
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const conversationId = userRole === 'client' ? 'conv-1' : 'conv-visitor';

  // Click outside and ESC listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImageUrl) {
          setZoomedImageUrl(null);
          return;
        }
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, zoomedImageUrl]);

  // Load initial messages
  useEffect(() => {
    const all = StorageService.getMessages();
    const currentList = all[conversationId] || [
      {
        id: 'welcome-1',
        conversationId,
        senderId: 'consultora-ia',
        senderName: 'Consultora Virtual de Beleza IA',
        senderRole: 'admin',
        text: 'Olá! Seja muito bem-vinda ao Sra. Bela Mulher Atelier. Sou sua Consultora Virtual de Beleza com Inteligência Artificial. Como posso ajudar com seus cabelos, rituais e cuidados corporais hoje?',
        timestamp: 'Agora',
        isRead: true,
      },
    ];
    setMessages(currentList);
  }, [conversationId, isOpen]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedImageBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice Recognition Handler
  const toggleVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('O reconhecimento de voz não é suportado neste navegador. Utilize o teclado.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map(result => result.transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Erro no reconhecimento de voz:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Falha ao iniciar microfone:', err);
      setIsRecording(false);
      alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  };

  const isSubmittingRef = useRef<boolean>(false);

  const handleSendMessage = async (textToSend?: string) => {
    if (isTyping || isSubmittingRef.current) return;

    const text = (textToSend || inputText).trim();
    if (!text && !attachedImageBase64) return;

    isSubmittingRef.current = true;
    const userPhoto = attachedImageBase64;
    setAttachedImageBase64(null);

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    // Record user message
    const userMsg = StorageService.sendMessage(conversationId, {
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: userRole,
      text: text || 'Análise de fotografia enviada para consultoria de beleza.',
      attachedImageUrl: userPhoto || undefined,
      isRead: false,
    });

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/ai/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          imageBase64: userPhoto,
          history: [...messages, userMsg].slice(-10),
          productsCatalog: products,
          servicesCatalog: services,
        }),
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      let replyText = data.replyText || 'Estou à sua disposição para indicar os tratamentos perfeitos para seu estilo.';
      let recProducts: Product[] = [];
      let recServices: Service[] = [];

      if (Array.isArray(data.recommendedProductIds)) {
        recProducts = data.recommendedProductIds
          .map((id: string) => products.find(p => p.id === id))
          .filter((p: Product | undefined): p is Product => p !== undefined && p.active);
      }

      if (Array.isArray(data.recommendedServiceIds)) {
        recServices = data.recommendedServiceIds
          .map((id: string) => services.find(s => s.id === id))
          .filter((s: Service | undefined): s is Service => s !== undefined && s.active);
      }

      const botMsg = StorageService.sendMessage(conversationId, {
        senderId: 'consultora-ia',
        senderName: 'Consultora Virtual de Beleza IA',
        senderRole: 'admin',
        text: replyText,
        recommendedProducts: recProducts,
        recommendedServices: recServices,
        isRead: true,
      });

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Erro na chamada da Consultora IA:', err);

      const errorMessage = err.name === 'AbortError'
        ? 'A consulta levou mais tempo que o esperado. Por favor, tente novamente.'
        : 'Nossos especialistas e visagistas estão à sua total disposição no atelier! Ocorreu uma oscilação na consulta online.';

      const fallbackMsg = StorageService.sendMessage(conversationId, {
        senderId: 'consultora-ia',
        senderName: 'Consultora Virtual de Beleza IA',
        senderRole: 'admin',
        text: errorMessage,
        isRead: true,
      });
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      isSubmittingRef.current = false;
      setIsTyping(false);
    }
  };

  const quickQuestions = [
    'Qual o melhor tratamento para cabelos com luzes?',
    'Indicação de produtos Home Care para brilho',
    'Valores de Balayage e Morena Iluminada',
    'Analisar meu tipo de cabelo',
  ];

  return (
    <>
      <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 max-w-[calc(100vw-24px)]">
        {/* Launcher Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            data-chat-launcher="true"
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#121216] border border-[#d4af37]/60 text-[#f3e5ab] shadow-xl hover:bg-[#1a1a24] hover:border-[#d4af37] hover:scale-105 active:scale-95 transition-all duration-200 group cursor-pointer"
            aria-label="Abrir Consultora Virtual de Beleza IA"
          >
            <div className="relative">
              <Sparkles size={16} className="text-[#d4af37] animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#d4af37] rounded-full" />
            </div>
            <span className="text-xs font-semibold tracking-wide hidden sm:inline">
              Consultora IA de Beleza
            </span>
          </button>
        )}

        {/* Professional Chat Window */}
        {isOpen && (
          <div
            ref={chatRef}
            className="w-[340px] sm:w-[380px] h-[480px] max-h-[75vh] bg-[#101014] border border-[#d4af37]/50 rounded-2xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#181822] via-[#14141a] to-[#1a1a24] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8d7122] flex items-center justify-center text-black font-bold shadow-sm">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-semibold text-white tracking-wide">
                    Consultora Virtual
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#d4af37]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>IA do Atelier · Online</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                  title="Minimizar chat"
                  aria-label="Minimizar chat"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                  title="Fechar chat"
                  aria-label="Fechar chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick FAQ Chips */}
            <div className="px-3 py-2 bg-[#0c0c0f] border-b border-white/[0.05] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  disabled={isTyping}
                  onClick={() => handleSendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#181820] text-neutral-300 hover:text-[#f3e5ab] hover:border-[#d4af37]/40 border border-white/[0.06] transition-colors shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-4 bg-[#0d0d11]">
              {messages.map(msg => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    <div className="text-[10px] text-neutral-400 px-1 font-mono">
                      {msg.senderName} · {msg.timestamp}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm space-y-2 ${
                        isMe
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#b89528] text-black font-medium rounded-tr-xs'
                          : 'bg-[#1a1a24] text-neutral-200 border border-white/[0.08] rounded-tl-xs'
                      }`}
                    >
                      {/* Attached Photo */}
                      {msg.attachedImageUrl && (
                        <div
                          className="rounded-lg overflow-hidden border border-black/20 my-1 max-w-[210px] cursor-pointer group relative"
                          onClick={() => setZoomedImageUrl(msg.attachedImageUrl || null)}
                          title="Clique para ampliar"
                        >
                          <img src={msg.attachedImageUrl} alt="Anexo enviado" className="w-full h-auto object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Maximize2 size={18} />
                          </div>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>

                    {/* Recommended Products */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="w-full space-y-2 pt-1">
                        <span className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider block">
                          ✦ Produto Recomendado do Catálogo:
                        </span>
                        {msg.recommendedProducts.map(prod => (
                          <div
                            key={prod.id}
                            className="p-2.5 bg-[#14141c] border border-[#d4af37]/30 rounded-xl flex items-center justify-between gap-2.5 shadow-md hover:border-[#d4af37] transition-all"
                          >
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0 border border-white/10"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-[9px] text-[#d4af37] font-semibold uppercase">{prod.brand}</span>
                              <h5 className="text-xs font-semibold text-white truncate">{prod.name}</h5>
                              <div className="text-xs font-mono text-[#f3e5ab] font-bold mt-0.5">
                                R$ {(prod.promotionalPriceBRL || prod.salePriceBRL).toFixed(2)}
                              </div>
                            </div>
                            {onAddToCart && (
                              <button
                                onClick={() => onAddToCart(prod)}
                                className="px-2.5 py-1.5 bg-[#d4af37] text-black font-semibold rounded-lg text-[10px] flex items-center gap-1 hover:bg-[#f3e5ab] transition-colors cursor-pointer shrink-0 uppercase tracking-wider"
                              >
                                <ShoppingBag size={12} />
                                <span>COMPRAR</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommended Services */}
                    {msg.recommendedServices && msg.recommendedServices.length > 0 && (
                      <div className="w-full space-y-2 pt-1">
                        <span className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-wider block">
                          ✦ Ritual Exclusivo Recomendado:
                        </span>
                        {msg.recommendedServices.map(srv => (
                          <div
                            key={srv.id}
                            className="p-2.5 bg-[#14141c] border border-[#d4af37]/30 rounded-xl flex items-center justify-between gap-2.5 shadow-md hover:border-[#d4af37] transition-all"
                          >
                            <img
                              src={srv.image}
                              alt={srv.name}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0 border border-white/10"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-[9px] text-[#d4af37] font-semibold uppercase">{srv.category}</span>
                              <h5 className="text-xs font-semibold text-white truncate">{srv.name}</h5>
                              <div className="text-[11px] font-mono text-[#f3e5ab] font-bold mt-0.5">
                                R$ {(srv.promotionalPriceBRL || srv.priceBRL).toFixed(2)} • {srv.durationMinutes} min
                              </div>
                            </div>
                            {onOpenBookingModal && (
                              <button
                                onClick={() => onOpenBookingModal(srv.id)}
                                className="px-2.5 py-1.5 bg-[#181820] hover:bg-[#d4af37] text-[#f3e5ab] hover:text-black border border-[#d4af37]/40 font-semibold rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0 uppercase tracking-wider"
                              >
                                <Calendar size={12} />
                                <span>AGENDAR</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-[#d4af37] px-2 py-1">
                  <Sparkles size={14} className="animate-spin text-[#d4af37]" />
                  <span className="text-[11px] text-neutral-400">Consultora IA consultando catálogo do atelier...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Recording Active Indicator */}
            {isRecording && (
              <div className="px-3 py-2 bg-red-950/60 border-t border-red-500/40 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2 text-red-300 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="font-semibold">Ouvindo... Fale agora sua dúvida...</span>
                </div>
                <button
                  onClick={() => {
                    if (recognitionRef.current) recognitionRef.current.stop();
                    setIsRecording(false);
                  }}
                  className="text-xs text-neutral-300 hover:text-white underline cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Attached Photo Preview Strip */}
            {attachedImageBase64 && (
              <div className="px-3 py-2 bg-[#14141c] border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={attachedImageBase64} alt="Anexo preview" className="w-9 h-9 rounded-lg object-cover border border-[#d4af37]" />
                  <span className="text-[11px] text-neutral-300 font-medium truncate max-w-[200px]">Foto pronta para envio</span>
                </div>
                <button
                  onClick={() => setAttachedImageBase64(null)}
                  className="p-1 text-neutral-400 hover:text-red-400 cursor-pointer"
                  title="Remover anexo"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 bg-[#14141a] border-t border-white/[0.08] flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />

              {/* Attach Photo Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-[#0b0b0e] hover:bg-[#1a1a24] text-neutral-300 hover:text-[#d4af37] border border-white/10 transition-colors cursor-pointer shadow-sm"
                title="Anexar foto da galeria ou tirar foto"
                aria-label="Anexar foto"
              >
                <Camera size={17} />
              </button>

              {/* Voice Microphone Button */}
              <button
                onClick={toggleVoiceRecording}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                  isRecording
                    ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                    : 'bg-[#0b0b0e] hover:bg-[#1a1a24] text-neutral-300 hover:text-[#d4af37] border-white/10'
                }`}
                title={isRecording ? 'Gravando... Clique para parar' : 'Falar via microfone'}
                aria-label="Microfone de voz"
              >
                <Mic size={17} />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isRecording ? 'Ouvindo...' : 'Digite ou fale sua dúvida...'}
                className="flex-1 bg-[#0b0b0e] text-xs text-white placeholder-neutral-500 px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#d4af37]/70"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={isTyping || (!inputText.trim() && !attachedImageBase64)}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f3e5ab] to-[#aa8422] text-black font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#d4af37]/20"
                title="Enviar mensagem"
                aria-label="Enviar mensagem"
              >
                <Send size={16} className="text-black fill-black/10" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Image Zoom Modal */}
      {zoomedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#0c0c10] p-2 shadow-2xl">
            <button
              onClick={() => setZoomedImageUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer border border-white/20"
              title="Fechar zoom"
            >
              <X size={18} />
            </button>
            <img
              src={zoomedImageUrl}
              alt="Ampliada"
              className="max-w-full max-h-[82vh] object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};
