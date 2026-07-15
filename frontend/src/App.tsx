import React, { useState, useCallback, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import { MENTORS, INITIAL_CHAT_HISTORY } from "./data";
import type { Message } from "./types";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

async function callMentorAPI(
  mentorId: string,
  conversationHistory: Message[],
): Promise<string> {
  const messages = conversationHistory.map((msg) => ({
    role: msg.role === "mentor" ? "assistant" : "user",
    content: msg.content,
  }));

  const backendUri = import.meta.env.VITE_BACKEND_URI;
  if (!backendUri) throw new Error("VITE_BACKEND_URI is not defined");

  const response = await fetch(`${backendUri}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mentorName: mentorId, messages }),
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();
  return data.reply;
}

const AppContent: React.FC = () => {
  const [selectedMentorId, setSelectedMentorId] = useState<string>(() => {
    return localStorage.getItem("selectedMentorId") || "hitesh";
  });
  const [messagesByMentor, setMessagesByMentor] = useState<
    Record<string, Message[]>
  >(() => {
    const saved = localStorage.getItem("messagesByMentor");
    return saved ? JSON.parse(saved) : {};
  });
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { id: string; title: string; mentorId: string }[]
  >(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : INITIAL_CHAT_HISTORY;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("messagesByMentor", JSON.stringify(messagesByMentor));
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    localStorage.setItem("selectedMentorId", selectedMentorId);
  }, [messagesByMentor, chatHistory, selectedMentorId]);

  const selectedMentor =
    MENTORS.find((m) => m.id === selectedMentorId) || MENTORS[0];
  const currentMessages = messagesByMentor[selectedMentorId] || [];

  const handleSelectMentor = useCallback((id: string) => {
    setSelectedMentorId(id);
    setInputValue("");
    setIsTyping(false);
    setIsMobileSidebarOpen(false); // Close sidebar on mobile after selecting mentor
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [
      ...(messagesByMentor[selectedMentorId] || []),
      userMessage,
    ];

    setMessagesByMentor((prev) => ({
      ...prev,
      [selectedMentorId]: updatedMessages,
    }));

    if ((messagesByMentor[selectedMentorId] || []).length === 0) {
      const title = text.length > 32 ? text.substring(0, 32) + "..." : text;
      setChatHistory((prev) => [
        { id: generateId(), title, mentorId: selectedMentorId },
        ...prev,
      ]);
    }

    setInputValue("");
    setIsTyping(true);

    try {
      const reply = await callMentorAPI(selectedMentorId, updatedMessages);

      const mentorMessage: Message = {
        id: generateId(),
        role: "mentor",
        content: reply,
        timestamp: new Date(),
      };

      setMessagesByMentor((prev) => ({
        ...prev,
        [selectedMentorId]: [...updatedMessages, mentorMessage],
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: "mentor",
        content: "⚠️ Internal Server Error: 500",
        timestamp: new Date(),
      };
      setMessagesByMentor((prev) => ({
        ...prev,
        [selectedMentorId]: [...updatedMessages, errorMessage],
      }));
      console.error("Failed to fetch from AI:", error);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, selectedMentorId, messagesByMentor]);

  const handleSuggestionClick = useCallback(
    async (text: string) => {
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      const updatedMessages = [
        ...(messagesByMentor[selectedMentorId] || []),
        userMessage,
      ];

      setMessagesByMentor((prev) => ({
        ...prev,
        [selectedMentorId]: updatedMessages,
      }));

      if ((messagesByMentor[selectedMentorId] || []).length === 0) {
        const title = text.length > 32 ? text.substring(0, 32) + "..." : text;
        setChatHistory((prev) => [
          { id: generateId(), title, mentorId: selectedMentorId },
          ...prev,
        ]);
      }

      setInputValue("");
      setIsTyping(true);

      try {
        // Call your real Express server!
        const reply = await callMentorAPI(selectedMentorId, updatedMessages);

        const mentorMessage: Message = {
          id: generateId(),
          role: "mentor",
          content: reply,
          timestamp: new Date(),
        };

        setMessagesByMentor((prev) => ({
          ...prev,
          [selectedMentorId]: [...updatedMessages, mentorMessage],
        }));
      } catch (error) {
        const errorMessage: Message = {
          id: generateId(),
          role: "mentor",
          content:
            "⚠️ Failed to connect to AI backend. Make sure your server is running on port 3001 and your API key is correct.",
          timestamp: new Date(),
        };
        setMessagesByMentor((prev) => ({
          ...prev,
          [selectedMentorId]: [...updatedMessages, errorMessage],
        }));
        console.error("Failed to fetch from AI:", error);
      } finally {
        setIsTyping(false);
      }
    },
    [selectedMentorId, messagesByMentor],
  );

  const handleNewChat = useCallback(() => {
    setMessagesByMentor((prev) => ({ ...prev, [selectedMentorId]: [] }));
    setInputValue("");
    setIsTyping(false);
  }, [selectedMentorId]);

  const handleDeleteChat = useCallback(
    (chatId: string, mentorId: string) => {
      setChatHistory((prev) => prev.filter((chat) => chat.id !== chatId));
      if (selectedMentorId === mentorId) {
        setMessagesByMentor((prev) => ({ ...prev, [mentorId]: [] }));
      }
    },
    [selectedMentorId],
  );

  return (
    <div className="app-layout">
      <Header
        mentorName={selectedMentor.name}
        mentorTag={`${selectedMentor.tag} Expert`}
        mentorOnline={selectedMentor.online}
        isMobileSidebarOpen={isMobileSidebarOpen}
        toggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />
      <div className="content-wrapper">
        <Sidebar
          mentors={MENTORS}
          selectedMentorId={selectedMentorId}
          onSelectMentor={handleSelectMentor}
          chatHistory={chatHistory}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <ChatPanel
          mentor={selectedMentor}
          messages={currentMessages}
          isTyping={isTyping}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
