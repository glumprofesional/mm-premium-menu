// src/app/admin/BiometricLockScreen.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { startAuthentication } from "@simplewebauthn/browser"

export default function BiometricLockScreen({ email, onUnlocked }: { email: string; onUnlocked: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Auto-trigger biometric prompt when lock screen appears
    const timer = setTimeout(() => handleBiometric(), 500)
    return () => clearTimeout(timer)
  }, [])

  async function handleBiometric() {
    setError("")
    setLoading(true)

    try {
      const optionsRes = await fetch("/admin/api/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!optionsRes.ok) {
        const errData = await optionsRes.json()
        setError(errData.error || "Error al obtener opciones de autenticación")
        setLoading(false)
        return
      }

      const { options } = await optionsRes.json()

      const authResponse = await startAuthentication({ optionsJSON: options })

      const verifyRes = await fetch("/admin/api/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: authResponse }),
      })

      const verifyData = await verifyRes.json()

      if (verifyRes.ok && verifyData.verified) {
        onUnlocked()
      } else {
        setError(verifyData.error || "Verificación fallida")
      }
    } catch (err: unknown) {
      console.error("[BiometricLock] Error:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)

      if (errorMessage.includes("cancel") || errorMessage.includes("Abort") || errorMessage.includes("NotAllowedError")) {
        setError("Autenticación cancelada. Tocá el botón para reintentar.")
      } else if (errorMessage.includes("SecurityError")) {
        setError("Error de seguridad. Asegurate de usar HTTPS.")
      } else {
        setError("Error: " + errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  function handlePasswordLogin() {
    router.push("/admin/login")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#e6dec8]">
      <div className="w-full max-w-sm mx-4 text-center">
        {/* Logo */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-[#14130e]">M&M</h2>
          <p className="text-sm text-[#6b6858] mt-1">Multiespacio</p>
        </div>

        {/* Fingerprint icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#fde8e5] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#da5a47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
            <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z"/>
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-[#14130e] mb-1">Panel de Administración</h3>
        <p className="text-sm text-[#6b6858] mb-6">Desbloqueá con tu huella, cara o PIN</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#fde8e5] text-[#b9412f] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Biometric button */}
        <button
          type="button"
          onClick={handleBiometric}
          disabled={loading}
          className="w-full py-3 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Verificando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
                <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z"/>
              </svg>
              Desbloquear con biometría
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#d4cbaf]" />
          <span className="text-xs text-[#6b6858]">o</span>
          <div className="flex-1 h-px bg-[#d4cbaf]" />
        </div>

        {/* Password fallback */}
        <button
          type="button"
          onClick={handlePasswordLogin}
          className="w-full py-3 rounded-lg border-2 border-[#d4cbaf] text-[#6b6858] hover:bg-[#f5f0e2] transition-colors font-medium text-sm cursor-pointer"
        >
          Ingresar con contraseña
        </button>

        {/* Email info */}
        <p className="mt-6 text-xs text-[#a09e8e]">
          Sesión: {email}
        </p>
      </div>
    </div>
  )
}