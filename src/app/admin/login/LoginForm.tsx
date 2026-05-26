"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { startAuthentication } from "@simplewebauthn/browser"

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)
  const [webauthnAvailable, setWebauthnAvailable] = useState(false)

  useEffect(() => {
    setWebauthnAvailable(window.PublicKeyCredential !== undefined)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
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
        setError(data.error || "Error al iniciar sesión")
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("Error de conexión. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  async function handleBiometricLogin() {
    if (!email) {
      setError("Ingresá tu email primero para usar biometría.")
      return
    }

    setError("")
    setBioLoading(true)

    try {
      // 1. Get authentication options from server
      const optionsRes = await fetch("/admin/api/webauthn/login-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const optionsData = await optionsRes.json()

      if (!optionsRes.ok) {
        setError(optionsData.error || "Error al obtener opciones de biometría")
        return
      }

      // 2. Prompt user for biometric authentication
      const asseResp = await startAuthentication({ optionsJSON: optionsData })

      // 3. Verify with server
      const verifyRes = await fetch("/admin/api/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asseResp),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setError(verifyData.error || "Verificación fallida")
        return
      }

      // 4. Success — redirect to admin
      router.push("/admin")
      router.refresh()
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        // User cancelled the biometric prompt — no error message needed
        return
      }
      setError("No se pudo completar la autenticación biométrica. Usá email y contraseña.")
    } finally {
      setBioLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-[#fde8e5] text-[#b9412f] text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#14130e] mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
            placeholder="tu@email.com"
          />
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
            className="w-full px-3 py-2 rounded-lg border border-[#d4cbaf] bg-[#f5f0e2] text-[#14130e] placeholder:text-[#a09e8e] focus:outline-none focus:ring-2 focus:ring-[#da5a47] focus:border-transparent text-sm"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {/* ── Biometric Login ── */}
      {webauthnAvailable && (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#d4cbaf]" />
            <span className="text-xs text-[#6b6858] font-medium">o</span>
            <div className="flex-1 h-px bg-[#d4cbaf]" />
          </div>

          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={bioLoading || !email}
            className="w-full py-2.5 rounded-lg border-2 border-[#da5a47] text-[#da5a47] hover:bg-[#fde8e5] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
              <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
            </svg>
            {bioLoading ? "Verificando..." : "Ingresar con huella / cara"}
          </button>

          <p className="text-xs text-[#6b6858] text-center">
            Ingresá tu email primero y luego usá biometría
          </p>
        </>
      )}
    </div>
  )
}