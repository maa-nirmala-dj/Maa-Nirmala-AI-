import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MasterSettings from './components/MasterSettings';
import AIAssistant from './components/AIAssistant';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        openSettings={() => setIsSettingsOpen(true)} 
      />
      
      <MasterSettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme}
        setTheme={setTheme}
      />

      <main className="pt-4">
        <AIAssistant />
      </main>

      <div id="effect-layer"></div>
      
      <audio id="alarmAudio" loop>
        <source src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" type="audio/ogg" />
      </audio>
    </>
  );
}
