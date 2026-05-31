// src/app/admin/login/LoginForm.tsx
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
  const [webauthnSupported, setWebauthnSupported] = useState(false)
  const [bioLoading, setBioLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      setWebauthnSupported(true)
    }
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

  async function handleBiometric() {
    if (!email) {
      setError("Ingresá tu email primero para usar biometría")
      return
    }

    setError("")
    setBioLoading(true)

    try {
      // Step 1: Get authentication options from server
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

      // Step 2: Start browser authentication (v13+ API)
      const authResponse = await startAuthentication({ optionsJSON: options })

      // Step 3: Verify with server
      const verifyRes = await fetch("/admin/api/webauthn/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: authResponse }),
      })

      const verifyData = await verifyRes.json()

      if (verifyRes.ok && verifyData.verified) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="........"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#da5a47] text-white hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      {webauthnSupported && (
        <>
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-[#d4cbaf]" />
            <span className="text-xs text-[#6b6858]">o</span>
            <div className="flex-1 h-px bg-[#d4cbaf]" />
          </div>

          <button
            type="button"
            onClick={handleBiometric}
            disabled={bioLoading || !email}
            className="w-full py-2.5 rounded-lg border-2 border-[#da5a47] text-[#da5a47] hover:bg-[#fde8e5] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {bioLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verificando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8Z" />
                </svg>
                Ingresar con huella / cara / PIN
              </>
            )}
          </button>

          {!email && (
            <p className="text-xs text-[#6b6858] text-center">
              Ingresá tu email arriba para usar biometría
            </p>
          )}
        </>
      )}
    </form>
  )
}