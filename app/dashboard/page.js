"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Copy, Check, ChevronDown, ChevronUp, FileText, Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      const { data } = await supabase
        .from("grievances")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      
      if (data) {
        setGrievances(data);
      }
      setLoading(false);
    };
    loadData();
  }, [router]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen py-unit-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop space-y-gutter">
        
        {/* Header Section */}
        <header className="space-y-unit-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-background">Welcome back, Citizen</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Your civic profile is currently being processed for secondary verification.</p>
        </header>

        {/* Top Block: Citizen Profile Validation Progress */}
        <section className="w-full">
          <div className="bg-surface-container-lowest rounded-xl p-unit-lg signature-shadow border border-outline-variant transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-unit-md mb-unit-md">
              <div className="space-y-unit-xs">
                <h2 className="font-headline-md text-headline-md text-on-background">Citizen Profile Validation Progress</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Verification level: Tier 2 (Standard Access)</p>
              </div>
              <div className="text-right">
                <span className="font-headline-md text-headline-md text-primary font-bold">40%</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider ml-1">Complete</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden mb-unit-md">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: '40%' }}></div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-unit-md">
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-label-sm text-label-sm">Basic Info</span>
              </div>
              <div className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-label-sm text-label-sm">Address Link</span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">fingerprint</span>
                <span className="font-label-sm text-label-sm">Biometric Sync</span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">hourglass_empty</span>
                <span className="font-label-sm text-label-sm">Document Audit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          
          <div className="lg:col-span-2 space-y-gutter">
            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <Link href="/features" className="group bg-surface-container-lowest p-6 rounded-xl signature-shadow border border-outline-variant hover:border-primary transition-all duration-300 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">account_balance</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-1">Check Schemes</h3>
                <p className="font-label-sm text-on-surface-variant">View eligible benefits</p>
              </Link>
              
              <Link href="/grievance" className="group bg-surface-container-lowest p-6 rounded-xl signature-shadow border border-outline-variant hover:border-primary transition-all duration-300 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">report</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-1">File Grievance</h3>
                <p className="font-label-sm text-on-surface-variant">Submit official feedback</p>
              </Link>
              
              <Link href="/features" className="group bg-surface-container-lowest p-6 rounded-xl signature-shadow border border-outline-variant hover:border-primary transition-all duration-300 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[24px]">newspaper</span>
                </div>
                <h3 className="font-headline-md text-on-surface mb-1">Read News</h3>
                <p className="font-label-sm text-on-surface-variant">Civic updates & alerts</p>
              </Link>
            </div>

            {/* Dynamic Grievances Tracker */}
            <div className="bg-surface-container-lowest p-unit-lg rounded-xl signature-shadow border border-outline-variant">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-6">
                <h2 className="font-headline-md text-on-surface">Your Registered Grievances</h2>
                <span className="font-label-sm text-on-surface-variant">Click row to view full draft</span>
              </div>
              
              {loading ? (
                <div className="space-y-3 py-4">
                  <div className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
                  <div className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
                </div>
              ) : grievances.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="font-body-md text-on-surface-variant">No grievances registered yet.</p>
                  <Link href="/grievance" className="inline-block font-label-sm text-primary hover:underline">
                    File a new grievance now &rarr;
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-150">
                  {grievances.map((g) => {
                    const isExpanded = expandedId === g.id;
                    const dateFormatted = g.created_at
                      ? new Date(g.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                      : "Recently Added";

                    return (
                      <div key={g.id} className="py-4 first:pt-0 last:pb-0">
                        <div
                          onClick={() => toggleExpand(g.id)}
                          className="flex items-center justify-between cursor-pointer hover:bg-slate-50/50 p-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-label-md text-on-surface font-semibold">{g.title}</h4>
                              <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-wider border ${g.urgency === "high" ? "bg-rose-50 text-rose-700 border-rose-100" : g.urgency === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                                {g.urgency}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400">
                              <span>{g.category}</span>
                              <span>•</span>
                              <span>{dateFormatted}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-label-sm px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full uppercase tracking-wider text-[10px] flex items-center gap-1 font-bold">
                              <Clock className="h-3 w-3" />
                              {g.status || "Pending"}
                            </span>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Official Drafted Letter</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(g.drafted_complaint, g.id);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                  >
                                    {copiedId === g.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                    <span>{copiedId === g.id ? "Copied!" : "Copy"}</span>
                                  </button>
                                </div>
                                <div className="bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg p-3 border border-slate-800 shadow-inner whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                                  {g.drafted_complaint}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Native Summary Explanation</span>
                                  <p className="bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-lg p-3 text-[11px] leading-relaxed mt-1">
                                    {g.native_explanation}
                                  </p>
                                </div>

                                {g.submission_steps && g.submission_steps.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">How to Submit</span>
                                    <div className="space-y-1.5 mt-1">
                                      {g.submission_steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-2 bg-white border border-slate-200 rounded-lg p-2 text-[10px] leading-relaxed shadow-sm">
                                          <div className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold flex-shrink-0 text-[9px]">
                                            {idx + 1}
                                          </div>
                                          <p className="text-slate-650">{step}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-gutter">
            {/* Profile Verification Sidebar */}
            <div className="bg-surface-container-lowest p-unit-lg rounded-xl signature-shadow border border-outline-variant">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-headline-md text-on-surface">Profile Verification</h2>
                <span className="material-symbols-outlined text-primary">verified_user</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <div>
                    <p className="font-label-md text-on-surface">Identity Verified</p>
                    <p className="font-label-sm text-on-surface-variant">[Aadhaar Omitted for Privacy]</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <div>
                    <p className="font-label-md text-on-surface">Mobile Authenticated</p>
                    <p className="font-label-sm text-on-surface-variant">+91 ******5432</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <div>
                    <p className="font-label-md text-on-surface">Residency Confirmed</p>
                    <p className="font-label-sm text-on-surface-variant">[Profile Verified]</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 opacity-50">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">radio_button_unchecked</span>
                  <div>
                    <p className="font-label-md text-on-surface">Income Tax Link</p>
                    <p className="font-label-sm text-on-surface-variant">Pending sync</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secure Vault */}
            <div className="bg-primary text-on-primary p-unit-lg rounded-xl signature-shadow border border-primary-container flex flex-col justify-between h-48 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <span className="material-symbols-outlined text-[100px]">lock</span>
              </div>
              <div>
                <span className="material-symbols-outlined mb-2 text-white text-[32px]">lightbulb</span>
                <h3 className="font-headline-md text-white">Secure Vault for your Documents</h3>
              </div>
              <Link href="/assistant" className="font-label-sm text-primary-fixed-dim hover:text-white mt-auto">
                Access Vault &rarr;
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
