"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ShieldCheck, AlertTriangle, FileText, User, Save, MapPin, Calendar, Briefcase, IndianRupee, Loader2, Lock, UploadCloud } from 'lucide-react';

export default function ProfileRegistry() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    gender: 'Male',
    role: 'General Citizen', 
    income: '',
    location: '',
    verified_documents: []
  });

  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [userSession, setUserSession] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/login');
          return;
        }
        
        setUserSession(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          const complete = !!(
            profile.location && 
            profile.role && 
            profile.dob
          );

          setFormData({
            full_name: profile.full_name || user.user_metadata?.full_name || '',
            dob: profile.dob || '',
            gender: profile.gender || 'Male',
            role: profile.role || 'General Citizen',
            income: profile.income !== null && profile.income !== undefined ? profile.income.toString() : '',
            location: profile.location || '',
            verified_documents: profile.verified_documents || []
          });
          
          setIsProfileComplete(complete);
        } else {
          setFormData(prev => ({
            ...prev,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || ''
          }));
        }
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.dob || !formData.income || !formData.location || formData.location === 'India') {
      setToast({ type: 'error', message: 'Please provide a valid DOB, Income, and a location outside default country codes.' });
      return;
    }

    setSaving(true);
    setToast(null);

    try {
      const supabase = createClient();
      const updates = {
        full_name: formData.full_name,
        dob: formData.dob,
        gender: formData.gender,
        role: formData.role,
        income: formData.income ? Number(formData.income) : 0,
        location: formData.location,
        verified_documents: formData.verified_documents || [],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userSession.id, ...updates });

      if (error) {
        console.error("Supabase update error details:", error);
        throw error;
      }
      
      setIsProfileComplete(true);
      setToast({ type: 'success', message: 'Registry Profile locked and saved successfully!' });
      router.refresh(); 
    } catch (err) {
      console.error("[SYSTEM ALERT] Exception in profile update mutation:", err);
      setToast({ type: 'error', message: `Update exception: ${err.message || 'Check database schema compatibility.'}` });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const hasDoc = (docName) => formData.verified_documents?.includes(docName);

  const handleSimulateUpload = async (docName) => {
    setUploadingDoc(docName);
    try {
      const supabase = createClient();
      const updatedDocs = [...(formData.verified_documents || []), docName];
      
      const { error } = await supabase
        .from('profiles')
        .update({ verified_documents: updatedDocs })
        .eq('id', userSession.id);

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        verified_documents: updatedDocs
      }));
      
      setToast({ type: 'success', message: `${docName} securely vaults-verified!` });
      router.refresh();
    } catch (err) {
      console.error("Document vault save failure:", err);
      setToast({ type: 'error', message: 'Failed to synchronize document verification state.' });
    } finally {
      setUploadingDoc(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#3525CD]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] p-6 md:p-8 font-sans">
      <div className="max-w-[1280px] mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#191c1e] mb-2">Citizen Profile Registry</h1>
          <p className="text-lg text-[#464555] max-w-2xl">
            Manage your personal civic identity and monitor the status of your securely vaulted documents.
          </p>
        </header>

        {isProfileComplete && (
          <div className="bg-red-50 text-red-700 font-semibold px-4 py-3 rounded-xl border border-red-200 text-sm mb-6 flex items-center gap-2 shadow-sm animate-fade-in">
            <Lock className="w-5 h-5 shrink-0" />
            <span>⚠️ Civic Lock Active: Your registry details have been securely synchronized with the central governance node. To maintain data integrity, these attributes cannot be modified online. Please visit a local facilitation desk for updates.</span>
          </div>
        )}

        {toast && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-sm ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
             {toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
             <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Update Grid */}
          <div className="lg:col-span-2">
            <div className="bg-[#ffffff] rounded-3xl p-8 border border-[#e0e3e5] shadow-[0px_8px_30px_rgba(15,23,42,0.03)]">
              <h2 className="text-2xl font-bold text-[#191c1e] mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-[#3525CD]" /> Registry Details
              </h2>
              
              {!isProfileComplete && (
                <div className="bg-amber-50 text-amber-700 font-semibold px-4 py-3 rounded-xl border border-amber-200 text-sm mb-6 flex items-center gap-2 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  ⚠️ Civic Lock Warning: Your registry details will be securely synchronized with the central governance node upon update. To maintain data integrity, these attributes cannot be modified online afterward. Please ensure all details are correct.
                </div>
              )}
              
              {isProfileComplete ? (
                <div className="animate-fade-in">
                  <div className="space-y-4 bg-[#fcfdfe] rounded-2xl border border-[#e0e3e5] p-6">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <span className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1">Full Name (Identity)</span>
                        <span className="text-sm font-semibold text-[#191c1e]">{formData.full_name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1">Date of Birth</span>
                        <span className="text-sm font-semibold text-[#191c1e]">{formData.dob || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1">Gender</span>
                        <span className="text-sm font-semibold text-[#191c1e]">{formData.gender || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1">Core Economic Role</span>
                        <span className="text-sm font-semibold text-[#191c1e]">{formData.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1">Annual Family Income</span>
                        <span className="text-sm font-semibold text-[#191c1e]">₹{formData.income || '0'}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#464555] uppercase tracking-wider mb-1">Primary Location</span>
                        <span className="text-sm font-semibold text-[#191c1e]">{formData.location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#464555]">Full Name (Identity)</label>
                      <input 
                        type="text" 
                        value={formData.full_name} 
                        disabled 
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e3e5] bg-[#f2f4f6] text-[#5c647a] cursor-not-allowed font-medium focus:outline-none" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#464555] flex items-center gap-1.5"><Calendar className="w-4 h-4"/> Date of Birth</label>
                      <input 
                        type="date" 
                        name="dob"
                        value={formData.dob} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e3e5] bg-white text-[#191c1e] focus:outline-none focus:border-[#3525CD] transition-colors" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#464555]">Gender</label>
                      <select 
                        name="gender"
                        value={formData.gender} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e3e5] bg-white text-[#191c1e] focus:outline-none focus:border-[#3525CD] transition-colors appearance-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#464555] flex items-center gap-1.5"><Briefcase className="w-4 h-4"/> Core Economic Role</label>
                      <select 
                        name="role"
                        value={formData.role} 
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e3e5] bg-white text-[#191c1e] focus:outline-none focus:border-[#3525CD] transition-colors appearance-none"
                      >
                        <option value="Student">Student</option>
                        <option value="Farmer">Farmer</option>
                        <option value="General Citizen">General Citizen</option>
                        <option value="Entrepreneur">Entrepreneur</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#464555] flex items-center gap-1.5"><IndianRupee className="w-4 h-4"/> Annual Family Income (₹)</label>
                      <input 
                        type="number" 
                        name="income"
                        value={formData.income} 
                        onChange={handleChange}
                        placeholder="e.g. 500000"
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e3e5] bg-white text-[#191c1e] focus:outline-none focus:border-[#3525CD] transition-colors" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#464555] flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Primary Location</label>
                      <input 
                        type="text" 
                        name="location"
                        value={formData.location} 
                        onChange={handleChange}
                        placeholder="e.g. Lucknow, India"
                        className="w-full px-4 py-3 rounded-xl border border-[#e0e3e5] bg-white text-[#191c1e] focus:outline-none focus:border-[#3525CD] transition-colors" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e0e3e5] flex justify-end">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#3525CD] hover:bg-[#2d1fae] text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-[#3525CD]/20 hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Update Registry Profile
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Safe Document Vault Matrix */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#ffffff] rounded-3xl p-8 border border-[#e0e3e5] shadow-[0px_8px_30px_rgba(15,23,42,0.03)] sticky top-8">
              <h3 className="text-xl font-bold text-[#191c1e] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#3525CD]" /> Safe Document Vault
              </h3>
              
              {!isProfileComplete ? (
                <div className="p-8 border-2 border-dashed border-[#e0e3e5] rounded-2xl flex flex-col items-center justify-center text-center bg-[#f7f9fb] animate-fade-in">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-label-lg font-bold text-[#191c1e] mb-2">Vault Locked</h4>
                  <p className="text-body-sm text-[#464555]">
                    Complete your registry details on the left (including specific Income and Location) to activate your encrypted document vault workspace.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Basic Profile */}
                  <div className="p-4 rounded-2xl border border-[#e0e3e5] bg-[#f7f9fb] flex flex-col gap-3 group hover:border-[#3525CD]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#191c1e] text-sm">Basic Identity</span>
                    </div>
                    <div className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" /> [PROFILE VERIFIED]
                    </div>
                  </div>

                  {/* Income Certificate */}
                  <div className="p-4 rounded-2xl border border-[#e0e3e5] bg-[#f7f9fb] flex flex-col gap-3 group hover:border-[#3525CD]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#191c1e] text-sm">Income Certificate</span>
                      {!hasDoc('Income Certificate') && (
                        <button 
                          onClick={(e) => { e.preventDefault(); handleSimulateUpload('Income Certificate'); }}
                          disabled={uploadingDoc === 'Income Certificate'}
                          className="text-[10px] font-bold uppercase tracking-wider text-[#3525CD] bg-[#3525CD]/10 px-2 py-1 rounded-md hover:bg-[#3525CD]/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {uploadingDoc === 'Income Certificate' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                          Simulate Upload
                        </button>
                      )}
                    </div>
                    <div className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      hasDoc('Income Certificate') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {hasDoc('Income Certificate') ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />} 
                      {hasDoc('Income Certificate') ? '[PROFILE VERIFIED]' : '[VERIFICATION PENDING]'}
                    </div>
                  </div>

                  {/* Caste Certificate */}
                  <div className="p-4 rounded-2xl border border-[#e0e3e5] bg-[#f7f9fb] flex flex-col gap-3 group hover:border-[#3525CD]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#191c1e] text-sm">Caste Certificate</span>
                      {!hasDoc('Caste Certificate') && (
                        <button 
                          onClick={(e) => { e.preventDefault(); handleSimulateUpload('Caste Certificate'); }}
                          disabled={uploadingDoc === 'Caste Certificate'}
                          className="text-[10px] font-bold uppercase tracking-wider text-[#3525CD] bg-[#3525CD]/10 px-2 py-1 rounded-md hover:bg-[#3525CD]/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {uploadingDoc === 'Caste Certificate' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                          Simulate Upload
                        </button>
                      )}
                    </div>
                    <div className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      hasDoc('Caste Certificate') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {hasDoc('Caste Certificate') ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />} 
                      {hasDoc('Caste Certificate') ? '[PROFILE VERIFIED]' : '[VERIFICATION PENDING]'}
                    </div>
                  </div>

                  {/* Domicile Certificate */}
                  <div className="p-4 rounded-2xl border border-[#e0e3e5] bg-[#f7f9fb] flex flex-col gap-3 group hover:border-[#3525CD]/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#191c1e] text-sm">Domicile Certificate</span>
                      {!hasDoc('Domicile Certificate') && (
                        <button 
                          onClick={(e) => { e.preventDefault(); handleSimulateUpload('Domicile Certificate'); }}
                          disabled={uploadingDoc === 'Domicile Certificate'}
                          className="text-[10px] font-bold uppercase tracking-wider text-[#3525CD] bg-[#3525CD]/10 px-2 py-1 rounded-md hover:bg-[#3525CD]/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {uploadingDoc === 'Domicile Certificate' ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                          Simulate Upload
                        </button>
                      )}
                    </div>
                    <div className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      hasDoc('Domicile Certificate') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {hasDoc('Domicile Certificate') ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />} 
                      {hasDoc('Domicile Certificate') ? '[PROFILE VERIFIED]' : '[VERIFICATION PENDING]'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}