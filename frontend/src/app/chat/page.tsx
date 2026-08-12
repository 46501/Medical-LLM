'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am MediMind AI. How can I assist you with your health questions today?\n\n**Important:** I provide educational information and cannot replace professional medical advice.' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat/stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + chunk
              };
              return newMessages;
            });
          }
        }
      } else {
        const errorData = await res.json().catch(() => null);
        setMessages(prev => [...prev, { role: 'assistant', content: errorData?.message || "Error: Could not reach the server." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Network failure." }]);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">M</div>
            <span className="font-bold">MediMind AI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/chat" className="block px-3 py-2 bg-slate-800 rounded-lg text-sm font-medium text-emerald-400">New Chat</Link>
          <Link href="/analyzer" className="block px-3 py-2 hover:bg-slate-800 rounded-lg text-sm text-slate-400 transition-colors">Report Analyzer</Link>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleSignOut} className="text-sm text-slate-400 hover:text-slate-200">Sign Out</button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        
        <header className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">M</div>
            <span className="font-bold">MediMind AI</span>
          </div>
          <Link href="/analyzer" className="text-sm text-emerald-400">Analyzer</Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-gradient-to-r from-emerald-600 to-cyan-700 text-white' : 'glass-panel border-slate-700/50'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 text-xs font-bold">M</div>
                    <span className="text-xs font-semibold text-emerald-400">MediMind AI</span>
                  </div>
                )}
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 z-10 bg-gradient-to-t from-slate-950 to-transparent pt-10">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms or ask a medical question..."
                className="w-full glass-panel pl-4 pr-12 py-4 rounded-full focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-50 placeholder-slate-400"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-2 top-2 bottom-2 w-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center disabled:opacity-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
            <p className="text-center text-xs text-slate-500 mt-2">MediMind AI can make mistakes. Always consult a real doctor for medical advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
