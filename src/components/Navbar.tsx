import React from 'react';
import { Menu, Crown, Sun, Moon, Settings } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  openSettings: () => void;
}

export default function Navbar({ theme, toggleTheme, openSettings }: NavbarProps) {
  return (
    <nav className="navbar" id="mainNavbar">
      <div className="brand">
        <Menu className="cursor-pointer" />
        <span className="flex items-center gap-2">
          <Crown size={20} /> MND Hub
        </span>
      </div>
      <div className="nav-right">
        <div id="google_translate_element"></div>
        <div className="controls">
          <button className="nav-btn-square theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="nav-btn-square set-btn" onClick={openSettings}>
            <Settings size={18} className="fa-spin-hover" />
          </button>
        </div>
      </div>
    </nav>
  );
}
