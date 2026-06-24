import { AiProvider, ChatMessage, MessageRole } from "./providers/types";
import { GeminiProvider } from "./providers/gemini.provider";
import { GroqProvider } from "./providers/groq.provider";

export type { ChatMessage };

const SUGGESTED_PROMPTS = [
  "Plan a 3-day beach getaway with a budget of $800",
  "I want a weekend trip focused on nature and hiking",
  "Plan a family-friendly 5-day trip with kids aged 6 and 9",
  "Romantic anniversary weekend, luxury budget, fine dining",
];

type ProviderName = "groq" | "gemini";

class AiService {
  private providers: Map<ProviderName, AiProvider> = new Map();
  private active: ProviderName = "groq";

  constructor() {
    this.providers.set("groq", new GroqProvider());
    this.providers.set("gemini", new GeminiProvider());
  }

  get activeProvider(): string {
    return this.providers.get(this.active)?.name || "Groq";
  }

  setProvider(name: ProviderName): void {
    if (this.providers.has(name)) {
      this.active = name;
    }
  }

  getSuggestedPrompts(): string[] {
    return SUGGESTED_PROMPTS;
  }

  async tripPlan(
    query: string,
    history: { role: MessageRole; text: string }[],
    onChunk: (text: string) => void,
  ): Promise<string> {
    const provider = this.providers.get(this.active);
    if (!provider) throw new Error(`Provider "${this.active}" not found`);

    return provider.tripPlan(query, history, onChunk);
  }
}

const aiService = new AiService();
export default aiService;
