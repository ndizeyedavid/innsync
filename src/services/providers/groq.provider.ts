import { fetch } from "expo/fetch";
import CONFIG from "../../constants/config";
import { AiProvider, MessageRole } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export class GroqProvider implements AiProvider {
  readonly name = "Groq";
  private model: string;
  private apiKey: string;

  constructor() {
    this.model = CONFIG.EXTERNAL.GROQ.MODEL;
    this.apiKey = CONFIG.EXTERNAL.GROQ.API_KEY;
  }

  async tripPlan(
    query: string,
    history: { role: MessageRole; text: string }[],
    onChunk: (text: string) => void,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Groq API key not configured");
    }

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: m.text,
      })),
      { role: "user" as const, content: query },
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.8,
        max_completion_tokens: 4096,
        top_p: 1,
        stream: true,
        stop: null,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`Groq API error ${response.status}: ${errBody}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Groq response body is not readable");

    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;
            onChunk(content);
          }
        } catch {
          // skip malformed JSON chunks
        }
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
