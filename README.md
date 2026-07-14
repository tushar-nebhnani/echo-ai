<div align="center">
  <img src="https://img.icons8.com/fluent/100/000000/github.png" alt="GitHub Logo" width="80" />
  <h1>EchoAI</h1>
  <p><em>An intelligent, interactive AI mentoring platform.</em></p>
</div>

---

> **⚠️ Disclaimer:** This is a pre-V0 MVP (Minimum Viable Product). Many changes, features, and improvements are required and will be actively made in the future. The project is currently in its early developmental stages.

## 📖 Overview

EchoAI is a modern, responsive web-based AI chat application that simulates conversations with various technical mentors. It features a beautiful, clean UI with floating panels, light/dark mode support, and AI-powered responses with rich Markdown rendering. Whether you need help with System Design, Backend, or Cloud architecture, EchoAI provides targeted, expert-like guidance.

## 🚀 Tech Stack

### Frontend
- **React 19**: Component-based UI library for building dynamic interfaces.
- **Vite**: Ultra-fast development server and build tool.
- **TypeScript**: Static typing for robust, error-free code.
- **Vanilla CSS**: Custom design tokens, CSS variables, and fluid layouts for a lightweight, dependency-free styling system.
- **React-Markdown & Remark**: Renders complex AI responses (code blocks, lists, links, etc.) gracefully.

### Backend
- **Node.js & Express**: API server to handle chat requests and proxy third-party APIs.
- **Google Gemini API**: Default Large Language Model (LLM) powering the mentor personas.
- **OpenAI API**: Ready-to-use fallback/alternative LLM integration built into the code.
- **YouTube Data API v3**: Allows the AI to autonomously fetch and suggest relevant YouTube video tutorials based on user queries.

## 📂 Folder Structure

```text
EchoAI/
├── public/                 # Static assets (images, icons, avatars)
├── server/
│   ├── prompts/            # System prompts defining each mentor's persona (e.g. hitesh, piyush)
│   ├── index.ts            # Main Express server and API routes
│   ├── chatService.ts      # (Optional) Extracted chat logic
│   └── package.json        # Backend dependencies
├── src/
│   ├── components/         # React components
│   │   ├── ChatPanel.tsx   # Main chat view and input area
│   │   ├── Header.tsx      # Navbar with logo and theme toggle
│   │   ├── MentorCard.tsx  # Sidebar mentor selection cards
│   │   ├── MessageBubble.tsx # Renders individual chat messages
│   │   ├── Sidebar.tsx     # Chat history and mentor selection
│   │   ├── TypingIndicator.tsx
│   │   └── WelcomeState.tsx # Empty state with suggestion pills
│   ├── context/            # React context (e.g., ThemeContext for dark mode)
│   ├── App.tsx             # Main application layout and state management
│   ├── data.ts             # Initial chat data and mentor configurations
│   ├── index.css           # Global styles and design tokens
│   ├── main.tsx            # React DOM entry point
│   └── types.ts            # TypeScript interfaces
├── package.json            # Frontend dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## ⚙️ How It Works (API Calls)

1. **User Input**: The user selects a mentor (e.g., Hitesh or Piyush) and sends a message in the React UI.
2. **Frontend Request**: The React app sends a `POST` request to `http://localhost:3001/api/chat` with the `mentorName` and the conversation history.
3. **Backend Processing**: 
   - The Express server dynamically loads the appropriate system prompt for the chosen mentor from `server/prompts/`.
   - The server structures the system prompt and message history, then sends it to the **Google Gemini API** (by default).
   - **Tool Calling**: If the AI decides it needs external data to answer the question, it returns a `TOOL_REQUEST` JSON object (e.g., `searchYoutubeVideos`). The backend executes the tool (fetching YouTube videos) and loops back to the AI with the results.
4. **Response Parsing**: The AI's final JSON response is parsed and the actual text content is returned to the frontend.
5. **UI Rendering**: The frontend receives the reply and renders it using `React-Markdown` inside a chat bubble. All external links automatically open in a new tab.

## 🔄 Switching to OpenAI

EchoAI is configured to use the free tier of Google's Gemini API by default. Because of this, you may experience slight delays due to API rate limits (a synthetic delay of 2000ms is added to help avoid hitting these limits).

If you wish to switch to **OpenAI** (e.g., `gpt-4o-mini`), it's very simple:
1. Open `server/index.ts`.
2. Look for the `SWITCHING BETWEEN GEMINI AND OPENAI` comment block inside the `/api/chat` route.
3. Follow the 5-step instructions to uncomment the OpenAI code and comment out the Gemini code.

## 🛠️ Getting Started

Follow these steps to run EchoAI locally:

### 1. Fork and Clone the Repository
1. Navigate to the top right of this repository on GitHub and click the **Fork** button to create a copy in your own account.
2. Clone your forked repository to your local machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/EchoAI.git
   cd EchoAI
   ```

### 2. Environment Variables
Create a `.env` file inside the `server/` directory and add your API keys:
```env
PORT=3001
GOOGLE_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. Install Dependencies
You will need to install dependencies for both the frontend (React) and backend (Express).
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### 4. Run the Application
You need to run both the frontend and backend servers simultaneously.

**Start the Backend:**
```bash
# In the server/ directory
npm run dev
```

**Start the Frontend:**
Open a new terminal window/tab, navigate to the project root (`EchoAI/`), and run:
```bash
npm run dev
```

Finally, open [http://localhost:5173](http://localhost:5173) in your browser to start chatting with your AI mentors!
