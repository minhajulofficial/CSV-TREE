
import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import { AppView } from '../types';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-bgSidebar border-t border-borderMain pt-20 pb-10 px-6 md:px-10 md:ml-[280px] transition-all">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 mb-16">
          <div className="col-span-2 md:col-span-1 space-y-6">
            <div className="flex items-center gap-1 text-2xl font-black tracking-tighter cursor-pointer" onClick={() => onNavigate('Home')}>
              <span className="text-primary">CSV</span>
              <span className="text-accent">TREE</span>
            </div>
            <p className="text-textDim text-sm leading-relaxed font-medium">
              The world's most advanced AI-powered metadata extraction tool for microstock contributors.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Instagram size={18} />} />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-textMain text-xs font-black uppercase tracking-[0.2em]">Tools</h4>
            <ul className="space-y-4 text-sm font-bold text-textDim">
              <li><FooterLink label="Vision Hub" onClick={() => onNavigate('Home')} /></li>
              <li><FooterLink label="Prompt Engine" onClick={() => onNavigate('Home')} /></li>
              <li><FooterLink label="Tutorials" onClick={() => onNavigate('Tutorials')} /></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-textMain text-xs font-black uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-textDim">
              <li><FooterLink label="About Us" onClick={() => onNavigate('About')} /></li>
              <li><FooterLink label="Pricing" onClick={() => onNavigate('Pricing')} /></li>
              <li><FooterLink label="Status" onClick={() => onNavigate('Home')} /></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-textMain text-xs font-black uppercase tracking-[0.2em]">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-textDim">
              <li><FooterLink label="Privacy" onClick={() => onNavigate('Privacy')} /></li>
              <li><FooterLink label="Terms" onClick={() => onNavigate('Terms')} /></li>
              <li><FooterLink label="Support" onClick={() => onNavigate('About')} /></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-borderMain flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-textDim text-[10px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            © 2024 CSV TREE. MADE WITH <Heart size={12} className="text-accent fill-accent" /> BY CONTRIBUTORS
          </div>
          <div className="flex items-center gap-6 md:gap-8">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-black text-textMain uppercase tracking-widest">Global Live</span>
             </div>
             <div className="text-[10px] font-black text-textDim uppercase tracking-widest">v2.5.0-Stable</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ label: string, onClick?: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} className="hover:text-primary transition-colors block text-left">{label}</button>
);

const SocialIcon: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
  <a href="#" className="w-10 h-10 rounded-xl bg-bgMain border border-borderMain flex items-center justify-center text-textDim hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
    {icon}
  </a>
);

export default Footer;
