import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  Store,
  Copy,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { CartItem, Product } from '../../types';
import { Button } from '../common/Button';
import { StorageService } from '../../services/storage';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmation'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const processedOrdersRef = useRef<Set<string>>(new Set());

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'retirada' | 'entrega'>('retirada');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [whatsappOrderUrl, setWhatsappOrderUrl] = useState('');
  const pixConfig = StorageService.getPixConfig();

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const activeOrder = StorageService.getActiveOrder();
      if (activeOrder && !activeOrder.completed && activeOrder.orderNumber) {
        setOrderNumber(activeOrder.orderNumber);
        if (activeOrder.customerName) setCustomerName(activeOrder.customerName);
        if (activeOrder.customerPhone) setCustomerPhone(activeOrder.customerPhone);
        if (activeOrder.customerEmail) setCustomerEmail(activeOrder.customerEmail);
        if (activeOrder.deliveryOption) setDeliveryOption(activeOrder.deliveryOption);
        if (activeOrder.paymentMethod) setPaymentMethod(activeOrder.paymentMethod);
        if (activeOrder.items && activeOrder.items.length > 0) {
          const currentCart = StorageService.getCart();
          if (currentCart.length === 0) {
            StorageService.saveCart(activeOrder.items);
          }
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Subtotals & Totals
  const calculateItemUnitPrice = (product: Product) => {
    return product.promotionalPriceBRL ?? product.salePriceBRL;
  };

  const subtotalProducts = cartItems.reduce((acc, item) => {
    return acc + calculateItemUnitPrice(item.product) * item.quantity;
  }, 0);

  const deliveryFee = deliveryOption === 'entrega' ? 25.0 : 0.0;
  const grandTotal = subtotalProducts + deliveryFee;

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCopyPixKey = () => {
    const keyToCopy = pixConfig.chavePix || 'contato@srabelamulher.com.br';
    navigator.clipboard.writeText(keyToCopy);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Por favor, informe seu nome e telefone para contato.');
      return;
    }

    let activeOrder = StorageService.getActiveOrder();
    if (!activeOrder || activeOrder.completed) {
      const generatedNum = `PED-${Date.now().toString().slice(-6)}`;
      activeOrder = {
        orderNumber: generatedNum,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        deliveryOption,
        paymentMethod,
        items: cartItems,
        subtotalProducts,
        deliveryFee,
        grandTotal,
        cashRecorded: false,
        reducedProductIds: [],
        completed: false,
      };
      StorageService.saveActiveOrder(activeOrder);
    }

    const orderNum = activeOrder.orderNumber;
    if (processedOrdersRef.current.has(orderNum) && activeOrder.completed) {
      return;
    }

    const itemsToProcess = activeOrder.items && activeOrder.items.length > 0 ? activeOrder.items : cartItems;

    setOrderNumber(orderNum);
    setIsSubmitting(true);

    try {
      processedOrdersRef.current.add(orderNum);

      const allProducts = StorageService.getProducts();
      for (const item of itemsToProcess) {
        const exists = allProducts.some(p => p.id === item.product.id);
        if (!exists) {
          throw new Error(`Produto ${item.product.name} não existe no estoque. Processamento interrompido.`);
        }
      }

      const itemsText = itemsToProcess
        .map(
          (item: CartItem) =>
            `• ${item.quantity}x ${item.product.name} (R$ ${(
              (item.product.promotionalPriceBRL ?? item.product.salePriceBRL) * item.quantity
            ).toFixed(2)})`
        )
        .join('\n');

      const message = `*NOVO PEDIDO DE COMPRA - SRA. BELA MULHER ATELIER*\n` +
        `*Número:* ${orderNum}\n\n` +
        `*Cliente:* ${activeOrder.customerName}\n` +
        `*Telefone:* ${activeOrder.customerPhone}\n` +
        `*E-mail:* ${activeOrder.customerEmail || 'Não informado'}\n\n` +
        `*ITENS DO PEDIDO:*\n${itemsText}\n\n` +
        `*Subtotal Produtos:* R$ ${activeOrder.subtotalProducts.toFixed(2)}\n` +
        `*Entrega/Retirada:* ${activeOrder.deliveryOption === 'entrega' ? 'Entrega em Domicílio (R$ 25,00)' : 'Retirada no Atelier (Grátis - Jardins)'}\n` +
        `*TOTAL FINAL:* R$ ${activeOrder.grandTotal.toFixed(2)}\n\n` +
        `*Forma de Pagamento:* ${
          activeOrder.paymentMethod === 'pix'
            ? 'PIX Instantâneo'
            : activeOrder.paymentMethod === 'cartao'
            ? 'Cartão na Entrega/Retirada'
            : 'Dinheiro'
        }`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5511987654321?text=${encodedMessage}`;
      setWhatsappOrderUrl(whatsappUrl);

      if (!activeOrder.cashRecorded) {
        const trx = StorageService.addCashTransaction({
          type: 'entrada',
          category: 'Venda de Produto',
          description: `Boutique Pedido ${orderNum} - ${activeOrder.customerName} (${itemsToProcess.length} itens)`,
          amountBRL: activeOrder.grandTotal,
          operatorName: 'Boutique Online',
          paymentMethod: activeOrder.paymentMethod === 'pix' ? 'pix' : activeOrder.paymentMethod === 'cartao' ? 'cartao_credito' : 'dinheiro',
        });

        if (trx && trx.id) {
          activeOrder.cashRecorded = true;
          StorageService.saveActiveOrder(activeOrder);
        } else {
          throw new Error('Falha ao registrar transação financeira no caixa.');
        }
      }

      for (const item of itemsToProcess) {
        if (!activeOrder.reducedProductIds.includes(item.product.id)) {
          const success = StorageService.adjustProductStock(item.product.id, -item.quantity);
          if (!success) {
            throw new Error(`Falha ao ajustar estoque do produto ${item.product.name}.`);
          }
          activeOrder.reducedProductIds.push(item.product.id);
          StorageService.saveActiveOrder(activeOrder);
        }
      }

      activeOrder.completed = true;
      StorageService.saveActiveOrder(activeOrder);
      StorageService.clearActiveOrder();
      onClearCart();
      setStep('confirmation');
    } catch (err) {
      console.warn('Erro ao processar pedido com snapshot persistente:', err);
      alert('Ocorreu uma falha ao processar o pedido. Seus itens e estado foram preservados para nova tentativa.');
      processedOrdersRef.current.delete(orderNum);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndClear = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center sm:justify-end p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* PAINEL COMPACTO E ELEGANTE */}
      <div
        className="w-[330px] sm:w-[380px] max-w-[94vw] h-auto max-h-[85vh] bg-[#0c0c10] border border-[#d4af37]/35 rounded-2xl shadow-2xl shadow-black/90 flex flex-col overflow-hidden text-neutral-100 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* COMPACT HEADER */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#181822] via-[#14141a] to-[#1a1a24] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-serif font-bold text-white tracking-wide">
                Sacola de Compras
              </h2>
              <span className="text-[10px] text-[#d4af37] font-medium">
                {totalItemsCount} {totalItemsCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar sacola"
            aria-label="Fechar sacola"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY AREA (COM ROLAGEM DEDICADA) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500">
                    <ShoppingBag size={22} />
                  </div>
                  <h3 className="text-sm font-serif text-white font-medium">Sua sacola está vazia</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto font-light leading-relaxed">
                    Explore os produtos das nossas vitrines e adicione seus itens favoritos.
                  </p>
                  <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                    Explorar Vitrines
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cartItems.map(item => {
                    const unitPrice = calculateItemUnitPrice(item.product);

                    return (
                      <div
                        key={item.product.id}
                        className="p-2.5 bg-[#14141c] border border-white/10 rounded-xl flex items-center justify-between gap-2.5 hover:border-[#d4af37]/30 transition-colors"
                      >
                        {/* Compact Thumbnail (12x12 = 48x48px) */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0 border border-white/10"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] text-[#d4af37] font-semibold uppercase tracking-wider truncate">
                            {item.product.brand}
                          </div>
                          <h4 className="text-xs font-semibold text-white truncate leading-snug">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs">
                            {item.product.promotionalPriceBRL ? (
                              <>
                                <span className="text-red-400 line-through text-[9px]">
                                  R$ {item.product.salePriceBRL.toFixed(2)}
                                </span>
                                <span className="text-[#f3e5ab] font-bold text-xs">
                                  R$ {item.product.promotionalPriceBRL.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[#f3e5ab] font-bold text-xs">
                                R$ {item.product.salePriceBRL.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Controls & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 bg-[#08080a] border border-white/10 rounded-lg p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Diminuir quantidade"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="px-1 text-xs font-mono font-bold text-white min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Aumentar quantidade"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-neutral-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Remover produto"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleFinalizeOrder} className="space-y-4 text-xs">
              <div className="border-b border-white/10 pb-2">
                <h3 className="text-xs sm:text-sm font-serif font-semibold text-white">1. Identificação da Cliente</h3>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Informe seus dados para confirmação do pedido
                </p>
              </div>

              <div>
                <label className="text-[11px] font-medium text-neutral-300 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Ex: Helena Montenegro"
                  className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-neutral-300 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full bg-[#14141c] border border-white/10 rounded-lg p-2 text-xs text-white focus:border-[#d4af37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-b border-white/10 py-3 space-y-2">
                <h3 className="text-xs sm:text-sm font-serif font-semibold text-white">2. Modalidade de Entrega</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryOption('retirada')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryOption === 'retirada'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-[#14141c] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Store size={14} className="text-[#d4af37]" />
                      <span className="font-semibold text-xs text-white">Retirada</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-medium">Grátis (Jardins)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryOption('entrega')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      deliveryOption === 'entrega'
                        ? 'bg-[#d4af37]/15 border-[#d4af37] text-white'
                        : 'bg-[#14141c] border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Truck size={14} className="text-[#d4af37]" />
                      <span className="font-semibold text-xs text-white">Entrega</span>
                    </div>
                    <span className="text-[10px] text-neutral-300 block">R$ 25,00 (Capital)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-serif font-semibold text-white">3. Forma de Pagamento</h3>
                <div className="space-y-1.5">
                  <label
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'pix' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-[#14141c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode size={16} className="text-[#d4af37]" />
                      <div>
                        <span className="font-semibold text-white text-xs block">PIX Instantâneo</span>
                        <span className="text-[9px] text-neutral-400">Liberação imediata</span>
                      </div>
                    </div>
                    <input type="radio" name="payment" checked={paymentMethod === 'pix'} readOnly />
                  </label>

                  {paymentMethod === 'pix' && (
                    <div className="p-2.5 bg-[#08080a] border border-[#d4af37]/30 rounded-xl space-y-1.5 text-[10px] text-neutral-300">
                      <p className="font-semibold text-[#f3e5ab]">Chave PIX Oficial ({pixConfig.tipoChave.toUpperCase()}):</p>
                      <div className="flex items-center justify-between bg-[#14141c] p-1.5 rounded border border-white/10 font-mono">
                        <span className="truncate mr-2 text-[10px]">{pixConfig.chavePix || 'contato@srabelamulher.com.br'}</span>
                        <button
                          type="button"
                          onClick={handleCopyPixKey}
                          className="text-[#d4af37] hover:text-white text-[9px] flex items-center gap-1 font-sans cursor-pointer shrink-0"
                        >
                          {copiedPix ? <Check size={11} /> : <Copy size={11} />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <p className="text-[9px] text-neutral-400">Titular: {pixConfig.titular} · {pixConfig.banco}</p>
                    </div>
                  )}

                  <label
                    onClick={() => setPaymentMethod('cartao')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'cartao' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-[#14141c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-[#d4af37]" />
                      <div>
                        <span className="font-semibold text-white text-xs block">Cartão de Crédito / Débito</span>
                        <span className="text-[9px] text-neutral-400">Na entrega ou retirada</span>
                      </div>
                    </div>
                    <input type="radio" name="payment" checked={paymentMethod === 'cartao'} readOnly />
                  </label>

                  <label
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'dinheiro' ? 'bg-[#d4af37]/15 border-[#d4af37]' : 'bg-[#14141c] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-[#d4af37]" />
                      <div>
                        <span className="font-semibold text-white text-xs block">Dinheiro em Espécie</span>
                        <span className="text-[9px] text-neutral-400">Na entrega ou retirada</span>
                      </div>
                    </div>
                    <input type="radio" name="payment" checked={paymentMethod === 'dinheiro'} readOnly />
                  </label>
                </div>
              </div>
            </form>
          )}

          {step === 'confirmation' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-[#d4af37] font-semibold">{orderNumber}</span>
                <h3 className="text-base font-serif font-bold text-white">Pedido Registrado com Sucesso!</h3>
                <p className="text-xs text-neutral-300 max-w-xs mx-auto font-light leading-relaxed">
                  Obrigado, <strong className="text-white">{customerName}</strong>! Seu pedido foi encaminhado para nosso concierge.
                </p>
              </div>

              <div className="p-3 bg-[#14141c] border border-white/10 rounded-xl text-left space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal Produtos:</span>
                  <span className="text-white font-mono">R$ {subtotalProducts.toFixed(2)}</span>
                </div>
                {deliveryOption === 'entrega' && (
                  <div className="flex justify-between text-neutral-400">
                    <span>Taxa de Entrega:</span>
                    <span className="text-white font-mono">R$ 25,00</span>
                  </div>
                )}
                <div className="flex justify-between font-bold pt-1.5 border-t border-white/10 text-[#f3e5ab]">
                  <span>Total Final:</span>
                  <span className="font-mono">R$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {whatsappOrderUrl && (
                  <a
                    href={whatsappOrderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Abrir Mensagem no WhatsApp</span>
                  </a>
                )}
                <Button onClick={handleFinishAndClear} variant="outline" className="w-full text-xs">
                  CONCLUIR E VOLTAR À VITRINE
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* FIXED FOOTER (SUMÁRIO E BOTÃO FIXO DE FINALIZAÇÃO) */}
        {cartItems.length > 0 && step !== 'confirmation' && (
          <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#121218] shrink-0 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-neutral-400 text-[11px]">
                <span>Subtotal Produtos:</span>
                <span className="font-mono text-white">R$ {subtotalProducts.toFixed(2)}</span>
              </div>
              {step === 'checkout' && deliveryOption === 'entrega' && (
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Entrega Expressa:</span>
                  <span className="font-mono text-white">R$ 25,00</span>
                </div>
              )}
              <div className="flex justify-between text-xs sm:text-sm font-bold text-[#f3e5ab] pt-1.5 border-t border-white/10">
                <span>Total Final:</span>
                <span className="font-mono">R$ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <Button onClick={() => setStep('checkout')} className="w-full text-xs font-bold" icon={<ArrowRight size={15} />}>
                FINALIZAR COMPRA
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep('cart')} className="w-1/3 text-xs">
                  Voltar
                </Button>
                <Button type="submit" form="checkout-form" className="w-2/3 text-xs font-bold" disabled={isSubmitting} icon={<Send size={14} />}>
                  {isSubmitting ? 'Processando...' : 'ENVIAR PEDIDO'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
