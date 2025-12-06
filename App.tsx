import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { InputArea } from './components/InputArea';
import { Message, Role, MessageType, Attachment } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { Info, ShieldCheck, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      type: MessageType.TEXT,
      content: text,
      timestamp: new Date(),
      attachment: attachment
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Pass the entire history (excluding the one we just added to state locally, let service handle history construction)
      const responseText = await sendMessageToGemini(messages, text, attachment ? { mimeType: attachment.mimeType, data: attachment.data } : undefined);
      
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        type: MessageType.TEXT,
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        type: MessageType.ERROR,
        content: "I'm encountering a connection error with the medical database. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-slate-200 font-sans selection:bg-med-500/30">
      <Header />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-med-900/10 via-dark-900 to-dark-900">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 pb-4">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-float">
               <div className="w-20 h-20 bg-med-500/10 rounded-full flex items-center justify-center border border-med-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                 <ShieldCheck className="w-10 h-10 text-med-400" />
               </div>
               <div className="max-w-md space-y-2">
                 <h2 className="text-2xl font-bold text-white">MedNexus AI Online</h2>
                 <p className="text-slate-400">
                   Advanced healthcare triage and information system. 
                   Ask about symptoms, medications, or upload medical images for analysis.
                 </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                  {/* Primary Call to Action */}
                  <button 
                    onClick={() => handleSendMessage("I need to check my symptoms. Start triage.")}
                    className="col-span-1 md:col-span-2 p-4 bg-med-900/20 border border-med-500/50 hover:bg-med-900/40 rounded-xl text-med-200 hover:text-white transition flex items-center justify-center space-x-2 group shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                  >
                    <Activity className="w-5 h-5 text-med-400 group-hover:animate-pulse" />
                    <span className="font-semibold tracking-wide">START INTELLIGENT TRIAGE</span>
                  </button>

                  <button 
                    onClick={() => handleSendMessage("Can you analyze this rash image for me?")}
                    className="p-3 bg-dark-800/50 border border-med-900/30 hover:border-med-500/50 rounded-xl text-sm text-slate-300 hover:text-med-300 transition text-left"
                  >
                    "Analyze a medical image"
                  </button>
                  <button 
                    onClick={() => handleSendMessage("Create a diet plan for hypertension.")}
                    className="p-3 bg-dark-800/50 border border-med-900/30 hover:border-med-500/50 rounded-xl text-sm text-slate-300 hover:text-med-300 transition text-left"
                  >
                    "Diet plan for hypertension"
                  </button>
                  <button 
                    onClick={() => handleSendMessage("Explain how mRNA vaccines work.")}
                    className="p-3 bg-dark-800/50 border border-med-900/30 hover:border-med-500/50 rounded-xl text-sm text-slate-300 hover:text-med-300 transition text-left"
                  >
                    "How do mRNA vaccines work?"
                  </button>
               </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex items-center space-x-2 pl-2">
              <div className="w-2 h-2 bg-med-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-med-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-med-500 rounded-full animate-bounce"></div>
              <span className="text-xs text-med-500/70 font-mono animate-pulse ml-2">ANALYZING DATABASE...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-med-900 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-med-900/20">
            <div className="flex items-center space-x-3 mb-4">
              <Info className="w-6 h-6 text-med-400" />
              <h3 className="text-lg font-bold text-white">Medical Disclaimer</h3>
            </div>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              MedNexus AI is a demonstration tool designed for educational and informational purposes only. 
              <br/><br/>
              <strong className="text-med-300">It does NOT provide medical diagnosis, treatment, or professional advice.</strong> 
              <br/><br/>
              Always consult a qualified healthcare provider for personal medical questions. 
              If you think you have a medical emergency, call emergency services immediately.
            </p>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="w-full py-3 bg-med-600 hover:bg-med-500 text-white font-medium rounded-xl transition shadow-[0_0_15px_rgba(13,148,136,0.4)]"
            >
              I Understand & Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;