'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Analyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsAnalyzing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // 1. Upload Document
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.detail || 'Upload failed');
      }
      
      const docData = await uploadRes.json();
      
      // 2. Analyze Document
      const analyzeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/${docData.id}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json();
        throw new Error(errData.detail || 'Analysis failed');
      }
      
      const analysisData = await analyzeRes.json();
      setResult(analysisData);

    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">M</div>
            <span className="font-bold">MediMind AI</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/chat" className="block px-3 py-2 hover:bg-slate-800 rounded-lg text-sm text-slate-400 transition-colors">New Chat</Link>
          <Link href="/analyzer" className="block px-3 py-2 bg-slate-800 rounded-lg text-sm font-medium text-emerald-400">Report Analyzer</Link>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleSignOut} className="text-sm text-slate-400 hover:text-slate-200">Sign Out</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative p-6 md:p-12">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        
        <header className="md:hidden flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">M</div>
          </Link>
          <Link href="/chat" className="text-sm text-emerald-400">Chat</Link>
        </header>

        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Medical Report Analyzer</h1>
            <p className="text-slate-400">Upload your laboratory reports (PDF/JPG/PNG) for an AI-assisted explanation.</p>
          </div>

          <div className="glass-panel p-8 border-dashed border-2 border-slate-700 text-center">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept="image/*,.pdf"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-slate-200">
                {file ? file.name : "Click to upload or drag and drop"}
              </span>
              <span className="text-sm text-slate-500">PDF, PNG, JPG (max 5MB)</span>
            </label>
            
            {error && (
              <div className="mt-4 bg-rose-500/10 border border-rose-500 text-rose-400 p-3 rounded-lg text-sm text-center animate-fade-in-up">
                {error}
              </div>
            )}
            
            {file && !error && (
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isAnalyzing ? "Analyzing Report..." : "Analyze Report"}
              </button>
            )}
          </div>

          {result && (
            <div className="glass-panel p-6 space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-1">Test Identified</h3>
                <p className="text-xl font-bold">{result.test_name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Abnormal Values Highlighted
                </h3>
                <p className="text-slate-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">{result.abnormal_values_highlight}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-1">Explanation</h3>
                <p className="text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-2">Sources: {result.sources.join(", ")}</p>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-500 text-xs">
                  <strong>Important:</strong> This analysis is provided for educational purposes and is not a clinical diagnosis. Please consult a doctor with your full medical history.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
