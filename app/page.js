"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const observerRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    observerRef.current = observer;

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-unit-xl pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] -ml-48 -mb-48"></div>
        </div>
        
        <div className="max-w-container-max mx-auto px-margin-desktop text-center animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Official Civic Governance Platform</span>
          </div>
          
          <h1 className="font-display text-display max-w-4xl mx-auto mb-6 text-on-background">
            Your Voice, Your Governance.
          </h1>
          
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-unit-lg">
            Access schemes, documents, and grievances in your own language. Empowering every citizen with transparent, technology-driven infrastructure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard" className="w-full sm:w-auto h-12 px-8 bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:scale-[1.01] transition-all duration-300 shadow-lg flex items-center justify-center gap-2">
              <span>Check Your Eligibility</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            <button className="w-full sm:w-auto h-12 px-8 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl font-label-md text-label-md hover:bg-surface-container-low transition-all duration-300 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">translate</span>
              <span>Choose Language</span>
            </button>
          </div>
          
          <div className="relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden signature-shadow border border-white/50">
            <div className="aspect-video relative">
              <img 
                className="w-full h-full object-cover" 
                alt="Dashboard Preview"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABmLqhPI5pAkfXEMcX8V1XhO-L7MzXvTrfZR458wQ8M__ebmW97zXZ4jaCVJKkAjY0yxVf9e-dvOag-zOFJkaOeH3Zx2xBlE_yMsTuMhB5XKXK8H0q0VTN2vSdtoIJ0wukQtpnQtNxUqy-M5rp-wznuB97zUQPq6QBYuDXdyYqmpkXTMlFIIcWYIAuLoXcVfcft5T_8cARW5091iNo8jZSJjApcHfisjW7W6oU0cgk0h_aizSGgnvykQ86SIqjTQkQAbiIVi_RGOc" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-unit-xl bg-white/40">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-display text-headline-lg text-on-background mb-4">Empowering Services</h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">Seamlessly manage your civic responsibilities and rights through our integrated digital platform.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Eligibility Check */}
            <div className="animate-on-scroll group bg-surface-container-lowest p-unit-lg rounded-2xl signature-shadow border border-outline-variant/30 transition-all duration-300 hover:scale-[1.01] hover:bg-white cursor-pointer flex flex-col items-start text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[28px]">fact_check</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Eligibility Check</h3>
              <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed">
                Discover government schemes and benefits customized to your profile using our smart verification engine.
              </p>
              <div className="mt-auto flex items-center gap-2 text-primary font-label-md text-label-md">
                <span>Check Now</span>
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
              </div>
            </div>

            {/* Grievance Redressal */}
            <div className="animate-on-scroll group bg-surface-container-lowest p-unit-lg rounded-2xl signature-shadow border border-outline-variant/30 transition-all duration-300 hover:scale-[1.01] hover:bg-white cursor-pointer flex flex-col items-start text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[28px]">campaign</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Grievance Redressal</h3>
              <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed">
                Report issues and track resolutions in real-time. Direct communication with governance departments.
              </p>
              <div className="mt-auto flex items-center gap-2 text-primary font-label-md text-label-md">
                <span>File Report</span>
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
              </div>
            </div>

            {/* Knowledge Base */}
            <div className="animate-on-scroll group bg-surface-container-lowest p-unit-lg rounded-2xl signature-shadow border border-outline-variant/30 transition-all duration-300 hover:scale-[1.01] hover:bg-white cursor-pointer flex flex-col items-start text-left">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[28px]">auto_stories</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-3 text-on-surface">Knowledge Base</h3>
              <p className="text-on-surface-variant font-body-md text-body-md mb-6 leading-relaxed">
                Comprehensive documentation, multi-lingual guides, and legislative updates at your fingertips.
              </p>
              <div className="mt-auto flex items-center gap-2 text-primary font-label-md text-label-md">
                <span>Explore Library</span>
                <span className="material-symbols-outlined text-[18px]">trending_flat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-unit-xl relative animate-on-scroll">
        <div className="max-w-container-max mx-auto px-margin-desktop">
          <div className="bg-primary p-unit-lg md:p-unit-xl rounded-[2rem] text-center text-on-primary relative overflow-hidden signature-shadow">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
                <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)"></path>
                <defs>
                  <pattern height="10" id="grid" patternUnits="userSpaceOnUse" width="10">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"></path>
                  </pattern>
                </defs>
              </svg>
            </div>
            
            <h2 className="font-display text-headline-lg mb-6 relative z-10">Start Your Digital Journey Today</h2>
            <p className="text-on-primary-container max-w-xl mx-auto mb-unit-lg relative z-10 opacity-90">
              Join thousands of citizens already using Nagrik Mitra to bridge the gap between their voice and active governance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <button className="bg-white text-primary px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-primary-fixed-dim transition-all duration-300">
                Create Account
              </button>
              <button className="bg-primary-container text-white border border-white/20 px-8 py-4 rounded-xl font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-all duration-300">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
