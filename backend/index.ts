import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
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
  if (!process.env.NVIDIA_API_KEY) {
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

checkAPIKey();
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
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

    const MESSAGE_DB: any[] = [
      {
        role: "system",
        content: finalSystemPrompt,
      },
      ...messages,
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 17;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const completion = await openai.chat.completions.create({
        model: "nvidia/nemotron-3-super-120b-a12b",
        messages: MESSAGE_DB,
        temperature: 1,
        top_p: 0.95,
        max_tokens: 16384,
        // @ts-ignore - NVIDIA specific parameters
        reasoning_budget: 16384,
        // @ts-ignore
        chat_template_kwargs: { enable_thinking: true },
        response_format: { type: "json_object" },
      });

      const rawResult = completion.choices[0].message.content; // For OpenAI
      if (!rawResult) continue;

      let parsedResult;
      try {
        parsedResult = JSON.parse(rawResult);
      } catch (e) {
        console.error("Failed to parse JSON:", rawResult);
        return res.status(500).json({ error: "AI returned invalid format" });
      }

      MESSAGE_DB.push({ role: "assistant", content: rawResult }); // For OpenAI

      // For Debugging:
      // console.log(
      //   `🤖 [Iteration ${iterations}] ${parsedResult.step}: ${parsedResult.text}`,
      // );

      if (parsedResult.step === "TOOL_REQUEST") {
        const { functionName, input } = parsedResult;
        const toolResult = await callTool(functionName, input);

        messages.push({
          role: "developer",
          content: JSON.stringify({
            step: "TOOL_OUTPUT",
            functionName,
            output: toolResult,
          }),
        });

        continue;
      }

      if (parsedResult.step && parsedResult.step.toUpperCase() === "OUTPUT") {
        return res.json({ reply: JSON.stringify(parsedResult.text) });
      }
    }

    return res.status(500).json({ error: "AI took too many steps to respond" });
  } catch (error: any) {
    console.error("OpenAI error:", error.message);

    return res.status(500).json({ error: "Failed to get AI response" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
