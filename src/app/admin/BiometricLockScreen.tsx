"use client";

import { useState, useEffect } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

interface BiometricLockScreenProps {
  email: string;
  onUnlocked: () => void;
}

export default function BiometricLockScreen({ email, onUnlocked }: BiometricLockScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSkip, setShowSkip] = useState(false);

  async function handleBiometricUnlock() {
    setLoading(true);
    setError("");

    try {
      const optionsRes = await fetch("/admin/api/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const optionsData = await optionsRes.json();

      if (!optionsRes.ok) {
        setError("No se encontraron credenciales biométricas");
        setShowSkip(true);
        setLoading(false);
        return;
      }

      const asseResp = await startAuthentication({ optionsJSON: optionsData.options });

      const verifyRes = await fetch("/admin/api/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, credential: asseResp }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        sessionStorage.setItem("bio_just_unlocked", "true");
        onUnlocked();
      } else {
        setError(verifyData.error || "Verificación fallida");
        setShowSkip(true);
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("");
      } else {
        setError("Error de autenticación biométrica");
      }
      setShowSkip(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBiometricUnlock();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "#e6dec8" }}>
      <div className="flex flex-col items-center gap-6 px-8 max-w-sm w-full">
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-bold" style={{ color: "#14130e" }}>M&amp;M</span>
          <span className="text-sm tracking-widest uppercase" style={{ color: "#6b6858" }}>Multiespacio</span>
        </div>

        <div className="my-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#da5a47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
            <path d="M2 12a10 10 0 0 1 18-6" />
            <path d="M2 16h.01" />
            <path d="M21.8 16c.2-2 .131-5.354 0-6" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
          </svg>
        </div>

        {loading && (
          <div className="flex items-center gap-2" style={{ color: "#6b6858" }}>
            <div className="w-4 h-4 border-2 border-[#da5a47] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Verificando...</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-center" style={{ color: "#da5a47" }}>{error}</p>
        )}

        {!loading && (
          <button onClick={handleBiometricUnlock} className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ background: "#da5a47" }}>
            Desbloquear con biometría
          </button>
        )}

        {showSkip && (
          <button onClick={() => { sessionStorage.setItem("bio_just_unlocked", "true"); onUnlocked(); }} className="text-sm underline transition-colors cursor-pointer" style={{ color: "#6b6858" }}>
            Omitir e ingresar
          </button>
        )}
      </div>
    </div>
  );
}
