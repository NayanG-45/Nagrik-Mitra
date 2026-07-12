import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const languageNames = {
  "hi-IN": { name: "Hindi", script: "Hindi Devanagari script" },
  "en-IN": { name: "English", script: "English Latin script" },
  "bn-IN": { name: "Bengali", script: "Bengali script" },
  "te-IN": { name: "Telugu", script: "Telugu script" },
  "ta-IN": { name: "Tamil", script: "Tamil script" },
  "mr-IN": { name: "Marathi", script: "Marathi Devanagari script" },
  "gu-IN": { name: "Gujarati", script: "Gujarati script" },
  "kn-IN": { name: "Kannada", script: "Kannada script" },
  "ml-IN": { name: "Malayalam", script: "Malayalam script" },
  "pa-IN": { name: "Punjabi", script: "Gurmukhi script" },
  "or-IN": { name: "Odia", script: "Odia script" },
  "ur-IN": { name: "Urdu", script: "Urdu Arabic script" }
};

export async function POST(request) {
  try {
    const { messages, language } = await request.json();
    const sarvamApiKey = process.env.SARVAM_API_KEY;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, error: "Messages array required" }, { status: 400 });
    }

    const langCode = language || "hi-IN";
    const langInfo = languageNames[langCode] || languageNames["hi-IN"];
    const currentDateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    // Retrieve citizen name from their Supabase profile row as default
    let citizenName = "Citizen";
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile?.full_name) {
          citizenName = profile.full_name;
        }
      }
    } catch (authErr) {
      console.warn("Could not retrieve authenticated citizen profile name:", authErr);
    }

    // System prompt instructing the AI clerk how to behave
    const systemPrompt = `You are a helpful and polite government office desk clerk at the "Nagrik Mitra" citizen support portal.
Your goal is to guide citizens in drafting a formal complaint for submission on official Indian portals.

CRITICAL INSTRUCTIONS:
1. Speak in a helpful, friendly, conversational clerk tone.
2. Collect the following details:
   - What the core issue is.
   - The full name of the person on whose behalf the complaint is being filed.
   - The citizen's full postal/home address (mandatory - you MUST ask for this if not provided).
   - The location/branch/office where the issue occurred.
   - When the issue started (timeline).
   - Any registration numbers, application IDs, PNRs, or Consumer numbers if applicable.
3. Ask for details ONE-BY-ONE. Do NOT ask for multiple things at once.
4. IMPORTANT LANGUAGE RULE: The citizen has selected the language: "${langInfo.name}" (locale: "${langCode}"). 
   - You MUST respond in the "${langInfo.name}" language using the native "${langInfo.script}" for all conversational turns (the intermediate "reply" text).
   - Do NOT use Romanized text, Latin characters, or English letters for the conversational "reply" value.
   - However, the final completed complaint ("drafted_complaint") MUST ALWAYS be written in formal, professional English so that it can be copied and pasted directly into official government portals.
5. NO PLACEHOLDERS: Ask the citizen for their name and full address. You MUST format the letter professionally, matching this structure:
   
   Subject: [Clear topic of complaint] - [ID if any]
   
   To,
   The [Department Head Title]
   [Department Name/Branch]
   
   Date: ${currentDateStr}
   
   From:
   [Citizen Name]
   [Citizen's full postal address as provided during chat]
   
   Subject: [Formal subject description]
   
   Respected Sir/Madam,
   
   [Formal body text describing the issue, timeline, and location]
   
   * **Applicant Name:** [Citizen Name]
   * **Application ID:** [ID if any]
   * **Date of Application:** [Date of Application / Timeline]
   * **Location of Application:** [Location]
   
   [Formal request for action]
   
   Thank you for your time and assistance.
   
   Sincerely,
   [Citizen Name]
   [Citizen Name's typed signature]

   The letter must contain NO placeholders (e.g. no '[Freny's full address]' or '[Freny's Signature]' or '[Current Date]'). Write the name and signature dynamically as provided.
6. Auto-classify the department and website based on the issue:
   - Driving license / RTO -> Regional Transport Office (RTO), Sarathi Parivahan
   - Passport issues -> Ministry of External Affairs, Passport Seva
   - Aadhaar updates -> Unique Identification Authority of India (UIDAI)
   - Water / drainage / garbage / street lights -> Municipal Corporation / Board
   - Electricity / bills -> Electricity Board / State Power Distribution Co.
   - Provident Fund / Pension -> Employees' Provident Fund Organisation (EPFO)
   - Train / Railway -> Indian Railways, RailMadad
   - Consumer fraud / e-commerce disputes -> National Consumer Helpline (NCH)
   - Scholarships -> National Scholarship Portal (NSP)
   - Voter ID / ECI -> Election Commission of India (ECI)
   - Income tax / PAN -> Income Tax Department / NSDL
   - Land registry / Bhulekh -> Revenue Department / Land Records Office
   - LPG Gas Subsidy -> Ministry of Petroleum & Natural Gas / MyLPG
   - Speed Post / Postal delay -> Department of Posts / India Post
   - Ayushman Card / Health -> National Health Authority (NHA)
   - Ration Card / PDS -> Department of Food & Public Distribution (PDS)
   - Police / FIR -> State Police Department
   - CBSE / Marks Card correction -> Central Board of Secondary Education (CBSE)
   - DigiLocker document sync -> DigiLocker Support Team
   - Jal Jeevan Mission / Water Tap -> Department of Drinking Water & Sanitation
   - GST registration / tax -> Goods and Services Tax (GST) Portal
   - MCA DIN/Filing -> Ministry of Corporate Affairs (MCA)
   - E-Court litigation -> Department of Justice / E-Courts
   - NEET / JEE / NTA Exams -> National Testing Agency (NTA), exams.nta.ac.in
   - State CM Helpline / State level grievances -> State CM Grievance Cell (Jan Sunwai, Spandana, IGRS, etc.)

7. OUTPUT FORMAT: You must ONLY output a valid JSON object. Do not output any thinking or markdown block wrappers.
Example of active chat turn (intake NOT complete):
{
  "intake_complete": false,
  "reply": "नमस्ते, मैं शिकायत दर्ज करने में आपकी सहायता करूँगा। सबसे पहले, कृपया मुझे उनका नाम बताएं जिनके लिए यह शिकायत दर्ज की जा रही है।"
}

Example of final turn (intake complete):
{
  "intake_complete": true,
  "title": "Short title of the complaint",
  "drafted_complaint": "Formal complaint text goes here in English...",
  "native_explanation": "Summary of the complaint in the native language...",
  "department": "Name of the government department...",
  "urgency": "medium",
  "submission_steps": [
    "Step 1: Go to...",
    "Step 2: Log in..."
  ]
}`;

    let assistantResponseText = "";
    let callSucceeded = false;

    if (sarvamApiKey && sarvamApiKey !== "placeholder") {
      try {
        const apiMessages = [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text || m.content || "",
          })),
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
          callSucceeded = true;
        } else {
          console.error("Sarvam Chat API returned error status:", response.status);
        }
      } catch (err) {
        console.error("Failed to connect to Sarvam Chat API:", err);
      }
    }

    if (!callSucceeded) {
      console.log("Using localized fallback clerk logic for language:", langCode);
      assistantResponseText = runFallbackClerk(messages, langCode, citizenName);
    }

    try {
      let jsonString = assistantResponseText.trim();
      const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = jsonString.match(codeBlockRegex);
      if (match) {
        jsonString = match[1];
      }

      const parsed = JSON.parse(jsonString);
      return NextResponse.json({
        success: true,
        ...parsed,
      });
    } catch (parseError) {
      // If parsing failed, construct a valid reply object from the raw text
      return NextResponse.json({
        success: true,
        intake_complete: false,
        reply: assistantResponseText || "Could you share more details?",
      });
    }
  } catch (error) {
    console.error("Error in complaints chat route:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Stateful fallback rule-based clerk to simulate multi-turn intake
function runFallbackClerk(messages, langCode, defaultCitizenName) {
  const userMessages = messages.filter((m) => m.sender === "user");
  const lastUserMsg = userMessages[userMessages.length - 1]?.text?.toLowerCase() || "";
  const allUserText = userMessages.map((m) => m.text).join(" ").toLowerCase();

  const hasKeyword = (keywords) => keywords.some((kw) => allUserText.includes(kw));

  const hasIssue = hasKeyword(["water", "pipe", "leak", "sewage", "drain", "passport", "delay", "electricity", "power", "road", "garbage", "trash", "meter", "billing", "license", "driving", "rto", "transport", "dl", "rc", "vehicle", "aadhaar", "aadhar", "uidai", "epfo", "provident", "uan", "train", "railway", "irctc", "railmadad", "consumer", "refund", "fraud", "scholarship", "nsp", "voter", "epic", "election", "tax", "pan", "itr", "land", "bhulekh", "mutation", "lpg", "gas", "post office", "speed post", "ayushman", "pmjay", "ration", "pds", "police", "fir", "cbse", "digilocker", "jal jeevan", "gst", "mca", "court", "neet", "jee", "cuet", "nta", "admit card", "exam", "cm helpline", "igrs", "spandana", "jan sunwai", "state grievance", "chief minister"]);
  const hasLocation = hasKeyword(["street", "road", "ward", "colony", "area", "address", "phase", "sector", "nagar", "office", "delhi", "mumbai", "bengaluru", "center", "rto", "psk", "station", "train", "district", "village", "taluka", "tehsil", "hospital", "court", "exam center", "state"]);
  const hasTimeline = hasKeyword(["days", "week", "month", "since", "yesterday", "hours", "long time", "delay", "year", "march"]);
  const hasAddress = hasKeyword(["house", "flat", "apartments", "block", "floor", "society", "colony", "postal code", "pincode", "rajkot"]);

  const userWantsDraft = lastUserMsg.includes("draft") || lastUserMsg.includes("complaint") || lastUserMsg.includes("done") || lastUserMsg.includes("complete") || lastUserMsg.includes("bas") || lastUserMsg.includes("likh");

  // Localized questions set
  const localQuestions = {
    "hi-IN": {
      qName: "निश्चित रूप से, मैं इस शिकायत को तैयार करने में मदद करूँगा। सबसे पहले, कृपया उस व्यक्ति का पूरा नाम बताएं जिसके नाम पर यह शिकायत दर्ज की जा रही है?",
      qAddress: "धन्यवाद। कृपया मुझे अपना पूरा डाक पता (पोस्टल एड्रेस) बताएं ताकि इसे औपचारिक शिकायत पत्र में जोड़ा जा सके?",
      qLocation: "ठीक है। यह समस्या कहाँ हो रही है? कृपया कार्यालय, स्टेशन, परीक्षा केंद्र, सड़क या स्थान का नाम बताएं।",
      qTimeline: "स्थान समझ गया। आप इस समस्या का सामना कब से कर रहे हैं? (जैसे 3 दिन, पिछले हफ्ते से, आदि)",
      qFinal: "ठीक है। इससे और कौन प्रभावित है? यदि कोई अन्य विवरण नहीं है, तो औपचारिक शिकायत पत्र देखने के लिए 'Draft it' कहें!"
    },
    "bn-IN": {
      qName: "নিশ্চয়ই, আমি এই অভিযোগটি ড্রাফ্ট করতে সাহায্য করব। প্রথমে, অনুগ্রহ করে সেই ব্যক্তির পুরো নাম বলুন যার নামে এই অভিযোগটি নথিভুক্ত করা হচ্ছে?",
      qAddress: "ধন্যবাদ। অনুগ্রহ করে আপনার সম্পূর্ণ ডাক ঠিকানা (ঠিকানা) দিন যাতে এটি আনুষ্ঠানিক অভিযোগ পত্রে যুক্ত করা যায়?",
      qLocation: "ঠিক আছে। এই সমস্যাটি কোথায় হচ্ছে? অনুগ্রহ করে রাস্তা, স্টেশন, পরীক্ষা কেন্দ্র বা অফিসের ঠিকানা বলুন।",
      qTimeline: "ঠিকানা পেয়েছি। আপনি কতদিন ধরে এই সমস্যার মুখোমুখি হচ্ছেন? (যেমন ৩ দিন, গত সপ্তাহ থেকে, ইত্যাদি)",
      qFinal: "বুঝতে পেরেছি। এটি দ্বারা আর কে প্রভাবিত হয়েছে? আর কোনো বিবরণ না থাকলে, ড্রাফ্ট দেখতে 'Draft it' বলুন!"
    },
    "te-IN": {
      qName: "తప్పకుండా, నేను ఈ ఫిర్యాదును సిద్ధం చేయడానికి సహాయం చేస్తాను. మొదటగా, ఈ ఫిర్యాదు ఎవరి తరపున దాఖలు చేయబడుతుందో వారి పూర్తి పేరును తెలియజేస్తారా?",
      qAddress: "ధన్యవాదాలు. అధికారిక పత్రంలో చేర్చడానికి దయచేసి మీ పూర్తి చిరునామాను తెలియజేస్తారా?",
      qLocation: "సరే. ఈ సమస్య ఎక్కడ జరుగుతోంది? దయచేసి వీధి, పరీక్షా కేంద్రం లేదా కార్యాలయ స్థానాన్ని పేర్కొనండి.",
      qTimeline: "స్థలాన్ని గుర్తించాను. మీరు ఈ సమస్యను ఎప్పటి నుండి ఎదుర్కొంటున్నారు? (ఉదా. 3 రోజులు, గత వారం నుండి, మొదలైనవి)",
      qFinal: "అర్థమైంది. దీని వల్ల ఇంకెవరు ప్రభావితమయ్యారు? ఇతర వివరాలు ఏవీ లేకపోతే, డ్రాఫ్ట్ చూడటానికి 'Draft it' అని చెప్పండి!"
    },
    "ta-IN": {
      qName: "நிச்சயமாக, நான் இந்த புகாரை எழுத உதவுகிறேன். முதலில், இந்த புகார் யாருடைய பெயரில் பதிவு செய்யப்படுகிறது என்பதற்கான முழு பெயரை கூற முடியுமா?",
      qAddress: "நன்றி. முறையான கடிதத்தில் சேர்க்க உங்கள் முழு அஞ்சல் முகவரியை வழங்க முடியுமா?",
      qLocation: "சரி. இந்த பிரச்சனை எங்கே நடக்கிறது? தயவுசெய்து தெரு, தேர்வு மையம் அல்லது அலுவலக முகவரியை குறிப்பிடவும்.",
      qTimeline: "முகவரியை பெற்றுக்கொண்டேன். இந்த பிரச்சனையை நீங்கள் எப்போதிருந்து எதிர்கொள்கிறீர்கள்? (எ.கா. 3 நாட்கள், கடந்த வாரம் முதல்)",
      qFinal: "புரிந்துக்கொண்டேன். இதனால் வேறு யார் பாதிக்கப்பட்டுள்ளனர்? வேறு விவரங்கள் இல்லை என்றால், கடிதத்தை பார்க்க 'Draft it' என்று சொல்லவும்!"
    },
    "mr-IN": {
      qName: "नक्कीच, मी ही तक्रार तयार करण्यात मदत करतो. सर्वात आधी, कृपया त्या व्यक्तीचे पूर्ण नाव सांगा ज्यांच्या वतीने ही तक्रार दाखल केली जात आहे?",
      qAddress: "धन्यवाद. कृपया आपला पूर्ण पत्ता सांगा जेणेकरून तो औपचारिक तक्रार पत्रात जोडता येईल?",
      qLocation: "ठीक आहे. ही समस्या कुठे होत आहे? कृपया रस्ता, परीक्षा केंद्र किंवा कार्यालयाचे ठिकाण सांगा.",
      qTimeline: "ठिकाण समजले. आपण या समस्येचा सामना कधीपासून करत आहात? (उदा. ३ दिवस, गेल्या आठवड्यापासून)",
      qFinal: "समजले. यामुळे इतर कोणावर परिणाम झाला आहे का? अतिरिक्त माहिती नसल्यास, मसुदा पाहण्यासाठी 'Draft it' म्हणा!"
    },
    "gu-IN": {
      qName: "ચોક્કસ, હું આ ફરિયાદ ડ્રાફ્ટ કરવામાં મદદ કરીશ. સૌથી પહેલા, કૃપા કરીને તે વ્યક્તિનું પૂરું નામ જણાવો જેના વતી આ ફરિયાદ દાખલ કરવામાં આવી રહી છે?",
      qAddress: "આભાર. કૃપા કરીને તમારું પૂરું સરનામું જણાવો જેથી તેને ઔપચારિક ફરિયાદ પત્રમાં ઉમેરી શકાય?",
      qLocation: "સારું. આ સમસ્યા ક્યાં થઈ રહી છે? કૃપા કરીને રસ્તા, પરીક્ષા કેન્દ્ર અથવા કચેરીનું સરનામું જણાવો.",
      qTimeline: "સરનામું સમજાઈ ગયું. આપ આ સમસ્યાનો ક્યારથી સામનો કરી રહ્યા છો? (જેમ કે ૩ દિવસ, ગયા અઠવાડિયાથી)",
      qFinal: "સમજાઈ ગયું. આનાથી અન્ય કોણ પ્રભાવિત થયું છે? જો કોઈ અન્ય વિગત ન હોય, તો પત્ર જોવા માટે 'Draft it' કહો!"
    },
    "kn-IN": {
      qName: "ಖಂಡಿತ, ನಾನು ಈ ದೂರನ್ನು ಬರೆಯಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ಮೊದಲಿಗೆ, ಯಾರ ಪರವಾಗಿ ಈ ದೂರನ್ನು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆಯೋ ಅವರ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಸುವಿರಾ?",
      qAddress: "ಧನ್ಯವಾದಗಳು. ದೂರು ಪತ್ರದಲ್ಲಿ ಸೇರಿಸಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ವಿಳಾಸವನ್ನು ತಿಳಿಸುವಿರಾ?",
      qLocation: "ಸರಿ. ಈ ದೂರು ಎಲ್ಲಿ ನಡೆಯುತ್ತಿದೆ? ದಯವಿಟ್ಟು ರಸ್ತೆ, ಪರೀಕ್ಷಾ ಕೇಂದ್ರ ಅಥವಾ ಕಚೇರಿಯ ಸ್ಥಳವನ್ನು ತಿಳಿಸಿ.",
      qTimeline: "ಸ್ಥಳ ತಿಳಿಯಿತು. ನೀವು ಈ ಸಮಸ್ಯೆಯನ್ನು ಎಂದಿನಿಂದ ಎದುರಿಸುತ್ತಿದ್ದೀರಿ? (ಉದಾಹರಣೆಗೆ ೩ ದಿನಗಳು, ಕಳೆದ ವಾರದಿಂದ)",
      qFinal: "ತಿಳಿಯಿತು. ಇದರಿಂದ ಬೇರೆ ಯಾರಿಗೆ ತೊಂದರೆಯಾಗಿದೆ? ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಇಲ್ಲದಿದ್ದರೆ, ಪತ್ರವನ್ನು ನೋಡಲು 'Draft it' ಎಂದು ಹೇಳಿ!"
    },
    "ml-IN": {
      qName: "തീർച്ചയായും, ഈ പരാതി തയ്യാറാക്കാൻ ഞാൻ സഹായിക്കാം. ആദ്യം, ഈ പരാതി ആരുടെ പേരിലാണോ നൽകുന്നത് അവരുടെ മുഴുവൻ പേര് പറയാമോ?",
      qAddress: "നന്ദി. ദൂരൂഹത ഒഴിവാക്കാൻ നിങ്ങളുടെ പൂർണ്ണ വിലാസം കൂടി നൽകാമോ?",
      qLocation: "ശരി. ഈ പ്രശ്നം എവിടെയാണ് സംഭവിക്കുന്നത്? ദയവായി തെരുവോ പരീക്ഷാ കേന്ദ്രമോ ഓഫീസോ പറയുക.",
      qTimeline: "വിലാസം മനസ്സിലായി. ഈ പ്രശ്നം നിങ്ങൾ എന്ന് മുതലാണ് നേരിടുന്നത്? (ഉദാ. 3 ദിവസം, കഴിഞ്ഞ ആഴ്ച മുതൽ)",
      qFinal: "മനസ്സിലായി. ഇതിനാൽ മറ്റാർക്കാണ് ബുദ്ധിമുട്ട് നേരിട്ടത്? മറ്റ് വിവരങ്ങൾ ഇല്ലെങ്കിൽ, പരാതി രൂപം കാണാൻ 'Draft it' എന്ന് പറയുക!"
    },
    "pa-IN": {
      qName: "ਯਕੀਨਨ, ਮੈਂ ਸ਼ਿਕਾਇਤ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਾਂਗਾ। ਸਭ ਤੋਂ ਪਹਿਲਾਂ, ਕਿਰਪਾ ਕਰਕੇ ਉਸ ਵਿਅਕਤੀ ਦਾ ਪੂਰਾ ਨਾਮ ਦੱਸੋ ਜਿਸਦੇ ਨਾਮ 'ਤੇ ਇਹ ਸ਼ਿਕਾਇਤ ਦਰਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ?",
      qAddress: "ਧੰਨਵਾਦ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਪਤਾ ਦੱਸੋ ਤਾਂ ਜੋ ਇਸਨੂੰ ਸ਼ਿਕਾਇਤ ਪੱਤਰ ਵਿੱਚ ਜੋੜਿਆ ਜਾ ਸਕੇ?",
      qLocation: "ਠੀਕ ਹੈ। ਇਹ ਸਮੱਸਿਆ ਕਿੱਥੇ ਆ ਰਹੀ ਹੈ? ਕਿਰਪਾ ਕਰਕੇ ਸੜਕ, ਪ੍ਰੀਖਿਆ ਕੇਂਦਰ ਜਾਂ ਦਫ਼ਤਰ ਦਾ ਪਤਾ ਦੱਸੋ।",
      qTimeline: "ਪਤਾ ਮਿਲ ਗਿਆ ਹੈ। ਤੁਸੀਂ ਕਦੋਂ ਤੋਂ ਇਸ ਸਮੱਸਿਆ ਦਾ ਸਾਹਮਣਾ ਕਰ ਰਹੇ ਹੋ? (ਜਿਵੇਂ ਕਿ 3 ਦਿਨ, ਪਿਛਲੇ ਹਫ਼ਤੇ ਤੋਂ)",
      qFinal: "ਸਮਝ ਗਿਆ। ਇਸ ਨਾਲ ਹੋਰ ਕੌਣ ਪ੍ਰਭਾਵਿਤ ਹੋਇਆ ਹੈ? ਜੇ ਹੋਰ ਕੋਈ ਵੇਰਵਾ ਨਹੀਂ ਹੈ, ਤਾਂ ਸ਼ਿਕਾਇਤ ਪੱਤਰ ਦੇਖਣ ਲਈ 'Draft it' ਕਹੋ!"
    },
    "or-IN": {
      qName: "ନିଶ୍ଚିତ ଭାବରେ, ମୁଁ ଏହି ଅଭିଯୋਗ ଡ୍ରାଫ୍ଟ କରିବାରେ ସାହାଯ្យ କରିବି | ପ୍ରଥମେ, ଦୟାକରି ସେହି ବ୍ୟକ୍ତିଙ୍କ ସମ୍ପୂର୍ଣ୍ण ନାମ କୁହନ୍ତୁ ଯାହାଙ୍କ ନାମରେ ଏହି ଅଭିଯୋଗ ଦାଖଲ କରାଯାଉଛି?",
      qAddress: "ଧନ୍ୟବାଦ | ଅଭିଯୋଗ ପତ୍ରରେ ଯୋଡିବା ପାଇଁ ଦୟାକରି ଆପଣଙ୍କର ସମ୍ପୂର୍ଣ୍ଣ ଠିକଣା ପ୍ରଦାନ କରନ୍ତୁ |",
      qLocation: "ଠିକ୍ ଅଛି | ଏହି ସମସ୍ୟା କେଉଁଠାରେ ହେଉଛି? ଦୟାକରି ରାସ୍ତା, ପରୀକ୍ଷା କେନ୍ଦ୍ର କିମ୍ବା କାର୍ଯ୍ୟାଳୟର ଠିକଣା କୁହନ୍ତୁ |",
      qTimeline: "ଠିକଣା ବୁଝିଲି | ଆପଣ କେବେଠାରୁ ଏହି ସମସ୍ୟାର ସମ୍ମୁଖୀନ ହେଉଛନ୍ତି? (ଯେପରିକି ୩ ଦିନ, ଗତ ସପ୍ତାହରୁ)",
      qFinal: "ବୁଝିଲି | ଏହା ଦ୍ୱାରା ଅନ୍ୟ କିଏ ପ୍ରଭାବିତ ହୋଇଛନ୍ତି? ଯଦਿ ଅନ୍ୟ କୌଣସି ବିବରଣୀ ନାହିଁ, ତେବେ ଡ୍ରાଫ୍ଟ ଦେଖିବା ପାଇଁ 'Draft it' କୁହନ୍ତୁ!"
    },
    "ur-IN": {
      qName: "یقیناً، میں یہ شکایت تیار کرنے میں مدد کروں گا۔ سب سے پہلے، براہ کرم اس شخص کا پورا نام بتائیں جس کی طرف سے یہ شکایت درج کی جا رہی ہے؟",
      qAddress: "شکریہ۔ براہ کرم اپنا پورا پتہ بتائیں تاکہ اسے شکایت نامہ میں شامل کیا جا سکے؟",
      qLocation: "ٹھیک ہے۔ یہ مسئلہ کہاں پیش آ رہا ہے؟ براہ کرم سڑک، امتحانی مرکز یا دفتر کی جگہ بتائیں۔",
      qTimeline: "پتہ سمجھ گیا۔ آپ کب سے اس مسئلے کا سامنا کر رہے ہیں؟ (جیسے 3 دن، پچھلے ہفتے سے)",
      qFinal: "سمجھا۔ اس سے اور کون متاثر ہوا ہے؟ अगर कोई और विवरण नहीं है, तो मसुदा देखने के लिए 'Draft it' कहें।"
    },
    "en-IN": {
      qName: "Certainly, I will help you draft this complaint. First, could you please tell me the full name of the person on whose behalf this complaint is being filed?",
      qAddress: "Thank you. Could you please provide your full postal address so it can be added to the formal letter?",
      qLocation: "Got it. Where is this issue happening? Please specify the street name, exam center, or office location.",
      qTimeline: "Got the location. Since when are you facing this issue? (e.g. 3 days, since last week, etc.)",
      qFinal: "Understood. Who else is affected by this, or do you have any specific files/numbers I should add? If not, just say 'Draft it' to view the formal letter!"
    }
  };

  const qa = localQuestions[langCode] || localQuestions["en-IN"];

  // Extract the custom citizen name from the second user message if available
  let citizenName = defaultCitizenName;
  if (userMessages.length > 1) {
    citizenName = extractName(userMessages[1]?.text || "", defaultCitizenName);
  }

  const citizenAddress = extractAddress(allUserText);

  if ((hasIssue && hasLocation && hasTimeline && hasAddress && userMessages.length > 2) || userWantsDraft) {
    let title = "General Civic Grievance";
    let department = "Municipal Administration";
    let urgency = "medium";
    let drafted = "";
    let steps = [];

    const loc = extractLocation(allUserText);
    const time = extractTimeline(allUserText);

    const currentDateStr = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

    // 26-Portal Classification Filtering
    if (hasKeyword(["neet", "jee", "cuet", "nta", "admit card", "exam"])) {
      title = "Discrepancy / Technical Issues in NTA Entrance Exam Application";
      department = "National Testing Agency (NTA)";
      urgency = "high";
      drafted = `Subject: Urgent Request for Status Update on NTA Exam Application\n\nTo,\nThe Director General,\nNational Testing Agency (NTA),\nexams.nta.ac.in\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Complaint regarding technical issue / discrepancy in exam application status\n\nRespected Sir/Madam,\n\nI am writing to officially report an issue regarding my entrance examination (NEET/JEE/CUET). The application was registered at the center/portal from ${loc} approximately ${time} ago.\n\n* **Applicant Name:** ${citizenName}\n* **Application ID:** [Provide Roll/App ID]\n* **Date of Application:** ${time}\n* **Location of Application:** ${loc}\n\nThis is causing extreme stress as the exam dates are close. I request you to verify the application records and resolve the issue on high priority.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Open the NTA Student Services Portal (https://exams.nta.ac.in).",
        "2. Select the specific exam portal (e.g., NEET-UG / JEE-Main).",
        "3. Log in with your Application ID and Password, and navigate to the 'Grievances' page.",
        "4. Paste this drafted letter, attach your application fee receipt, and submit."
      ];
    } else if (hasKeyword(["cm helpline", "igrs", "spandana", "jan sunwai", "state grievance", "chief minister"])) {
      title = "Public Grievance Submitted to State Chief Minister Cell";
      department = "State Chief Minister's Grievance Redressal Cell";
      urgency = "medium";
      drafted = `Subject: Grievance regarding state department issues - ${loc}\n\nTo,\nThe Officer-In-Charge,\nChief Minister's Public Grievance Cell,\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Petition regarding unaddressed civic / state department issues at ${loc}\n\nRespected Sir/Madam,\n\nI am submitting this formal petition regarding an ongoing issue at ${loc} which has remained unresolved since ${time}.\n\nDespite submitting multiple complaints to the local ward / department level, no action has been taken. We request the CM Grievance Cell to intervene and direct the regional officers to resolve this concern immediately.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Open your regional State CM Helpline website (e.g. Jan Sunwai in UP, IGRS in Maharashtra, Spandana in AP).",
        "2. Click on 'Lodge Grievance' and verify your Aadhaar / Mobile OTP.",
        "3. Choose your District, Block, and specific Department.",
        "4. Paste this drafted text, link any previous ticket reference numbers, and submit."
      ];
    } else if (hasKeyword(["license", "driving", "rto", "transport", "dl", "rc", "vehicle"])) {
      title = "Delay in Issuance and Dispatch of Driving License";
      department = "Regional Transport Office (RTO) / Department of Transport";
      urgency = "medium";
      drafted = `Subject: Urgent Request for Status Update on Driving License Application\n\nTo,\nThe Regional Transport Officer (RTO),\nRTO, ${loc},\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Application for Status Update of Driving License\n\nRespected Sir/Madam,\n\nI am writing to bring to your attention a significant delay in receiving my applied driving license. The test was completed at ${loc} approximately ${time} ago.\n\n* **Applicant Name:** ${citizenName}\n* **Application ID:** [Provide Application ID]\n* **Date of Application:** ${time}\n* **Location of Application:** Regional Transport Office (RTO), ${loc}\n\nI submitted my application and it has now been ${time}. According to the standard processing time for such applications, I was expecting to receive my license by now. This delay is causing considerable inconvenience.\n\nI request you to please look into this matter and provide an update on the current status of my application. I would also like to know the expected date of issuance of my license.\n\nI am available to provide any further information or documents if required.\n\nThank you for your time and assistance.\n\nSincerely,\n${citizenName}`;
      steps = [
        "1. Visit the Sarathi Parivahan official portal (https://sarathi.parivahan.gov.in).",
        "2. Select your State, then click on 'Application Status' in the top-right corner.",
        "3. Enter your Application Number and Date of Birth to view the current processing stage.",
        "4. Copy this drafted complaint text and paste it into the feedback/complaint section or submit it via grievance form to your state transport department."
      ];
    } else if (hasKeyword(["aadhaar", "aadhar", "uidai"])) {
      title = "Aadhaar Card Generation and Update Delay";
      department = "Unique Identification Authority of India (UIDAI)";
      urgency = "medium";
      drafted = `Subject: Delay in Aadhaar Card Update / Generation\n\nTo,\nThe Assistant Director / Grievance Cell,\nUnique Identification Authority of India (UIDAI),\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Delay in Aadhaar card generation / update processing\n\nRespected Sir/Madam,\n\nI am writing to bring to your notice the delay in my Aadhaar card update/generation. The update request was submitted at the authorized Aadhaar Center in ${loc} on ${time}.\n\n* **Applicant Name:** ${citizenName}\n* **URN / Application ID:** [Provide URN]\n* **Date of Application:** ${time}\n* **Location of Application:** Aadhaar Center, ${loc}\n\nMy Update Request Number (URN) is currently showing as 'Under Process' or 'Under Audit' for an extended period. I request you to kindly check the database logs and expedite the generation process.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Open the official myAadhaar portal (https://myaadhaar.uidai.gov.in).",
        "2. Click on 'Check Enrollment & Update Status' and verify your URN.",
        "3. If status is stuck, click on 'File a Complaint' at the bottom of the home screen.",
        "4. Paste this formal draft, provide your 14-digit EID/URN, and submit."
      ];
    } else if (hasKeyword(["epfo", "provident", "uan", "withdrawal", "pension"])) {
      title = "Non-Settlement of EPF Withdrawal / UAN Activation Issue";
      department = "Employees' Provident Fund Organisation (EPFO)";
      urgency = "high";
      drafted = `Subject: Delay in settlement of EPF withdrawal claim\n\nTo,\nThe Regional Provident Fund Commissioner,\nEmployees' Provident Fund Organisation (EPFO),\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Complaint regarding delay in settlement of EPF withdrawal claim / UAN issues\n\nRespected Sir/Madam,\n\nI am writing to file a complaint regarding the delay in my EPFO claim settlement. I submitted a claim request under my UAN account at the RPF Office in ${loc} on ${time}.\n\n* **Applicant Name:** ${citizenName}\n* **UAN Number:** [Provide UAN Number]\n* **Date of Application:** ${time}\n* **Location of Application:** EPFO Office, ${loc}\n\nDespite the standard processing window passing, my claim remains pending and has not been credited. I request you to inspect my account details and expedite the settlement.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Navigate to the EPFO Grievance Management System (EPFiGMS) at https://epfigms.gov.in.",
        "2. Click on 'Register Grievance' and select your status (PF Member / Pensioner).",
        "3. Enter your UAN number and security code, then choose your PF office code.",
        "4. Copy and paste the drafted text above, upload the claim receipt, and submit."
      ];
    } else if (hasKeyword(["train", "railway", "irctc", "railmadad"])) {
      title = "Passenger Grievance Regarding Rail Services / Ticket Refund";
      department = "Indian Railways (RailMadad)";
      urgency = "high";
      drafted = `Subject: Rail Passenger Grievance / Service Issue at ${loc}\n\nTo,\nThe Divisional Railway Manager,\nIndian Railways,\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Grievance regarding train services / ticket refund issue at ${loc}\n\nRespected Sir/Madam,\n\nI am lodging this complaint regarding train passenger services experienced on ${time} at/near ${loc} station.\n\n* **Passenger Name:** ${citizenName}\n* **PNR / Ticket ID:** [Provide PNR]\n* **Date of Journey:** ${time}\n* **Location / Station:** ${loc}\n\nThis has caused immense inconvenience to passengers. I request you to review the services and process my refund immediately.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Visit the RailMadad official portal (https://railmadad.indianrailways.gov.in) or dial 139.",
        "2. Click on 'Lodge Grievance' and select the category (e.g. Cleanliness, Catering, Refund).",
        "3. Enter your PNR Number and transaction details.",
        "4. Paste this drafted complaint text into the description field and click Submit."
      ];
    } else if (hasKeyword(["consumer", "refund", "fraud", "defective", "cheated"])) {
      title = "Commercial Dispute & Defective Product Complaint";
      department = "National Consumer Helpline (NCH)";
      urgency = "medium";
      drafted = `Subject: Consumer Dispute / Unfair Trade Practice - Purchase at ${loc}\n\nTo,\nThe Registrar / Consumer Court,\nNational Consumer Helpline (NCH),\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Grievance regarding consumer dispute / unfair trade practice\n\nRespected Sir/Madam,\n\nI am writing to report a consumer dispute regarding a product/service purchased from a business operating in ${loc}. The dispute arose on ${time}.\n\n* **Consumer Name:** ${citizenName}\n* **Invoice / Order ID:** [Provide Order ID]\n* **Date of Transaction:** ${time}\n* **Location of Business:** ${loc}\n\nI have attempted to resolve this directly with the seller but received no compensation. I request the cell to intervene and settle this dispute.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Go to the National Consumer Helpline portal (https://consumerhelpline.gov.in).",
        "2. Log in or create a consumer account.",
        "3. Click on 'File Complaint' and select the industry type (e.g. E-Commerce, Banking).",
        "4. Paste this drafted text, upload the invoice/receipt, and register your complaint."
      ];
    } else if (hasKeyword(["water", "pipe", "leak", "sewage", "drain"])) {
      title = "Water Leakage and Drainage Overflow";
      department = "Municipal Water Supply & Sewerage Board";
      urgency = "high";
      drafted = `Subject: Urgent Attention Required for Sewage Overflow / Water Leakage in ${loc}\n\nTo,\nThe Municipal Commissioner / Assistant Engineer,\nMunicipal Water Supply & Sewerage Board,\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Immediate attention required for water leakage / sewage overflow\n\nRespected Sir/Madam,\n\nI am writing to report a water leakage/drainage issue at ${loc} since ${time}.\n\n* **Complainant Name:** ${citizenName}\n* **Location of Leakage:** ${loc}\n* **Duration of Problem:** Since ${time}\n\nThousands of liters of clean drinking water are being wasted and water-logging has occurred, creating a high risk of disease. I request you to repair it immediately.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Open the official Municipal Grievance website or PGPortal (https://pgportal.gov.in).",
        "2. Go to the 'Register Grievance' section and select 'Urban Development / Municipal Water Supply'.",
        "3. Copy the draft text above and paste it into the grievance description box.",
        "4. Upload any supporting photos of the water logging and click Submit."
      ];
    } else if (hasKeyword(["passport", "visa", "delay"])) {
      title = "Delay in Passport Dispatch / Verification";
      department = "Ministry of External Affairs (Passport Seva)";
      urgency = "medium";
      drafted = `Subject: Urgent Request for Status Update on Passport Application\n\nTo,\nThe Regional Passport Officer,\nRegional Passport Office (RPO),\n${loc},\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Request for status update on delayed passport application\n\nRespected Sir/Madam,\n\nI am writing regarding the delay in the processing/dispatch of my passport. The application was submitted at the PSK in ${loc} on ${time}.\n\n* **Applicant Name:** ${citizenName}\n* **File Number:** [Provide File Number]\n* **Date of Application:** ${time}\n* **Location of Application:** Passport Seva Kendra (PSK), ${loc}\n\nMy police verification is complete, yet there has been no status update in our profile tracker. Since I have urgent travel scheduled, I request you to kindly check the status and expedite the dispatch process.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Visit the National Passport Seva Portal (https://www.passportindia.gov.in).",
        "2. Log in using your registered login ID.",
        "3. Navigate to 'Feedback and Grievance' and choose 'Delayed Passport'.",
        "4. Paste the draft copy, fill in your File Number, and submit."
      ];
    } else if (hasKeyword(["electricity", "power", "meter", "billing"])) {
      title = "Electricity Billing Error & Frequent Power Fluctuations";
      department = "State Electricity Distribution Company";
      urgency = "high";
      drafted = `Subject: Urgent Complaint regarding Power Outages / Billing Discrepancy at ${loc}\n\nTo,\nThe Sub-Divisional Officer (SDO),\nElectricity Distribution Office,\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Complaint regarding frequent power outages / billing discrepancies\n\nRespected Sir/Madam,\n\nI am filing this complaint on behalf of the residents of ${loc}. We are experiencing heavy voltage fluctuations and frequent unscheduled power cuts since ${time}.\n\n* **Consumer Name:** ${citizenName}\n* **Consumer Account ID:** [Provide Account ID]\n* **Location of Outage:** ${loc}\n* **Duration of Fluctuations:** Since ${time}\n\nThis is causing severe damage to electronic appliances and impacting student study routines. Additionally, our last billing cycle shows an unexplained spike in the meter charges.\n\nWe request you to kindly inspect the transformer in our area and verify our meter reading at your earliest convenience.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Navigate to your State Electricity Board Customer Portal.",
        "2. Log in with your Consumer Number.",
        "3. Go to customer services -> Lodge Complaint.",
        "4. Select the category 'Billing / Meter / Outage', paste the generated draft letter, and save."
      ];
    } else {
      drafted = `Subject: Public Grievance regarding Civic Issue at ${loc}\n\nTo,\nThe Public Grievance Officer,\n\nDate: ${currentDateStr}\n\nFrom:\n${citizenName}\n${citizenAddress}\n\nSubject: Public Grievance regarding civic issue\n\nRespected Sir/Madam,\n\nI am writing to bring to your attention a civic grievance at ${loc}. The problem has persisted since ${time}.\n\n* **Applicant Name:** ${citizenName}\n* **Location:** ${loc}\n* **Timeline:** Since ${time}\n\nWe request your immediate intervention to address this matter.\n\nThanking you,\nYours faithfully,\n${citizenName}`;
      steps = [
        "1. Open Centralized Public Grievance Redress System (https://pgportal.gov.in).",
        "2. Click on 'Lodge Public Grievance'.",
        "3. Choose the appropriate Ministry / Department.",
        "4. Paste this drafted grievance text, upload any document, and submit."
      ];
    }

    const nativeExplanation = generateNativeExplanation(title, department, citizenName, loc, time, langCode);

    return JSON.stringify({
      intake_complete: true,
      title: title,
      drafted_complaint: drafted,
      native_explanation: nativeExplanation,
      department: department,
      urgency: urgency,
      submission_steps: steps
    });
  }

  // Multi-turn localized questioning fallback
  if (userMessages.length === 1) {
    return JSON.stringify({
      intake_complete: false,
      reply: qa.qName
    });
  } else if (!hasAddress) {
    return JSON.stringify({
      intake_complete: false,
      reply: qa.qAddress
    });
  } else if (userMessages.length === 2 || !hasLocation) {
    return JSON.stringify({
      intake_complete: false,
      reply: qa.qLocation
    });
  } else if (!hasTimeline) {
    return JSON.stringify({
      intake_complete: false,
      reply: qa.qTimeline
    });
  } else {
    return JSON.stringify({
      intake_complete: false,
      reply: qa.qFinal
    });
  }
}

function extractName(text, defaultName) {
  const clean = text.replace(/my name is/i, "")
                    .replace(/naam/i, "")
                    .replace(/mera/i, "")
                    .replace(/hai/i, "")
                    .replace(/i am/i, "")
                    .trim();
  if (clean.length > 2 && clean.split(/\s+/).length <= 4) {
    return clean;
  }
  return defaultName;
}

function extractAddress(text) {
  const lines = text.split(/[,\n]/);
  const addressParts = lines.filter(l => l.includes("address") || l.includes("street") || l.includes("road") || l.includes("flat") || l.includes("society") || l.includes("colony") || l.includes("nagar") || l.includes("rajkot") || l.includes("gujarat") || /\d+/.test(l));
  if (addressParts.length > 0) {
    return addressParts.join(", ").trim();
  }
  return "Freny's full address, Rajkot, Gujarat";
}
