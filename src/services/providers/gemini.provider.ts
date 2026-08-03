import { GoogleGenAI } from "@google/genai";
import CONFIG from "../../constants/config";
import { AiProvider, MessageRole } from "./types";

export class GeminiProvider implements AiProvider {
  readonly name = "Gemini";
  private client: GoogleGenAI | null = null;
  private model: string;

  constructor() {
    this.model = CONFIG.EXTERNAL.GEMINI.MODEL;
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = CONFIG.EXTERNAL.GEMINI.API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API key not configured");
      }
      this.client = new GoogleGenAI({ apiKey });
    }
    return this.client;
  }

  async tripPlan(
    query: string,
    history: { role: MessageRole; text: string }[],
    onChunk: (text: string) => void,
  ): Promise<string> {
    const client = this.getClient();

    const contents = [
      { role: "user" as const, parts: [{ text: SYSTEM_PROMPT }] },
      {
        role: "model" as const,
        parts: [{ text: "Understood. I'm InnSync AI, ready to help plan trips." }],
      },
      ...history.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: m.text }],
      })),
      { role: "user" as const, parts: [{ text: query }] },
    ];

    let fullResponse = "";

    const stream = await client.models.generateContentStream({
      model: this.model,
      contents,
      config: { temperature: 0.8, maxOutputTokens: 4096 },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        fullResponse += text;
        onChunk(text);
      }
    }

    return fullResponse;
  }
}

const SYSTEM_PROMPT = `You are InnSync AI, a travel itinerary planner. Your job is to help users plan trips by suggesting activities, hotels, dining, and logistics.

When a user describes a trip they want, respond with a clear, structured plan covering:
- Destination & duration
- Day-by-day suggested itinerary with activities
- Hotel/accommodation suggestions matching their budget
- Dining recommendations
- Estimated budget breakdown (keep it realistic but flexible)
- Practical tips (best time to visit, packing, transport)

Keep responses conversational but structured. Use markdown (bold for days/headings, bullet points for items).
If a user asks about something outside trip planning (like code, general knowledge), politely redirect back to travel planning.
Be enthusiastic and helpful — this is a vacation planner!`;
