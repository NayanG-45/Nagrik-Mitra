"use client";

import { useEffect, useState } from 'react';
import { Newspaper, Loader2, UserCircle, MapPin, AlertCircle } from 'lucide-react';

export default function NewsDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    role: 'citizen',
    location: 'local',
    grievanceContext: 'general'
  });

  useEffect(() => {
    // Inject local-storage active user properties dynamically
    try {
      const storedRole = localStorage.getItem('user_role');
      const storedLocation = localStorage.getItem('user_location');
      const storedContext = localStorage.getItem('user_context');
      
      // Explicit validation guard checks for guest users
      const isGuest = !storedRole && !storedLocation;
      
      const newUserData = {
        role: storedRole || (isGuest ? '' : 'citizen'),
        location: storedLocation || (isGuest ? '' : 'local'),
        grievanceContext: storedContext || (isGuest ? 'General Bulletins' : 'general'),
        isGuest
      };

      const fetchNews = async () => {
        try {
          const params = new URLSearchParams({
            role: newUserData.role,
            location: newUserData.location,
            grievanceContext: newUserData.grievanceContext
          });
          
          const response = await fetch(`/api/news?${params.toString()}`);
          if (!response.ok) throw new Error('Failed to fetch news');
          const data = await response.json();
          setArticles(data.articles || []);
          setUserData(newUserData);
        } catch (error) {
          console.error("Error loading news:", error);
          setUserData(newUserData);
        } finally {
          setLoading(false);
        }
      };

      fetchNews();
    } catch (e) {
      console.error("Local storage error:", e);
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 font-sans">
      <div className="max-w-[1280px] mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Newspaper className="w-8 h-8 text-primary" />
            <h1 className="text-headline-lg text-on-surface">Live News & Updates</h1>
          </div>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Real-time Indian civic updates personalized to your current location and active requests.
          </p>
          
          <div className="mt-6 flex flex-wrap gap-4">
             <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant text-label-md text-on-surface">
                <UserCircle className="w-4 h-4 text-primary" />
                <span className="capitalize">{userData.role || 'Guest'}</span>
             </div>
             <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant text-label-md text-on-surface">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="capitalize">{userData.location || 'India'}</span>
             </div>
             <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-label-md transition-colors ${userData.isGuest ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-low border-outline-variant text-on-surface'}`}>
                <AlertCircle className={`w-4 h-4 ${userData.isGuest ? 'text-on-primary' : 'text-primary'}`} />
                <span className="capitalize">{userData.grievanceContext}</span>
             </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
            {articles.map((article, index) => (
              <article 
                key={index} 
                className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_8px_30px_rgba(15,23,42,0.03)] border border-surface-container transition-transform hover:-translate-y-1 duration-300 flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="text-label-sm text-primary font-bold tracking-wider uppercase mb-3">
                    {article.source?.name || 'Civic Update'}
                  </div>
                  <h2 className="text-body-lg font-bold text-on-surface mb-3 line-clamp-2 leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-body-md text-on-surface-variant line-clamp-3 mb-6">
                    {article.description}
                  </p>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-container">
                  <span className="text-label-sm text-outline">
                    {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-label-md text-primary hover:text-primary-container font-semibold transition-colors"
                  >
                    Read more
                  </a>
                </div>
              </article>
            ))}
            
            {articles.length === 0 && (
              <div className="col-span-full text-center py-12 bg-surface-container-lowest rounded-2xl border border-surface-container">
                <p className="text-body-lg text-on-surface-variant">No relevant civic updates found for your current profile.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
