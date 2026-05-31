// src/app/admin/login/LoginForm.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { startAuthentication } from "@simplewebauthn/browser"

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "password" | "biometric">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasBiometric, setHasBiometric] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!email) return

    setLoading(true)

    try {
      // Check if user has biometric credentials
      const res = await fetch(`/admin/api/webauthn/check-credentials?email=${encodeURIComponent(email)}`)
      const data = await res.json()

      if (data.hasCredentials) {
        setHasBiometric(true)
        setStep("biometric")
        // Auto-trigger biometric prompt
        setTimeout(() => handleBiometric(), 300)
      } else {
        setHasBiometric(false)
        setStep("password")
      }
    } catch {
      // If check fails, go to password
      setStep("password")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/admin/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Credenciales inválidas")
        return
      }

      sessionStorage.setItem("bio_just_unlocked", "true")
        router.push("/admin")
      router.refresh()
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  async function handleBiometric() {
    setError("")
    setBioLoading(true)

    try {
      const optionsRes = await fetch("/admin/api/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!optionsRes.ok) {
        const errData = await optionsRes.json()
        setError(errData.error || "Error al obtener opciones de autenticación")
        setBioLoading(false)
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
        sessionStorage.setItem("bio_just_unlocked", "true")
        router.push("/admin")
        router.refresh()
      } else {
        setError(verifyData.error || "Verificación biométrica fallida")
      }
    } catch (err: unknown) {
      console.error("[LoginForm] Biometric error:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)

      if (errorMessage.includes("cancel") || errorMessage.includes("Abort") || errorMessage.includes("NotAllowedError")) {
        setError("Autenticación cancelada")
      } else if (errorMessage.includes("SecurityError")) {
        setError("Error de seguridad. Asegurate de usar HTTPS.")
      } else if (errorMessage.includes("WebAuthn is not supported")) {
        setError("Tu navegador no soporta WebAuthn")
      } else {
        setError("Error biométrico: " + errorMessage)
      }
    } finally {
      setBioLoading(false)
    }
  }

  function goBack() {
    setStep("email")
    setError("")
    setPassword("")
  }

  // ====== STEP 1: EMAIL ======
  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[#fde8e5] text-[#b9412f] text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#14130e] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
            placeholder="tu@email.com"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-2.5 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Continuar"}
        </button>
      </form>
    )
  }

  // ====== STEP 2A: BIOMETRIC ======
  if (step === "biometric") {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-[#fde8e5] text-[#b9412f] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Show email as confirmation */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f5f0e2] border border-[#d4cbaf]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6858" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <span className="text-sm text-[#14130e] font-medium truncate">{email}</span>
          <button type="button" onClick={goBack} className="ml-auto text-xs text-[#da5a47] font-medium cursor-pointer hover:underline">
            Cambiar
          </button>
        </div>

        {/* Biometric prompt info */}
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#fde8e5] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#da5a47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z"/>
            </svg>
          </div>
          <p className="text-sm text-[#14130e] font-medium mb-1">Usá tu desbloqueo biométrico</p>
          <p className="text-xs text-[#6b6858]">Se va a abrir el diálogo de autenticación de tu dispositivo</p>
        </div>

        {/* Biometric button */}
        <button
          type="button"
          onClick={handleBiometric}
          disabled={bioLoading}
          className="w-full py-2.5 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {bioLoading ? (
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
              Ingresar con biometría
            </>
          )}
        </button>

        {/* Fallback to password */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#d4cbaf]" />
          <span className="text-xs text-[#6b6858]">o</span>
          <div className="flex-1 h-px bg-[#d4cbaf]" />
        </div>

        <button
          type="button"
          onClick={() => { setStep("password"); setError("") }}
          className="w-full py-2.5 rounded-lg border-2 border-[#d4cbaf] text-[#6b6858] hover:bg-[#f5f0e2] transition-colors font-medium text-sm cursor-pointer"
        >
          Ingresar con contraseña
        </button>
      </div>
    )
  }

  // ====== STEP 2B: PASSWORD ======
  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-[#fde8e5] text-[#b9412f] text-sm font-medium">
          {error}
        </div>
      )}

      {/* Show email as confirmation */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f5f0e2] border border-[#d4cbaf]">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6858" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        <span className="text-sm text-[#14130e] font-medium truncate">{email}</span>
        <button type="button" onClick={goBack} className="ml-auto text-xs text-[#da5a47] font-medium cursor-pointer hover:underline">
          Cambiar
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#14130e] mb-1">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2.5 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
          placeholder="........"
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {/* If biometric is available, show option to go back */}
      {hasBiometric && (
        <>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#d4cbaf]" />
            <span className="text-xs text-[#6b6858]">o</span>
            <div className="flex-1 h-px bg-[#d4cbaf]" />
          </div>

          <button
            type="button"
            onClick={() => { setStep("biometric"); setError("") }}
            className="w-full py-2.5 rounded-lg border-2 border-[#da5a47] text-[#da5a47] hover:bg-[#fde8e5] transition-colors font-medium text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>
              <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z"/>
            </svg>
            Ingresar con biometría
          </button>
        </>
      )}
    </form>
  )
}