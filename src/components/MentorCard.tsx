import React from 'react';
import type { Mentor } from '../types';

interface MentorCardProps {
  mentor: Mentor;
  isSelected: boolean;
  onClick: () => void;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentor, isSelected, onClick }) => {
  return (
    <button
      id={`mentor-card-${mentor.id}`}
      className={`mentor-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      aria-selected={isSelected}
      role="option"
    >
      <div className="mentor-avatar-wrapper">
        <img
          src={mentor.avatar}
          alt={mentor.name}
          className="mentor-avatar"
        />
        {mentor.online && <span className="mentor-status-dot" aria-label="Online" />}
      </div>

      <div className="mentor-info">
        <div className="mentor-name">{mentor.name}</div>
        {mentor.tagColor === 'brand' ? (
          <div className="mentor-tag">{mentor.tag}</div>
        ) : (
          <div className="mentor-tag-neutral">{mentor.tag}</div>
        )}
      </div>
    </button>
  );
};

export default MentorCard;
