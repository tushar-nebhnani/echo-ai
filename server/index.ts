import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
interface ChatRequest {
  mentorName: string;
  messages: ChatMessage[];
}

function checkAPIKey() {
  if (!process.env.OPENAI_API_KEY) {
    return { status: 404, message: "API KEY missing from .env file!!" };
  }
}

async function getSystemPrompt(mentorId: string): Promise<string | null> {
  try {
    const module = await import(`./prompts/${mentorId}.ts`);
    return module.default ?? null;
  } catch (error) {
    console.error(`Error loading prompt for mentor: ${mentorId}`, error);
    return null;
  }
}

checkAPIKey();
const openai = new OpenAI();

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    console.log("Service Called from post");
    const { mentorName, messages }: ChatRequest = req.body;
    if (!mentorName || !messages) {
      return res
        .status(400)
        .json({ error: "mentorId and messages are required" });
    }

    const systemPrompt = await getSystemPrompt(mentorName);

    if (!systemPrompt) {
      return res.status(400).json({ error: `Unknown mentor: ${mentorName}` });
    }
    const finalSystemPrompt =
      systemPrompt +
      `\n\nYou MUST respond ONLY with a JSON object containing two keys: "step" and "text".\nIf you are reasoning about how to answer, set "step": "THINK" and put your thoughts in "text".\nWhen you are ready to give the final response to the user, set "step": "OUTPUT" and put your final answer in "text".`;

    const MESSAGE_DB: any[] = [
      {
        role: "system",
        content: finalSystemPrompt,
      },
      ...messages,
    ];

    let iterations = 0;
    const MAX_ITERATIONS = 25;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: MESSAGE_DB,
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.7,
      });

      const rawResult = completion.choices[0].message.content;
      if (!rawResult) continue;

      let parsedResult;
      try {
        parsedResult = JSON.parse(rawResult);
      } catch (e) {
        console.error("Failed to parse JSON:", rawResult);
        return res.status(500).json({ error: "AI returned invalid format" });
      }

      MESSAGE_DB.push({ role: "assistant", content: rawResult });

      console.log(
        `🤖 [Iteration ${iterations}] ${parsedResult.step}: ${parsedResult.text}`,
      );

      if (parsedResult.step && parsedResult.step.toUpperCase() === "OUTPUT") {
        return res.json({ reply: parsedResult.text });
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
