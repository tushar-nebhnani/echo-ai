export type Theme = 'light' | 'dark';

export interface Mentor {
  id: string;
  name: string;
  tag: string;
  tagColor: 'brand' | 'neutral';
  avatarBg: string;
  initials: string;
  avatar: string;
  online: boolean;
  welcomeTitle: string;
  welcomeSubtitle: string;
  inputPlaceholder: string;
  suggestions: SuggestionRow[];
}

export interface SuggestionRow {
  pills: Suggestion[];
}

export interface Suggestion {
  id: string;
  emoji: string;
  text: string;
}

export interface Message {
  id: string;
  role: 'mentor' | 'user';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  mentorId: string;
  messages: Message[];
  createdAt: Date;
}
