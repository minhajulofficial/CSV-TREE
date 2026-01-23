
import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import { AppView, SystemConfig } from '../types';
import { rtdb, ref, onValue } from '../services/firebase';

interface FooterProps {
  onNavigate: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    const configRef = ref(rtdb, 'system/config');
    onValue(configRef, (snapshot) => {
      if (snapshot.exists()) setConfig(snapshot.val());
    });
  }, []);

  const socials = config?.site?.socials || {
    facebook: '#', twitter: '#', instagram: '#', youtube: '#'
  };

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
              <SocialIcon href={socials.facebook} icon={<Facebook size={18} />} />
              <SocialIcon href={socials.twitter} icon={<Twitter size={18} />} />
              <SocialIcon href={socials.instagram} icon={<Instagram size={18} />} />
              <SocialIcon href={socials.youtube} icon={<Youtube size={18} />} />
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
              <li><FooterLink label="System Status" onClick={() => onNavigate('Status')} /></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-textMain text-xs font-black uppercase tracking-[0.2em]">Legal</h4>
            <ul className="space-y-4 text-sm font-bold text-textDim">
              <li><FooterLink label="Privacy Policy" onClick={() => onNavigate('Privacy')} /></li>
              <li><FooterLink label="Terms of Service" onClick={() => onNavigate('Terms')} /></li>
              <li><FooterLink label="Technical Support" onClick={() => onNavigate('Support')} /></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-borderMain flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-textDim text-[10px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
            © 2024 CSV TREE. MADE BY <span className="text-textMain font-black">{config?.site?.footerCredit || 'MINHAJUL ISLAM'}</span>
          </div>
          <div className="flex items-center gap-6 md:gap-8">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-black text-textMain uppercase tracking-widest">{config?.site?.status || 'Global Live'}</span>
             </div>
             <div className="text-[10px] font-black text-textDim uppercase tracking-widest">v{config?.site?.version || '2.5.0-Stable'}</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ label: string, onClick?: () => void }> = ({ label, onClick }) => (
  <button onClick={onClick} className="hover:text-primary transition-colors block text-left uppercase text-[10px] tracking-widest">{label}</button>
);

const SocialIcon: React.FC<{ icon: React.ReactNode, href: string }> = ({ icon, href }) => (
  <a href={href} target="_blank" className="w-10 h-10 rounded-xl bg-bgMain border border-borderMain flex items-center justify-center text-textDim hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 shadow-lg">
    {icon}
  </a>
);

export default Footer;
