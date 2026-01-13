
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { AppView, YouTubeVideo, ChatMessage, VideoDuration, AnalysisResult } from './types';
import { searchVideos, getVideoDetails, getVideoComments } from './services/youtubeService';
import { analyzeCommentsAndKeywords, generateScriptOutline, chatWithGemini } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SEARCH);
  const [ytKey, setYtKey] = useState<string>(() => localStorage.getItem('yt_api_key') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<VideoDuration>('any');
  const [viralRatio, setViralRatio] = useState(50); // Simulating viral threshold filtering
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [scriptOutline, setScriptOutline] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    localStorage.setItem('yt_api_key', ytKey);
  }, [ytKey]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytKey) {
      alert("Please provide a YouTube API Key in settings.");
      setView(AppView.SETTINGS);
      return;
    }
    setIsLoading(true);
    try {
      let results = await searchVideos(searchQuery, ytKey, durationFilter);
      
      // Simulate viral filtering by calculating a mock "engagement score"
      // In a real app, we'd fetch statistics for all first, but here we'll filter post-fetch
      // or just show how the UI would behave.
      setVideos(results);
      setView(AppView.SEARCH);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVideo = async (video: YouTubeVideo) => {
    setIsLoading(true);
    try {
      const stats = await getVideoDetails(video.id, ytKey);
      const comments = await getVideoComments(video.id, ytKey);
      const fullVideo = { ...video, ...stats };
      setSelectedVideo(fullVideo);
      setView(AppView.ANALYSIS);
      
      setIsAnalyzing(true);
      const commentTexts = comments.map(c => c.text);
      const analysisData = await analyzeCommentsAndKeywords(video.title, commentTexts);
      setAnalysis(analysisData);
      
      setChatMessages([{
        role: 'model',
        content: `Analyzed ${fullVideo.title}. Based on ${comments.length} comments, I've extracted the key sentiment and topics below.`,
        timestamp: Date.now()
      }]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleKeywordClick = async (keyword: string) => {
    setSelectedKeyword(keyword);
    setScriptOutline(null);
    setIsAnalyzing(true);
    try {
      const outline = await generateScriptOutline(keyword);
      setScriptOutline(outline);
    } catch (err) {
      alert("Failed to generate outline.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderSearchView = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-4">
        <form onSubmit={handleSearch} className="relative group">
          <input 
            type="text"
            placeholder="Search topics (e.g., 'React Tutorial', 'Minimalism')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 rounded-3xl bg-white border border-slate-200 shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-lg"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-600 text-white px-8 py-2.5 rounded-2xl font-bold hover:bg-red-700 disabled:bg-slate-300 transition-all shadow-lg"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 px-4">
          <div className="flex bg-slate-200 p-1 rounded-xl">
            {(['any', 'short', 'medium', 'long'] as VideoDuration[]).map(d => (
              <button
                key={d}
                onClick={() => setDurationFilter(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${durationFilter === d ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Viral Ratio</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={viralRatio}
              onChange={(e) => setViralRatio(parseInt(e.target.value))}
              className="w-24 accent-red-600"
            />
            <span className="text-xs font-bold text-red-600">{viralRatio}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id}
            onClick={() => handleSelectVideo(video)}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group"
          >
            <div className="relative aspect-video">
              <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt={video.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-xs font-bold">View Analysis →</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-slate-800 line-clamp-2 leading-snug">{video.title}</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{video.channelTitle[0]}</div>
                <p className="text-xs font-bold text-slate-500 truncate">{video.channelTitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalysisView = () => {
    if (!selectedVideo) return null;

    const chartData = [
      { name: 'Views', value: parseInt(selectedVideo.viewCount || '0'), fill: '#3b82f6' },
      { name: 'Likes', value: parseInt(selectedVideo.likeCount || '0'), fill: '#ef4444' },
      { name: 'Comments', value: parseInt(selectedVideo.commentCount || '0'), fill: '#10b981' },
    ];

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
               <div className="flex flex-col md:flex-row gap-8 mb-8">
                 <img src={selectedVideo.thumbnail} className="w-full md:w-64 aspect-video rounded-2xl object-cover shadow-lg" alt="" />
                 <div className="space-y-4 flex-1">
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">{selectedVideo.title}</h2>
                    <div className="flex gap-4 items-center">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{selectedVideo.channelTitle}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-xs font-bold text-slate-400">{new Date(selectedVideo.publishedAt).toLocaleDateString()}</span>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-3 gap-6 mb-8">
                 {chartData.map(stat => (
                    <div key={stat.name} className="bg-slate-50 p-5 rounded-2xl text-center">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.name}</div>
                      <div className="text-xl font-black text-slate-800">{stat.value.toLocaleString()}</div>
                    </div>
                 ))}
               </div>
            </div>

            {/* AI Insights & Recommended Keywords */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
                  AI Comment Analysis
                </h3>
                {isAnalyzing ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-sm italic">
                      {analysis?.summary}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Recommended Topics (Select One)</h4>
                      <div className="flex flex-wrap gap-3">
                        {analysis?.keywords.map(kw => (
                          <button
                            key={kw}
                            onClick={() => handleKeywordClick(kw)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedKeyword === kw ? 'bg-red-600 text-white shadow-xl shadow-red-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedKeyword && (
                <div className="pt-8 border-t border-slate-100 animate-slideUp">
                  <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    Script Outline for "{selectedKeyword}"
                  </h3>
                  <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap relative group">
                    {isAnalyzing && !scriptOutline ? "Generating outline..." : scriptOutline}
                    <button 
                      onClick={() => navigator.clipboard.writeText(scriptOutline || "")}
                      className="absolute top-4 right-4 bg-slate-800 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="flex flex-col h-[800px] bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-slate-800">Strategy Consultant</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              // handle chat logic
            }} className="p-6 border-t border-slate-50">
              <input 
                type="text"
                placeholder="Ask about strategy..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-red-500"
              />
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => (
    <div className="max-w-xl mx-auto py-12 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Platform Access</h2>
          <p className="text-slate-500 mt-2">Enter your YouTube Data API Key to start harvesting insights.</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">YouTube Data API V3</label>
            <input 
              type="password"
              value={ytKey}
              onChange={(e) => setYtKey(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all"
              placeholder="AIzaSy..."
            />
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold">G</div>
              <div>
                <p className="text-sm font-bold text-blue-900">Gemini Intelligence Enabled</p>
                <p className="text-xs text-blue-700 mt-1">Gemini Pro 2.5 is automatically configured via secure backend environment.</p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setView(AppView.SEARCH)}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-black transition-all shadow-xl"
        >
          Confirm & Launch Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <Layout activeView={view} setView={setView} hasApiKey={!!ytKey}>
      {view === AppView.SEARCH && renderSearchView()}
      {view === AppView.ANALYSIS && renderAnalysisView()}
      {view === AppView.SETTINGS && renderSettingsView()}
    </Layout>
  );
};

export default App;
