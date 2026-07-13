import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator" aria-label="Mentor is typing" role="status">
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;
