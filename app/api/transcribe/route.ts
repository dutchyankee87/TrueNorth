import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as Blob;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    const deepgram = createClient(apiKey);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-2",
        language: "en-US",
        smart_format: true,
        punctuate: true,
      }
    );

    if (error) {
      console.error("Deepgram error:", error);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    const transcript =
      result.results?.channels[0]?.alternatives[0]?.transcript || "";

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to transcribe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
