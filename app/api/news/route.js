import { NextResponse } from 'next/server';

const fallbackArticles = [
  {
    title: "SBI Asha and Corporate Scholarship Schemes Final Allocation Guidelines",
    description: "The Ministry of Education in partnership with SBI has released updated allocation guidelines for national corporate scholarships.",
    url: "#",
    publishedAt: new Date().toISOString(),
    source: { name: "GovNews India" }
  },
  {
    title: "National Passport Processing Price Revision",
    description: "Citizens will see a revised fee structure for expedited passport processing starting next month, alongside new digital verification steps.",
    url: "#",
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    source: { name: "Civic Update" }
  },
  {
    title: "Municipal Works Budget Allocated for Q3 Infrastructure",
    description: "Local civic bodies have received a major boost in funding tailored for critical municipal infrastructure and road maintenance projects.",
    url: "#",
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    source: { name: "City Daily" }
  },
  {
    title: "Healthcare Subsidies Expanded in Rural Areas",
    description: "The health ministry announced a new scheme expanding subsidies for rural primary health centers starting this quarter.",
    url: "#",
    publishedAt: new Date(Date.now() - 259200000).toISOString(),
    source: { name: "Health Bulletin" }
  },
  {
    title: "General Public Transport Upgrades Announced",
    description: "New policies will integrate electric buses into the national public infrastructure over the next two years to improve urban mobility.",
    url: "#",
    publishedAt: new Date(Date.now() - 345600000).toISOString(),
    source: { name: "Transport Today" }
  },
  {
    title: "Digital India Initiative Reaches Milestone",
    description: "The national digital literacy campaign has successfully covered 50 million citizens, enhancing e-governance access nationwide.",
    url: "#",
    publishedAt: new Date(Date.now() - 432000000).toISOString(),
    source: { name: "Tech Governance" }
  },
  {
    title: "Updates on Municipal Waste Management Rules",
    description: "Strict new municipal guidelines for segregation of waste at the source have been rolled out in metropolitan areas.",
    url: "#",
    publishedAt: new Date(Date.now() - 518400000).toISOString(),
    source: { name: "Eco Civic" }
  },
  {
    title: "National Passport Timelines Optimized",
    description: "A new simplified verification matrix is set to reduce the standard passport issuance timeline by up to 10 days.",
    url: "#",
    publishedAt: new Date(Date.now() - 604800000).toISOString(),
    source: { name: "India Travel Updates" }
  }
];

export async function GET(request) {
  console.log("=== HACKATHON DEBUG: GNEWS_API_KEY IS:", process.env.GNEWS_API_KEY ? "FOUND/DEFINED" : "UNDEFINED");

  const { searchParams } = new URL(request.url);
  const roleParam = searchParams.get('role');
  const locationParam = searchParams.get('location');
  const grievanceContextParam = searchParams.get('grievanceContext');

  // Base Stages 1, 2, 3 keywords
  const baseQuery = '"scholarship" OR "passport" OR "municipal" OR "scheme"';
  let dynamicQuery = "";

  // Check if user is signed in
  const isGuest = !roleParam || !locationParam || roleParam === 'guest' || roleParam.trim() === '';
  
  // Apply Stage 4 if authenticated, otherwise use base query
  if (!isGuest) {
    dynamicQuery = ` AND (${roleParam} OR ${locationParam}${grievanceContextParam ? ` OR ${grievanceContextParam}` : ''})`;
  }
  
  const finalQuery = `${baseQuery}${dynamicQuery}`;
  const apiKey = process.env.GNEWS_API_KEY;

  // Emergency safety rule: ONLY exit early if the API key is completely missing
  if (!apiKey || apiKey.trim() === '') {
    console.log("API Key missing, serving fallbackArticles.");
    return NextResponse.json({ articles: fallbackArticles });
  }

  const apiUrl = new URL('https://gnews.io/api/v4/search');
  apiUrl.searchParams.append('q', finalQuery);
  apiUrl.searchParams.append('country', 'in');
  apiUrl.searchParams.append('lang', 'en');
  apiUrl.searchParams.append('apikey', apiKey); // GNews uses token or apikey param

  try {
    const response = await fetch(apiUrl.toString(), {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ articles: data.articles || [] });
  } catch (error) {
    console.error("GNews API Exception:", error.message);
    return NextResponse.json({ articles: fallbackArticles });
  }
}
