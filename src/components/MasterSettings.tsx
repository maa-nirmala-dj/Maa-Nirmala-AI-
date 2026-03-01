import React, { useState, useEffect } from 'react';
import { 
  X, SlidersHorizontal, Clock, Send, Volume2, 
  Palette, Snowflake, Bot, Newspaper 
} from 'lucide-react';

interface MasterSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function MasterSettings({ isOpen, onClose, theme, setTheme }: MasterSettingsProps) {
  const [timeString, setTimeString] = useState('');
  const [alarmTime, setAlarmTime] = useState('');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [quickMsg, setQuickMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Effects
  const [bassMode, setBassMode] = useState(false);
  const [rgbMode, setRgbMode] = useState(false);
  const [snowMode, setSnowMode] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [newspaperMode, setNewspaperMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
      setTimeString(timeStr);

      if (isAlarmActive && alarmTime) {
        const currentHM = timeStr.substring(0, 5);
        if (alarmTime === currentHM && now.getSeconds() === 0) {
          triggerAlarm();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAlarmActive, alarmTime]);

  useEffect(() => {
    if (bassMode) document.body.classList.add('bass-mode');
    else document.body.classList.remove('bass-mode');

    if (rgbMode) document.body.classList.add('rgb-mode');
    else document.body.classList.remove('rgb-mode');

    if (newspaperMode) document.body.classList.add('newspaper-mode');
    else document.body.classList.remove('newspaper-mode');
  }, [bassMode, rgbMode, newspaperMode]);

  useEffect(() => {
    let snowInterval: NodeJS.Timeout;
    const layer = document.getElementById('effect-layer');
    if (snowMode && layer) {
      snowInterval = setInterval(() => {
        const snow = document.createElement('div');
        snow.classList.add('snowflake');
        snow.innerHTML = '❄️';
        snow.style.left = Math.random() * 100 + 'vw';
        snow.style.animationDuration = Math.random() * 3 + 2 + 's';
        snow.style.opacity = Math.random().toString();
        snow.style.fontSize = (Math.random() * 15 + 10) + 'px';
        layer.appendChild(snow);
        setTimeout(() => snow.remove(), 4000);
      }, 100);
    } else if (layer) {
      layer.innerHTML = '';
    }
    return () => clearInterval(snowInterval);
  }, [snowMode]);

  useEffect(() => {
    if (voiceMode) {
      const pageText = document.body.innerText || document.body.textContent || '';
      const utterance = new SpeechSynthesisUtterance("Welcome to Maa Nirmala DJ. " + pageText.substring(0, 500));
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setVoiceMode(false);
    } else {
      window.speechSynthesis.cancel();
    }
  }, [voiceMode]);

  const toggleAlarm = () => {
    if (!isAlarmActive && !alarmTime) {
      alert("Please set a time for the alarm first!");
      return;
    }
    setIsAlarmActive(!isAlarmActive);
    if (isAlarmActive) {
      const audio = document.getElementById('alarmAudio') as HTMLAudioElement;
      if (audio) audio.pause();
      setBassMode(false);
    }
  };

  const triggerAlarm = () => {
    setBassMode(true);
    const audio = document.getElementById('alarmAudio') as HTMLAudioElement;
    if (audio) audio.play();
    alert("🚨 ALARM! MAA NIRMALA DJ TIME! 🚨");
  };

  const sendFeedback = () => {
    if (!quickMsg) return alert("Please type a message!");
    setIsSending(true);
    setTimeout(() => {
      alert("Sent! (API Token required for real Telegram link)");
      setIsSending(false);
      setQuickMsg('');
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div id="masterSettingsOverlay" onClick={(e) => { if ((e.target as HTMLElement).id === 'masterSettingsOverlay') onClose(); }}>
      <div className="mn-master-box">
        <div className="master-header">
          <X className="absolute top-4 right-5 text-[#D4AF37] cursor-pointer" size={30} onClick={onClose} />
          <h2 className="m-0 text-[#D4AF37] font-['Cinzel'] text-[22px] font-black tracking-wide flex items-center justify-center gap-2">
            <SlidersHorizontal size={24} /> Master Control
          </h2>
        </div>
        
        <div className="master-content">
          <div className="setting-row bg-[rgba(212,175,55,0.05)]">
            <div className="setting-label">
              <div className="setting-icon"><Clock size={20} /></div>
              <div>
                Live Time: <strong className="text-[#D4AF37]">{timeString || '00:00:00'}</strong>
                <div className="text-[11px] text-[#888]">Set Earthquake Alarm</div>
              </div>
            </div>
            <div className="flex gap-[10px] items-center">
              <input type="time" className="mn-input p-[5px]" value={alarmTime} onChange={e => setAlarmTime(e.target.value)} />
              <label className="mn-switch">
                <input type="checkbox" checked={isAlarmActive} onChange={toggleAlarm} />
                <span className="mn-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-row flex-col items-start">
            <div className="setting-label mb-[10px]">
              <div className="setting-icon text-[#0088cc]"><Send size={20} /></div>
              <div>Direct Message to Management</div>
            </div>
            <div className="flex w-full gap-[10px]">
              <input type="text" className="mn-input grow" placeholder="Type your feedback here..." value={quickMsg} onChange={e => setQuickMsg(e.target.value)} />
              <button className="mn-btn flex items-center gap-2" onClick={sendFeedback} disabled={isSending}>
                <Send size={16} /> {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <div className="setting-icon text-[#ff3333]"><Volume2 size={20} /></div>
              <div>Earthquake Bass<div className="text-[11px] text-[#888]">Screen physically shakes!</div></div>
            </div>
            <label className="mn-switch"><input type="checkbox" checked={bassMode} onChange={() => setBassMode(!bassMode)} /><span className="mn-slider"></span></label>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <div className="setting-icon text-[#00ff00]"><Palette size={20} /></div>
              <div>Dynamic RGB Shining<div className="text-[11px] text-[#888]">Colors shift like DJ Lights</div></div>
            </div>
            <label className="mn-switch"><input type="checkbox" checked={rgbMode} onChange={() => setRgbMode(!rgbMode)} /><span className="mn-slider"></span></label>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <div className="setting-icon text-[#fff]"><Snowflake size={20} /></div>
              <div>Magic Snowfall ❄️<div className="text-[11px] text-[#888]">Beautiful winter effect</div></div>
            </div>
            <label className="mn-switch"><input type="checkbox" checked={snowMode} onChange={() => setSnowMode(!snowMode)} /><span className="mn-slider"></span></label>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <div className="setting-icon text-[#00bcd4]"><Bot size={20} /></div>
              <div>Auto-Reader Voice<div className="text-[11px] text-[#888]">AI reads page to you</div></div>
            </div>
            <label className="mn-switch"><input type="checkbox" checked={voiceMode} onChange={() => setVoiceMode(!voiceMode)} /><span className="mn-slider"></span></label>
          </div>

          <div className="setting-row">
            <div className="setting-label">
              <div className="setting-icon text-[#ccc]"><Newspaper size={20} /></div>
              <div>Newspaper Mode<div className="text-[11px] text-[#888]">Simple reading view</div></div>
            </div>
            <label className="mn-switch"><input type="checkbox" checked={newspaperMode} onChange={() => setNewspaperMode(!newspaperMode)} /><span className="mn-slider"></span></label>
          </div>
        </div>
      </div>
    </div>
  );
}
