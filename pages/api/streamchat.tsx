import { ChatGPTMessage, OpenAIStream, OpenAIStreamPayload } from "../../utils/openAiStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge",
};

export default async function (req: Request): Promise<Response> {
  const { chatHistory } = (await req.json()) as {
    chatHistory?: ChatGPTMessage[];
  };

  if (!chatHistory) {
    return new Response("No chatHistory in the request", { status: 400 });
  }

  // Fine tuned model name: davinci:ft-personal:test1-2023-06-21-06-23-44

  const payload: OpenAIStreamPayload = {
    model: "davinci:ft-personal:test1-2023-06-21-06-23-44",
    messages: chatHistory,
    temperature: 0.2,
    // top_p: 1,
    // frequency_penalty: 0,
    // presence_penalty: 0,
    max_tokens: 500,
    stream: true,
    // n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
}
