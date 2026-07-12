import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const sarvamApiKey = process.env.SARVAM_API_KEY;

    // Check if it is a JSON request (Text-to-Speech) or multipart (Speech-to-Text)
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // --- TEXT TO SPEECH (TTS) ---
      const { text, languageCode } = await request.json();

      if (!text) {
        return NextResponse.json({ success: false, error: "Text is required for TTS" }, { status: 400 });
      }

      if (sarvamApiKey && sarvamApiKey !== "placeholder") {
        try {
          const response = await fetch("https://api.sarvam.ai/text-to-speech", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "api-subscription-key": sarvamApiKey,
            },
            body: JSON.stringify({
              text: text,
              target_language_code: languageCode || "hi-IN",
              speaker: "ritu", // Standard high-quality female voice for bulbul:v3
              model: "bulbul:v3",
              speech_sample_rate: 16000,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
              success: true,
              audio: data.audios?.[0] || data.audio || "", // returns base64 audio
            });
          } else {
            const errText = await response.text();
            console.error("Sarvam TTS API returned error:", response.status, errText);
            return NextResponse.json({
              success: false,
              error: `Sarvam API returned status ${response.status}`,
              mock: true,
            });
          }
        } catch (err) {
          console.error("Failed to connect to Sarvam TTS API:", err);
          return NextResponse.json({ success: false, error: err.message, mock: true });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: "Sarvam AI API key is missing",
          mock: true,
        });
      }
    } else {
      // --- SPEECH TO TEXT (STT) ---
      const formData = await request.formData();
      const audioFile = formData.get("file");
      const languageCode = "unknown"; // Always use auto-detection for voice inputs

      if (!audioFile) {
        return NextResponse.json({ success: false, error: "Audio file is required for STT" }, { status: 400 });
      }

      if (sarvamApiKey && sarvamApiKey !== "placeholder") {
        try {
          // Prepare form data for Sarvam API
          const sarvamFormData = new FormData();
          
          // Append the file as a Blob/File
          sarvamFormData.append("file", audioFile);
          sarvamFormData.append("model", "saaras:v3");
          sarvamFormData.append("language_code", languageCode);
          
          // Use 'transcribe' mode to keep the audio in the native language
          sarvamFormData.append("mode", "transcribe"); 

          const response = await fetch("https://api.sarvam.ai/speech-to-text", {
            method: "POST",
            headers: {
              "api-subscription-key": sarvamApiKey,
            },
            body: sarvamFormData,
          });

          if (response.ok) {
            const data = await response.json();
            return NextResponse.json({
              success: true,
              transcript: data.transcript,
            });
          } else {
            const errText = await response.text();
            console.error("Sarvam STT API returned error:", response.status, errText);
            return NextResponse.json({
              success: false,
              error: `Sarvam STT API returned status ${response.status}`,
              mock: true,
              transcript: "[Speech detected: Please check your street drainage issue. This was parsed as mock transcription due to API limit.]",
            });
          }
        } catch (err) {
          console.error("Failed to connect to Sarvam STT API:", err);
          return NextResponse.json({
            success: false,
            error: err.message,
            mock: true,
            transcript: "[Connection issue: Please look into the electricity fluctuations on our street. Mock fallback transcript.]",
          });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: "Sarvam AI API key is missing",
          mock: true,
          transcript: "[Mock Translation: Water leakage has flooded Main Street. Add your Sarvam API Key to test real-time speech input.]",
        });
      }
    }
  } catch (error) {
    console.error("Error in complaints voice route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
