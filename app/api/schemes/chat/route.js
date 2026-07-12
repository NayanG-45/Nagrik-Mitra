import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { query, contextData, language } = await request.json();
    const sarvamApiKey = process.env.SARVAM_API_KEY;

    if (!query) {
      return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });
    }

    const systemPrompt = `You are a helpful, multilingual government scheme assistant for the "Nagrik Mitra" portal.
Your goal is to answer the citizen's questions about government welfare schemes accurately.

You have been provided with the following Local Catalog Context Data about schemes relevant to the user:
---
${contextData ? JSON.stringify(contextData, null, 2) : "No specific local context provided."}
---

CRITICAL INSTRUCTIONS:
1. If the user's question relates to the provided Local Catalog Context Data, answer using THAT data primarily.
2. If the user's question relates to real-world civic information NOT in the local catalog, use your general knowledge to provide accurate Indian government scheme details.
3. The user's query may be in a local language (Hindi, Hinglish, Bengali, etc.). You MUST reply in the same language as the user's query, but format your output as beautifully formatted Markdown text.
4. Keep your answer concise, clear, and highly professional. Use bullet points and bold text where appropriate to make it easy to read.
`;

    let assistantResponseText = "";

    if (sarvamApiKey && sarvamApiKey !== "placeholder") {
      try {
        const apiMessages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ];

        const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": sarvamApiKey,
          },
          body: JSON.stringify({
            model: "sarvam-30b",
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          assistantResponseText = data.choices?.[0]?.message?.content || "";
        } else {
          console.error("Sarvam API error status:", response.status);
          assistantResponseText = "Sorry, I am currently unable to reach the Sarvam AI servers. Please try again later.";
        }
      } catch (err) {
        console.error("Failed to connect to Sarvam Chat API:", err);
        assistantResponseText = "An error occurred while connecting to the AI. Please check your network.";
      }
    } else {
      assistantResponseText = "This is a fallback response. Sarvam API Key is not configured.";
    }

    return NextResponse.json({
      success: true,
      reply: assistantResponseText,
    });
  } catch (error) {
    console.error("Error in schemes chat route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
