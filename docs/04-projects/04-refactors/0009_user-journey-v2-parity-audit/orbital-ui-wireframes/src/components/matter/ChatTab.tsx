import React, { useEffect, useState, useRef } from 'react';
import { Send, Bot, User, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../hooks/useOrbitalState';
interface ChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onOpenSource: (citationId: string, page: number) => void;
}
const SUGGESTED_PROMPTS = [
'What are the key obligations of each party?',
'Summarize the termination provisions.',
'Are there any liability caps or limitations?',
'What intellectual property rights are assigned?'];

export function ChatTab({
  messages,
  onSendMessage,
  onOpenSource
}: ChatTabProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };
  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-lg shadow-ui-sm overflow-hidden">
      {/* Header / Run Picker */}
      <div className="px-4 py-3 border-b border-border bg-cyan-50/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-cyan-100 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <span className="text-sm font-medium text-foreground">
            Matter Assistant
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">Scope:</span>
          <select className="text-xs bg-card border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
            <option>Latest Run (run_882)</option>
            <option>Previous Run (run_881)</option>
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 &&
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-5 border border-purple-100">
              <Sparkles className="w-7 h-7 text-purple-500" />
            </div>
            <h3 className="font-serif font-medium text-lg text-foreground mb-2">
              Ask about this matter
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Get answers grounded in the indexed documents. All responses
              include source citations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt, idx) =>
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="text-left px-3 py-2.5 bg-purple-50/50 hover:bg-purple-50 border border-purple-100 rounded-lg text-xs text-foreground transition-colors leading-relaxed hover:border-purple-200">

                  {prompt}
                </button>
            )}
            </div>
          </div>
        }

        {messages.map((msg) =>
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            <div
            className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-cyan-200 text-cyan-800 ml-2.5' : 'bg-cyan-600 text-white mr-2.5'}`}>

                {msg.role === 'user' ?
              <User className="w-3.5 h-3.5" /> :

              <Bot className="w-3.5 h-3.5" />
              }
              </div>

              {/* Bubble */}
              <div className="flex flex-col">
                <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-100 text-foreground rounded-tr-sm' : 'bg-card border border-border text-foreground rounded-tl-sm shadow-ui-sm'}`}>

                  {msg.isStreaming ?
                <div className="flex items-center space-x-1.5 py-1">
                      <span
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{
                      animationDelay: '0ms'
                    }} />

                      <span
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{
                      animationDelay: '150ms'
                    }} />

                      <span
                    className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                    style={{
                      animationDelay: '300ms'
                    }} />

                    </div> :

                msg.content
                }
                </div>

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 &&
              <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.sources.map((source, idx) =>
                <button
                  key={idx}
                  onClick={() => onOpenSource(source.id, source.page)}
                  className="flex items-center bg-card border border-border hover:border-cyan-300 hover:bg-cyan-50 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-cyan-700 transition-colors">

                        <FileText className="w-3 h-3 mr-1.5" />
                        {source.label}
                      </button>
                )}
                  </div>
              }
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scope Warning */}
      <div className="px-4 py-1.5 bg-warning/5 border-t border-warning/10 flex items-center justify-center">
        <AlertCircle className="w-3 h-3 text-warning mr-2 flex-shrink-0" />
        <span className="text-[11px] text-warning">
          Answers are scoped to the selected run. External knowledge is limited.
        </span>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-card border-t border-border">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this matter..."
            className="w-full bg-muted/30 border border-border rounded-lg pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 transition-all" />

          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-1.5 top-1.5 p-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">

            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-1.5">
          AI responses may be inaccurate. Always verify with source documents.
        </p>
      </div>
    </div>);

}