import React, { useState, useRef } from 'react';
import { Send, Upload, Mic, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { 
  chatWithGemini, analyzeMedia, transcribeAudio, 
  generateImage, editImage, generateVideo, generateSpeech 
} from '../services/geminiService';
import Markdown from 'react-markdown';

export default function ChatInterface({ feature }: { feature: any }) {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, media?: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<"512px" | "1K" | "2K" | "4K">("1K");
  const [videoRatio, setVideoRatio] = useState<"16:9" | "9:16">("16:9");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSend = async () => {
    if (!input && !file) return;

    const userMsg = input;
    const currentFile = file;
    const currentPreview = filePreview;

    setMessages(prev => [...prev, { role: 'user', text: userMsg, media: currentPreview || undefined }]);
    setInput('');
    setFile(null);
    setFilePreview(null);
    setIsLoading(true);

    try {
      let responseText = '';
      let responseMedia = '';

      if (feature.type === 'image-gen') {
        const imgUrl = await generateImage(userMsg, imageSize);
        responseMedia = imgUrl;
        responseText = "Here is your generated image:";
      } else if (feature.type === 'video-gen') {
        const vidUrl = await generateVideo(userMsg, videoRatio);
        responseMedia = vidUrl;
        responseText = "Here is your generated video:";
      } else if (feature.type === 'tts') {
        const audioUrl = await generateSpeech(userMsg);
        responseMedia = audioUrl;
        responseText = "Here is the generated speech:";
      } else if (currentFile) {
        const base64 = currentPreview?.split(',')[1] || '';
        if (feature.type === 'image-edit') {
          const imgUrl = await editImage(userMsg, base64, currentFile.type);
          responseMedia = imgUrl;
          responseText = "Here is the edited image:";
        } else if (feature.type === 'audio') {
          responseText = await transcribeAudio(base64, currentFile.type);
        } else {
          responseText = await analyzeMedia(userMsg, base64, currentFile.type);
        }
      } else {
        responseText = await chatWithGemini(userMsg, feature.model, feature.useSearch, feature.useMaps, feature.useThinking);
      }

      setMessages(prev => [...prev, { role: 'ai', text: responseText, media: responseMedia || undefined }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="flex items-center gap-2">
          <feature.icon className="text-[#D4AF37]" />
          <h2 className="text-[#D4AF37] font-['Cinzel'] font-bold text-xl m-0">{feature.title}</h2>
        </div>
        {feature.type === 'image-gen' && (
          <select 
            className="mn-input text-sm py-1 px-2"
            value={imageSize}
            onChange={(e) => setImageSize(e.target.value as any)}
          >
            <option value="512px">512px</option>
            <option value="1K">1K</option>
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>
        )}
        {feature.type === 'video-gen' && (
          <select 
            className="mn-input text-sm py-1 px-2"
            value={videoRatio}
            onChange={(e) => setVideoRatio(e.target.value as any)}
          >
            <option value="16:9">Landscape (16:9)</option>
            <option value="9:16">Portrait (9:16)</option>
          </select>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <feature.icon size={48} className="mx-auto mb-4 opacity-50" />
            <p>Start interacting with {feature.title}</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="markdown-body">
              <Markdown>{msg.text}</Markdown>
            </div>
            {msg.media && (
              <div className="mt-2">
                {msg.media.startsWith('data:image') ? (
                  <img src={msg.media} alt="Media" className="max-w-full rounded-lg" />
                ) : msg.media.startsWith('data:audio') ? (
                  <audio controls src={msg.media} className="w-full mt-2" />
                ) : msg.media.startsWith('blob:') ? (
                  <video controls src={msg.media} className="max-w-full rounded-lg" />
                ) : null}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message ai flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} /> Processing...
          </div>
        )}
      </div>

      <div className="chat-input-area flex-col">
        {filePreview && (
          <div className="relative inline-block mb-2">
            {file?.type.startsWith('image') ? (
              <img src={filePreview} alt="Preview" className="h-20 rounded border border-[#D4AF37]" />
            ) : file?.type.startsWith('video') ? (
              <video src={filePreview} className="h-20 rounded border border-[#D4AF37]" />
            ) : file?.type.startsWith('audio') ? (
              <audio src={filePreview} controls className="h-10" />
            ) : null}
            <button 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              onClick={() => { setFile(null); setFilePreview(null); }}
            >
              &times;
            </button>
          </div>
        )}
        <div className="flex gap-2 w-full">
          {['image-edit', 'media', 'audio'].includes(feature.type) && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={feature.type === 'audio' ? 'audio/*' : feature.type === 'media' ? 'image/*,video/*' : 'image/*'}
                onChange={handleFileChange}
              />
              <button 
                className="nav-btn-square theme-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
              </button>
            </>
          )}
          <input 
            type="text" 
            className="chat-input" 
            placeholder={feature.type === 'audio' ? "Upload audio and click send..." : "Type your prompt here..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send-btn flex items-center gap-2" onClick={handleSend} disabled={isLoading}>
            <Send size={16} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
