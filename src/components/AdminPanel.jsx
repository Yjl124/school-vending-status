import React, { useState, useEffect } from 'react';
import { 
  updateVendingItem, 
  batchUpdateVendingItems,
  getStoredFirebaseConfig, 
  saveStoredFirebaseConfig,
  isDatabaseMock
} from '../firebase';
import { 
  isGeminiConfigured,
  getApiUrl,
  analyzeVendingMachineImage 
} from '../geminiService';

export const AdminPanel = ({ items, onClose, onLogOut }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [hasGemini, setHasGemini] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState('checking'); // 'checking', 'online', 'offline'

  const dbMode = isDatabaseMock() ? 'Local Mock (LocalStorage)' : 'Real-Time Cloud (Firebase Firestore)';

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setBase64Image(reader.result);
        setScanError(null);
        setScanSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerRealAIScan = async () => {
    if (!base64Image) {
      setScanError("Please select or upload an image first.");
      return;
    }
    setIsScanning(true);
    setScanError(null);
    setScanSuccess(false);
    
    try {
      const mappings = await analyzeVendingMachineImage(base64Image);
      await batchUpdateVendingItems(mappings);
      setScanSuccess(true);
      console.log("Successfully scanned & batch updated database:", mappings);
    } catch (error) {
      console.error(error);
      setScanError(error.message || "An error occurred during the Gemini vision scan.");
    } finally {
      setIsScanning(false);
    }
  };

  // Simulation flow for testing/hackathon demos without keys
  const triggerSimulatedAIScan = () => {
    setIsScanning(true);
    setScanError(null);
    setScanSuccess(false);

    setTimeout(async () => {
      // Create a mock mapping that randomizes a few sold out items
      const mockResult = {};
      const slotIds = [
        "60", "61", "62", "63", "64", "65", "66", "67",
        "50", "51", "52", "53", "54", "55", "56", "57",
        "40", "41", "42", "43", "44", "45", "46", "47",
        "30", "31", "32", "33", "34", "35", "36", "37",
        "20", "21", "22", "23", "24", "25", "26", "27",
        "11", "13", "15", "17"
      ];
      
      slotIds.forEach(id => {
        // Randomly toggle stock but make sure 64 and 15 default to sold out occasionally, or simulate randomly
        if (id === "64" || id === "15") {
          mockResult[id] = Math.random() > 0.9; // Usually sold out
        } else {
          mockResult[id] = Math.random() > 0.15; // Mostly in stock
        }
      });

      try {
        await batchUpdateVendingItems(mockResult);
        setScanSuccess(true);
      } catch (e) {
        setScanError("Simulation update failed.");
      } finally {
        setIsScanning(false);
      }
    }, 2500);
  };

  const toggleItemStock = async (id, currentStock) => {
    await updateVendingItem(id, !currentStock);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-toss-text-primary tracking-tight">Vending Admin Portal</h1>
          <p className="text-toss-text-secondary mt-1">Configure database connections, manually override stock, or upload pictures for AI grid vision scan.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onLogOut}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer text-sm"
          >
            Log Out
          </button>
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-toss-border hover:bg-toss-text-tertiary/20 text-toss-text-primary font-semibold rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* DB Connection Status Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-toss-card border border-toss-border/50 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-toss-text-tertiary tracking-wider uppercase block">Database Engine</span>
          <span className="text-lg font-bold text-toss-text-primary mt-0.5 block">{dbMode}</span>
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

      {/* Main Admin Operations Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Manual Stock Control (7/12 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-toss-card border border-toss-border/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-toss-text-primary">Manual Stock Overrides</h2>
            <span className="text-xs px-2.5 py-1 bg-toss-blue-light text-toss-blue font-bold rounded-full">
              6 Shelves (44 Slots)
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3.5 bg-toss-gray-bg/30 border border-toss-border/40 hover:border-toss-border/80 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 font-bold text-xs bg-toss-blue-light text-toss-blue flex items-center justify-center rounded-xl">
                    {item.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-toss-text-primary text-sm">{item.name}</h3>
                    <p className="text-xs text-toss-text-secondary mt-0.5">₩{item.price.toLocaleString()} • {item.category}</p>
                  </div>
                </div>

                {/* Toss Style Custom Toggle Switch */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${item.inStock ? 'text-toss-blue' : 'text-toss-text-secondary'}`}>
                    {item.inStock ? "In Stock" : "Sold Out"}
                  </span>
                  <button
                    onClick={() => toggleItemStock(item.id, item.inStock)}
                    className={`relative inline-flex h-6.5 w-12 items-center rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
                      item.inStock ? 'bg-toss-blue' : 'bg-toss-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                        item.inStock ? 'translate-x-6.0' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Vending Camera Scanner (5/12 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-toss-card border border-toss-border/50 flex flex-col">
          <h2 className="text-xl font-bold text-toss-text-primary mb-2">Gemini Vision AI Scanner</h2>
          <p className="text-xs text-toss-text-secondary mb-6">Upload a photo of the vending machine tray. Gemini will analyze all 12 slots and update the inventory instantly.</p>
          
          {/* File Upload Box */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <label 
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 min-h-[180px] ${
                  imagePreview 
                    ? 'border-toss-blue bg-toss-blue-light/10' 
                    : 'border-toss-border hover:border-toss-text-tertiary bg-toss-gray-bg/20'
                }`}
              >
                {imagePreview ? (
                  <div className="relative w-full h-40">
                    <img 
                      src={imagePreview} 
                      alt="Vending Machine Upload" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="text-xs text-white font-bold">Replace Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 text-toss-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-bold text-toss-text-primary">Upload Machine Photo</span>
                    <span className="text-xs text-toss-text-secondary mt-1">PNG, JPG, or JPEG</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden" 
                  disabled={isScanning}
                />
              </label>

              {/* Status Messages */}
              {isScanning && (
                <div className="bg-toss-blue-light/50 border border-toss-blue/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-toss-blue border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-xs text-toss-blue font-semibold">
                    Gemini AI is scanning slots 11-67...
                  </div>
                </div>
              )}

              {scanSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-emerald-700 font-bold">
                    Scan successful! Real-time grid has been synchronized.
                  </span>
                </div>
              )}

              {scanError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-red-700 font-bold">Scan Failed</span>
                  </div>
                  <p className="text-[11px] text-red-600 font-medium leading-snug">{scanError}</p>
                </div>
              )}
            </div>

            {/* Run Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-toss-border/50">
              <button
                onClick={triggerRealAIScan}
                disabled={isScanning || !base64Image}
                className={`flex-1 py-3 px-4 font-bold rounded-2xl text-sm transition-all cursor-pointer ${
                  !base64Image || isScanning
                    ? 'bg-toss-border text-toss-text-tertiary cursor-not-allowed'
                    : 'bg-toss-blue hover:bg-toss-blue-hover text-white shadow-md active:scale-98'
                }`}
              >
                Scan with Gemini
              </button>
              <button
                onClick={triggerSimulatedAIScan}
                disabled={isScanning}
                className="py-3 px-4 bg-toss-blue-light hover:bg-toss-blue/10 text-toss-blue font-bold rounded-2xl text-sm transition-all cursor-pointer active:scale-98"
              >
                Simulate AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
