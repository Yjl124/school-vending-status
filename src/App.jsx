import React, { useState, useEffect } from 'react';
import { initialVendingItems } from './vendingData';
import { subscribeToVendingItems, subscribeToMetadata, isDatabaseMock } from './firebase';
import { VendingItemVector } from './components/VendingItemVector';
import { AdminPanel } from './components/AdminPanel';
import { AdminGate } from './components/AdminGate';
import { getApiUrl } from './geminiService';
import { StatusPage } from './components/StatusPage';

// Trigger redeployment: 2026-06-04T08:17:00+09:00

function App() {
  const [items, setItems] = useState([]);
  const [metadata, setMetadata] = useState({ lastUpdated: null });
  const [isAdmin, setIsAdmin] = useState(
    window.location.hash === '#admin' || window.location.hash === '#/admin'
  );
  const [secretCounter, setSecretCounter] = useState(0);
  const [isSessionAuthorized, setIsSessionAuthorized] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState('checking'); // 'checking', 'online', 'offline'
  const [isStatus, setIsStatus] = useState(
    window.location.hash === '#status' || window.location.hash === '#/status'
  );
  const [selectedItem, setSelectedItem] = useState(null);

  // Check Backend and Gemini connectivity from status endpoint
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/status`);
        if (response.ok) {
          const data = await response.json();
          setIsBackendOnline('online');
          setHasGemini(!!data.geminiReady);
        } else {
          setIsBackendOnline('offline');
          setHasGemini(false);
        }
      } catch (e) {
        setIsBackendOnline('offline');
        setHasGemini(false);
      }
    };
    checkBackend();
  }, []);

  // Synchronize routing state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const activeAdmin = window.location.hash === '#admin' || window.location.hash === '#/admin';
      const activeStatus = window.location.hash === '#status' || window.location.hash === '#/status';
      setIsAdmin(activeAdmin);
      setIsStatus(activeStatus);
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

  const navigateToStatus = () => {
    window.location.hash = '#status';
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

  if (isStatus) {
    return (
      <StatusPage onClose={navigateToGrid} />
    );
  }

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

          <div 
            onClick={navigateToStatus}
            className="flex flex-wrap items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            title="Click to open System Status Dashboard"
          >
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

            {/* Render Backend Status Badge */}
            <div className="flex items-center gap-2 bg-toss-gray-bg/50 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-toss-text-secondary border border-toss-border/30">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBackendOnline === 'online' ? 'bg-emerald-400' : isBackendOnline === 'offline' ? 'bg-red-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBackendOnline === 'online' ? 'bg-emerald-500' : isBackendOnline === 'offline' ? 'bg-red-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span>Render Server:</span>
              <span className={isBackendOnline === 'online' ? "text-toss-blue font-bold" : isBackendOnline === 'offline' ? "text-red-500 font-bold" : "text-amber-500 font-bold"}>
                {isBackendOnline === 'online' ? "Online" : isBackendOnline === 'offline' ? "Offline" : "Connecting..."}
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

        {/* 6-Shelf Vending Cabinet Display */}
        {items.length === 0 ? (
          <div className="w-full bg-white rounded-3xl p-16 shadow-toss-card border border-toss-border/50 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-toss-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-toss-text-secondary">Loading vending machine layout...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 bg-[#181d24] p-5 md:p-8 rounded-[36px] border-4 border-slate-900 shadow-2xl relative">
            {/* Vending Glass Reflection Accents */}
            <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none z-10 opacity-[0.02]">
              <div className="w-[150%] h-[150%] bg-gradient-to-tr from-transparent via-white to-transparent transform -rotate-45 -translate-x-1/4 -translate-y-1/4"></div>
            </div>

            {/* Render Row by Row */}
            {[
              { num: "6", name: "Shelf 6 — Snacks & Chips" },
              { num: "5", name: "Shelf 5 — Jellies & Drinks" },
              { num: "4", name: "Shelf 4 — Drinks & Sodas" },
              { num: "3", name: "Shelf 3 — Cans & Juices" },
              { num: "2", name: "Shelf 2 — Energy & Protein Bars" },
              { num: "1", name: "Shelf 1 — Large Boxes & Wafers" }
            ].map((rowInfo) => {
              const rowItems = items.filter(item => item.id.startsWith(rowInfo.num));
              const isBottomRow = rowInfo.num === "1";

              return (
                <div key={rowInfo.num} className="relative flex flex-col gap-3">
                  {/* Row Header/Label */}
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {rowInfo.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">
                      {rowItems.length} slots
                    </span>
                  </div>

                  {/* Vending Shelf Rack */}
                  <div className={`grid gap-4 ${isBottomRow ? 'grid-cols-2 md:grid-cols-4 max-w-4xl' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-8'}`}>
                    {rowItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => item.name !== "Empty Slot" && setSelectedItem(item)}
                        className={`relative bg-slate-900/60 backdrop-blur-sm rounded-[20px] p-4 border transition-all duration-300 flex flex-col justify-between min-h-[230px] ${
                          item.name === "Empty Slot" ? '' : 'cursor-pointer hover:border-slate-700 hover:scale-[1.03] hover:shadow-xl z-20 shadow-lg'
                        } ${
                          !item.inStock && 'opacity-60'
                        } border-slate-800`}
                      >
                        {/* Slot Tag */}
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-200 text-[10px] font-bold rounded-md">
                            {item.id}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500">
                            {item.category}
                          </span>
                        </div>

                        {/* Vector representation */}
                        <div className="relative h-28 my-2 flex items-center justify-center">
                          <div className={`w-full h-full max-h-24 ${item.inStock ? 'opacity-100' : 'opacity-20'}`}>
                            <VendingItemVector 
                              type={item.type} 
                              brandColor={item.brandColor} 
                              accentColor={item.accentColor} 
                              name={item.name}
                            />
                          </div>

                          {!item.inStock && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="px-2.5 py-1 bg-red-950/90 border border-red-800/50 text-red-400 text-[9px] font-black uppercase tracking-wider rounded-md shadow-md">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Item metadata */}
                        <div className="text-center mt-1">
                          <h4 className="font-bold text-white text-xs tracking-tight truncate max-w-full">
                            {item.name}
                          </h4>
                          <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                            ₩{item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Physical Metal Coil / Rack Bottom Line Visualizer */}
                  <div className="w-full h-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-full border-t border-slate-900 mt-1"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Item Details Bottom Sheet Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-[#181d24] border border-slate-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Brand Color Banner */}
            <div 
              className="h-3 w-full" 
              style={{ backgroundColor: selectedItem.brandColor }}
            ></div>

            {/* Close Button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-900/60 p-2 rounded-full border border-slate-800/80 transition-colors cursor-pointer z-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content Layout */}
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
              
              {/* Left Side: Photo/Vector Showcase */}
              <div className="flex-1 flex flex-col items-center gap-4">
                <div 
                  className="w-full aspect-square rounded-2xl flex items-center justify-center relative border border-slate-800/80 shadow-inner overflow-hidden p-6 bg-slate-950"
                  style={{ 
                    background: `radial-gradient(circle, ${selectedItem.brandColor}15 0%, #090d12 100%)` 
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <div className="w-40 h-40 transform hover:scale-105 transition-transform duration-300">
                      <VendingItemVector 
                        type={selectedItem.type} 
                        brandColor={selectedItem.brandColor} 
                        accentColor={selectedItem.accentColor} 
                        name={selectedItem.name}
                      />
                    </div>
                    <div 
                      className="w-28 h-4 rounded-full filter blur-md opacity-30 mt-2"
                      style={{ backgroundColor: selectedItem.brandColor }}
                    ></div>
                  </div>

                  {/* Price Tag Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-slate-900/90 text-white font-extrabold text-xs rounded-lg border border-slate-800 shadow-md">
                    ₩{selectedItem.price.toLocaleString()}
                  </span>

                  {/* Slot position Tag */}
                  <span className="absolute top-4 right-4 px-3 py-1 bg-toss-blue/20 text-toss-blue font-black text-xs rounded-lg border border-toss-blue/30 uppercase tracking-wide">
                    SLOT {selectedItem.id}
                  </span>
                </div>

                {/* Real-time Vending Status Badge */}
                <div className={`w-full py-2.5 px-4 rounded-xl border text-center flex items-center justify-center gap-2 font-bold text-xs ${
                  selectedItem.inStock 
                    ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400' 
                    : 'bg-red-950/30 border-red-900/40 text-red-400'
                }`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      selectedItem.inStock ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      selectedItem.inStock ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></span>
                  </span>
                  <span>
                    자판기 상태: {selectedItem.inStock ? "판매 중 (In Stock)" : "품절 (Sold Out)"}
                  </span>
                </div>
              </div>

              {/* Right Side: Details and Nutrition Profile */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                    {selectedItem.category} Profile
                  </span>
                  <h3 className="text-2xl font-black text-white mt-0.5 mb-4">
                    {selectedItem.name}
                  </h3>

                  {/* Nutrition Panel */}
                  <div className="bg-slate-900/75 rounded-2xl p-4 border border-slate-800/80">
                    <h4 className="text-[10px] font-bold text-slate-400 mb-3.5 pb-2 border-b border-slate-800/80 uppercase tracking-wider flex justify-between">
                      <span>제품 영양 성분 정보 (Nutrition Facts)</span>
                    </h4>

                    {selectedItem.nutritionalInfo ? (
                      <div className="space-y-3">
                        {[
                          { label: "열량 (Calories)", value: `${selectedItem.nutritionalInfo.calories} kcal`, pct: (selectedItem.nutritionalInfo.calories / 2000) * 100, color: "bg-amber-500" },
                          { label: "나트륨 (Sodium)", value: `${selectedItem.nutritionalInfo.sodium} mg`, pct: (selectedItem.nutritionalInfo.sodium / 2000) * 100, color: "bg-blue-500" },
                          { label: "탄수화물 (Carbs)", value: `${selectedItem.nutritionalInfo.carbs} g`, pct: (selectedItem.nutritionalInfo.carbs / 324) * 100, color: "bg-emerald-500" },
                          { label: "당류 (Sugars)", value: `${selectedItem.nutritionalInfo.sugars} g`, pct: (selectedItem.nutritionalInfo.sugars / 100) * 100, color: "bg-pink-500" },
                          { label: "지방 (Fat)", value: `${selectedItem.nutritionalInfo.fat} g`, pct: (selectedItem.nutritionalInfo.fat / 54) * 100, color: "bg-orange-500" },
                          { label: "단백질 (Protein)", value: `${selectedItem.nutritionalInfo.protein} g`, pct: (selectedItem.nutritionalInfo.protein / 55) * 100, color: "bg-toss-blue" }
                        ].map((nutr, index) => (
                          <div key={index} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-slate-400">{nutr.label}</span>
                              <span className="text-white font-bold">{nutr.value}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${nutr.color}`}
                                style={{ width: `${Math.min(100, Math.max(2, nutr.pct))}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">영양 정보 정보 없음</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 text-[9px] text-slate-500 font-semibold flex justify-between border-t border-slate-800/60 pt-3">
                  <span>* 2,000kcal 영양성분 기준치 비율 (%)</span>
                  <span>Real-time IoT Scanner</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-8 mt-12 border-t border-toss-border/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-toss-text-tertiary">
        <span>© 2026 School Hackathon Vending Tracker</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={navigateToStatus}
            className="hover:text-toss-blue transition-colors cursor-pointer"
          >
            System Status Dashboard
          </button>
          <span>•</span>
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
