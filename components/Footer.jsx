import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-desktop py-unit-xl max-w-container-max mx-auto">
        <div className="md:col-span-1">
          <span className="font-display text-headline-md font-bold text-on-surface mb-4 block">Nagrik Mitra</span>
          <p className="text-on-secondary-fixed-variant font-body-md text-body-md mb-6">Empowering citizens with seamless digital bridges to governance and infrastructure.</p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-outline-variant/20 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-outline-variant/20 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">alternate_email</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Security</Link></li>
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">API Documentation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">Platform</h4>
          <ul className="space-y-4">
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Schemes</Link></li>
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Services</Link></li>
            <li><Link href="#" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Grievances</Link></li>
            <li><Link href="/assistant" className="text-on-secondary-fixed-variant font-label-sm text-label-sm hover:text-on-background transition-colors">Assistant</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-6">Stay Updated</h4>
          <p className="text-on-secondary-fixed-variant font-label-sm text-label-sm mb-4">Get the latest legislative updates directly in your inbox.</p>
          <div className="flex gap-2">
            <input className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="email@gov.in" type="email" />
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-sm text-label-sm hover:bg-primary-container transition-colors">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-desktop py-unit-md border-t border-outline-variant/50 flex flex-col md:flex-row justify-between items-center gap-4 text-on-secondary-fixed-variant font-label-sm text-label-sm opacity-80">
        <span>© 2024 Nagrik Mitra. Empowering Civic Infrastructure.</span>
        <div className="flex gap-8">
          <span>Accessibility Statement</span>
          <span>Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
}
