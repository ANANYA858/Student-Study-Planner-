import React, { useState, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  sources?: Array<{ uri: string; title: string }>;
  imageUrl?: string;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerToast: (msg: string, badge?: string) => void;
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  onTriggerToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content:
        "Hello! I am your SyncLife Circadian & Academic Mentor. How can I help you optimize your study blocks, explain tough concepts, or ground your schedule today?",
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [useMaps, setUseMaps] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'visuals'>('chat');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Brain Dump Floating State & Persistence
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState(() => {
    return localStorage.getItem('synclife_brain_dump') || '';
  });

  useEffect(() => {
    localStorage.setItem('synclife_brain_dump', brainDumpText);
  }, [brainDumpText]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          useSearch,
          useMaps,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      const modelMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: data.reply,
        timestamp: Date.now(),
        sources: data.groundingMetadata?.groundingChunks?.map((c: { web?: { uri?: string; title?: string } }) => ({
          uri: c.web?.uri || '#',
          title: c.web?.title || 'Web Source',
        })),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Chat error';
      onTriggerToast(`Gemini error: ${msg}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  // Audio recording with gemini-3.5-transcribe
  const handleToggleVoice = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            onTriggerToast('Transcribing audio with gemini-3.5-transcribe...', 'VOICE');
            try {
              const res = await fetch('/api/gemini/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Audio, mimeType: 'audio/webm' }),
              });
              const data = await res.json();
              if (data.text) {
                setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
                onTriggerToast('Voice transcribed successfully! 🎙️', 'TRANSCRIBED');
              }
            } catch {
              onTriggerToast('Audio transcription failed', 'ERROR');
            }
          };
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        onTriggerToast('Listening... Speak your study question 🎙️', 'RECORDING');
      } catch {
        onTriggerToast('Microphone access denied', 'MIC DENIED');
      }
    }
  };

  // Generate Image with gemini-3.1-flash-image
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    onTriggerToast('Synthesizing study visual with Gemini...', 'GENERATING');

    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            role: 'model',
            content: `Generated study infographic for: "${imagePrompt}"`,
            imageUrl: data.imageUrl,
            timestamp: Date.now(),
          },
        ]);
        setActiveTab('chat');
        setImagePrompt('');
        onTriggerToast('Visual created successfully! 🎨', 'CREATED');
      }
    } catch {
      onTriggerToast('Image generation failed', 'ERROR');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Organize Brain Dump with Gemini
  const handleOrganizeBrainDump = async () => {
    if (!brainDumpText.trim()) {
      onTriggerToast('Brain Dump is empty! Write some thoughts first.', 'EMPTY');
      return;
    }

    const brainDumpContent = brainDumpText.trim();
    setIsBrainDumpOpen(false);
    setActiveTab('chat');

    const userPrompt = `🧠 Please organize my study session brain dump into structured categories:\n\n${brainDumpContent}`;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          systemInstruction:
            'You are SyncLife AI, an expert Academic & Circadian Productivity Mentor. When given a student\'s brain dump, organize it cleanly into: 1) 🚨 Urgent Action Items, 2) 📚 Academic & Study Tasks (suggesting high-focus vs evening slots), and 3) 💭 Parked Ideas / Low Priority. Provide an encouraging anti-burnout tone.',
          model: selectedModel,
          useSearch: false,
          useMaps: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');

      const modelMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'model',
        content: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
      onTriggerToast('Gemini organized your brain dump into structured tasks! 🧠✨', 'ORGANIZED');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Organization error';
      onTriggerToast(`Gemini error: ${msg}`, 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container rounded-2xl w-full max-w-lg h-[86vh] flex flex-col shadow-2xl border border-outline-variant/40 overflow-hidden relative">
        {/* Header */}
        <div className="p-3.5 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-headline text-sm font-bold text-on-surface">
                  SyncLife Gemini Mentor
                </h3>
                <span className="font-label-badge text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold">
                  AI Multimodal
                </span>
              </div>
              <span className="font-body text-[11px] text-on-surface-variant block">
                Grounding with Search, Maps, Vision & Voice
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Tab Strip: Chat vs Visual Studio */}
        <div className="flex border-b border-outline-variant/20 bg-surface-container-low px-3 py-1 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-1 px-3 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition ${
              activeTab === 'chat'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">chat</span>
            <span>Study Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`py-1 px-3 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition ${
              activeTab === 'visuals'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">palette</span>
            <span>Create Infographics</span>
          </button>
        </div>

        {/* Grounding & Model Bar */}
        <div className="px-3 py-2 bg-surface-container-lowest/80 border-b border-outline-variant/20 flex items-center justify-between text-[11px] gap-2 flex-wrap">
          {/* Grounding tools */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setUseSearch(!useSearch);
                if (!useSearch) setUseMaps(false);
              }}
              className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                useSearch
                  ? 'bg-secondary/20 border-secondary text-secondary font-bold'
                  : 'border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">search</span>
              <span>Google Search</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUseMaps(!useMaps);
                if (!useMaps) setUseSearch(false);
              }}
              className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                useMaps
                  ? 'bg-secondary/20 border-secondary text-secondary font-bold'
                  : 'border-outline-variant/30 text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              <span>Maps (Libraries)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBrainDumpOpen(!isBrainDumpOpen)}
              className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition ${
                isBrainDumpOpen || brainDumpText.trim()
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-700 dark:text-amber-400 font-bold'
                  : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
              }`}
              title="Toggle floating study brain dump scratchpad"
            >
              <span>🧠</span>
              <span>Brain Dump</span>
              {brainDumpText.trim() && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Model picker */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as never)}
            className="bg-surface-container-high border border-outline-variant/30 text-[10px] rounded-lg px-2 py-0.5 text-on-surface font-semibold focus:outline-none"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra Fast)</option>
          </select>
        </div>

        {/* Content Area */}
        {activeTab === 'chat' ? (
          <>
            {/* Scrollable Chat History */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 shadow-xs ${
                      m.role === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-xs'
                        : 'bg-surface-container-high text-on-surface rounded-tl-xs border border-outline-variant/30'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {/* Generated Image preview if present */}
                    {m.imageUrl && (
                      <div className="rounded-xl overflow-hidden mt-2 border border-outline-variant/30">
                        <img src={m.imageUrl} alt="Generated visual" className="w-full h-auto object-cover" />
                      </div>
                    )}

                    {/* Sources grounding chips */}
                    {m.sources && m.sources.length > 0 && (
                      <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap gap-1">
                        <span className="text-[9px] font-bold uppercase text-on-surface-variant block w-full">
                          Sources Grounded:
                        </span>
                        {m.sources.slice(0, 3).map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[9px] px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary underline truncate max-w-[180px]"
                          >
                            🔗 {s.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-on-surface-variant p-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>Gemini is synthesizing circadian reasoning...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating Brain Dump Quick Trigger Pill */}
            {!isBrainDumpOpen && (
              <div className="px-3 py-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsBrainDumpOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-highest border border-amber-500/40 text-on-surface text-xs font-bold shadow-md hover:bg-surface-container hover:scale-105 active:scale-95 transition cursor-pointer"
                  title="Open Brain Dump floating scratchpad"
                >
                  <span>🧠</span>
                  <span>Brain Dump</span>
                  {brainDumpText.trim() && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                      {brainDumpText.trim().split('\n').filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Floating Brain Dump Text Area Card */}
            {isBrainDumpOpen && (
              <div className="mx-3 mb-2 p-3.5 bg-surface-container-highest/95 backdrop-blur-2xl rounded-2xl border border-amber-500/40 shadow-2xl space-y-2.5 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between pb-1.5 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    <div>
                      <h4 className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5">
                        Study Session Brain Dump
                        <span className="font-label-badge text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold">
                          Floating Pad
                        </span>
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-medium">
                        Quickly park intrusive thoughts or random tasks to organize later.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBrainDumpOpen(false)}
                    className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition cursor-pointer"
                    title="Minimize Brain Dump"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>

                <textarea
                  value={brainDumpText}
                  onChange={(e) => setBrainDumpText(e.target.value)}
                  placeholder="Type anything on your mind (e.g., 'Revise Indian Polity Ch 3 tonight', 'Submit semester assignment by Friday', 'Order test series notebook', 'Look up dynamic programming memoization vs tabulation')..."
                  rows={4}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none shadow-inner"
                />

                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
                    <span>
                      {brainDumpText.trim()
                        ? `${brainDumpText.trim().split('\n').filter(Boolean).length} thought(s)`
                        : 'Empty scratchpad'}
                    </span>
                    <span>•</span>
                    <span className="text-secondary font-medium">Auto-saved</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {brainDumpText.trim() && (
                      <button
                        type="button"
                        onClick={() => {
                          setBrainDumpText('');
                          onTriggerToast('Brain dump scratchpad cleared', 'CLEARED');
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] text-on-surface-variant hover:text-red-400 bg-surface-container hover:bg-surface-container-high transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleOrganizeBrainDump}
                      disabled={!brainDumpText.trim() || isLoading}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-on-primary font-headline text-xs font-bold shadow-sm hover:opacity-95 disabled:opacity-40 transition active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      <span>Organize with Gemini</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-surface-container-high border-t border-outline-variant/30 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleVoice}
                title={isRecording ? 'Stop recording' : 'Speak with gemini-3.5-transcribe'}
                className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isRecording ? 'stop' : 'mic'}
                </span>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about syllabus, circadian rest, or search latest exam notifications..."
                className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-primary text-on-primary disabled:opacity-40 transition cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
          </>
        ) : (
          /* Visual Studio Tab */
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="space-y-1">
              <h4 className="font-headline text-sm font-bold text-on-surface">
                Synthesize Study Infographics & Visuals
              </h4>
              <p className="font-body text-xs text-on-surface-variant">
                Powered by Gemini 3.1 Flash Image. Create diagrams, mindmaps, or desk focus art.
              </p>
            </div>

            <div className="space-y-2">
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g. A high-contrast mindmap diagram illustrating Dijkstra's shortest path algorithm with glowing neon edges"
                rows={3}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />

              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-headline text-xs font-bold shadow-md hover:bg-secondary/95 disabled:opacity-50 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>{isGeneratingImage ? 'Synthesizing...' : 'Generate Visual with Gemini'}</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5 pt-2">
              <span className="font-label-badge text-[10px] uppercase font-bold text-on-surface-variant block">
                Quick Prompts
              </span>
              <div className="flex flex-col gap-1.5">
                {[
                  'Circadian rhythm 24-hour clock diagram with cortisol and melatonin waves',
                  'Minimalist clean aesthetic memory anchor for Modern Indian History timelines',
                  'Calm lo-fi study room overlooking a rainy city with warm desk lamp',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImagePrompt(preset)}
                    className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-left text-[11px] text-on-surface-variant hover:text-on-surface border border-outline-variant/20 transition cursor-pointer"
                  >
                    💡 {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
