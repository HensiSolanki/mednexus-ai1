import React, { useState, useEffect } from 'react';
import { Role, Message } from '../types';
import { Bot, User, Volume2, StopCircle, AlertTriangle } from 'lucide-react';
import { generateSpeech, pcmToAudioBuffer } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
}

// Global shared AudioContext to prevent creating too many contexts (browser limit is usually 6)
let sharedAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: 24000 
    });
  }
  return sharedAudioContext;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (sourceRef.current) {
        sourceRef.current.stop();
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      
      const ctx = getAudioContext();
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const rawAudioData = await generateSpeech(message.content);
      
      // Convert raw PCM to AudioBuffer
      const audioBuffer = pcmToAudioBuffer(rawAudioData, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      
      sourceRef.current = source;
      source.start(0);
      setIsPlaying(true);

    } catch (err) {
      console.error("Audio playback failed", err);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-med-300 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatContent = (text: string) => {
    // Advanced markdown parser for Triage structure
    return text.split('\n').map((line, i) => {
        // H3 Headers (used for Triage Assessment titles)
        if (line.trim().startsWith('###')) {
            return (
              <h3 key={i} className="text-lg font-bold text-med-400 mt-4 mb-2 tracking-wide border-b border-med-500/30 pb-1">
                {line.replace(/^###\s*/, '')}
              </h3>
            );
        }
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
                <div key={i} className="flex items-start space-x-2 ml-1 mb-1">
                    <span className="text-med-500 mt-1.5 text-xs">●</span>
                    <span className="flex-1 text-slate-200">{renderInlineStyles(line.replace(/^[-*]\s*/, ''))}</span>
                </div>
            );
        }
        // Regular paragraphs (if not empty)
        if (line.trim().length > 0) {
            return <p key={i} className="mb-2 leading-relaxed">{renderInlineStyles(line)}</p>;
        }
        return <div key={i} className="h-2" />; // Spacer for empty lines
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isUser ? 'bg-med-600' : 'bg-dark-800 border border-med-500/30'}`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-med-400" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            relative p-4 rounded-2xl shadow-lg
            ${isUser 
              ? 'bg-gradient-to-br from-med-600 to-med-800 text-white rounded-tr-none border border-med-500/50' 
              : 'bg-dark-800/80 backdrop-blur text-slate-200 rounded-tl-none border border-med-900/50'
            }
          `}>
            {message.attachment && (
              <div className="mb-3">
                <img 
                  src={message.attachment.previewUrl} 
                  alt="User upload" 
                  className="rounded-lg max-h-48 border border-white/20 object-cover"
                />
              </div>
            )}
            
            <div className="text-sm md:text-base font-light w-full">
              {formatContent(message.content)}
            </div>

            {!isUser && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <button 
                    onClick={handlePlayAudio}
                    disabled={isGeneratingAudio}
                    className="flex items-center space-x-1.5 text-xs text-med-400 hover:text-med-300 transition-colors disabled:opacity-50"
                   >
                     {isPlaying ? (
                        <>
                          <StopCircle className="w-4 h-4" />
                          <span>Stop</span>
                        </>
                     ) : (
                        <>
                          <Volume2 className={`w-4 h-4 ${isGeneratingAudio ? 'animate-pulse' : ''}`} />
                          <span>{isGeneratingAudio ? 'Synthesizing...' : 'Read Aloud'}</span>
                        </>
                     )}
                   </button>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            
            {isUser && (
                 <span className="text-[10px] text-med-200/60 font-mono mt-1 block text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            )}
          </div>
          
          {/* Disclaimer for AI messages */}
          {!isUser && (
             <div className="mt-1 flex items-center space-x-1 text-[10px] text-slate-500 opacity-60 ml-1">
               <AlertTriangle className="w-3 h-3" />
               <span>AI info. Consult a professional.</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};