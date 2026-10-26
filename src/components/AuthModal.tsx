import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Lock, ShieldCheck, X, KeyRound, Delete } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    pendingSpaceId,
    activeSpaceId,
    workspaces,
    authenticateWorkspace,
    cancelSpaceChange
  } = useStore();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const targetId = pendingSpaceId || activeSpaceId;
  const targetWs = workspaces.find((w) => w.id === targetId);

  useEffect(() => {
    if (isAuthModalOpen) {
      setPin('');
      setErrorMsg('');
      setIsShaking(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen || !targetWs) return null;

  const handleKeyPress = async (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');

    if (newPin.length === 4) {
      // Auto verify when 4 digits reached
      const success = await authenticateWorkspace(targetId, newPin);
      if (!success) {
        setIsShaking(true);
        setErrorMsg('PIN salah. Silakan coba lagi (PIN default: 1234)');
        setTimeout(() => {
          setPin('');
          setIsShaking(false);
        }, 800);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl border border-slate-200 text-center transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Workspace Icon & Header */}
        <div className="relative">
          {pendingSpaceId && (
            <button
              onClick={cancelSpaceChange}
              className="absolute -top-2 -right-2 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          )}

          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
            {targetWs.icon || '💼'}
          </div>

          <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
            Autentikasi Workspace
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan PIN 4 digit untuk membuka <br />
            <strong className="text-slate-800">{targetWs.name}</strong>
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex justify-center items-center gap-4 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-blue-600 scale-125 shadow-sm shadow-blue-500/50'
                    : 'border-2 border-slate-300 bg-slate-100'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Hint message */}
        <div className="min-h-6 mb-2">
          {errorMsg ? (
            <p className="text-[11px] font-bold text-rose-600">{errorMsg}</p>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium">
              PIN Bawaan Awal: <strong className="text-slate-600">1234</strong>
            </p>
          )}
        </div>

        {/* Numeric Keypad for Mobile and Touch Devices */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-2xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 active:scale-95 text-slate-800 font-bold text-lg transition flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-12 rounded-2xl text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center justify-center"
          >
            Bersihkan
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 active:scale-95 text-slate-800 font-bold text-lg transition flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDeleteDigit}
            className="h-12 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-slate-500 font-bold text-base transition flex items-center justify-center cursor-pointer"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Physical input fallback */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(val);
              if (val.length === 4) {
                authenticateWorkspace(targetId, val);
              }
            }}
            placeholder="Ketik keyboard..."
            className="w-full text-center text-xs text-slate-400 bg-transparent focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
