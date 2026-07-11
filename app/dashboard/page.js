import Link from "next/link";
import QuickActionCard from "@/components/QuickActionCard";

export default function Dashboard() {
  const recentActivity = [
    {
      title: "Digital Certificate Issued",
      time: "2 hours ago",
      type: "success",
      description: "Residential status certificate available for download.",
    },
    {
      title: "Complaint NAG-2026-001 submitted",
      time: "1 day ago",
      type: "info",
      description: "Grievance successfully filed and queued for review.",
    },
    {
      title: "You may be eligible for a scholarship",
      time: "3 days ago",
      type: "alert",
      description: "Matched with 'National Merit Scholarship' criteria.",
    },
  ];

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
              
              <Link href="/features" className="group bg-surface-container-lowest p-6 rounded-xl signature-shadow border border-outline-variant hover:border-primary transition-all duration-300 flex flex-col items-center justify-center text-center">
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

            {/* Timeline */}
            <div className="bg-surface-container-lowest p-unit-lg rounded-xl signature-shadow border border-outline-variant">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4 mb-6">
                <h2 className="font-headline-md text-on-surface">Timeline of Requests</h2>
                <Link href="#" className="font-label-sm text-primary hover:underline">View All History</Link>
              </div>
              <div className="space-y-6">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-label-md text-on-surface">{activity.title}</h4>
                        <span className="font-label-sm text-on-surface-variant whitespace-nowrap">{activity.time}</span>
                      </div>
                      <p className="font-body-sm text-on-surface-variant mt-1">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
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
