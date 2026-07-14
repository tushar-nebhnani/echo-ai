import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
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
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="message-avatar"
        />
      ) : (
        <img
          src="/user-avatar.jpg"
          alt="You"
          className="message-avatar"
        />
      )}

      {/* Bubble */}
      <div className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-mentor'}`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
              }}
            >
              {message.content.replace(/\\n/g, '\n').replace(/\n{3,}/g, '\n\n')}
            </ReactMarkdown>
          </div>
        )}
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;

