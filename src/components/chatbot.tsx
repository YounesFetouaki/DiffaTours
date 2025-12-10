'use client';
// Force rebuild

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from '@/lib/i18n/hooks';
import { useUser } from '@clerk/nextjs';

type Language = 'en' | 'es' | 'fr' | 'it';

const LANGUAGE_MAP: Record<string, Language> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  it: 'it'
};

const TRANSLATIONS = {
  en: {
    title: 'Diffa Tours Assistant',
    subtitle: 'Ask me anything about Morocco & tours',
    placeholder: 'Ask about tours, Morocco, booking...',
    send: 'Send',
    close: 'Close',
    thinking: 'Thinking...',
    welcome: 'Hello! 👋 I\'m your Diffa Tours assistant. Ask me about our excursions, Morocco destinations, booking process, or anything else!',
    exampleQuestions: [
      'What tours are available in Marrakech?',
      'Tell me about Morocco travel tips',
      'How do I book a tour?',
      'What are the prices for Sahara tours?'
    ]
  },
  es: {
    title: 'Asistente Diffa Tours',
    subtitle: 'Pregúntame sobre Marruecos y tours',
    placeholder: 'Pregunta sobre tours, Marruecos, reservas...',
    send: 'Enviar',
    close: 'Cerrar',
    thinking: 'Pensando...',
    welcome: '¡Hola! 👋 Soy tu asistente de Diffa Tours. ¡Pregúntame sobre nuestras excursiones, destinos en Marruecos, proceso de reserva o cualquier otra cosa!',
    exampleQuestions: [
      '¿Qué tours hay disponibles en Marrakech?',
      'Cuéntame sobre consejos de viaje en Marruecos',
      '¿Cómo reservo un tour?',
      '¿Cuáles son los precios para tours del Sahara?'
    ]
  },
  fr: {
    title: 'Assistant Diffa Tours',
    subtitle: 'Posez-moi des questions sur le Maroc et les tours',
    placeholder: 'Demandez sur les tours, le Maroc, les réservations...',
    send: 'Envoyer',
    close: 'Fermer',
    thinking: 'Réflexion...',
    welcome: 'Bonjour! 👋 Je suis votre assistant Diffa Tours. Posez-moi des questions sur nos excursions, destinations au Maroc, processus de réservation ou autre chose!',
    exampleQuestions: [
      'Quels tours sont disponibles à Marrakech?',
      'Parlez-moi des conseils de voyage au Maroc',
      'Comment réserver un tour?',
      'Quels sont les prix pour les tours du Sahara?'
    ]
  },
  it: {
    title: 'Assistente Diffa Tours',
    subtitle: 'Chiedimi qualsiasi cosa sul Marocco e sui tour',
    placeholder: 'Chiedi di tour, Marocco, prenotazioni...',
    send: 'Invia',
    close: 'Chiudi',
    thinking: 'Pensando...',
    welcome: 'Ciao! 👋 Sono il tuo assistente Diffa Tours. Chiedimi delle nostre escursioni, destinazioni in Marocco, processo di prenotazione o altro!',
    exampleQuestions: [
      'Quali tour sono disponibili a Marrakech?',
      'Parlami dei consigli di viaggio in Marocco',
      'Come prenoto un tour?',
      'Quali sono i prezzi per i tour del Sahara?'
    ]
  }
};

export function ChatBot() {
  const localeKey = useLocale();
  const language = LANGUAGE_MAP[localeKey] || 'en';
  const t = TRANSLATIONS[language];
  const { user } = useUser();

  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const [isOpen, setIsOpen] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Determine user role from Clerk metadata
  const userRole = (user?.publicMetadata?.role as 'admin' | 'staff' | 'user') || 'user';

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages, error } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
    body: {
      language,
      role: userRole,
      sessionId
    },
    id: sessionId,
    onFinish: () => {
      setShowExamples(false);
    },
    onError: (err) => {
      console.error("Chat API Error:", err);
      // Fallback to mock response on error
      const mockResponse = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: "Bonjour! 👋 (Mode Démo) \n\nJe suis là pour vous aider avec vos voyages au Maroc. Comme je n'ai pas encore ma clé API, je fonctionne en mode démonstration. \n\nJe peux vous parler de :\n- Marrakech et ses souks\n- Le désert du Sahara\n- Le surf à Taghazout\n- Nos circuits sur mesure\n\nComment puis-je vous aider ?"
      };
      setMessages(prev => [...prev, mockResponse]);
    }
  });

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleExampleClick = (question: string) => {
    setInput(question);
    setShowExamples(false);
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = inputRef.current?.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Save conversation to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`chat-${sessionId}`, JSON.stringify(messages));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-gradient-to-br from-primary to-accent hover:from-accent hover:to-primary text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/50 animate-pulse hover:animate-none"
          aria-label={t.title}
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[95vw] max-w-[420px] h-[600px] max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-scaleIn border border-gray-200">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary to-accent p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-lg">{t.title}</h2>
                <p className="text-white/80 text-xs">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-gray-100 border border-gray-200 px-4 py-3 rounded-[16px] rounded-tl-none shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed">{t.welcome}</p>
                  </div>
                </div>

                {/* Example Questions */}
                {showExamples && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-1">
                      {language === 'en' && 'Try asking:'}
                      {language === 'es' && 'Prueba preguntar:'}
                      {language === 'fr' && 'Essayez de demander:'}
                      {language === 'it' && 'Prova a chiedere:'}
                    </p>
                    {t.exampleQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleExampleClick(question)}
                        className="w-full text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-primary/30 px-3 py-2 rounded-[12px] text-sm text-gray-700 hover:text-gray-900 transition-all group shadow-sm"
                      >
                        <span className="inline-block mr-2 text-primary group-hover:scale-110 transition-transform">→</span>
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-[16px] ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-primary to-accent text-white rounded-br-none shadow-lg'
                    : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                    }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fadeInUp">
                <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-[16px] rounded-tl-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <p className="text-sm text-gray-600">{t.thinking}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-center animate-fadeInUp">
                <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-[16px] text-red-600 text-sm shadow-sm">
                  <p>Sorry, I encountered an error. Please try again later.</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white border-t border-gray-200"
          >
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder={t.placeholder}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-br from-primary to-accent hover:from-accent hover:to-primary disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-full transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none"
                aria-label={t.send}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}