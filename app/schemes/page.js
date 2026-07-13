"use client";

import { useState, useEffect, useRef } from 'react';
import { Bot, X, CheckCircle2, AlertCircle, AlertTriangle, Filter, ShieldCheck, ChevronRight, ArrowLeft, FileText, User, Mic, MicOff, Send } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function SchemesNavigator() {
  const [userData, setUserData] = useState({ role: '', location: '', income: null, gender: '', verified_documents: [] });
  const [isGuest, setIsGuest] = useState(true);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [eligibilityFilter, setEligibilityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // UI State
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  
  // Companion State
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'system', text: "Hello, citizen! I am your Sarvam Multilingual Assistant. I can assist you with compiling documents or checking your eligibility metrics. Ask me anything in your local language:" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
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
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');
          
          setIsChatLoading(true);
          try {
            const res = await fetch('/api/complaints/voice', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.success && data.transcript) {
              setChatInput(prev => prev ? prev + ' ' + data.transcript : data.transcript);
            } else if (data.mock) {
              setChatInput(prev => prev ? prev + ' ' + data.transcript : data.transcript);
            }
          } catch (error) {
            console.error("Audio processing failed", error);
          } finally {
            setIsChatLoading(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone", error);
        alert("Please grant microphone permissions to use voice dictation.");
      }
    }
  };

  useEffect(() => {
    let channel;
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (user && !authError) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile && !profileError) {
            const updateStateFromProfile = (prof) => {
              setUserData({ 
                role: prof.role || '', 
                location: prof.location || '', 
                income: prof.income !== null && prof.income !== undefined ? parseInt(prof.income, 10) : null,
                gender: prof.gender || '',
                verified_documents: prof.verified_documents || []
              });
              const isProfileComplete = !!(prof.location && prof.role && prof.dob);
              setIsGuest(!isProfileComplete);
            };
            
            updateStateFromProfile(profile);

            const uniqueChannel = `schemes-profile-changes-${Date.now()}-${Math.random()}`;
            channel = supabase
              .channel(uniqueChannel)
              .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'profiles', 
                filter: `id=eq.${user.id}` 
              }, (payload) => {
                if (payload.new) {
                  updateStateFromProfile(payload.new);
                }
              })
              .subscribe();
          } else {
            setIsGuest(true);
          }
        } else {
          setIsGuest(true);
        }
      } catch (err) {
        console.error("Session fetch error:", err);
        setIsGuest(true);
      }
    };
    checkAuth();

    const fetchSchemes = async () => {
      try {
        const res = await fetch('/api/schemes');
        const data = await res.json();
        if (data.success) {
          setSchemes(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch schemes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isCompanionOpen]);

  const getEligibilityStatus = (scheme) => {
    if (isGuest) return 'Action Required';
    
    const { criteria } = scheme;
    const roleMatch = !criteria.role || criteria.role.toLowerCase() === userData.role?.toLowerCase();
    const locMatch = !criteria.location || userData.location?.toLowerCase().includes(criteria.location.toLowerCase()) || criteria.location === 'India';
    const incomeMatch = criteria.incomeMax === null || criteria.incomeMax === undefined || (userData.income !== null && userData.income <= criteria.incomeMax);
    const genderMatch = !criteria.gender || criteria.gender.toLowerCase() === userData.gender?.toLowerCase();

    const docsMatch = scheme.requiredDocs.every(doc => 
      doc === 'Basic Profile' || (userData.verified_documents && userData.verified_documents.includes(doc))
    );

    if (roleMatch && locMatch && incomeMatch && genderMatch && docsMatch) return 'Ready to Apply';
    if (!roleMatch || !locMatch || !genderMatch || (!incomeMatch && userData.income !== null && userData.income > criteria.incomeMax)) return 'Not Eligible';
    return 'Action Required';
  };

  const filteredSchemes = schemes.filter(scheme => {
    if (eligibilityFilter !== 'All') {
      const status = getEligibilityStatus(scheme);
      if (status !== eligibilityFilter) return false;
    }
    if (categoryFilter !== 'All') {
      if (categoryFilter === 'Scholarships' && scheme.category !== 'scholarship') return false;
      if (categoryFilter === 'Subsidies' && scheme.category !== 'subsidy') return false;
      if (categoryFilter === 'Female-focused' && scheme.category !== 'female') return false;
    }
    return true;
  });

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const query = chatInput.trim();
    setChatInput("");
    
    setChatHistory(prev => [...prev, { role: 'user', text: query }]);
    setIsChatLoading(true);

    let contextData = null;
    const activeScheme = schemes.find(s => s.id === selectedSchemeId);
    let queryToSend = query;
    
    if (selectedSchemeId && activeScheme) {
      contextData = {
        title: activeScheme.title,
        category: activeScheme.category,
        criteria: activeScheme.criteria,
        requiredDocs: activeScheme.requiredDocs,
        procedureSteps: activeScheme.procedureSteps,
        payAttentionPoints: activeScheme.payAttentionPoints
      };
      
      const qLower = query.toLowerCase();
      if (qLower.includes('condition') || qLower.includes('critical') || qLower.includes('step')) {
        queryToSend = `CONTEXT: The citizen is currently exploring the official civic details layout for ${activeScheme.title}. The phrase 'critical condition' refers strictly to the structural rules, eligibility clauses, and administrative warnings defined in the scheme's 'payAttentionPoints' dataset array. Do NOT treat this as a medical query. Read the data blocks provided in contextData and explain the relevant rule/condition clearly in the user's input language:\n\nUser Query: ${query}`;
      }
    } else {
      // Step 1: Local Catalog Context Check & Explicit Mapping
      const qLower = query.toLowerCase();
      const matchedSchemes = schemes.filter(s => 
        qLower.includes(s.category.toLowerCase()) || 
        qLower.includes('scholarship') && s.category.toLowerCase() === 'scholarship' ||
        qLower.includes('subsidy') && s.category.toLowerCase() === 'subsidy' ||
        s.title.toLowerCase().includes(qLower)
      );
      
      // If no specific keyword matches, provide the full catalog to let AI decide
      const targetSchemes = matchedSchemes.length > 0 ? matchedSchemes : schemes;
      
      contextData = {
        relevantLocalSchemes: targetSchemes.map(s => ({
          title: s.title,
          department: s.provider,
          conditions: s.criteria,
          requiredDocs: s.requiredDocs,
          procedureSteps: s.procedureSteps
        }))
      };
    }

    try {
      const res = await fetch('/api/schemes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSend, contextData })
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: 'system', text: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'system', text: "Error connecting to Sarvam AI." }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'system', text: "Network connection error." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const parseMarkdown = (text) => {
    let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n- (.*)/g, '<br/><span class="text-[#3525CD] mr-1">•</span> $1')
      .replace(/\n\* (.*)/g, '<br/><span class="text-[#3525CD] mr-1">•</span> $1')
      .replace(/\n/g, '<br/>');
    return { __html: html };
  };

  const activeScheme = schemes.find(s => s.id === selectedSchemeId);

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans pb-24">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-surface-container py-8 px-6 md:px-12 transition-all">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-extrabold text-on-surface mb-2">Welfare Scheme Navigator</h1>
          <p className="text-on-surface-variant text-lg">Predictive matching and personalized benefit discovery.</p>
          
          {activeScheme && (
            <button 
              onClick={() => setSelectedSchemeId(null)}
              className="mt-6 flex items-center gap-2 text-on-surface-variant hover:text-[#3525CD] font-bold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Catalog
            </button>
          )}

          {!activeScheme && isGuest && (
            <div className="mt-8 w-full bg-amber-50/50 border-2 border-amber-300 text-center rounded-2xl p-10 mb-8 relative overflow-hidden backdrop-blur-md shadow-[0_0_35px_rgba(245,158,11,0.08)] animate-[pulse_3s_infinite_ease-in-out]">
              <div className="text-amber-600 bg-amber-100 border border-amber-300/50 px-4 py-4 rounded-full mb-4 inline-flex">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-amber-950 tracking-tight mb-2">Action Required: Unlock Your Welfare Dashboard</h3>
                <p className="text-body-md text-amber-900/80 max-w-xl mx-auto mb-6 font-medium">
                  Your civic profile is currently incomplete. Set up your profile now to enable real-time eligibility matching, seamless document verification, and one-click scheme applications tailored for you.
                </p>
              </div>
              <Link href="/dashboard" className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-3 rounded-xl shadow-md transition-all ease-out hover:scale-[1.02]">
                Setup Profile &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        {!activeScheme ? (
          /* Main Navigator View */
          <>
            {/* Two-Dimensional Grid Controls */}
            <div className="mb-8 space-y-6">
              {/* Row 1: Eligibility */}
              <div>
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Eligibility Match
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Ready to Apply', 'Action Required', 'Not Eligible'].map(filter => {
                    let badgeClass = 'border-outline-variant text-on-surface-variant hover:bg-surface-container';
                    if (eligibilityFilter === filter) {
                      if (filter === 'All') badgeClass = 'bg-surface-variant text-on-surface border-surface-variant';
                      if (filter === 'Ready to Apply') badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      if (filter === 'Action Required') badgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
                      if (filter === 'Not Eligible') badgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
                    }
                    
                    let icon = null;
                    if (filter === 'Ready to Apply') icon = '🟢';
                    if (filter === 'Action Required') icon = '🟡';
                    if (filter === 'Not Eligible') icon = '🔴';

                    return (
                      <button
                        key={filter}
                        onClick={() => setEligibilityFilter(filter)}
                        className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${badgeClass}`}
                      >
                        {icon && <span className="mr-2">{icon}</span>}
                        {filter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Category */}
              <div>
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Functional Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Scholarships', 'Subsidies', 'Female-focused'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                        categoryFilter === cat 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white border-outline-variant text-on-surface hover:border-primary/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic List-Row Layout */}
            {loading ? (
              <div className="text-center py-20 text-on-surface-variant font-medium">Loading catalog...</div>
            ) : (
              <div className="w-full flex flex-col gap-6">
                {filteredSchemes.length === 0 && (
                  <div className="w-full text-center py-16 bg-white rounded-2xl border border-surface-container">
                    <p className="text-on-surface-variant text-lg">No schemes match your current criteria.</p>
                  </div>
                )}
                
                {filteredSchemes.map(scheme => {
                  const status = getEligibilityStatus(scheme);
                  const isReady = status === 'Ready to Apply';
                  
                  return (
                    <div 
                      key={scheme.id} 
                      onClick={() => setSelectedSchemeId(scheme.id)}
                      className="relative p-[2px] rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform duration-300"
                    >
                      {/* Gradient Border Animation Track */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3525cd] via-cyan-400 to-[#3525cd] opacity-0 group-hover:opacity-100 bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite] transition-opacity duration-300"></div>
                      
                      {/* Card Content Core */}
                      <div className="relative bg-white rounded-[14px] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full h-full">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="bg-primary/5 text-primary px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                              {scheme.category}
                            </div>
                            <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border ${
                              status === 'Ready to Apply' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              status === 'Not Eligible' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {status === 'Ready to Apply' ? <ShieldCheck className="w-3.5 h-3.5" /> : 
                               status === 'Not Eligible' ? <X className="w-3.5 h-3.5" /> : 
                               <AlertTriangle className="w-3.5 h-3.5" />}
                              {status === 'Ready to Apply' ? '[ELIGIBLE & VERIFIED]' : 
                               status === 'Not Eligible' ? '[NOT ELIGIBLE]' : 
                               '[VERIFICATION PENDING]'}
                            </div>
                          </div>
                          <h2 className="text-xl font-bold text-on-surface mb-1 group-hover:text-[#3525CD] transition-colors">
                            {scheme.title}
                          </h2>
                          <p className="text-sm text-on-surface-variant font-medium">
                            {scheme.provider}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-6 md:border-l md:border-surface-container md:pl-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-surface-container md:border-t-0">
                          <div className="flex flex-col">
                            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Required</span>
                            <span className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-[#3525CD]" /> {scheme.requiredDocs.length} Docs
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center group-hover:bg-[#3525CD] group-hover:text-white transition-colors ml-auto md:ml-4">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Dedicated Sub-View Layout */
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Top Summary Block */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border border-surface-container shadow-sm mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <ShieldCheck className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="inline-block bg-[#3525CD]/10 text-[#3525CD] px-4 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider border border-[#3525CD]/20">
                    {activeScheme.category}
                  </span>
                  <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {activeScheme.provider}
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-6 leading-tight max-w-4xl">{activeScheme.title}</h2>
                
                <p className="text-lg text-on-surface-variant leading-relaxed max-w-3xl mb-8">
                  This state-sponsored welfare initiative provides targeted assistance based on your verified civic profile metrics. Ensure your primary documents are synchronized with the Nagrik Mitra vault before proceeding with the application lifecycle.
                </p>
                
                {/* Documents Matrix Integration */}
                <div className="bg-[#f7f9fb] border border-outline-variant rounded-2xl p-6">
                  <h4 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#3525CD]" /> Mandatory Documents Framework
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeScheme.requiredDocs.map((doc, i) => {
                      const isVerified = (doc === 'Basic Profile' && !isGuest) || (userData.verified_documents && userData.verified_documents.includes(doc));
                      
                      return (
                        <div key={i} className="bg-white border border-surface-container rounded-xl p-4 flex items-start justify-between shadow-sm">
                          <span className="font-medium text-sm text-on-surface">{doc}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                            isVerified 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {isVerified ? '[PROFILE VERIFIED]' : '[VERIFICATION PENDING]'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Official Application Lifecycle Protocol */}
                <div className="bg-white rounded-3xl p-8 border border-surface-container shadow-sm">
                  <h3 className="font-extrabold text-2xl text-on-surface mb-8">Official Application Lifecycle Protocol</h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#3525CD] before:to-transparent">
                    {activeScheme.procedureSteps.map((step, i) => {
                      const isLastStep = i === activeScheme.procedureSteps.length - 1;
                      
                      return (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-[#3525CD] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <span className="font-bold">{i + 1}</span>
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#f7f9fb] p-6 rounded-2xl border border-surface-container shadow-sm group-hover:shadow-md transition-shadow">
                            <p className="text-on-surface-variant font-medium leading-relaxed">{step}</p>
                            
                            {/* Embed operational action link inside the step block */}
                            {isLastStep && (
                              <a 
                                href={activeScheme.applicationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 mt-5 bg-[#3525CD] hover:bg-[#2d1fae] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-[#3525CD]/20 hover:-translate-y-0.5"
                              >
                                Launch Official Portal <ChevronRight className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                {/* Pay Attention Points */}
                <div className="bg-rose-50 border-2 border-rose-100 rounded-3xl p-8 sticky top-24">
                  <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center text-rose-600 mb-6">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-rose-900 text-xl mb-4">Critical Conditions</h4>
                  <ul className="space-y-4">
                    {activeScheme.payAttentionPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                        <span className="text-rose-800 text-sm leading-relaxed font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Smart Mock Companion (Conversational Workspace) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isCompanionOpen && (
          <div className="mb-4 bg-white w-[350px] rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-surface-container overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom-right flex flex-col h-[450px]">
            <div className="bg-gradient-to-r from-[#3525CD] to-cyan-600 p-4 flex items-center gap-3 shrink-0">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h4 className="font-bold text-sm">Sarvam AI Workspace</h4>
                <p className="text-xs text-white/80">Civic Intelligence Agent</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-[#f7f9fb] flex flex-col gap-4">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-surface-container-high text-on-surface' : 'bg-[#3525CD] text-white'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-white border border-surface-container text-on-surface rounded-tr-sm' 
                      : 'bg-[#3525CD]/10 text-[#3525CD] font-medium border border-[#3525CD]/20 rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' 
                      ? msg.text 
                      : <div dangerouslySetInnerHTML={parseMarkdown(msg.text)} />
                    }
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Sandbox Area */}
            <div className="p-4 bg-white border-t border-surface-container">
              <div className="mb-3 flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  [Sarvam Multilingual Engine Active]
                </span>
              </div>
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0 ${isRecording ? 'bg-rose-50 border border-rose-200 text-rose-600 animate-pulse' : 'bg-[#f7f9fb] border border-outline-variant text-[#3525CD] hover:bg-surface-container-low'}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isRecording ? "[Listening... Speak in any local language]" : "Ask anything in your language..."}
                  disabled={isChatLoading || isRecording}
                  className="flex-1 px-4 py-3 w-full min-w-0 rounded-xl border border-surface-container bg-[#f7f9fb] text-sm focus:outline-none focus:border-[#3525CD] transition-colors disabled:opacity-70 text-on-surface"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading || isRecording}
                  className="p-3 bg-[#3525CD] hover:bg-[#2a1cb1] text-white rounded-xl flex items-center justify-center transition-colors shadow-sm shrink-0 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              
              {isChatLoading && (
                <p className="text-[10px] text-center text-[#3525CD] font-medium mt-2 animate-pulse">
                  Processing query via Sarvam Pipeline...
                </p>
              )}
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsCompanionOpen(!isCompanionOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isCompanionOpen ? 'bg-surface-container border border-outline-variant text-on-surface' : 'bg-[#3525CD] hover:bg-[#2d1fae] text-white hover:scale-105'
          }`}
        >
          {isCompanionOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1.005); }
        }
      `}} />
    </div>
  );
}
