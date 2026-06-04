import React, { useState, useEffect } from 'react';
import { initialVendingItems, shelves } from './vendingData';
import { subscribeToVendingItems, subscribeToMetadata, isDatabaseMock } from './firebase';
import { VendingItemVector } from './components/VendingItemVector';
import { AdminPanel } from './components/AdminPanel';
import { AdminGate } from './components/AdminGate';
import { NutritionModal } from './components/NutritionModal';
import { getApiUrl } from './geminiService';
import { StatusPage } from './components/StatusPage';

// ── Light theme colour tokens ─────────────────────────────────────────────────
const C = {
  bg:        '#f2f4f6',
  shelf:     '#ffffff',
  card:      '#ffffff',
  border:    '#e5e8eb',
  text:      '#191f28',
  muted:     '#8b95a1',
  dim:       '#b0b8c1',
};

function App() {
  const [items, setItems]                     = useState([]);
  const [metadata, setMetadata]               = useState({ lastUpdated: null });
  const [selectedItem, setSelectedItem]       = useState(null);
  const [isAdmin, setIsAdmin]                 = useState(
    window.location.hash === '#admin' || window.location.hash === '#/admin'
  );
  const [secretCounter, setSecretCounter]     = useState(0);
  const [isSessionAuthorized, setIsSessionAuthorized] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState('checking');
  const [hasGemini, setHasGemini]             = useState(false);
  const [isStatus, setIsStatus]               = useState(
    window.location.hash === '#status' || window.location.hash === '#/status'
  );

  // Backend + Gemini status check
  useEffect(() => {
    const check = async () => {
      try {
        const res  = await fetch(`${getApiUrl()}/api/status`);
        const data = await res.json();
        setIsBackendOnline(res.ok ? 'online' : 'offline');
        setHasGemini(!!data.geminiReady);
      } catch {
        setIsBackendOnline('offline');
        setHasGemini(false);
      }
    };
    check();
  }, []);

  // Hash-based routing
  useEffect(() => {
    const onChange = () => {
      const admin  = window.location.hash === '#admin' || window.location.hash === '#/admin';
      const status = window.location.hash === '#status' || window.location.hash === '#/status';
      setIsAdmin(admin);
      setIsStatus(status);
      if (!admin) setIsSessionAuthorized(false);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  // Firebase / localStorage real-time subscription
  useEffect(() => {
    const unsubItems = subscribeToVendingItems(setItems);
    const unsubMeta  = subscribeToMetadata(setMetadata);
    return () => { unsubItems(); unsubMeta(); };
  }, []);

  const navigateToAdmin  = () => { window.location.hash = '#admin'; };
  const navigateToStatus = () => { window.location.hash = '#status'; };
  const navigateToGrid   = () => { window.location.hash = ''; };

  const handleTitleClick = () => {
    setSecretCounter(prev => {
      const next = prev + 1;
      if (next >= 5) { navigateToAdmin(); return 0; }
      return next;
    });
  };

  const formatLastUpdated = (iso) => {
    if (!iso) return 'Loading...';
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    } catch { return 'Just now'; }
  };

  // ── Status page ────────────────────────────────────────────────────────────
  if (isStatus) return <StatusPage onClose={navigateToGrid} />;

  // ── Admin views ────────────────────────────────────────────────────────────
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
          onLogOut={() => { setIsSessionAuthorized(false); navigateToGrid(); }}
        />
      </div>
    );
  }

  // Group items by shelf for display
  const itemsByShelf = {};
  shelves.forEach(s => {
    itemsByShelf[s.id] = items
      .filter(it => it.shelf === s.id)
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  });

  // ── Status badge helper ────────────────────────────────────────────────────
  const StatusDot = ({ online }) => (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${online ? 'bg-emerald-400' : 'bg-red-400'}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
    </span>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-8 pb-4">
        <header className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#34D399' }}>Real-Time Synced</span>
            </div>
            <h1
              onClick={handleTitleClick}
              className="text-3xl md:text-4xl font-extrabold tracking-tight cursor-default select-none"
              style={{ color: C.text }}
            >
              School Smart Vending
            </h1>
          </div>

          <button
            onClick={navigateToAdmin}
            className="p-3 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, color: C.muted }}
            title="Admin Portal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        {/* ── Status ribbon ── */}
        <div
          className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: '#e8f3ff' }}>
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <span className="text-xs font-semibold block" style={{ color: C.muted }}>Last Update Stamp</span>
              <span className="text-sm font-bold" style={{ color: C.text }}>
                Last Updated: {formatLastUpdated(metadata.lastUpdated)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 cursor-pointer" onClick={navigateToStatus} title="System Status">
            {/* Firebase */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ backgroundColor: '#f2f4f6', border: `1px solid ${C.border}`, color: C.muted }}>
              <StatusDot online={!isDatabaseMock()} />
              <span>Firebase:</span>
              <span style={{ color: isDatabaseMock() ? '#d97706' : '#3182f6', fontWeight: 700 }}>
                {isDatabaseMock() ? 'Offline (Local)' : 'Online (Firestore)'}
              </span>
            </div>
            {/* Render */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ backgroundColor: '#f2f4f6', border: `1px solid ${C.border}`, color: C.muted }}>
              <StatusDot online={isBackendOnline === 'online'} />
              <span>Render Server:</span>
              <span style={{ color: isBackendOnline === 'online' ? '#3182f6' : isBackendOnline === 'offline' ? '#ef4444' : '#d97706', fontWeight: 700 }}>
                {isBackendOnline === 'online' ? 'Online' : isBackendOnline === 'offline' ? 'Offline' : 'Connecting...'}
              </span>
            </div>
            {/* Gemini */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ backgroundColor: '#f2f4f6', border: `1px solid ${C.border}`, color: C.muted }}>
              <StatusDot online={hasGemini} />
              <span>Gemini AI:</span>
              <span style={{ color: hasGemini ? '#3182f6' : '#ef4444', fontWeight: 700 }}>
                {hasGemini ? 'Ready (2.5 Flash)' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shelf Grid ── */}
      {items.length === 0 ? (
        <div className="w-full max-w-6xl mx-auto px-4 py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold" style={{ color: C.muted }}>Loading vending machine layout...</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl mx-auto px-4 pb-12 space-y-4">
          {shelves.map(shelf => {
            const shelfItems = itemsByShelf[shelf.id] || [];
            return (
              <div
                key={shelf.id}
                className="rounded-3xl overflow-hidden"
                style={{ backgroundColor: C.shelf, border: `1px solid ${C.border}` }}
              >
                {/* Shelf label bar */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: `1px solid ${C.border}` }}
                >
                  <span className="text-xs font-extrabold tracking-widest uppercase" style={{ color: C.muted }}>
                    Shelf {shelf.id} — {shelf.name}
                  </span>
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: C.border, color: C.dim }}
                  >
                    {shelfItems.length} slots
                  </span>
                </div>

                {/* Items row */}
                <div className={`grid gap-3 p-4 ${shelfItems.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8'}`}>
                  {shelfItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="relative flex flex-col items-center rounded-2xl p-3 transition-all duration-200 active:scale-95 text-left cursor-pointer"
                      style={{
                        backgroundColor: C.card,
                        border: `1px solid ${item.inStock ? C.border : '#1F1F2E'}`,
                        opacity: item.inStock ? 1 : 0.55,
                      }}
                    >
                      {/* Slot ID + Category badges */}
                      <div className="w-full flex justify-between items-center mb-2">
                        <span
                          className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: '#f2f4f6', color: C.muted }}
                        >
                          {item.id}
                        </span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: C.dim }}
                        >
                          {item.category}
                        </span>
                      </div>

                      {/* Item graphic */}
                      <div className="relative w-full h-20 flex items-center justify-center my-1">
                        <div className="w-full h-full max-w-[56px]">
                          <VendingItemVector
                            type={item.type}
                            brandColor={item.brandColor}
                            accentColor={item.accentColor}
                            name={item.name}
                          />
                        </div>
                        {!item.inStock && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span
                              className="text-[9px] font-extrabold px-2 py-1 rounded-full tracking-wide"
                              style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                            >
                              SOLD OUT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Name + Price */}
                      <div className="w-full text-center mt-1">
                        <p
                          className="text-[11px] font-bold leading-tight truncate w-full"
                          style={{ color: item.inStock ? C.text : C.muted }}
                          title={item.name}
                        >
                          {item.name}
                        </p>
                        <p className="text-[11px] font-semibold mt-0.5" style={{ color: C.muted }}>
                          ₩{item.price.toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        className="w-full max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs font-semibold"
        style={{ borderTop: `1px solid ${C.border}`, color: C.dim }}
      >
        <span>© 2026 School Hackathon Vending Tracker</span>
        <div className="flex items-center gap-4">
          <button onClick={navigateToStatus} className="hover:text-white transition-colors cursor-pointer">
            System Status
          </button>
          <span>•</span>
          <button onClick={navigateToAdmin} className="hover:text-white transition-colors cursor-pointer">
            Admin Panel
          </button>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-md text-[10px]" style={{ backgroundColor: C.border }}>v2.0.0</span>
        </div>
      </footer>

      {/* ── Nutrition modal ── */}
      {selectedItem && (
        <NutritionModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

export default App;
