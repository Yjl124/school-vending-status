import React, { useState } from 'react';

export const AdminGate = ({ onAuthorized, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Read from env variable, localStorage config, or use default 'admin1234'
    const correctPassword = 
      import.meta.env.VITE_ADMIN_PASSWORD || 
      localStorage.getItem('vending_admin_password') || 
      'admin1234';

    if (password === correctPassword) {
      setError(false);
      onAuthorized();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-toss-gray-bg flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-white rounded-[32px] p-8 shadow-toss-card border border-toss-border/50 transition-all duration-300 ${
        shaking ? 'animate-shake border-red-300 shadow-red-100/50' : 'hover:shadow-toss-hover'
      }`}>
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-toss-blue-light text-toss-blue flex items-center justify-center rounded-2xl mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-toss-text-primary tracking-tight">Admin Gatekeeper</h2>
          <p className="text-sm text-toss-text-secondary mt-1.5">Enter the admin security passcode to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              className={`w-full px-4 py-3.5 bg-toss-gray-bg border focus:outline-none rounded-2xl text-center text-lg font-semibold tracking-widest transition-all duration-200 ${
                error 
                  ? 'border-red-400 focus:border-red-500 text-red-600 bg-red-50/20' 
                  : 'border-toss-border/80 focus:border-toss-blue focus:bg-white'
              }`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 text-center font-bold mt-2.5 animate-fade-in">
                Access Denied. Passcode is incorrect.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-toss-border hover:bg-toss-text-tertiary/20 text-toss-text-primary font-bold rounded-2xl text-sm transition-all cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-toss-blue hover:bg-toss-blue-hover text-white font-bold rounded-2xl text-sm transition-all cursor-pointer active:scale-95 shadow-md shadow-toss-blue/10"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
