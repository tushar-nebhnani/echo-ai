import React from 'react';
import type { Message, Mentor } from '../types';

interface MessageBubbleProps {
  message: Message;
  mentor: Mentor;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, mentor }) => {
  const isUser = message.role === 'user';

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-mentor'}`}>
      {/* Avatar */}
      {!isUser ? (
        <div
          className="message-avatar-placeholder"
          style={{ background: mentor.avatarBg }}
          aria-label={mentor.name}
        >
          {mentor.initials}
        </div>
      ) : (
        <div
          className="message-avatar-placeholder"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
          aria-label="You"
        >
          U
        </div>
      )}

      {/* Bubble */}
      <div className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-mentor'}`}>
        <p>{message.content}</p>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
