'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Terminal, Cpu, Sparkles, Send, Code2 } from 'lucide-react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullContent, setFullContent] = useState('');
  const [displayedContent, setDisplayedContent] = useState('');

  // 1. Typewriter Effect for the Blog Content
  useEffect(() => {
    if (loading || !fullContent) return;
    
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedContent((prev) => prev + fullContent.charAt(index));
      index++;
      if (index >= fullContent.length) clearInterval(interval);
    }, 2); // Fast typing speed

    return () => clearInterval(interval);
  }, [fullContent, loading]);

  const handleSubmit = async () => {
    if (!topic) return;
    setLoading(true);
    setFullContent('');
    setDisplayedContent('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topic }),
      });

      const data = await response.json();
      if (data.output) {
        setFullContent(data.output);
      }
    } catch (error) {
      alert("Error generating blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // MAIN BACKGROUND: Deep "Portfolio" Black
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* NAVBAR: "Coder" Style with < > tags */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 group-hover:border-purple-500/50 transition-all">
              <Terminal className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xl font-bold text-gray-100 tracking-tight">
              FlocCare<span className="text-purple-500">.ai</span>
            </span>
          </div>

          {/* Nav Links (Hidden on small mobile) */}
          <nav className="hidden md:flex gap-8 text-sm font-mono text-gray-400">
            <span className="hover:text-purple-400 cursor-pointer transition-colors">{'<Home />'}</span>
            <span className="hover:text-purple-400 cursor-pointer transition-colors">{'<Generate />'}</span>
            <span className="text-purple-500 font-semibold cursor-pointer">{'<Blog_Output />'}</span>
          </nav>

          <a 
            href="https://github.com/Nishmith12" 
            target="_blank" 
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all text-xs font-mono text-gray-300 flex items-center gap-2"
          >
            <Code2 className="w-3 h-3" />
            <span>Built by You</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        
        {/* HERO SECTION: Big Gradient Text */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono mb-4">
            <Sparkles className="w-3 h-3" />
            <span>Powered by Gemini 2.5 Flash</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Technical Writing, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Reimagined.
            </span>
          </h1>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Generate high-quality, 1000-word technical blogs in seconds. 
            Optimized for developers, formatted in Markdown.
          </p>
        </div>

        {/* INPUT AREA: The "IDE" Look */}
        <div className="relative group">
          {/* Animated Glow Effect behind the card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative bg-[#121212] rounded-xl border border-white/10 p-1">
            {/* Fake Browser Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#18181b] rounded-t-lg">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="ml-4 text-xs font-mono text-gray-500">prompt.txt</div>
            </div>

            {/* Text Area */}
            <div className="p-2">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="// Describe your blog topic here...&#10;e.g. 'Explain Microservices Architecture to a 5-year-old'"
                className="w-full bg-[#0a0a0a] text-gray-200 p-6 rounded-lg outline-none font-mono text-sm min-h-[160px] resize-none placeholder:text-gray-700"
              />
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center p-4 border-t border-white/5 bg-[#18181b]/50 rounded-b-lg">
              <div className="text-xs text-gray-600 font-mono flex items-center gap-2">
                <Cpu className="w-3 h-3" />
                <span>AI Model Ready</span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={loading || !topic}
                className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                  loading 
                    ? 'bg-purple-500/20 text-purple-300 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-purple-50 hover:scale-105 active:scale-95'
                }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></span>
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <span>Generate</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* OUTPUT SECTION: Clean Markdown Render */}
        {(displayedContent || loading) && (
          <div className="mt-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-sm font-mono text-purple-400">{'<Output />'}</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <article className="prose prose-invert prose-lg max-w-none 
              prose-headings:text-gray-100 prose-headings:font-bold 
              prose-p:text-gray-400 prose-p:leading-relaxed
              prose-strong:text-purple-300 prose-code:text-purple-300
              prose-pre:bg-[#121212] prose-pre:border prose-pre:border-white/10">
              
              {loading && !displayedContent ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6"></div>
                </div>
              ) : (
                <ReactMarkdown>{displayedContent}</ReactMarkdown>
              )}
            </article>
          </div>
        )}
      </main>
    </div>
  );
}