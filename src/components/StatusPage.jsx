import React, { useState, useEffect } from 'react';
import { isGeminiConfigured, getApiUrl } from '../geminiService';
import { isDatabaseMock } from '../firebase';

export const StatusPage = ({ onClose }) => {
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
  const [geminiStatus, setGeminiStatus] = useState('checking'); // checking, ready, disconnected
  const [firebaseStatus, setFirebaseStatus] = useState('checking'); // checking, online, mock
  const [latency, setLatency] = useState(null);
  const [diagnosticLog, setDiagnosticLog] = useState([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const apiUrl = getApiUrl();

  const addLog = (message) => {
    setDiagnosticLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setBackendStatus('checking');
    setGeminiStatus('checking');
    setFirebaseStatus('checking');
    setLatency(null);
    setDiagnosticLog([]);

    addLog("Starting system diagnostics...");

    // 1. Check Backend Connection & Latency
    const startTime = performance.now();
    try {
      addLog(`Pinging backend server at ${apiUrl}/api/status...`);
      const response = await fetch(`${apiUrl}/api/status`);
      const endTime = performance.now();
      
      if (response.ok) {
        const data = await response.json();
        const duration = Math.round(endTime - startTime);
        setLatency(duration);
        setBackendStatus('online');
        addLog(`Backend server responded in ${duration}ms (Status: 200 OK).`);
        
        // 2. Check Gemini AI config (reported by backend status)
        if (data.geminiReady) {
          setGeminiStatus('ready');
          addLog("Gemini AI integration is Ready (Model: gemini-2.5-flash).");
        } else {
          setGeminiStatus('disconnected');
          addLog("WARNING: Gemini API Key is missing on the backend server.");
        }
      } else {
        setBackendStatus('offline');
        setGeminiStatus('disconnected');
        addLog(`ERROR: Backend server responded with status ${response.status}.`);
      }
    } catch (e) {
      setBackendStatus('offline');
      setGeminiStatus('disconnected');
      addLog(`ERROR: Failed to connect to backend server. ${e.message}`);
    }

    // 3. Check Firebase Connection
    addLog("Checking Firebase Cloud Firestore connectivity...");
    const isMock = isDatabaseMock();
    if (isMock) {
      setFirebaseStatus('mock');
      addLog("Database: Offline (Using local simulation sandbox).");
    } else {
      setFirebaseStatus('online');
      addLog("Database: Online (Real-time Firestore active and syncing).");
    }

    addLog("Diagnostics complete. System status updated.");
    setIsRunningDiagnostics(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-toss-gray-bg flex items-center justify-center px-4 py-12 selection:bg-toss-blue-light selection:text-toss-blue">
      <div className="w-full max-w-2xl bg-white rounded-[32px] p-8 shadow-toss-card border border-toss-border/50 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-toss-blue uppercase tracking-widest block mb-1">Diagnostics</span>
            <h1 className="text-2xl font-extrabold text-toss-text-primary tracking-tight">System Status</h1>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-toss-gray-bg hover:bg-toss-border/30 text-toss-text-secondary flex items-center justify-center rounded-2xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dashboard Status Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Backend Server Status Card */}
          <div className="bg-toss-gray-bg/40 border border-toss-border/30 rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-bold text-toss-text-tertiary uppercase tracking-wide">Render Backend</span>
              <span className="block text-xs font-semibold text-toss-text-secondary mt-1 truncate" title={apiUrl}>
                {apiUrl.replace('https://', '')}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backendStatus === 'online' ? 'bg-emerald-400' : backendStatus === 'offline' ? 'bg-red-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  backendStatus === 'online' ? 'bg-emerald-500' : backendStatus === 'offline' ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-sm font-extrabold text-toss-text-primary capitalize">
                {backendStatus === 'checking' ? 'Checking...' : backendStatus}
              </span>
              {latency && <span className="text-[10px] text-toss-text-tertiary font-bold">({latency}ms)</span>}
            </div>
          </div>

          {/* Gemini AI Status Card */}
          <div className="bg-toss-gray-bg/40 border border-toss-border/30 rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-bold text-toss-text-tertiary uppercase tracking-wide">Gemini 2.5 Flash</span>
              <span className="block text-xs font-semibold text-toss-text-secondary mt-1">Vision AI Model</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  geminiStatus === 'ready' ? 'bg-emerald-400' : geminiStatus === 'disconnected' ? 'bg-red-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  geminiStatus === 'ready' ? 'bg-emerald-500' : geminiStatus === 'disconnected' ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-sm font-extrabold text-toss-text-primary">
                {geminiStatus === 'checking' ? 'Checking...' : geminiStatus === 'ready' ? 'Ready' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Firebase Status Card */}
          <div className="bg-toss-gray-bg/40 border border-toss-border/30 rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-bold text-toss-text-tertiary uppercase tracking-wide">Firestore Cloud</span>
              <span className="block text-xs font-semibold text-toss-text-secondary mt-1">Real-Time Database</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  firebaseStatus === 'online' ? 'bg-emerald-400' : firebaseStatus === 'mock' ? 'bg-amber-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  firebaseStatus === 'online' ? 'bg-emerald-500' : firebaseStatus === 'mock' ? 'bg-amber-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className="text-sm font-extrabold text-toss-text-primary">
                {firebaseStatus === 'checking' ? 'Checking...' : firebaseStatus === 'online' ? 'Cloud Active' : 'Local Sandbox'}
              </span>
            </div>
          </div>

        </div>

        {/* Diagnostics Console Logs */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-toss-text-secondary uppercase tracking-wider">Diagnostic Logs</span>
            <button 
              onClick={runDiagnostics} 
              disabled={isRunningDiagnostics}
              className={`text-xs font-bold text-toss-blue hover:text-toss-blue/80 flex items-center gap-1 cursor-pointer transition-opacity ${
                isRunningDiagnostics ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              {isRunningDiagnostics ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-toss-blue border-t-transparent rounded-full animate-spin"></div>
                  Diagnosing...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Re-run Diagnostics
                </>
              )}
            </button>
          </div>
          <div className="bg-toss-gray-bg rounded-2xl p-5 font-mono text-xs text-toss-text-secondary border border-toss-border/40 min-h-[140px] max-h-[220px] overflow-y-auto flex flex-col gap-1.5 leading-relaxed">
            {diagnosticLog.length === 0 ? (
              <span className="text-toss-text-tertiary">No logs generated yet.</span>
            ) : (
              diagnosticLog.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-4 border-t border-toss-border/40 pt-6">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-toss-blue hover:bg-toss-blue-hover text-white text-sm font-extrabold rounded-2xl transition-all shadow-md shadow-toss-blue/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-center"
          >
            Back to Vending Machine
          </button>
        </div>

      </div>
    </div>
  );
};
