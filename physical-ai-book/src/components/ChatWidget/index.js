import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './styles.module.css';

const CHAT_API_URL = typeof window !== 'undefined'
  ? (window.__CHAT_API_URL || 'http://localhost:8000')
  : 'http://localhost:8000';

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isHealthy, setIsHealthy] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectedTooltip, setShowSelectedTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const sessionIdRef = useRef(generateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Health check on mount
  useEffect(() => {
    fetch(`${CHAT_API_URL}/api/health`)
      .then((r) => r.json())
      .then((data) => setIsHealthy(data.status === 'healthy' || data.status === 'degraded'))
      .catch(() => setIsHealthy(false));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Text selection listener
  useEffect(() => {
    const handleMouseUp = (e) => {
      // Ignore clicks inside the chat widget
      if (e.target.closest(`.${styles.chatPanel}`) || e.target.closest(`.${styles.chatButton}`)) {
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 10) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text.substring(0, 5000));
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
        setShowSelectedTooltip(true);
      } else {
        setShowSelectedTooltip(false);
        setSelectedText('');
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const sendMessage = useCallback(async (message, selected = null) => {
    if (!message.trim() || isStreaming) return;

    const userMsg = selected
      ? `[About selected text] ${message}`
      : message;

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsStreaming(true);
    setIsSearching(false);

    // Add placeholder for assistant response
    const assistantIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

    try {
      const endpoint = selected
        ? `${CHAT_API_URL}/api/chat/selected`
        : `${CHAT_API_URL}/api/chat/stream`;

      const body = selected
        ? { selected_text: selected, question: message, session_id: sessionIdRef.current }
        : { message, session_id: sessionIdRef.current };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Handle non-streaming response (selected text)
      if (selected) {
        const data = await response.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: data.response };
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      // Handle SSE streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'delta') {
              fullContent += event.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: fullContent,
                  isStreaming: true,
                };
                return updated;
              });
              setIsSearching(false);
            } else if (event.type === 'tool_call') {
              setIsSearching(true);
            } else if (event.type === 'done') {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: fullContent,
                };
                return updated;
              });
            } else if (event.type === 'error') {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: `Error: ${event.content}`,
                };
                return updated;
              });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, I could not connect to the chatbot service. Please try again later.',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setIsSearching(false);
    }
  }, [isStreaming, messages.length]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleAskAboutSelected = () => {
    setShowSelectedTooltip(false);
    setIsOpen(true);
    setInputValue('');
    // Pre-fill a hint in the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.placeholder = 'Ask about the selected text...';
      }
    }, 100);
  };

  const handleSendSelected = () => {
    if (selectedText && inputValue.trim()) {
      sendMessage(inputValue, selectedText);
      setSelectedText('');
    } else if (!selectedText) {
      sendMessage(inputValue);
    }
  };

  const charCount = inputValue.length;
  const isNearLimit = charCount > 1800;
  const isOverLimit = charCount > 2000;

  return (
    <>
      {/* Selected text tooltip */}
      {showSelectedTooltip && (
        <button
          className={styles.selectedTooltip}
          style={{
            position: 'fixed',
            left: Math.min(tooltipPos.x - 60, window.innerWidth - 140),
            top: Math.max(tooltipPos.y - 36, 8),
            zIndex: 1001,
            background: 'var(--ifm-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onClick={handleAskAboutSelected}
        >
          Ask about this
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <span
                className={`${styles.statusDot} ${isHealthy ? styles.statusHealthy : styles.statusUnhealthy}`}
              />
              <span>Physical AI Tutor</span>
            </div>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className={styles.messagesArea}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-500)', padding: '40px 20px', fontSize: '14px' }}>
                Ask me anything about Physical AI, ROS 2, Gazebo, NVIDIA Isaac, or VLA models!
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
              >
                {msg.content}
                {msg.isStreaming && <span className={styles.streamingIndicator}> ▊</span>}
              </div>
            ))}

            {isSearching && (
              <div className={styles.searchingIndicator}>
                Searching textbook...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {isHealthy === false && (
            <div className={styles.errorMessage}>
              Chatbot is currently unavailable.
              <br />
              <button
                className={styles.retryButton}
                onClick={() => {
                  setIsHealthy(null);
                  fetch(`${CHAT_API_URL}/api/health`)
                    .then((r) => r.json())
                    .then((data) => setIsHealthy(data.status === 'healthy' || data.status === 'degraded'))
                    .catch(() => setIsHealthy(false));
                }}
              >
                Retry
              </button>
            </div>
          )}

          {charCount > 0 && (
            <div className={`${styles.charCounter} ${isNearLimit ? styles.charCounterWarn : ''}`}>
              {charCount}/2000
            </div>
          )}

          <div className={styles.inputArea}>
            <textarea
              ref={inputRef}
              className={styles.chatInput}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedText ? 'Ask about the selected text...' : 'Ask a question...'}
              rows={1}
              disabled={isStreaming}
            />
            <button
              className={styles.sendButton}
              disabled={!inputValue.trim() || isStreaming || isOverLimit}
              onClick={() => {
                if (selectedText) {
                  handleSendSelected();
                } else {
                  sendMessage(inputValue);
                }
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Floating chat button */}
      <button className={styles.chatButton} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>
    </>
  );
}
