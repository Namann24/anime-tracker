import { Link } from "react-router-dom";
import SagaLogo from "./SagaLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 pb-12 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-halftone opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="max-w-[1400px] mx-auto pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <SagaLogo />
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Chronicling the epic journeys of anime fans across the globe. Join the saga and track your path to greatness.
          </p>
          <div className="flex items-center gap-4">
            <SocialIcon icon="discord" />
            <SocialIcon icon="twitter" />
            <SocialIcon icon="github" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-6">
          <h4 className="text-shonen-bold text-lg text-white">Navigation</h4>
          <ul className="flex flex-col gap-3">
            <FooterLink to="/">Infinite Home</FooterLink>
            <FooterLink to="/search">Explore Archive</FooterLink>
            <FooterLink to="/watchlist">Your Chronicles</FooterLink>
            <FooterLink to="/analytics">Spirit Insight</FooterLink>
          </ul>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-6">
          <h4 className="text-shonen-bold text-lg text-white">Guild Support</h4>
          <ul className="flex flex-col gap-3">
            <FooterLink to="/help">Scroll of Help</FooterLink>
            <FooterLink to="/about">Our Origin</FooterLink>
            <FooterLink to="/privacy">Law of the Land</FooterLink>
            <FooterLink to="/terms">Contract of Fate</FooterLink>
          </ul>
        </div>

        {/* Newsletter / Action */}
        <div className="flex flex-col gap-6">
          <h4 className="text-shonen-bold text-lg text-white">Join the Guard</h4>
          <p className="text-gray-400 text-sm">Receive alerts for new seasons and major updates.</p>
          <div className="relative group">
            <input
              type="text"
              placeholder="Enter your scroll ID..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all"
            />
            <button className="absolute right-2 top-2 bottom-2 px-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all">
              Sign
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <span className="text-gray-500 text-xs">
          © {currentYear} SAGA CHRONICLES. ALL RIGHTS RESERVED.
        </span>
        <div className="flex items-center gap-6">
          <Link to="/status" className="text-gray-500 hover:text-white text-xs transition-colors uppercase tracking-widest font-bold">System Pulse</Link>
          <Link to="/changelog" className="text-gray-500 hover:text-white text-xs transition-colors uppercase tracking-widest font-bold">Evolutions</Link>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-400 hover:text-white text-sm transition-all hover:translate-x-1 inline-block"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ icon }) {
  // Simple icons for placeholder
  return (
    <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-600/20 hover:border-red-600/50 hover:text-red-500 transition-all hover:-translate-y-1">
      <span className="sr-only">{icon}</span>
      {icon === 'discord' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292.077.057.07.155-.015.128-1.02.518-1.51.713-1.872.892a.076.076 0 0 0-.041.106c.36.698.772 1.362 1.225 1.993.051.071.048.019.084.028a19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" /></svg>}
      {icon === 'twitter' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" /></svg>}
      {icon === 'github' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>}
    </a>
  );
}
