'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageCircle, X, BookOpen, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [input, setInput] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const showAttention = !hasOpened && !prefersReducedMotion;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat();

  const isScrolledToBottomRef = useRef(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    isScrolledToBottomRef.current = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
  };

  // Instant scroll to bottom without jittery smooth-scroll bouncing during streaming
  useEffect(() => {
    if (scrollContainerRef.current && isScrolledToBottomRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendMessage({
      text,
      role: 'user',
      content: text,
      parts: [{ type: 'text', text }]
    } as any);
    setInput('');
  };

  const isThinking = status === 'submitted' || status === 'streaming';

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: showAttention ? [0, -14, 12, -8, 6, 0] : 0 }}
        transition={{
          scale: { type: 'spring', stiffness: 260, damping: 20, delay: 0.5 },
          rotate: showAttention
            ? { duration: 0.5, ease: 'linear', delay: 1.5, repeat: Infinity, repeatDelay: 4 }
            : { duration: 0.1 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasOpened(true);
        }}
        aria-label={isOpen ? 'Close Diksyo AI chat' : 'Open Diksyo AI chat'}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-none border-4 border-black bg-yellow-400 text-black shadow-[6px_6px_0_0_#000] transition-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
      >
        {/* Pulsing ring + "AI" badge until the chat has been opened once */}
        {!hasOpened && (
          <>
            <span aria-hidden className="pointer-events-none absolute -inset-1 border-4 border-yellow-400 animate-ping motion-reduce:hidden" />
            <span aria-hidden className="pointer-events-none absolute -top-3 -left-3 border-2 border-black bg-red-500 px-1.5 py-0.5 text-[10px] font-black uppercase leading-none tracking-tight text-white shadow-[2px_2px_0_0_#000]">
              AI
            </span>
          </>
        )}
        {isOpen ? <X size={28} className="font-black" /> : <MessageCircle size={28} className="font-black" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[540px] w-[380px] flex-col border-4 border-black bg-white shadow-[8px_8px_0_0_#000] max-w-[calc(100vw-3rem)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black bg-yellow-400 p-4">
              <div className="flex items-center gap-2 text-black">
                <BookOpen size={22} className="font-black" />
                <h3 className="font-black uppercase tracking-tighter text-lg">Diksyo AI</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="border-2 border-black bg-white p-1 hover:bg-black hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Body */}
            <div ref={scrollContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f8f8]">
              {messages.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  className="flex h-full flex-col items-center justify-center text-center p-4"
                >
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="border-4 border-black bg-yellow-400 p-4 shadow-[4px_4px_0_0_#000] mb-3 cursor-pointer"
                  >
                    <BookOpen size={32} className="mx-auto mb-1 text-black font-black" />
                    <span className="font-black uppercase text-sm tracking-tight block">Mabuhay!</span>
                  </motion.div>
                  <p className="font-bold text-xs uppercase tracking-tight text-gray-700">
                    Ask me any Tagalog word definition or grammar rule!
                  </p>
                </motion.div>
              ) : (
                messages.map((m: any) => {
                  // Extract text content robustly
                  const contentStr = Array.isArray(m.parts) && m.parts.some((p: any) => p.type === 'text')
                    ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')
                    : m.content || '';

                  if (m.role === 'user') {
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10, originX: 1 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        key={m.id} 
                        className="flex justify-end"
                      >
                        <div className="max-w-[85%] border-2 border-black bg-yellow-400 p-3 font-bold text-sm text-black shadow-[4px_4px_0_0_#000]">
                          {contentStr || (typeof m === 'string' ? m : '')}
                        </div>
                      </motion.div>
                    );
                  }

                  // Check for System Note (Model Fallback)
                  const systemNoteRegex = /\[SYSTEM_NOTE:\s*([^\]]+)\]/g;
                  let systemNote = null;
                  const systemNoteMatch = systemNoteRegex.exec(contentStr);
                  if (systemNoteMatch) {
                     systemNote = systemNoteMatch[1].trim();
                  }

                  // Assistant Message Parsing
                  const followUpRegex = /\[FOLLOW-UP:\s*([^\]]+)\]/g;
                  const followUps: string[] = [];
                  let match;
                  while ((match = followUpRegex.exec(contentStr)) !== null) {
                    followUps.push(match[1].trim());
                  }
                  
                  const cleanedText = contentStr
                    .replace(followUpRegex, '')
                    .replace(systemNoteRegex, '')
                    .trim();

                  // Extract Tools from either m.parts or m.toolInvocations
                  const tools = [];
                  if (Array.isArray(m.parts)) {
                    tools.push(...m.parts.filter((p: any) => p.type === 'tool-invocation' || p.type?.startsWith('tool-')));
                  }
                  if (Array.isArray(m.toolInvocations)) {
                    tools.push(...m.toolInvocations);
                  }

                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10, originX: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      key={m.id} 
                      className="space-y-2"
                    >
                      {/* Tool Parts handling */}
                      {tools.map((ti: any, i: number) => {
                        const state = ti.state || (ti.toolInvocation?.state);
                        const output = ti.result || ti.output || (ti.toolInvocation?.result);

                        if (state === 'call' || state === 'running' || (!output && !state)) {
                          return (
                            <div key={`tool-${i}`} className="flex items-center gap-2 border-2 border-black bg-white p-2.5 my-2 shadow-[2px_2px_0_0_#000] w-fit">
                              <span className="text-xs font-black uppercase tracking-tight mr-1">Searching Diksyo DB</span>
                              <div className="flex items-center gap-1">
                                <div className="h-2 w-2 rounded-full border border-black bg-yellow-400 animate-bounce [animation-delay:-0.3s]" />
                                <div className="h-2 w-2 rounded-full border border-black bg-yellow-400 animate-bounce [animation-delay:-0.15s]" />
                                <div className="h-2 w-2 rounded-full border border-black bg-yellow-400 animate-bounce" />
                              </div>
                            </div>
                          );
                        } else if (state === 'result' || output) {
                          if (output?.notFound || output?.error) {
                            return (
                              <div key={`tool-${i}`} className="flex items-center gap-2 border-2 border-black bg-blue-100 p-2.5 text-xs font-bold my-2 shadow-[3px_3px_0_0_#000] text-blue-950 w-fit">
                                <Sparkles size={16} className="text-blue-700 font-black shrink-0" />
                                <span className="font-black uppercase tracking-tight">
                                  ⚡ Not in DB — Explaining with AI General Knowledge:
                                </span>
                              </div>
                            );
                          }
                        }
                        return null;
                      })}

                      {/* System Note (Fallback Indicator) */}
                      {systemNote && (
                        <div className="flex items-center gap-2 border-2 border-black bg-orange-100 p-2.5 text-xs font-bold my-2 shadow-[3px_3px_0_0_#000] text-orange-950 w-fit">
                          <span className="font-black uppercase tracking-tight flex items-center gap-1">
                            ⚠️ {systemNote}
                          </span>
                        </div>
                      )}

                      {/* Text content rendered as Markdown */}
                      {cleanedText && (
                        <div className="border-2 border-black bg-white p-3 font-medium text-sm text-black shadow-[4px_4px_0_0_#000] prose prose-sm max-w-none leading-relaxed">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {cleanedText}
                          </ReactMarkdown>
                        </div>
                      )}

                      {/* Follow-up Interactive Pills */}
                      {followUps.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          <span className="text-[10px] font-black uppercase text-gray-500 w-full block tracking-wider">
                            Suggested Follow-ups:
                          </span>
                          {followUps.map((promptText, idx) => (
                            <motion.button
                              initial={{ opacity: 0, scale: 0.8, x: -10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              transition={{ type: 'spring', delay: idx * 0.1, stiffness: 300, damping: 20 }}
                              key={idx}
                              onClick={() => handleSend(promptText)}
                              className="flex items-center gap-1 border-2 border-black bg-yellow-300 px-2.5 py-1 text-xs font-bold text-black shadow-[2px_2px_0_0_#000] transition-all hover:bg-yellow-400 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                              <Sparkles size={12} className="text-black" />
                              <span>{promptText}</span>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}

              {/* Bubbly Animated Thinking Dots 🫧 */}
              {isThinking && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex justify-start my-2"
                >
                  <div className="flex items-center gap-2 border-2 border-black bg-white p-3 shadow-[4px_4px_0_0_#000]">
                    <span className="text-xs font-black uppercase tracking-tight">Thinking</span>
                    <div className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded-full border border-black bg-yellow-400 animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-2.5 w-2.5 rounded-full border border-black bg-yellow-400 animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-2.5 w-2.5 rounded-full border border-black bg-yellow-400 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex border-t-4 border-black bg-white p-3 gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isThinking) {
                      handleSend(input);
                    }
                  }
                }}
                placeholder="Ask about a Tagalog word..."
                rows={1}
                className="flex-1 border-2 border-black p-2 font-bold text-sm outline-none focus-visible:bg-yellow-100 placeholder:text-black/50 resize-none max-h-24 overflow-y-auto leading-snug"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isThinking}
                className="flex items-center justify-center border-2 border-black bg-yellow-400 px-4 font-black uppercase transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[4px_4px_0_0_#000] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#000]"
              >
                <Send size={18} className="font-bold text-black" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
