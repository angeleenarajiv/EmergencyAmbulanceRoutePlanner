import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ShieldCheck,
  HeartPulse,
  Building2,
  Copy,
  Check,
  AlertCircle,
  Minimize2,
  Maximize2,
  Key
} from 'lucide-react';
import { sirenAudio } from '../utils/sirenSound';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'cad_dispatcher' | 'first_aid' | 'hospital_liaison';
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'cad_dispatcher'
}) => {
  const [role, setRole] = useState<'cad_dispatcher' | 'first_aid' | 'hospital_liaison'>(initialRole);
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: 'ResQPath EMS CAD Assistant initialized. How can I assist you with Kerala 108 dispatch, shortest Dijkstra routes, trauma center capacities, or emergency first aid?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    sirenAudio.playBeep(950, 80);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newHistory.slice(-10).map((m) => ({ role: m.role, text: m.text })),
          role,
          model,
          apiKey: apiKey || undefined
        })
      });

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.reply || 'CAD guidance generated. Maintain active telemetry tracking.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: 'Connection to AI CAD Dispatch was interrupted. Local Dijkstra router remains fully active on the CAD console.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: 'model',
        text: `Conversation cleared. Operating as ${
          role === 'cad_dispatcher'
            ? 'Central CAD Dispatcher'
            : role === 'first_aid'
            ? 'Bystander First-Aid Guide'
            : 'Hospital Trauma Desk Liaison'
        }. Ready for instructions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const suggestedPrompts = [
    'Why route Vytilla accident to Welcare Hospital?',
    'Fastest ALS route to Vytilla Junction?',
    'Trauma centers with open ICU in Ernakulam?',
    'Immediate first aid for heavy bleeding',
    'Explain Dijkstra weighting factors for CAD'
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end animate-fadeIn">
      <div
        className={`bg-white dark:bg-[#0e1628] border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isMinimized
            ? 'w-80 h-14'
            : 'w-full max-w-lg sm:w-[480px] h-[580px] max-h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#0a1120] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-400 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  ResQPath AI Assistant
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                  {apiKey ? 'Gemini 2.5 Flash' : 'CAD Intelligence'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                Kerala 108 CAD Emergency Telemetry &amp; Protocols
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Close Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* API Key Status Bar */}
            <div className="px-3.5 py-1.5 bg-slate-100/90 dark:bg-[#070b16] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    apiKey ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-400'
                  }`}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-[10.5px]">
                  {apiKey ? 'Gemini Generative AI Active' : 'CAD Offline Intelligence Active'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-mono cursor-pointer"
              >
                <Key className="w-3 h-3" />
                <span>{apiKey ? 'Configured' : '+ Add Gemini Key'}</span>
              </button>
            </div>

            {/* API Key Input Drawer */}
            {showKeyInput && (
              <div className="p-3 bg-slate-50 dark:bg-[#0d1628] border-b border-slate-200 dark:border-slate-800 flex flex-col gap-1.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <label className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200">
                    Google Gemini API Key:
                  </label>
                  <span className="text-[9.5px] text-slate-400">Saved locally in browser</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setApiKey(val);
                      localStorage.setItem('gemini_api_key', val);
                    }}
                    placeholder="Enter your Gemini API key..."
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#070c18] text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setApiKey('');
                        localStorage.removeItem('gemini_api_key');
                      }}
                      className="px-2 py-1 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded border border-rose-300 dark:border-rose-900 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowKeyInput(false)}
                    className="px-2.5 py-1 text-[10px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded cursor-pointer transition"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Role & Model Controls Strip */}
            <div className="px-3 py-2 bg-slate-100/80 dark:bg-[#070c18] border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mr-1">
                  Role:
                </span>
                <button
                  type="button"
                  onClick={() => setRole('cad_dispatcher')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                    role === 'cad_dispatcher'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>CAD Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('first_aid')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                    role === 'first_aid'
                      ? 'bg-rose-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <HeartPulse className="w-3 h-3" />
                  <span>First Aid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('hospital_liaison')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                    role === 'hospital_liaison'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>Trauma Desk</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetChat}
                className="text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-mono transition"
                title="Reset conversation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white dark:bg-[#090f1e] text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-400 border border-slate-300 dark:border-cyan-800/60'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`group relative max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        isUser
                          ? 'bg-cyan-600 text-white shadow-sm rounded-tr-xs'
                          : 'bg-slate-100 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      <div
                        className={`flex items-center justify-between gap-3 mt-1.5 text-[9px] ${
                          isUser ? 'text-cyan-200' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        <span className="font-mono">{msg.timestamp}</span>

                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-0.5"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-2.5 h-2.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-cyan-950 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#070c18] border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                    <span>Gemini CAD Assistant is computing response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 bg-slate-50 dark:bg-[#070c18] border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Try:</span>
                {suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-300 transition shrink-0"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-slate-50 dark:bg-[#0a1120] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  role === 'first_aid'
                    ? 'Ask for medical first-aid guidance...'
                    : role === 'hospital_liaison'
                    ? 'Ask about ICU capacity, trauma bays...'
                    : 'Ask about shortest route, CAD dispatch...'
                }
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#070c18] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold transition shadow-md shadow-cyan-900/30 flex items-center justify-center shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
