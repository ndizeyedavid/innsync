export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
}

export interface AiProvider {
  readonly name: string;
  tripPlan(
    query: string,
    history: { role: MessageRole; text: string }[],
    onChunk: (text: string) => void,
  ): Promise<string>;
}
