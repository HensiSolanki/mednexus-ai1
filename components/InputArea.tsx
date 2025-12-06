import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Mic, StopCircle } from 'lucide-react';
import { Attachment } from '../types';

interface InputAreaProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    // Check for standard or webkit speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence for typical chat interaction
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsRecording(true);
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(prev => {
            const trailingSpace = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + trailingSpace + finalTranscript;
          });
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;
    
    onSendMessage(input, attachment || undefined);
    setInput('');
    setAttachment(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      setAttachment({
        mimeType: file.type,
        data: base64Data,
        previewUrl: base64String
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="border-t border-med-900/30 bg-dark-900/90 backdrop-blur-lg p-4 relative overflow-hidden">
      {/* Recording Overlay/Effect */}
      {isRecording && (
        <div className="absolute inset-0 bg-med-950/20 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-r from-transparent via-med-500/5 to-transparent animate-pulse" />
          <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        {attachment && (
          <div className="mb-3 flex items-start animate-float">
            <div className="relative group">
              <img 
                src={attachment.previewUrl} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-lg border border-med-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
              />
              <button 
                onClick={() => setAttachment(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-400 hover:text-med-400 hover:bg-med-950/50 rounded-xl transition-all border border-transparent hover:border-med-500/20 mb-[1px]"
            title="Upload Medical Image"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className={`
            flex-1 bg-dark-800/80 border rounded-xl transition-all shadow-inner flex items-center
            ${isRecording ? 'border-red-500/40 ring-1 ring-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-med-900/50 focus-within:border-med-500/50 focus-within:ring-1 focus-within:ring-med-500/20'}
          `}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Listening to your voice..." : "Describe symptoms, ask medical questions..."}
              className={`w-full bg-transparent p-3 max-h-32 min-h-[50px] focus:outline-none resize-none placeholder-slate-500 ${isRecording ? 'text-red-100 placeholder-red-400/50' : 'text-slate-200'}`}
              rows={1}
            />
            
            <button
              type="button"
              onClick={toggleRecording}
              className={`
                mr-2 p-2 rounded-full transition-all duration-300
                ${isRecording 
                  ? 'bg-red-500/20 text-red-400 animate-pulse hover:bg-red-500/30' 
                  : 'hover:bg-med-900/30 text-slate-400 hover:text-med-300'
                }
              `}
              title={isRecording ? "Stop Recording" : "Start Voice Input"}
            >
              {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>

          <button 
            type="submit"
            disabled={isLoading || (!input.trim() && !attachment)}
            className={`
              p-3 rounded-xl flex items-center justify-center transition-all mb-[1px]
              ${isLoading || (!input.trim() && !attachment)
                ? 'bg-dark-800 text-slate-600 cursor-not-allowed' 
                : 'bg-med-600 text-white hover:bg-med-500 shadow-[0_0_15px_rgba(13,148,136,0.4)]'
              }
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <p className="text-[10px] text-slate-600">
            MedNexus provides information, not diagnosis.
          </p>
          {isRecording && (
            <div className="flex items-center space-x-1 animate-pulse">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <span className="text-[10px] text-red-400 font-mono tracking-wider">MIC ACTIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};