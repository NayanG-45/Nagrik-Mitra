"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mic, MicOff, Send, Play, Square, Copy, Check, Save, ArrowLeft, Languages, Keyboard } from "lucide-react";

const regionalKeyboards = {
  "hi-IN": [
    ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "अं", "अः"],
    ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ"],
    ["ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न"],
    ["प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "ह"],
    ["ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "्"]
  ],
  "mr-IN": [
    ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ", "अं", "अः"],
    ["क", "ख", "ग", "घ", "ङ", "च", "छ", "ज", "झ", "ञ"],
    ["ट", "ठ", "ड", "ढ", "ण", "त", "थ", "द", "ध", "न"],
    ["प", "फ", "ब", "भ", "म", "य", "र", "ल", "व", "ह"],
    ["ा", "ि", "ी", "ु", "ू", "े", "ै", "ो", "ौ", "्"]
  ],
  "bn-IN": [
    ["অ", "আ", "ই", "ঈ", "উ", "ঊ", "এ", "ঐ", "ও", "ঔ", "ং", "ঃ"],
    ["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ"],
    ["ট", "ठ", "ಡ", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন"],
    ["প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "ব", "হ"],
    ["া", "ি", "ী", "ু", "ূ", "ে", "ৈ", "ো", "ৌ", "্"]
  ],
  "te-IN": [
    ["అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ"],
    ["క", "ఖ", "గ", "ఘ", "ఙ", "చ", "ఛ", "జ", "ఝ", "ఞ"],
    ["ట", "ఠ", "డ", "ఢ", "ణ", "త", "థ", "ద", "ధ", "న"],
    ["ప", "ఫ", "బ", "భ", "మ", "య", "ర", "ల", "వ", "హ"],
    ["ా", "ి", "ీ", "ు", "ూ", "ె", "ే", "ై", "ొ", "ో"]
  ],
  "ta-IN": [
    ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"],
    ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம"],
    ["ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன", "ஜ", "ஷ"],
    ["ஹ", "ஸ", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை"]
  ],
  "gu-IN": [
    ["અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "એ", "ઐ", "ઓ", "ઔ", "અં", "અઃ"],
    ["ક", "ખ", "ગ", "ઘ", "જ", "ઝ", "ઞ", "ટ", "ઠ", "ડ"],
    ["ઢ", "ણ", "ત", "થ", "દ", "ધ", "ન", "પ", "ફ", "બ"],
    ["ભ", "મ", "ય", "ર", "લ", "વ", "હ", "ા", "િ", "ી"],
    ["ુ", "ૂ", "ે", "ૈ", "ો", "ૌ", "્"]
  ],
  "kn-IN": [
    ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಎ", "ಏ", "ಐ", "ಒ", "ಓ", "ಔ"],
    ["ಕ", "ಖ", "ಗ", "ಘ", "ಙ", "ಚ", "ಛ", "ಜ", "ಝ", "ಞ"],
    ["ಟ", "ಠ", "ಡ", "ಢ", "ಣ", "ತ", "ಥ", "ದ", "ಧ", "ನ"],
    ["ಪ", "ಫ", "ಬ", "ಭ", "ಮ", "ಯ", "ರ", "ಲ", "ವ", "ಹ"],
    ["ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೆ", "ೇ", "ೈ", "ೊ", "ೋ"]
  ],
  "ml-IN": [
    ["അ", "ആ", "ഇ", "ഈ", "ഉ", "ഊ", "എ", "ഏ", "ഐ", "ഒ", "ഓ", "ഔ"],
    ["ക", "ഖ", "ഗ", "ഘ", "ങ", "ച", "ഛ", "ജ", "ഝ", "ഞ"],
    ["ട", "ഠ", "ഡ", "ഢ", "ണ", "ത", "ഥ", "ദ", "ധ", "ന"],
    ["പ", "ഫ", "ബ", "ഭ", "മ", "യ", "ര", "ല", "വ", "ഹ"],
    ["ാ", "ി", "ീ", "ു", "ൂ", "െ", "േ", "ൈ", "ൊ", "ോ"]
  ],
  "pa-IN": [
    ["ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ"],
    ["ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ"],
    ["ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ"],
    ["ਯ", "ਰ", "ਲ", "ਵ", "ੜ", "ਾ", "ਿ", "ੀ", "ੁ", "ੂ"]
  ],
  "or-IN": [
    ["ଅ", "ଆ", "ଇ", "ଈ", "ଉ", "ଊ", "ଏ", "ଐ", "ଓ", "ଔ", "ଂ", "ଃ"],
    ["କ", "ଖ", "ଗ", "ଘ", "ଙ", "ଚ", "ଛ", "ଜ", "ଝ", "ଞ"],
    ["ଟ", "ଠ", "ଡ", "ଢ", "ଣ", "ତ", "ଥ", "ଦ", "ଧ", "ନ"],
    ["ପ", "ଫ", "ବ", "ଭ", "ମ", "ଯ", "ର", "ଲ", "ଵ", "ହ"],
    ["ା", "ି", "ୀ", "ୁ", "ୂ", "େ", "ୈ", "ୋ", "ୌ", "୍"]
  ],
  "ur-IN": [
    ["ا", "ب", "پ", "ت", "ٹ", "ث", "ج", "چ", "ح", "خ"],
    ["د", "ڈ", "ذ", "ر", "ڑ", "ز", "ژ", "س", "ش", "ص"],
    ["ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل"],
    ["م", "ن", "و", "ہ", "ھ", "ء", "ی", "ے", "ُ", "ِ"]
  ]
};

const detectLanguage = (text) => {
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
  else if (/[\u0980-\u09FF]/.test(text)) return "bn-IN";
  else if (/[\u0B80-\u0BFF]/.test(text)) return "ta-IN";
  else if (/[\u0C00-\u0C7F]/.test(text)) return "te-IN";
  else if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
  else if (/[\u0A80-\u0AFF]/.test(text)) return "gu-IN";
  else if (/[\u0B00-\u0B7F]/.test(text)) return "or-IN";
  else if (/[\u0D00-\u0D7F]/.test(text)) return "ml-IN";
  else if (/[a-zA-Z]/.test(text)) return "en-IN";
  return null;
};

export default function GrievancePage() {
  const [messages, setMessages] = useState([
    {
      id: "clerk-welcome",
      sender: "clerk",
      text: "Namaste! I am your Nagrik Clerk. I will help you draft a formal, professional grievance for submission to government authorities. What issue or complaint are you facing today? Feel free to speak or type in Hindi, English, or your local language (e.g., 'mera passport delay ho gaya hai' or 'water leakage issue').",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Final draft result state
  const [draftResult, setDraftResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Text to Speech playback state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentAudioText, setCurrentAudioText] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioPlayerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  useEffect(() => {
    if (selectedLanguage === "en-IN") {
      setShowKeyboard(false);
    }
  }, [selectedLanguage]);

  const languages = [
    { code: "hi-IN", name: "Hindi (हिंदी)" },
    { code: "en-IN", name: "English" },
    { code: "bn-IN", name: "Bengali (বাংলা)" },
    { code: "te-IN", name: "Telugu (తెలుగు)" },
    { code: "ta-IN", name: "Tamil (தமிழ்)" },
    { code: "mr-IN", name: "Marathi (मराठी)" },
    { code: "gu-IN", name: "Gujarati (ગુજરાતી)" },
    { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
    { code: "ml-IN", name: "Malayalam (മലയാളം)" },
    { code: "pa-IN", name: "Punjabi (ਪੰਜਾਬੀ)" },
    { code: "or-IN", name: "Odia (ଓଡ଼ିଆ)" },
    { code: "ur-IN", name: "Urdu (اردو)" },
  ];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Audio Recording Handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks on the stream to release the mic
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", blob, "audio.webm");
      formData.append("language_code", selectedLanguage);

      const response = await fetch("/api/complaints/voice", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("STT API failed");
      const data = await response.json();

      if (data.success && data.transcript) {
        setInput(data.transcript);
        
        // Auto-detect regional language script from transcript and set matching dropdown language
        const detected = detectLanguage(data.transcript);
        if (detected) {
          setSelectedLanguage(detected);
        }
      } else {
        alert("Could not transcribe audio. " + (data.error || ""));
      }
    } catch (err) {
      console.error("Transcription error:", err);
      alert("Voice input failed. Please type your message.");
    } finally {
      setIsLoading(false);
    }
  };

  // Text Submission
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput("");

    // Auto-detect regional language script from typed text and set matching dropdown language
    const detected = detectLanguage(userMessageText);
    let activeLang = selectedLanguage;
    if (detected) {
      setSelectedLanguage(detected);
      activeLang = detected;
    }

    const newMessages = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        text: userMessageText,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/complaints/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, language: activeLang }),
      });

      if (!response.ok) throw new Error("Chat clerk failed");
      const data = await response.json();

      if (data.success) {
        if (data.intake_complete) {
          // Intake completed, render formal draft side panel
          setMessages((prev) => [
            ...prev,
            {
              id: `clerk-${Date.now()}`,
              sender: "clerk",
              text: "Success! I have gathered all the necessary details and successfully drafted your formal complaint letter. You can view, copy, listen to, and save it in the side panel.",
              timestamp: new Date(),
            },
          ]);
          setDraftResult({
            title: data.title || "Civic Complaint",
            drafted_complaint: data.drafted_complaint,
            native_explanation: data.native_explanation,
            department: data.department || "Municipal Administration",
            urgency: data.urgency || "medium",
            submission_steps: data.submission_steps || [],
            raw_input: newMessages.map((m) => `${m.sender}: ${m.text}`).join("\n"),
          });
        } else {
          // Keep chatting
          setMessages((prev) => [
            ...prev,
            {
              id: `clerk-${Date.now()}`,
              sender: "clerk",
              text: data.reply || "Could you share more details?",
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Intake chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "clerk",
          text: "I experienced an error connecting to the service. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save grievance to Supabase database
  const saveGrievance = async () => {
    if (!draftResult || saveLoading) return;
    setSaveLoading(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/complaints/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftResult.title,
          description: draftResult.title,
          category: draftResult.department,
          urgency: draftResult.urgency,
          raw_input: draftResult.raw_input,
          drafted_complaint: draftResult.drafted_complaint,
          submission_steps: draftResult.submission_steps,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsSaved(true);
        setSaveMessage("Grievance registered and saved to your profile!");
      } else {
        setSaveMessage(`Error: ${data.error || "Failed to save"}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("Failed to save grievance. Please check your internet connection.");
    } finally {
      setSaveLoading(false);
    }
  };

  // Text to Speech logic
  const handleSpeakToggle = async (text, languageCode) => {
    if (!text) return;

    if (isSpeaking && currentAudioText === text) {
      if (audioPlayerRef.current) {
        if (isPaused) {
          audioPlayerRef.current.play();
          setIsPaused(false);
        } else {
          audioPlayerRef.current.pause();
          setIsPaused(true);
        }
      }
      return;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }

    setIsSpeaking(false);
    setIsPaused(false);
    setTtsLoading(true);
    setCurrentAudioText(text);

    try {
      const response = await fetch("/api/complaints/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text,
          languageCode: languageCode,
        }),
      });

      if (!response.ok) throw new Error("TTS failed");
      const data = await response.json();

      if (data.success && data.audio) {
        const audioSrc = `data:audio/wav;base64,${data.audio}`;
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = audioSrc;
          audioPlayerRef.current.play();
          setIsSpeaking(true);
          setIsPaused(false);
          audioPlayerRef.current.onended = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentAudioText("");
          };
        }
      } else {
        alert("Failed to synthesize speech.");
        setCurrentAudioText("");
      }
    } catch (err) {
      console.error("TTS error:", err);
      alert("Could not activate voice feedback.");
      setCurrentAudioText("");
    } finally {
      setTtsLoading(false);
    }
  };

  const speakDraft = () => {
    handleSpeakToggle(draftResult.drafted_complaint, "en-IN");
  };

  const speakNativeExplanation = () => {
    handleSpeakToggle(draftResult.native_explanation, selectedLanguage);
  };

  const copyToClipboard = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(draftResult.drafted_complaint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-800 flex flex-col">
      {/* Audio Element for voice synthesis */}
      <audio ref={audioPlayerRef} className="hidden" />

      {/* Main Grid: Chat + Draft Panel */}
      <div className="max-w-[1440px] w-full mx-auto p-4 md:p-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Dynamic Chat Panel */}
        <div className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${draftResult ? "lg:max-w-[50%]" : "w-full"}`}>
          {/* Header */}
          <div className="bg-[#3525CD] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-bold text-lg">Grievance Intake Clerk</h1>
                <p className="text-indigo-200 text-xs">Conversational Assistance Portal</p>
              </div>
            </div>
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-lg border border-white/20">
              <Languages className="h-4 w-4 text-indigo-200" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-white border-none text-xs focus:ring-0 cursor-pointer font-medium outline-none pr-1"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-800 font-normal">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={chatContainerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 min-h-[400px] max-h-[550px] lg:max-h-[600px] scroll-smooth">
            {messages.map((msg) => {
              const isClerk = msg.sender === "clerk";
              return (
                <div key={msg.id} className={`flex ${isClerk ? "justify-start" : "justify-end"}`}>
                  <div className={`flex gap-3 max-w-[85%] ${isClerk ? "" : "flex-row-reverse"}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isClerk ? "bg-indigo-100 text-[#3525CD]" : "bg-emerald-100 text-emerald-800"}`}>
                      {isClerk ? "C" : "U"}
                    </div>
                    {/* Bubble */}
                    <div className={`rounded-2xl p-4 shadow-sm border ${isClerk ? "bg-[#F8FAFC] border-slate-200 rounded-tl-none" : "bg-indigo-50 border-indigo-100 rounded-tr-none"}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block text-right">
                        {isMounted && msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#3525CD] flex items-center justify-center font-bold animate-pulse">
                    C
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-220"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form / Inputs */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <form onSubmit={handleSend} className="flex gap-2">
              {/* Record Mic Button */}
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-xl flex items-center justify-center transition-colors shadow-md animate-pulse"
                  title="Stop recording"
                >
                  <MicOff className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="bg-indigo-50 border border-indigo-200 text-[#3525CD] hover:bg-indigo-100 p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm"
                  title="Start recording"
                  disabled={isLoading}
                >
                  <Mic className="h-5 w-5" />
                </button>
              )}

              {/* Onscreen Keyboard Toggle Button */}
              {selectedLanguage !== "en-IN" && (
                <button
                  type="button"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={`p-3 rounded-xl flex items-center justify-center transition-colors border shadow-sm ${showKeyboard ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700" : "bg-indigo-50 text-[#3525CD] border-indigo-200 hover:bg-indigo-100"}`}
                  title="Onscreen Keyboard"
                >
                  <Keyboard className="h-5 w-5" />
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRecording ? "Listening... Speak now..." : "Explain your issue here or speak using mic..."}
                disabled={isRecording || isLoading}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-inner focus:outline-none focus:border-[#3525CD] text-sm"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-[#3525CD] hover:bg-[#2a1cb1] text-white p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            {/* Onscreen Virtual Keyboard */}
            {showKeyboard && selectedLanguage !== "en-IN" && regionalKeyboards[selectedLanguage] && (
              <div className="mt-3 bg-slate-100 rounded-xl p-3 border border-slate-200 shadow-inner flex flex-col gap-2 max-w-full overflow-x-auto select-none animate-in fade-in duration-300">
                {/* Rows of keys */}
                {regionalKeyboards[selectedLanguage].map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-1 justify-center min-w-max">
                    {row.map((char) => (
                      <button
                        key={char}
                        type="button"
                        onClick={() => setInput((prev) => prev + char)}
                        className="bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-200 rounded-lg w-8 h-9 text-sm font-semibold flex items-center justify-center transition-colors text-slate-800 shadow-sm"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                ))}
                {/* Bottom helper row */}
                <div className="flex gap-2 justify-center mt-1">
                  <button
                    type="button"
                    onClick={() => setInput((prev) => prev + " ")}
                    className="bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-200 rounded-lg px-8 h-9 text-xs font-bold transition-colors text-slate-800 shadow-sm uppercase tracking-wider"
                  >
                    Space
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput((prev) => prev.slice(0, -1))}
                    className="bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 rounded-lg px-4 h-9 text-xs font-bold transition-colors shadow-sm uppercase tracking-wider"
                  >
                    Backspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput("")}
                    className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 border border-slate-300 rounded-lg px-4 h-9 text-xs font-bold transition-colors text-slate-700 shadow-sm uppercase tracking-wider"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {isRecording && (
              <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Recording audio. Speak clearly in your selected language...
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Draft Results Panel (Reveals dynamically) */}
        {draftResult && (
          <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-base">Drafted Citizen Complaint</h2>
                <p className="text-slate-400 text-xs">Ready for government portal submission</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wider ${draftResult.urgency === "high" ? "bg-rose-950 text-rose-400 border border-rose-900" : draftResult.urgency === "medium" ? "bg-amber-950 text-amber-400 border border-amber-900" : "bg-emerald-950 text-emerald-400 border border-emerald-900"}`}>
                  {draftResult.urgency} Urgency
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[600px] lg:max-h-[670px]">
              
              {/* Department Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Department</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{draftResult.department}</p>
                </div>
                <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-[#3525CD] font-bold text-sm">
                  🏢
                </div>
              </div>

              {/* Draft Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-700">Official Formal Draft</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={speakDraft}
                      disabled={ttsLoading && currentAudioText !== draftResult.drafted_complaint}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>
                        {ttsLoading && currentAudioText === draftResult.drafted_complaint
                          ? "Loading..."
                          : isSpeaking && currentAudioText === draftResult.drafted_complaint
                          ? isPaused
                            ? "Resume"
                            : "Pause"
                          : "Listen to Draft"}
                      </span>
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Text"}</span>
                    </button>
                  </div>
                </div>
                <div className="bg-slate-900 text-slate-200 font-mono text-xs rounded-xl p-4 border border-slate-800 shadow-inner whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto">
                  {draftResult.drafted_complaint}
                </div>
              </div>

              {/* Native language explanation section */}
              {draftResult.native_explanation && (
                <div className="space-y-2 border-t border-slate-100 pt-4 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-700">Native Explanation / शिकायत का सारांश</h3>
                    <button
                      onClick={speakNativeExplanation}
                      disabled={ttsLoading && currentAudioText !== draftResult.native_explanation}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>
                        {ttsLoading && currentAudioText === draftResult.native_explanation
                          ? "Loading..."
                          : isSpeaking && currentAudioText === draftResult.native_explanation
                          ? isPaused
                            ? "Resume"
                            : "Pause"
                          : `Listen in ${languages.find(l => l.code === selectedLanguage)?.name || "Native Language"}`}
                      </span>
                    </button>
                  </div>
                  <div className="bg-emerald-50/50 text-slate-700 text-xs rounded-xl p-4 border border-emerald-100 shadow-sm leading-relaxed whitespace-pre-wrap">
                    {draftResult.native_explanation}
                  </div>
                </div>
              )}

              {/* Instructions steps */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-700">Where & How to Submit</h3>
                <div className="space-y-3">
                  {draftResult.submission_steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-50 border border-slate-150 rounded-lg p-3 text-xs leading-relaxed">
                      <div className="w-5 h-5 bg-[#3525CD]/10 text-[#3525CD] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
              <p className="text-xs text-emerald-600 font-medium">
                {isSaved ? "✓ Grievance registered successfully!" : "Ensure you copy the draft and save the details."}
              </p>
              <button
                onClick={saveGrievance}
                disabled={isSaved || saveLoading}
                className="inline-flex items-center gap-2 bg-[#3525CD] hover:bg-[#2a1cb1] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md disabled:bg-emerald-600 disabled:opacity-100 disabled:cursor-not-allowed"
              >
                {saveLoading ? (
                  <span>Saving...</span>
                ) : isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved to Profile</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Register Grievance</span>
                  </>
                )}
              </button>
            </div>
            {saveMessage && (
              <div className={`px-4 py-2 text-center text-xs border-t ${isSaved ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"}`}>
                {saveMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
