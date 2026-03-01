import React, { useState } from 'react';
import { 
  Sparkles, Zap, Search, MapPin, BrainCircuit, 
  Image as ImageIcon, Video, Mic, Wand2, MessageSquare,
  ArrowLeft
} from 'lucide-react';
import ChatInterface from './ChatInterface';
import LiveAudioInterface from './LiveAudioInterface';

const features = [
  { id: 'chat', title: 'Gemini Intelligence', desc: 'General AI Assistant', icon: Sparkles, model: 'gemini-3.1-pro-preview' },
  { id: 'fast', title: 'Fast Responses', desc: 'Low-latency answers', icon: Zap, model: 'gemini-2.5-flash-lite' },
  { id: 'search', title: 'Search Grounding', desc: 'Up-to-date web info', icon: Search, model: 'gemini-3-flash-preview', useSearch: true },
  { id: 'maps', title: 'Maps Grounding', desc: 'Location-based info', icon: MapPin, model: 'gemini-2.5-flash', useMaps: true },
  { id: 'thinking', title: 'Thinking Mode', desc: 'Deep reasoning', icon: BrainCircuit, model: 'gemini-3.1-pro-preview', useThinking: true },
  { id: 'image-gen', title: 'Image Generation', desc: 'Create images from text', icon: ImageIcon, type: 'image-gen' },
  { id: 'image-edit', title: 'Image Editing', desc: 'Edit images with AI', icon: Wand2, type: 'image-edit' },
  { id: 'video-gen', title: 'Video Generation', desc: 'Create videos from text', icon: Video, type: 'video-gen' },
  { id: 'media', title: 'Media Analysis', desc: 'Analyze images & video', icon: ImageIcon, type: 'media' },
  { id: 'audio', title: 'Audio Transcription', desc: 'Speech to text', icon: Mic, type: 'audio' },
  { id: 'tts', title: 'Generate Speech', desc: 'Text to speech', icon: Mic, type: 'tts' },
  { id: 'live', title: 'Live Voice', desc: 'Real-time conversation', icon: MessageSquare, type: 'live' },
];

export default function AIAssistant() {
  const [activeFeature, setActiveFeature] = useState<any>(null);

  if (activeFeature) {
    return (
      <div className="ai-container">
        <button 
          className="mn-btn flex items-center gap-2 mb-4"
          onClick={() => setActiveFeature(null)}
        >
          <ArrowLeft size={16} /> Back to Hub
        </button>
        {activeFeature.type === 'live' ? (
          <LiveAudioInterface />
        ) : (
          <ChatInterface feature={activeFeature} />
        )}
      </div>
    );
  }

  return (
    <div className="ai-container">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-['Cinzel'] font-bold text-[#D4AF37] mb-2">MND AI Hub</h1>
        <p className="text-gray-400">Select an AI capability to begin</p>
      </div>
      
      <div className="ai-grid">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.id} className="ai-card" onClick={() => setActiveFeature(f)}>
              <Icon className="ai-card-icon" />
              <div className="ai-card-title">{f.title}</div>
              <div className="ai-card-desc">{f.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
