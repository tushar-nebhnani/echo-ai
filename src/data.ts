import type { Mentor } from './types';

export const MENTORS: Mentor[] = [
  {
    id: 'hitesh',
    name: 'Hitesh Choudhary',
    tag: 'Backend & DSA',
    tagColor: 'brand',
    avatarBg: 'linear-gradient(135deg, #d97706, #92400e)',
    initials: 'HC',
    online: true,
    welcomeTitle: 'Ask Hitesh',
    welcomeSubtitle: 'Backend, DSA & the art of shipping things that scale',
    inputPlaceholder: 'Ask Hitesh anything...',
    suggestions: [
      {
        pills: [
          { id: 's1', emoji: '🔥', text: 'Best backend stack in 2025?' },
          { id: 's2', emoji: '✨', text: 'How to crack system design?' },
        ],
      },
      {
        pills: [
          { id: 's3', emoji: '⚛️', text: 'React vs Next.js — when to use what?' },
          { id: 's4', emoji: '🍕', text: 'How to get good at DSA fast?' },
        ],
      },
      {
        pills: [
          { id: 's5', emoji: '🐳', text: 'Docker for beginners — where to start?' },
          { id: 's6', emoji: '🍩', text: 'Monorepo or polyrepo?' },
        ],
      },
    ],
  },
  {
    id: 'piyush',
    name: 'Piyush Garg',
    tag: 'Full Stack & Cloud',
    tagColor: 'neutral',
    avatarBg: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
    initials: 'PG',
    online: false,
    welcomeTitle: 'Ask Piyush',
    welcomeSubtitle: 'Full Stack development & cloud architecture simplified',
    inputPlaceholder: 'Ask Piyush anything...',
    suggestions: [
      {
        pills: [
          { id: 'p1', emoji: '☁️', text: 'AWS vs GCP — which to learn first?' },
          { id: 'p2', emoji: '🚀', text: 'Next.js 15 new features?' },
        ],
      },
      {
        pills: [
          { id: 'p3', emoji: '🛠️', text: 'Best CI/CD pipeline for solo devs?' },
          { id: 'p4', emoji: '💡', text: 'tRPC vs REST vs GraphQL?' },
        ],
      },
      {
        pills: [
          { id: 'p5', emoji: '🐘', text: 'PostgreSQL vs MongoDB — when to pick?' },
          { id: 'p6', emoji: '🔐', text: 'How does OAuth 2.0 work?' },
        ],
      },
    ],
  },
  {
    id: 'combine',
    name: 'Group Session',
    tag: 'Dual mentor mode',
    tagColor: 'neutral',
    avatarBg: 'linear-gradient(135deg, #059669, #064e3b)',
    initials: 'GS',
    online: true,
    welcomeTitle: 'Ask Both',
    welcomeSubtitle: 'Get perspectives from Hitesh & Piyush together',
    inputPlaceholder: 'Ask both mentors anything...',
    suggestions: [
      {
        pills: [
          { id: 'g1', emoji: '🤝', text: 'How do you both approach debugging?' },
          { id: 'g2', emoji: '📚', text: 'Recommended learning roadmap for 2025?' },
        ],
      },
      {
        pills: [
          { id: 'g3', emoji: '💬', text: 'Freelancing vs full-time as a dev?' },
          { id: 'g4', emoji: '🏆', text: 'Open source contribution tips?' },
        ],
      },
    ],
  },
];

export const INITIAL_CHAT_HISTORY = [
  { id: 'c1', title: 'React vs Next.js — when t...', mentorId: 'hitesh' },
];
