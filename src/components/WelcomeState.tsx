import React from 'react';
import type { Mentor } from '../types';

interface WelcomeStateProps {
  mentor: Mentor;
  onSuggestionClick: (text: string) => void;
}

const WelcomeState: React.FC<WelcomeStateProps> = ({ mentor, onSuggestionClick }) => {
  return (
    <div className="welcome-state" role="main" aria-label={`Welcome to ${mentor.welcomeTitle}`}>
      {/* Mentor Avatar */}
      <div className="welcome-avatar-ring">
        <div
          className="welcome-avatar-placeholder"
          style={{ background: mentor.avatarBg }}
          aria-label={mentor.name}
        >
          {mentor.initials}
        </div>
      </div>

      {/* Title */}
      <h1 className="welcome-title">{mentor.welcomeTitle}</h1>

      {/* Subtitle */}
      <p className="welcome-subtitle">{mentor.welcomeSubtitle}</p>

      {/* Suggestion Pills */}
      <div className="suggestions-grid" role="list" aria-label="Suggested questions">
        {mentor.suggestions.map((row, rowIdx) => (
          <div key={rowIdx} className="suggestions-row">
            {row.pills.map((pill) => (
              <button
                key={pill.id}
                id={`suggestion-${pill.id}`}
                className="suggestion-pill"
                role="listitem"
                onClick={() => onSuggestionClick(pill.text)}
                aria-label={pill.text}
              >
                <span aria-hidden="true">{pill.emoji}</span>
                <span>{pill.text}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeState;
