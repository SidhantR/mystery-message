import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { error } from "console";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      message
    });

    const stream = OpenAIStream(response);

    return new StreamingTextResponse(stream);
  } catch (err) {
    if (err instanceof OpenAI.APIError) {
      const { name, status, headers, message } = err;
      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      console.error("An unexpected error occured", err);
      throw error;
    }
  }
}
