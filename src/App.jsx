import React, { useState, useEffect } from 'react';
import { initialVendingItems } from './vendingData';
import { subscribeToVendingItems, subscribeToMetadata, isDatabaseMock } from './firebase';
import { VendingItemVector } from './components/VendingItemVector';
import { AdminPanel } from './components/AdminPanel';
import { AdminGate } from './components/AdminGate';
import { isGeminiConfigured } from './geminiService';

function App() {
  const [items, setItems] = useState([]);
  const [metadata, setMetadata] = useState({ lastUpdated: null });
  const [isAdmin, setIsAdmin] = useState(
    window.location.hash === '#admin' || window.location.hash === '#/admin'
  );
  const [secretCounter, setSecretCounter] = useState(0);
  const [isSessionAuthorized, setIsSessionAuthorized] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);

  // Check Gemini connectivity from backend status
  useEffect(() => {
    const checkGemini = async () => {
      const configured = await isGeminiConfigured();
      setHasGemini(configured);
    };
    checkGemini();
  }, []);

  // Synchronize routing state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const activeAdmin = window.location.hash === '#admin' || window.location.hash === '#/admin';
      setIsAdmin(activeAdmin);
      if (!activeAdmin) {
        setIsSessionAuthorized(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to Firestore database or local storage updates in real-time
  useEffect(() => {
    const unsubscribeItems = subscribeToVendingItems((updatedItems) => {
      setItems(updatedItems);
    });

    const unsubscribeMeta = subscribeToMetadata((updatedMeta) => {
      setMetadata(updatedMeta);
    });

    return () => {
      unsubscribeItems();
      unsubscribeMeta();
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
  };

  const navigateToGrid = () => {
    window.location.hash = '';
  };

  const handleTitleClick = () => {
    // Secret trigger: click the header 5 times to enter Admin mode!
    setSecretCounter(prev => {
      const next = prev + 1;
      if (next >= 5) {
        navigateToAdmin();
        return 0;
      }
      return next;
    });
  };

  const formatLastUpdated = (isoString) => {
    if (!isoString) return 'Loading...';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
    } catch (e) {
      return 'Just now';
    }
  };

  if (isAdmin) {
    if (!isSessionAuthorized) {
      return (
        <AdminGate 
          onAuthorized={() => setIsSessionAuthorized(true)} 
          onCancel={navigateToGrid} 
        />
      );
    }
    return (
      <div className="min-h-screen bg-toss-gray-bg pb-12">
        <AdminPanel 
          items={items} 
          onClose={navigateToGrid} 
          onLogOut={() => {
            setIsSessionAuthorized(false);
            navigateToGrid();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-toss-gray-bg flex flex-col justify-between selection:bg-toss-blue-light selection:text-toss-blue">
      {/* Upper Layout */}
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        
        {/* Navigation & Header */}
        <header className="flex justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-600 tracking-wide uppercase">Real-Time Synced</span>
            </div>
            <h1 
              onClick={handleTitleClick}
              className="text-3xl md:text-4xl font-extrabold text-toss-text-primary tracking-tight cursor-default select-none transition-colors duration-200 active:text-toss-blue"
            >
              School Smart Vending
            </h1>
          </div>
          
          {/* Admin Gear Button */}
          <button 
            onClick={navigateToAdmin}
            className="p-3 bg-white hover:bg-toss-gray-bg border border-toss-border/50 text-toss-text-secondary hover:text-toss-blue rounded-2xl shadow-toss-card transition-all duration-200 active:scale-95 cursor-pointer"
            title="Configure Admin Portal"
          >
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* Info Ribbon & Last Updated indicator */}
        <div className="bg-white rounded-3xl p-5 mb-8 shadow-toss-card border border-toss-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-toss-blue-light text-toss-blue flex items-center justify-center rounded-2xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <span className="text-xs text-toss-text-secondary font-semibold block">Last Update Stamp</span>
              <span className="text-sm font-bold text-toss-text-primary">
                Last Updated: {formatLastUpdated(metadata.lastUpdated)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Firebase Status Badge */}
            <div className="flex items-center gap-2 bg-toss-gray-bg/50 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-toss-text-secondary border border-toss-border/30">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDatabaseMock() ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isDatabaseMock() ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>Firebase:</span>
              <span className={isDatabaseMock() ? "text-amber-600 font-bold" : "text-toss-blue font-bold"}>
                {isDatabaseMock() ? "Offline (Local)" : "Online (Firestore)"}
              </span>
            </div>

            {/* Gemini Status Badge */}
            <div className="flex items-center gap-2 bg-toss-gray-bg/50 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-toss-text-secondary border border-toss-border/30">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasGemini ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasGemini ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
              <span>Gemini AI:</span>
              <span className={hasGemini ? "text-toss-blue font-bold" : "text-red-500 font-bold"}>
                {hasGemini ? "Ready (2.5 Flash)" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* 4x3 Vending Grid */}
        {items.length === 0 ? (
          <div className="w-full bg-white rounded-3xl p-16 shadow-toss-card border border-toss-border/50 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-toss-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-toss-text-secondary">Loading vending machine layout...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className={`relative bg-white rounded-[28px] p-6 border transition-all duration-300 flex flex-col justify-between min-h-[300px] ${
                  item.inStock 
                    ? 'border-toss-border/40 shadow-toss-card hover:shadow-toss-hover hover:-translate-y-1' 
                    : 'border-toss-border/10 shadow-none'
                }`}
              >
                {/* Upper Tag Row */}
                <div className={`flex justify-between items-center ${!item.inStock && 'opacity-30'}`}>
                  <span className="px-2.5 py-1 bg-toss-blue-light text-toss-blue text-xs font-bold rounded-lg tracking-wider">
                    {item.id}
                  </span>
                  <span className="text-xs font-semibold text-toss-text-tertiary">
                    {item.category}
                  </span>
                </div>

                {/* Vending Item Vector Graphic Container */}
                <div className="relative h-44 my-4 flex items-center justify-center">
                  
                  {/* Stock Dependent Opacity Filter */}
                  <div className={`w-full h-full max-h-36 ${item.inStock ? 'opacity-100' : 'opacity-30'}`}>
                    <VendingItemVector 
                      type={item.type} 
                      brandColor={item.brandColor} 
                      accentColor={item.accentColor} 
                      name={item.name}
                    />
                  </div>

                  {/* Sold Out Badge Overlay */}
                  {!item.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 bg-toss-gray-bg/95 border border-toss-border text-toss-text-secondary text-xs font-bold rounded-full shadow-md tracking-wide">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & Price Tag */}
                <div className={`text-center mt-2 ${!item.inStock && 'opacity-30'}`}>
                  <h3 className="font-bold text-toss-text-primary text-base tracking-tight leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-toss-text-secondary text-sm font-medium mt-1">
                    ₩{item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-toss-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-toss-text-tertiary">
        <span>© 2026 School Hackathon Vending Tracker</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={navigateToAdmin}
            className="hover:text-toss-blue transition-colors cursor-pointer"
          >
            Access Vending Admin Panel
          </button>
          <span>•</span>
          <span className="text-[10px] bg-toss-border/50 text-toss-text-secondary px-2 py-0.5 rounded-md">
            v1.0.0
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
