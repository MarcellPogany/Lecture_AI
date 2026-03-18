import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare, User, Bot } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  isLoading?: boolean;
  onAsk: (question: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ chatHistory, isLoading, onAsk }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onAsk(input.trim());
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={15} color="white" />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Ask About This Lecture</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Grounded in your transcript & documents</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
        {chatHistory.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} strokeWidth={1} />
            <div style={{ fontSize: '13px', textAlign: 'center', maxWidth: '240px', lineHeight: '1.6' }}>
              Ask any question about this lecture. I'll answer using only the transcript and uploaded documents.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', maxWidth: '280px' }}>
              {['What were the main points covered?', 'Explain the key concept in simple terms', 'What examples were used?'].map((q) => (
                <button key={q} onClick={() => onAsk(q)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-muted)', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'left', transition: 'all 0.2s' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                {msg.role === 'user' ? <User size={13} color="white" /> : <Bot size={13} color="var(--accent)" />}
              </div>
              <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px', background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-muted)', fontSize: '13px', lineHeight: '1.65', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-muted)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={13} color="var(--accent)" />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '4px 14px 14px 14px', background: 'var(--bg-muted)', display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this lecture..."
          disabled={isLoading}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-muted)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{ width: '40px', height: '40px', borderRadius: '10px', border: 'none', background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}
        >
          {isLoading ? <Loader2 size={16} color="var(--text-muted)" className="animate-spin" /> : <Send size={16} color={input.trim() ? 'white' : 'var(--text-muted)'} />}
        </button>
      </form>
    </div>
  );
};
