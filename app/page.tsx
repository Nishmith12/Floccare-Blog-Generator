'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Terminal, Send, Check, Copy, Sparkles, Code2, Cpu, Moon, Sun, ArrowUpRight, X, Download, Github, Linkedin, Twitter, Zap, Layout, User, StopCircle, AlertCircle, FileText, MessageSquare, RotateCcw, Share2, Clock, Maximize2, Minimize2, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TOAST COMPONENT ---
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
        type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
        type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
        'bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100'
      } backdrop-blur-md`}
    >
      {type === 'success' && <Check className="w-4 h-4" />}
      {type === 'error' && <AlertCircle className="w-4 h-4" />}
      {type === 'info' && <Sparkles className="w-4 h-4 text-purple-500" />}
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

export default function Home() {
  // --- STATE ---
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [fullContent, setFullContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  
  // NEW: Fullscreen Mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [mobileTab, setMobileTab] = useState<'input' | 'output'>('input');
  const [copied, setCopied] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const tones = ['Professional', 'Casual', 'Storyteller', 'ELI5'];
  const suggestions = ['The Future of AI in Healthcare', 'React vs Vue: A Comparison', 'Explain Quantum Computing', 'Tips for Remote Work'];

  // --- THEME ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkMode(false);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- HERO TYPEWRITER ---
  const [heroText, setHeroText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const words = ["Developers.", "Founders.", "Content Creators.", "Everyone."];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % words.length;
      const fullText = words[i];
      setHeroText(isDeleting ? fullText.substring(0, heroText.length - 1) : fullText.substring(0, heroText.length + 1));
      setTypingSpeed(isDeleting ? 40 : 100);
      if (!isDeleting && heroText === fullText) setTimeout(() => setIsDeleting(true), 2000); 
      else if (isDeleting && heroText === '') { setIsDeleting(false); setLoopNum(loopNum + 1); }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [heroText, isDeleting, loopNum, typingSpeed, words]);

  // --- STREAMING SIMULATION & METRICS ---
  useEffect(() => {
    if (loading || !fullContent || !isTyping) return;

    let index = displayedContent.length;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      if (index < fullContent.length) {
        setDisplayedContent((prev) => prev + fullContent.charAt(index));
        
        const currentText = fullContent.slice(0, index + 1);
        const words = currentText.trim().split(/\s+/).length;
        setWordCount(words);
        setReadTime(Math.ceil(words / 200));

        index++;
      } else {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setIsTyping(false);
        showToast("Blog generated successfully!", "success");
      }
    }, 2);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [fullContent, loading, isTyping]);

  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleSubmit = async (overrideTopic?: string) => {
    const finalTopic = overrideTopic || topic;
    if (!finalTopic) return;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setIsTyping(true);
    setFullContent('');
    setDisplayedContent('');
    setWordCount(0);
    setIsCanvasOpen(true);
    setIsFullscreen(false); 
    setMobileTab('output'); 

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalTopic, tone: selectedTone }),
        signal: controller.signal
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || "Generation failed");
      
      if (data.output) {
        setFullContent(data.output);
      }
    } catch (error: any) {
      setIsTyping(false);
      if (error.name === 'AbortError') {
        showToast("Generation stopped.", "info");
      } else {
        showToast("Something went wrong. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    setLoading(false);
    setIsTyping(false);
    showToast("Stopped by user.", "info");
  };

  const handleReset = () => {
    setTopic('');
    setFullContent('');
    setDisplayedContent('');
    setWordCount(0);
    setIsCanvasOpen(false);
    setIsFullscreen(false);
    setIsTyping(false);
    setTimeout(() => scrollToSection('home'), 100);
  };

  const handleCopy = () => {
    if (!fullContent) return;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!fullContent) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Blog: ${topic}`,
          text: fullContent,
        });
        showToast("Shared successfully!", "success");
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopy();
      showToast("Sharing not supported, copied instead.", "info");
    }
  };

  const handleDownload = () => {
    if (!fullContent) return;
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.slice(0, 20).replace(/\s+/g, '_')}_blog.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Download started!", "success");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  // --- ANIMATIONS ---
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
  };

  const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 10 } }
  };

  // Helper for scrollbar class
  const scrollbarClass = "overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600";

  return (
    <div className={`transition-colors duration-500 bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-200 font-sans selection:bg-purple-500/30 selection:text-purple-300 flex flex-col ${isCanvasOpen ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <motion.header 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100 }}
        className={`fixed top-0 w-full z-50 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 h-16 ${isFullscreen ? 'hidden' : 'block'}`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div onClick={() => {setIsCanvasOpen(false); setTimeout(() => scrollToSection('home'), 100);}} className="flex items-center gap-3 cursor-pointer group">
            <div className="p-2.5 bg-purple-600/10 rounded-xl border border-purple-500/20 group-hover:border-purple-500/50 transition-all">
              <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              FlocCare<span className="text-purple-600 dark:text-purple-500">.ai</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
             <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                <button onClick={() => { setIsCanvasOpen(false); setTimeout(() => scrollToSection('home'), 100); }} className="hover:text-purple-600 dark:hover:text-white transition-colors">Home</button>
                <button onClick={() => { setIsCanvasOpen(false); setTimeout(() => scrollToSection('about'), 100); }} className="hover:text-purple-600 dark:hover:text-white transition-colors">About</button>
                <button onClick={() => { setIsCanvasOpen(false); setTimeout(() => scrollToSection('tech-stack'), 100); }} className="hover:text-purple-600 dark:hover:text-white transition-colors">Stack</button>
                <button onClick={() => { if(!isCanvasOpen) scrollToSection('generator'); }} className={`text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-3 py-1 rounded-full ${isCanvasOpen ? 'opacity-50' : ''}`}>Generator</button>
             </nav>
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-600 dark:text-gray-400"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
          </div>
        </div>
      </motion.header>

      {/* MAIN CONTAINER: min-h-0 allows nested flex scrolling to work */}
      <div className={`flex-1 flex relative min-h-0 ${isCanvasOpen ? (isFullscreen ? 'pt-0' : 'pt-16') : 'pt-24'}`}>
        
        {/* LEFT PANEL (Input) */}
        <motion.div 
          layout 
          transition={{ type: "spring", bounce: 0, duration: 0.6 }}
          className={`flex flex-col px-6 transition-all ${
            isCanvasOpen 
              ? isFullscreen 
                ? 'hidden' // Hide completely in fullscreen mode
                : `w-full md:w-[35%] border-r border-gray-200 dark:border-white/5 pt-6 justify-start h-full ${scrollbarClass} ${mobileTab === 'output' ? 'hidden md:flex' : 'flex'}` 
              : 'w-full max-w-5xl mx-auto justify-start'
          }`}
        >
          {/* HERO */}
          <AnimatePresence>
            {!isCanvasOpen && (
              <motion.div 
                id="home"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                exit={{ opacity: 0, height: 0, overflow: "hidden", transition: { duration: 0.4 } }}
                className="text-center mb-16"
              >
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-6">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Powered by Gemini 2.5 Flash</span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6 text-gray-900 dark:text-white">
                    AI Writing for <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
                      {heroText}
                    </span>
                    <span className="animate-pulse text-purple-500">|</span>
                  </h1>
                  <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Generate technically accurate, SEO-optimized blogs in seconds.
                  </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INPUT CARD */}
          <motion.div layout id="generator" className="relative w-full z-10 mb-20">
             <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>
             
             <div className="relative bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden group focus-within:ring-2 ring-purple-500/50 transition-all">
                {!isCanvasOpen && (
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#18181b]/50">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>
                    <div className="ml-4 px-3 py-1 rounded-md text-xs font-mono text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-all cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-500/20">
                      prompt.txt
                    </div>
                  </div>
                )}

                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isCanvasOpen ? "New topic..." : "What do you want to write about? (e.g. 'The Future of AI')"}
                  className={`w-full bg-transparent text-gray-900 dark:text-gray-100 p-6 outline-none font-medium resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 ${isCanvasOpen ? 'h-32 text-base' : 'h-[200px] text-lg'}`}
                />
                
                {/* NEW: QUICK SUGGESTIONS */}
                {!isCanvasOpen && !topic && (
                  <div className="px-6 pb-4 flex flex-wrap gap-2">
                    {suggestions.map((s) => (
                      <button 
                        key={s} 
                        onClick={() => { setTopic(s); }}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* TONE & SUBMIT */}
                <div className="flex flex-col gap-4 p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#18181b]">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {tones.map((t) => (
                      <button 
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                          selectedTone === t 
                            ? 'bg-purple-100 dark:bg-purple-500/20 border-purple-500 text-purple-600 dark:text-purple-300' 
                            : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 hover:border-purple-400'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Gemini-Pro Ready</span>
                    </div>
                    
                    {/* FIXED: Stop button appears when loading (network) OR isTyping (animation) */}
                    {(loading || isTyping) ? (
                      <button onClick={handleStop} className="px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 bg-red-100 text-red-500 dark:bg-red-500/10 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/20">
                        <StopCircle className="w-4 h-4" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button onClick={() => handleSubmit()} disabled={!topic} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${!topic ? 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600 cursor-not-allowed' : 'bg-black dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95 shadow-lg'}`}>
                        <span>Generate</span>
                        {/* Shortcut Hint */}
                        <span className="hidden lg:inline text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded ml-1 opacity-70">⌘ ↵</span>
                        <ArrowUpRight className="w-4 h-4 lg:hidden" />
                      </button>
                    )}
                  </div>
                </div>
             </div>
          </motion.div>

          {/* ABOUT SECTION */}
          <AnimatePresence>
            {!isCanvasOpen && (
              <motion.div 
                id="about"
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="w-full pb-24"
              >
                <motion.div variants={fadeInUp} className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why FlocCare.ai?</h2>
                  <p className="text-gray-500 max-w-xl mx-auto">Built to demonstrate the power of Next.js 14 combined with advanced AI streaming.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div variants={scaleUp} className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 hover:border-blue-500/50 transition-all group hover:-translate-y-1">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Instant Streaming</h3>
                    <p className="text-sm text-gray-500">No waiting. Content streams in real-time using Vercel AI SDK and Gemini Flash.</p>
                  </motion.div>

                  <motion.div variants={scaleUp} className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 hover:border-purple-500/50 transition-all group hover:-translate-y-1">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Layout className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Canvas Mode</h3>
                    <p className="text-sm text-gray-500">Distraction-free split screen experience for heavy-duty writing sessions.</p>
                  </motion.div>

                  <motion.div variants={scaleUp} className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 hover:border-green-500/50 transition-all group hover:-translate-y-1">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Personalized Tone</h3>
                    <p className="text-sm text-gray-500">Adjust the AI's personality from Professional to Casual with one click.</p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TECH STACK */}
          <AnimatePresence>
            {!isCanvasOpen && (
              <motion.div 
                id="tech-stack"
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="w-full pb-24"
              >
                  <motion.div variants={fadeInUp} className="text-center mb-10">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Built with Modern Tech</h2>
                  </motion.div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: "Next.js 14", color: "hover:shadow-gray-500/20", icon: <svg viewBox="0 0 180 180" className="w-8 h-8 fill-black dark:fill-white"><path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"></path><rect height="72" width="12" x="115" y="54"></rect></svg> },
                        { name: "React", color: "hover:shadow-blue-500/20", icon: <svg viewBox="-10.5 -9.45 21 18.9" className="w-8 h-8 fill-[#61dafb]"><circle cx="0" cy="0" r="2"></circle><g stroke="#61dafb" strokeWidth="1" fill="none"><ellipse rx="10" ry="4.5"></ellipse><ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse><ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse></g></svg> },
                        { name: "Tailwind", color: "hover:shadow-cyan-500/20", icon: <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#38bdf8]"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"></path></svg> },
                        { name: "Gemini AI", color: "hover:shadow-purple-500/20", icon: <svg viewBox="0 0 24 24" className="w-8 h-8 fill-purple-600 dark:fill-purple-400"><path d="M22 11.08c-6.24 0-10.92-4.96-10.92-11.08 0 6.12-4.68 11.08-10.92 11.08 6.24 0 10.92 4.96 10.92 11.08 0-6.12 4.68-11.08 10.92-11.08z"></path></svg> }
                      ].map((tech, i) => (
                        <motion.div key={i} variants={scaleUp} className={`p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 hover:border-black dark:hover:border-white/20 transition-all flex flex-col items-center gap-4 hover:-translate-y-1 shadow-sm group ${tech.color} hover:shadow-xl`}>
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
                               {tech.icon}
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{tech.name}</h3>
                        </motion.div>
                      ))}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER */}
          <AnimatePresence>
            {!isCanvasOpen && (
              <motion.footer 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                className="w-full border-t border-gray-200 dark:border-white/5 py-12"
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/10 rounded-lg">
                      <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">FlocCare.ai</h4>
                      <p className="text-xs text-gray-500">Built by Nishmith</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <a href="https://github.com/Nishmith12" target="_blank" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                      <Github className="w-5 h-5" />
                    </a>
                    <a href="https://www.linkedin.com/in/nishmith-kumar-54162026a" target="_blank" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-[#0077b5] hover:text-white transition-all">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com" target="_blank" className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </motion.footer>
            )}
          </AnimatePresence>

        </motion.div>


        {/* RIGHT PANEL: GEMINI CANVAS (Only Visible when Generating) */}
        <AnimatePresence>
          {isCanvasOpen && (
            <motion.div 
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.6 }}
              className={`flex-col flex-1 bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/5 h-full relative shadow-2xl overflow-hidden ${mobileTab === 'output' ? 'flex' : 'hidden md:flex'}`}
            >
              {/* CANVAS HEADER */}
              <div className="h-14 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 bg-gray-50/50 dark:bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    Generated_Draft.md
                  </span>
                  {/* METRICS */}
                  {wordCount > 0 && (
                    <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200 dark:border-white/10">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {wordCount} words
                      </span>
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {readTime} min read
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                   {/* FULLSCREEN TOGGLE */}
                   <button 
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-500 hover:text-purple-500 transition-colors hidden md:block"
                      title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                   >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                   </button>

                   {/* RESET BUTTON */}
                   <button 
                      onClick={handleReset} 
                      className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10"
                      title="New Chat"
                   >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">New</span>
                   </button>

                   {fullContent && (
                    <>
                      {/* SHARE BUTTON */}
                      <button onClick={handleShare} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10">
                        <Share2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Share</span>
                      </button>
                      <button onClick={handleDownload} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10">
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-black dark:hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => { setIsCanvasOpen(false); setIsFullscreen(false); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-500 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* MOBILE TAB TOGGLE (Only visible on small screens when canvas is open) */}
              <div className="md:hidden flex border-b border-gray-200 dark:border-white/5">
                <button 
                  onClick={() => setMobileTab('input')}
                  className={`flex-1 py-3 text-sm font-medium ${mobileTab === 'input' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Input
                </button>
                <button 
                  onClick={() => setMobileTab('output')}
                  className={`flex-1 py-3 text-sm font-medium ${mobileTab === 'output' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}
                >
                  Output
                </button>
              </div>

              {/* CANVAS BODY */}
              <div className={`flex-1 overflow-y-auto p-6 md:p-10 bg-white dark:bg-[#0a0a0a] ${scrollbarClass}`}>
                <div className="relative max-w-3xl mx-auto">
                  {/* FIXED: THIS IS THE SHINE EFFECT FOR OUTPUT - Increased opacity and blur */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-3xl opacity-30 blur-3xl pointer-events-none"></div>
                  
                  {/* CUSTOM MARKDOWN STYLING */}
                  <div className="relative prose prose-lg max-w-none dark:prose-invert">
                    {loading && !displayedContent ? (
                      <div className="space-y-6 animate-pulse mt-10">
                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-full"></div>
                        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-5/6"></div>
                        <div className="h-40 bg-gray-200 dark:bg-white/5 rounded-xl w-full"></div>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <ReactMarkdown
                          components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-600 dark:text-gray-300" {...props} />,
                            li: ({node, ...props}) => <li className="ml-4" {...props} />,
                            // Enhanced Table Styling
                            table: ({node, ...props}) => (
                              <div className="overflow-x-auto my-8 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10" {...props} />
                              </div>
                            ),
                            thead: ({node, ...props}) => <thead className="bg-gray-50 dark:bg-white/5" {...props} />,
                            tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-[#0a0a0a]" {...props} />,
                            tr: ({node, ...props}) => <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" {...props} />,
                            th: ({node, ...props}) => <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" {...props} />,
                            td: ({node, ...props}) => <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300" {...props} />,
                            // Enhanced Code Block Styling
                            code: ({node, inline, className, children, ...props}: any) => {
                              return !inline ? (
                                <div className="relative group my-6">
                                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                  <div className="relative rounded-lg bg-[#1e1e1e] border border-white/10 p-4 font-mono text-sm text-gray-200 overflow-x-auto custom-scrollbar">
                                    <div className="flex gap-1.5 mb-3 opacity-50">
                                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <code {...props}>{children}</code>
                                  </div>
                                </div>
                              ) : (
                                <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400 font-mono text-sm border border-gray-200 dark:border-white/10" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            blockquote: ({node, ...props}) => (
                              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-500 dark:text-gray-400 my-6 bg-purple-50/50 dark:bg-purple-900/10 py-2 pr-4 rounded-r-lg" {...props} />
                            ),
                            a: ({node, ...props}) => <a className="text-purple-600 dark:text-purple-400 hover:underline decoration-purple-500/30 underline-offset-2" {...props} />
                          }}
                        >
                          {displayedContent}
                        </ReactMarkdown>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}