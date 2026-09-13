import type { AIProvider, StudyAssistantReply } from "@/lib/ai/types";

abstract class FutureRemoteProvider implements AIProvider {
  abstract id: string;
  abstract name: string;
  mode = "remote" as const;
  isAvailable() { return false; }
  async chat(): Promise<StudyAssistantReply> {
    return {
      text: `${this.name} is not configured. EduFlow is currently using the Local Study Assistant. Remote providers must be connected through the server-side /api/ai/chat route with environment variables.`,
      sourceLabel: "Unavailable",
    };
  }
}

export class OpenAIProvider extends FutureRemoteProvider {
  id = "openai";
  name = "OpenAI Provider";
}

export class GeminiProvider extends FutureRemoteProvider {
  id = "gemini";
  name = "Gemini Provider";
}

export class FutureProvider extends FutureRemoteProvider {
  id = "future";
  name = "Future Provider";
}
