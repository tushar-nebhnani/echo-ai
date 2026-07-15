import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import HITESH_PERSONA from "./prompts/hitesh.js";
import PIYUSH_PERSONA from "./prompts/piyush.js";
import BOTH_PERSONA from "./prompts/combine.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

if (!process.env.CORS_ORIGIN)
  throw new Error("CORS_ORIGIN is not defined in the environment.");

// Hard Coding My frontend URL!
app.use(
  cors({
    origin: "https://echoai.tushardev.in",
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

interface ChatMessage {
  role: "user" | "assistant" | "developer";
  content: string;
}
interface ChatRequest {
  mentorName: string;
  messages: ChatMessage[];
}

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
}

interface FormattedVideo {
  title: string;
  videoLink: string;
  thumbnail: string;
}

function checkAPIKey() {
  if (!process.env.OPENAI_API_KEY) {
    return { status: 404, message: "API KEY missing from .env file!!" };
  }
}

async function getSystemPrompt(mentorId: string): Promise<string | null> {
  const prompts: Record<string, string> = {
    hitesh: HITESH_PERSONA,
    piyush: PIYUSH_PERSONA,
    combine: BOTH_PERSONA,
  };
  return prompts[mentorId] || null;
}

async function searchYoutubeVideos(
  searchQuery: string,
): Promise<FormattedVideo[]> {
  try {
    console.log("✅Youtube Service Called with query:", searchQuery);
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      throw new Error("YOUTUBE_API_KEY is not defined in the environment.");
    }

    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=id,snippet` +
      `&q=${encodeURIComponent(searchQuery)}` +
      `&maxResults=3` +
      `&type=video` +
      `&key=${key}`;

    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`YouTube API ${res.status}: ${res.statusText}`);
    console.log("RAW Data from backend:", res);
    console.log("❌");

    const data = await res.json();

    console.log("Data from backend:", data);

    return data.items.map(
      (item: YouTubeSearchItem): FormattedVideo => ({
        title: item.snippet.title,
        videoLink: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.medium.url,
      }),
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("YouTube API error:", err.message);
    } else {
      console.error("An unexpected error occurred:", err);
    }
    return [];
  }
}

async function callTool(functionName: string, input: string) {
  switch (functionName) {
    case "searchYoutubeVideos":
      return await searchYoutubeVideos(input);

    case "executeCommandCli":
      return "CLI execution is not available in browser mode.";

    case "getWeatherData":
      return "Weather lookup is not available in browser mode.";

    default:
      return `Unknown tool: ${functionName}`;
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// checkAPIKey();
// const openai = new OpenAI();

const gemini = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { mentorName, messages }: ChatRequest = req.body;
    if (!mentorName || !messages) {
      return res
        .status(400)
        .json({ error: "mentorId and messages are required" });
    }
    // console.log(mentorName, messages);

    const systemPrompt = await getSystemPrompt(mentorName);

    if (!systemPrompt) {
      return res.status(400).json({ error: `Unknown mentor: ${mentorName}` });
    }

    const finalSystemPrompt =
      systemPrompt +
      "Always ensure that the end user gets a structure respone, not a long paragraph. And all the responses must be in JSON format.";

    // For OpenAI
    // const MESSAGE_DB: any[] = [
    //   {
    //     role: "system",
    //     content: finalSystemPrompt,
    //   },
    //   ...messages,
    // ];

    // For Gemini
    const MESSAGE_DB: any[] = messages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }], // Gemini demands this structure for text
    }));

    let iterations = 0;
    const MAX_ITERATIONS = 17;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      // ==========================================
      // SWITCHING BETWEEN GEMINI AND OPENAI
      // ==========================================
      // To switch to OpenAI:
      // 1. Uncomment the OpenAI MESSAGE_DB format above and comment out the Gemini one.
      // 2. Remove or comment out `await delay(2000)` below.
      // 3. Uncomment the OpenAI `completion` call below and comment out the Gemini one.
      // 4. Uncomment the OpenAI `rawResult` / `MESSAGE_DB.push` and comment out Gemini's.
      // 5. Do the same for the TOOL_REQUEST push formatting further down.
      // ==========================================

      await delay(2000); // Remove when using OpenAI (helps avoid Gemini Free Tier rate limits)

      // --- OPENAI COMPLETION ---
      // const completion = await openai.chat.completions.create({
      //   model: "gpt-4o-mini",
      //   messages: MESSAGE_DB,
      //   response_format: { type: "json_object" },
      // });

      const completion = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: MESSAGE_DB,
        config: {
          responseMimeType: "application/json",
          systemInstruction: finalSystemPrompt,
        },
      });

      // const rawResult = completion.choices[0].message.content; // For OpenAI
      const rawResult = completion.text; // For Gemini
      if (!rawResult) continue;

      let parsedResult;
      try {
        parsedResult = JSON.parse(rawResult);
      } catch (e) {
        console.error("Failed to parse JSON:", rawResult);
        return res.status(500).json({ error: "AI returned invalid format" });
      }

      // MESSAGE_DB.push({ role: "assistant", content: rawResult }); // For OpenAI
      MESSAGE_DB.push({ role: "model", parts: [{ text: rawResult }] }); // For Gemini

      // For Debugging:
      // console.log(
      //   `🤖 [Iteration ${iterations}] ${parsedResult.step}: ${parsedResult.text}`,
      // );

      if (parsedResult.step === "TOOL_REQUEST") {
        const { functionName, input } = parsedResult;
        const toolResult = await callTool(functionName, input);

        // For OpenAI
        // messages.push({
        //   role: "developer",
        //   content: JSON.stringify({
        //     step: "TOOL_OUTPUT",
        //     functionName,
        //     output: toolResult,
        //   }),
        // });

        MESSAGE_DB.push({
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                step: "TOOL_OUTPUT",
                functionName,
                output: toolResult,
              }),
            },
          ],
        });

        continue;
      }

      if (parsedResult.step && parsedResult.step.toUpperCase() === "OUTPUT") {
        return res.json({ reply: JSON.stringify(parsedResult.text) });
      }
    }

    return res.status(500).json({ error: "AI took too many steps to respond" });
  } catch (error: any) {
    // console.error("OpenAI error:", error.message);
    // Handle specific API errors
    if (
      error.status === 429 ||
      (error.message && error.message.includes("429"))
    ) {
      return res.status(429).json({
        error:
          "We're experiencing high traffic. Gemini API rate limit exceeded. Please wait a moment and try again.",
      });
    }
    console.error("Gemini error:", error);

    return res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
