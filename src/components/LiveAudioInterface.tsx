import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";

export default function LiveAudioInterface() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    setError(null);
    nextPlayTimeRef.current = 0;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setIsConnecting(false);
            
            // Setup audio input
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              streamRef.current = stream;
              
              const audioContext = new AudioContext({ sampleRate: 16000 });
              audioContextRef.current = audioContext;
              
              const source = audioContext.createMediaStreamSource(stream);
              sourceRef.current = source;
              
              const processor = audioContext.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              source.connect(processor);
              processor.connect(audioContext.destination);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                }
                
                const buffer = new ArrayBuffer(pcmData.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < pcmData.length; i++) {
                  view.setInt16(i * 2, pcmData[i], true);
                }
                const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({
                    media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
                });
              };
            } catch (mediaErr: any) {
              console.error("Media error:", mediaErr);
              setError("Could not access microphone.");
              stopSession();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              nextPlayTimeRef.current = 0;
            }
            
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const binaryString = atob(base64Audio);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              const pcmData = new Int16Array(bytes.buffer);
              const floatData = new Float32Array(pcmData.length);
              for (let i = 0; i < pcmData.length; i++) {
                floatData[i] = pcmData[i] / 32768.0;
              }
              
              try {
                const audioContext = audioContextRef.current;
                const audioBuffer = audioContext.createBuffer(1, floatData.length, 24000);
                audioBuffer.getChannelData(0).set(floatData);
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContext.destination);
                
                const currentTime = audioContext.currentTime;
                if (nextPlayTimeRef.current < currentTime) {
                  nextPlayTimeRef.current = currentTime;
                }
                
                source.start(nextPlayTimeRef.current);
                nextPlayTimeRef.current += audioBuffer.duration;
              } catch (e) {
                console.error("Error playing audio", e);
              }
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error occurred.");
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful AI assistant for MND Hub.",
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsConnecting(false);
      stopSession();
    }
  };

  const stopSession = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      if (typeof sessionRef.current.close === 'function') {
        sessionRef.current.close();
      }
      sessionRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="chat-interface items-center justify-center">
      <div className="text-center">
        <h2 className="text-[#D4AF37] font-['Cinzel'] font-bold text-2xl mb-4">Live Voice Assistant</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Have a real-time voice conversation with the AI. Make sure your microphone is enabled.
        </p>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {!isConnected ? (
          <button 
            className="mn-btn flex items-center gap-2 mx-auto text-lg px-6 py-3"
            onClick={startSession}
            disabled={isConnecting}
          >
            {isConnecting ? <Loader2 className="animate-spin" /> : <Mic />}
            {isConnecting ? 'Connecting...' : 'Start Conversation'}
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[rgba(212,175,55,0.2)] flex items-center justify-center mb-6 animate-pulse border-2 border-[#D4AF37]">
              <Mic size={40} className="text-[#D4AF37]" />
            </div>
            <button 
              className="bg-red-500 text-white border-none px-6 py-3 rounded-lg cursor-pointer font-bold flex items-center gap-2"
              onClick={stopSession}
            >
              <Square size={16} /> Stop Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
