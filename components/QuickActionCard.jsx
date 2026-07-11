import Link from "next/link";

export default function QuickActionCard({ title, description, icon: Icon, href, actionText = "Launch" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        </div>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">{description}</p>
      </div>
      <Link
        href={href}
        className="w-full text-center py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-semibold transition-all"
      >
        {actionText}
      </Link>
    </div>
  );
}
