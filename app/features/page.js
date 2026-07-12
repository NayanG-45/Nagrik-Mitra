import { UserCheck, FileCheck2, AlertCircle, FileText, Newspaper, Languages, Sparkles } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";

export default function FeaturesPage() {
  const modules = [
    {
      title: "Profile",
      description: "A centralized, secure conversational profile builder. Fill in your information once through friendly chat and use it to auto-apply for government schemes, track complaints, or fill documents.",
      icon: UserCheck,
      status: "Core",
      href: "/dashboard",
    },
    {
      title: "Eligibility Navigator",
      description: "AI-driven mapping that parses regional, state, and central welfare schemes. Automatically computes and recommends scholarships and subsidies matching your citizen profile criteria.",
      icon: FileCheck2,
      status: "Coming Soon",
    },
    {
      title: "Grievance Filing",
      description: "Direct citizen-to-authority complaint management pipeline. Chat to detail your grievance, capture geolocation details, attach proofs, file officially, and track real-time resolution status.",
      icon: AlertCircle,
      status: "Core",
      href: "/grievance",
    },
    {
      title: "News Feed",
      description: "Real-time, verified government policy announcements, national advisories, local community news, and scheme deadline updates sourced directly from official state feeds.",
      icon: Newspaper,
      status: "Coming Soon",
    },
    {
      title: "Forms Search",
      description: "A comprehensive central index of state and national government applications. Find forms easily, and use your Citizen Profile data to pre-populate form fields in seconds.",
      icon: FileText,
      status: "Coming Soon",
    },
    {
      title: "Voice Support",
      description: "Advanced conversational assistance enabling audio speech recognition and text-to-speech output in major regional Indian languages (Hindi, Tamil, Telugu, Marathi, Kannada, Bengali).",
      icon: Languages,
      status: "Coming Soon",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platform Roadmap</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Explore Nagrik Modules
          </h1>
          <p className="text-slate-600 leading-relaxed text-sm md:text-lg">
            From direct conversational filing to AI eligibility matching and multilingual voice accessibility, discover how Nagrik is bringing the state apparatus closer to the common citizen.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, idx) => (
            <FeatureCard
              key={idx}
              title={mod.title}
              description={mod.description}
              icon={mod.icon}
              status={mod.status}
              href={mod.href}
            />
          ))}
        </div>

        {/* Tech Stack Info Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm max-w-5xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-bold text-slate-900 text-base">Integrations & Architecture Roadmap</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              We are utilizing React & Next.js for our core UI. In the next iterations, we will plug in Supabase (Auth, Database, Storage), Sarvam AI APIs (Translation, Chat, Voice STT/TTS), and the GNews feed API.
            </p>
          </div>
          <div className="flex-shrink-0 flex gap-3 text-xs font-semibold tracking-wider uppercase">
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">Next.js</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">Supabase</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">Sarvam AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
