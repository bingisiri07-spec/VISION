import React, { useState, useRef, useEffect } from 'react';
import { askAIAssistant } from '../../services/aiChatEngine';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Key,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function AIAssistantDrawer({
  isOpen,
  onClose,
  projectState,
  apiKey,
  onUpdateApiKey,
  onAddChatMessage
}) {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  const messagesEndRef = useRef(null);

  const messages = projectState.chatHistory || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    onAddChatMessage(userMsg);
    setInputMessage('');
    setIsLoading(true);

    try {
      const replyText = await askAIAssistant({
        userMessage: text.trim(),
        projectState,
        apiKey
      });

      const assistantMsg = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      onAddChatMessage(assistantMsg);
    } catch (err) {
      onAddChatMessage({
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: "I encountered an issue generating a response. Please check your connection or Groq API key.",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    onUpdateApiKey(tempApiKey.trim());
    setShowSettings(false);
  };

  if (!isOpen) return null;

  const quickPrompts = [
    "What is my next priority?",
    "Review my budget tradeoffs",
    "How do I conduct user interviews?",
    "Help me cut my MVP scope"
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '460px',
        zIndex: 2500,
        backgroundColor: 'rgba(2, 6, 18, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(7, 18, 43, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #1d72fe, #38bdf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)',
            }}
          >
            <Bot size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              VISION Co-Pilot
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cyan-glow)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
              <span>Project Memory Active</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Groq AI Key"
            style={{
              color: apiKey ? 'var(--cyan-bright)' : 'var(--text-dim)',
              padding: '0.4rem',
              borderRadius: '6px',
            }}
          >
            <Key size={18} />
          </button>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-silver)', padding: '0.4rem', borderRadius: '6px' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Groq API Key Configuration Panel */}
      {showSettings && (
        <form
          onSubmit={handleSaveApiKey}
          style={{
            padding: '1.25rem',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
            Optional: Connect Groq API Key
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            VISION functions fully with built-in startup intelligence. Enter a Groq key (<code>gsk_...</code>) for direct Llama-3.3-70B inference. Stored locally in your browser.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="password"
              placeholder="gsk_..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              style={{ flex: 1, padding: '0.5rem 0.75rem', background: '#020612', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
            />
            <button type="submit" className="btn-primary-glow" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              Save
            </button>
          </div>
        </form>
      )}

      {/* Active Project Context Pill */}
      {projectState.selectedIdea && (
        <div
          style={{
            padding: '0.6rem 1.25rem',
            background: 'rgba(29, 114, 254, 0.12)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.12)',
            fontSize: '0.75rem',
            color: 'var(--text-silver)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ color: 'var(--cyan-glow)', fontWeight: 600 }}>Active Context: </span>
            <span>{projectState.selectedIdea.name}</span>
          </div>
          <div style={{ color: 'var(--text-dim)' }}>
            {(projectState.tasks || []).filter((t) => t.completed).length} tasks done
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
              }}
            >
              <div
                style={{
                  padding: '0.85rem 1.1rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'linear-gradient(135deg, #1d72fe, #2563eb)' : 'rgba(15, 23, 42, 0.85)',
                  border: isUser ? 'none' : '1px solid rgba(56, 189, 248, 0.15)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                  boxShadow: isUser ? '0 0 15px rgba(29, 114, 254, 0.4)' : 'none',
                }}
              >
                {msg.text}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-dim)',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  padding: '0 0.25rem',
                }}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '0.85rem 1.1rem',
              borderRadius: '16px 16px 16px 4px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--cyan-glow)',
              fontSize: '0.85rem',
            }}
          >
            <Sparkles size={16} />
            <span>Consulting project memory...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div
        style={{
          padding: '0.5rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          background: 'rgba(2, 6, 18, 0.7)',
        }}
      >
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: 'var(--cyan-bright)',
              fontSize: '0.75rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 18, 43, 0.9)',
          display: 'flex',
          gap: '0.65rem',
        }}
      >
        <input
          type="text"
          placeholder="Ask anything about your venture..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'rgba(2, 6, 18, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '9999px',
            padding: '0.75rem 1.25rem',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="btn-primary-glow"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            padding: 0,
            opacity: !inputMessage.trim() ? 0.4 : 1,
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
