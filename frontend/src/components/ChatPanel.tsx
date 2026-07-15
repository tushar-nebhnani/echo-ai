import React, { useRef, useEffect } from "react";
import type { Message, Mentor } from "../types";
import MessageBubble from "./MessageBubble";
import WelcomeState from "./WelcomeState";
import TypingIndicator from "./TypingIndicator";

// Send (arrow) icon
const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

interface ChatPanelProps {
  mentor: Mentor;
  messages: Message[];
  isTyping: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestionClick: (text: string) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  mentor,
  messages,
  isTyping,
  inputValue,
  onInputChange,
  onSend,
  onSuggestionClick,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="main-content">
      {/* Chat / Welcome area */}
      <div className="chat-area">
        {!hasMessages ? (
          <WelcomeState mentor={mentor} onSuggestionClick={onSuggestionClick} />
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} mentor={mentor} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="input-bar-wrapper">
        <div className="input-bar">
          <textarea
            id="chat-input"
            ref={textareaRef}
            className="chat-input"
            placeholder={mentor.inputPlaceholder}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label={mentor.inputPlaceholder}
          />
          <button
            id="send-btn"
            className="send-btn"
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        <div
          style={{
            fontSize: "11.5px",
            color: "var(--text-tertiary)",
            textAlign: "center",
            marginTop: "12px",
            padding: "0 20px",
            lineHeight: "1.5",
          }}
        >
          <strong>Note:</strong> EchoAI is currently powered by NVIDIA's
          nemotron-3-super-120b-a12b model. You may occasionally experience
          brief delays due to high traffic on the model.
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
