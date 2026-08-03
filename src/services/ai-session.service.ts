import * as SecureStore from "expo-secure-store";
import { ChatMessage } from "./ai.service";

const INDEX_KEY = "ai_sessions_index";
const SESSION_PREFIX = "ai_session_";

export interface AiSessionMeta {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AiSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

class AiSessionService {
  private async getIndex(): Promise<AiSessionMeta[]> {
    try {
      const raw = await SecureStore.getItemAsync(INDEX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private async saveIndex(index: AiSessionMeta[]): Promise<void> {
    await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(index));
  }

  private sessionKey(id: string): string {
    return `${SESSION_PREFIX}${id}`;
  }

  async listSessions(): Promise<AiSessionMeta[]> {
    const index = await this.getIndex();
    return index.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async loadSession(id: string): Promise<AiSession | null> {
    try {
      const raw = await SecureStore.getItemAsync(this.sessionKey(id));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveSession(session: AiSession): Promise<void> {
    await SecureStore.setItemAsync(
      this.sessionKey(session.id),
      JSON.stringify(session),
    );

    const index = await this.getIndex();
    const existing = index.findIndex((m) => m.id === session.id);
    const meta: AiSessionMeta = {
      id: session.id,
      title: session.title,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };

    if (existing >= 0) {
      index[existing] = meta;
    } else {
      index.push(meta);
    }

    await this.saveIndex(index);
  }

  async deleteSession(id: string): Promise<void> {
    await SecureStore.deleteItemAsync(this.sessionKey(id));

    const index = await this.getIndex();
    const filtered = index.filter((m) => m.id !== id);
    await this.saveIndex(filtered);
  }

  createSession(): AiSession {
    return {
      id: generateId(),
      title: "New chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  generateTitle(messages: ChatMessage[]): string {
    const firstUserMsg = messages.find((m) => m.role === "user");
    if (!firstUserMsg) return "New chat";
    const text = firstUserMsg.text;
    return text.length > 50 ? text.slice(0, 50) + "..." : text;
  }
}

export default new AiSessionService();
