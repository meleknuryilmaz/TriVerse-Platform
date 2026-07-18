import React, { useState, useRef, useEffect } from 'react';
import { sendMessage, hasApiKey } from '../services/aiService';

// ── Hızlı Soru Butonları ─────────────────────────────────────
const QUICK_QUESTIONS = [
  { text: 'Bütçenin altında kalınacak günler hangileri?', icon: '📉' },
  { text: 'Yeni batarya ve GES yatırımları nelerdir?', icon: '🔋' },
  { text: 'Kanat çatlağı (YOLOv8) denetimi nasıl çalışıyor?', icon: '🦅' },
  { text: 'Piyasa takas fiyatı (PTF) nedir?', icon: '📈' },
  { text: 'Offshore amortisman süresi ne kadar?', icon: '🌊' },
];

// ── Mesaj Baloncuğu ─────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md'
            : 'bg-gray-800/80 text-gray-200 border border-gray-700/50 rounded-bl-md'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs">🤖</span>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Marine-Twin AI</span>
            {msg.source && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto ${
                msg.source.startsWith('gemini')
                  ? 'bg-purple-950/80 text-purple-300 border border-purple-700/40' 
                  : msg.source === 'local'
                  ? 'bg-gray-700/60 text-gray-400 border border-gray-600/30'
                  : 'bg-yellow-950/80 text-yellow-400 border border-yellow-700/30'
              }`}>
                {msg.source === 'gemini-1.5-flash' ? '✨ Gemini 1.5' :
                 msg.source === 'gemini-2.0-flash' ? '✨ Gemini 2.0' :
                 msg.source === 'local' ? '📋 Lokal' :
                 msg.source === 'fallback' ? '⚠️ Fallback' : '📢 Sistem'}
              </span>
            )}
          </div>
        )}
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {msg.content.split('**').map((part, i) =>
            i % 2 === 1
              ? <strong key={i} className="text-white font-bold">{part}</strong>
              : <span key={i}>{part}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Yazıyor Animasyonu ──────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <span className="text-xs">🤖</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: '600ms' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ANA BİLEŞEN: Chatbot Widget
// ═══════════════════════════════════════════════════════════════
export default function ChatbotWidget() {
  const [isOpen, setIsOpen]             = useState(false);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [hasGreeted, setHasGreeted]     = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const messagesEndRef                  = useRef(null);
  const inputRef                        = useRef(null);

  // Otomatik scroll (Sadece chat açıksa ve en yakın bloka kaydıracak şekilde)
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isTyping, isOpen]);

  // İlk açılışta karşılama mesajı
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setMessages([{
        role: 'assistant',
        content: 'Merhaba! 👋 Ben **Marine-Twin AI Asistanı**. Enerjisa portföyü, rüzgar enerjisi, karbon hesapları, fırtına senaryoları veya finansal projeksiyonlar hakkında size yardımcı olabilirim.\n\nAşağıdaki hızlı sorulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.',
        source: 'system',
      }]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, hasGreeted]);

  // Sohbeti Temizle
  const handleClearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Sohbet geçmişi temizlendi. 🧹 Size nasıl yardımcı olabilirim?',
      source: 'system',
    }]);
  };

  // Mesaj gönder
  const handleSend = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || isTyping) return;

    // Kullanıcı mesajını ekle
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // AI yanıtı al
      const history = messages.filter(m => m.role !== 'system' && m.source !== 'system');
      const response = await sendMessage(
        userMsg, 
        history.map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role,
          content: m.content,
        })),
        selectedModel
      );

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.text,
        source: response.source,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Bir hata oluştu. Lütfen tekrar deneyin.',
        source: 'error',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating Button ─────────────────────────────── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group ${
          isOpen
            ? 'bg-gray-800 border border-gray-600 rotate-0 scale-90'
            : 'bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 hover:scale-110 shadow-cyan-500/30'
        }`}
        title="Marine-Twin AI Asistanı"
      >
        {isOpen ? (
          <span className="text-gray-300 text-xl">✕</span>
        ) : (
          <>
            <span className="text-2xl">🤖</span>
            {/* Pulse ring */}
            <span className="absolute w-full h-full rounded-full bg-cyan-400/30 animate-ping" />
          </>
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] w-[380px] max-h-[560px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto translate-y-0'
            : 'scale-75 opacity-0 pointer-events-none translate-y-8'
        }`}
        style={{ backdropFilter: 'blur(20px)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 border-b border-gray-700/50 px-4 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-md shadow-lg shadow-cyan-900/40">
            🤖
          </div>
          <div className="flex-1">
            <div className="text-white text-xs font-bold leading-tight">Marine-Twin AI</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {/* Model Seçim Menüsü */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-gray-800/80 border border-gray-700/60 rounded px-1 py-0.5 text-[9px] text-cyan-400 font-semibold focus:outline-none cursor-pointer"
                title="Model Seçimi"
              >
                <option value="gemini-1.5-flash" className="bg-gray-900 text-gray-300">Gemini 1.5 Flash</option>
                <option value="gemini-2.0-flash" className="bg-gray-900 text-gray-300">Gemini 2.0 Flash</option>
                <option value="local" className="bg-gray-900 text-gray-300">Lokal Asistan</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Sohbeti Temizle Butonu */}
            <button
              onClick={handleClearChat}
              className="text-gray-400 hover:text-cyan-400 text-xs transition-colors p-1"
              title="Sohbeti Temizle"
            >
              🧹
            </button>
            <span className="text-[9px] px-2 py-1 rounded-full bg-cyan-900/40 border border-cyan-700/30 text-cyan-400 font-bold">
              Enerjisa
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-950/95" style={{ minHeight: 280, maxHeight: 380 }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-3 py-2 bg-gray-900/95 border-t border-gray-800/50">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  disabled={isTyping}
                  className="text-[10px] px-2.5 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-gray-400 hover:text-cyan-300 hover:border-cyan-700/40 hover:bg-cyan-900/20 transition-all disabled:opacity-50"
                >
                  {q.icon} {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-gray-900/95 border-t border-gray-700/50 px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Sorunuzu yazın..."
              rows={1}
              className="flex-1 bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-cyan-600/60 focus:ring-1 focus:ring-cyan-600/30 transition-all"
              style={{ maxHeight: 80, minHeight: 38 }}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 shadow-lg shadow-cyan-900/30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-gray-700">
              {hasApiKey() 
                ? `✨ Model: ${selectedModel}` 
                : '📋 Lokal motor aktif • .env dosyasına API key ekleyerek Gemini\'ye geçin'}
            </span>
            <span className="text-[9px] text-gray-700">Enter ile gönder</span>
          </div>
        </div>
      </div>
    </>
  );
}
