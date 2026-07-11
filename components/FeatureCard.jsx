import Link from "next/link";

export default function FeatureCard({ title, description, icon: Icon, status, href }) {
  const isComingSoon = status?.toLowerCase() === "coming soon";

  const CardContent = () => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col h-full group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 group-hover:scale-105 transition-all duration-300">
          {Icon && <Icon className="h-6 w-6" />}
        </div>
        {status && (
          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold tracking-wide ${
              isComingSoon
                ? "bg-slate-100 text-slate-500"
                : "bg-emerald-50 text-emerald-700 border border-emerald-100"
            }`}
          >
            {status}
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed flex-grow">
        {description}
      </p>

      {!isComingSoon && href && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
          <span>Get Started</span>
          <span className="ml-1 transform group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </div>
      )}
    </div>
  );

  if (href && !isComingSoon) {
    return (
      <Link href={href} className="block h-full">
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="block h-full cursor-default">
      <CardContent />
    </div>
  );
}
