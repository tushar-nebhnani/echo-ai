import React from 'react';
import type { Mentor } from '../types';
import MentorCard from './MentorCard';

// Plus icon
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Message icon
const MessageIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Delete (Trash) icon
const DeleteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

interface ChatHistoryItem {
  id: string;
  title: string;
  mentorId: string;
}

interface SidebarProps {
  mentors: Mentor[];
  selectedMentorId: string;
  onSelectMentor: (id: string) => void;
  chatHistory: ChatHistoryItem[];
  onNewChat: () => void;
  onDeleteChat: (chatId: string, mentorId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  mentors,
  selectedMentorId,
  onSelectMentor,
  chatHistory,
  onNewChat,
  onDeleteChat,
}) => {
  return (
    <aside className="sidebar" role="complementary" aria-label="Sidebar">
      {/* SELECT MENTOR */}
      <section className="sidebar-section" aria-label="Select Mentor">
        <div className="sidebar-label">Select Mentor</div>
        {mentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={mentor}
            isSelected={selectedMentorId === mentor.id}
            onClick={() => onSelectMentor(mentor.id)}
          />
        ))}
      </section>

      {/* CHAT HISTORY */}
      <section className="sidebar-section" aria-label="Chat History">
        <div className="sidebar-label">Chat History</div>
        <button
          id="new-chat-btn"
          className="new-chat-btn"
          onClick={onNewChat}
          aria-label="Start a new chat"
        >
          <PlusIcon />
          <span>New Chat</span>
        </button>

        <div className="chat-history-list">
          {chatHistory.map((item) => (
            <div
              key={item.id}
              className="chat-history-item-container"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <button
                id={`chat-history-item-${item.id}`}
                className="chat-history-item"
                aria-label={item.title}
                style={{ flex: 1, minWidth: 0 }}
              >
                <span className="chat-history-icon">
                  <MessageIcon />
                </span>
                <span className="chat-history-text">{item.title}</span>
              </button>
              <button
                className="delete-chat-btn"
                onClick={() => onDeleteChat(item.id, item.mentorId)}
                aria-label="Delete chat"
                title="Delete chat"
                style={{
                  padding: "6px",
                  color: "var(--text-tertiary)",
                  borderRadius: "var(--radius-sm)",
                  flexShrink: 0,
                }}
              >
                <DeleteIcon />
              </button>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
