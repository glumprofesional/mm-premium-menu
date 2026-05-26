"use client"

import { useState, useEffect } from "react"
import { startRegistration } from "@simplewebauthn/browser"

export default function PasskeyManager() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hasCredential, setHasCredential] = useState<boolean | null>(null)
  const [webauthnAvailable, setWebauthnAvailable] = useState(false)

  useEffect(() => {
    setWebauthnAvailable(window.PublicKeyCredential !== undefined)
    checkExistingCredential()
  }, [])

  async function checkExistingCredential() {
    try {
      const res = await fetch("/admin/api/webauthn/check-credentials", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setHasCredential(data.hasCredential)
      }
    } catch {
      // Silently fail — not critical
    }
  }

  async function handleRegister() {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // 1. Get registration options from server
      const optionsRes = await fetch("/admin/api/webauthn/register-options", {
        method: "POST",
      })

      const optionsData = await optionsRes.json()

      if (!optionsRes.ok) {
        setError(optionsData.error || "Error al obtener opciones de registro")
        return
      }

      // 2. Prompt user for biometric registration
      const regResp = await startRegistration(optionsData)

      // 3. Verify with server
      const verifyRes = await fetch("/admin/api/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regResp),
      })

      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setError(verifyData.error || "Verificación fallida")
        return
      }

      setSuccess("Biometría registrada exitosamente en este dispositivo")
      setHasCredential(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          // User cancelled — no error message needed
          return
        }
        if (err.message.includes("already registered") || err.message.includes("exclude")) {
          setError("Esta biometría ya está registrada en este dispositivo.")
          return
        }
      }
      setError("No se pudo registrar la biometría. Intentá de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  /* ── Not supported ── */
  if (!webauthnAvailable) {
    return (
      <div className="bg-[#eee7d4] rounded-xl border border-[#d4cbaf] p-4">
        <div className="flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6858" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
            <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          </svg>
          <h3 className="font-semibold text-[#14130e]">Acceso Biométrico</h3>
        </div>
        <p className="text-sm text-[#6b6858]">
          Tu navegador no soporta autenticación biométrica. Actualizá tu navegador para usar esta función.
        </p>
      </div>
    )
  }

  /* ── Main ── */
  return (
    <div className="bg-[#eee7d4] rounded-xl border border-[#d4cbaf] p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#da5a47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Z" />
          <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
        <h3 className="font-semibold text-[#14130e]">Acceso Biométrico</h3>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-[#fde8e5] text-[#b9412f] text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
          {success}
        </div>
      )}

      <p className="text-sm text-[#6b6858] mb-3">
        {hasCredential
          ? "Biometría registrada en este dispositivo. Podés ingresar con huella o cara desde la pantalla de login."
          : hasCredential === false
          ? "No tenés biometría registrada. Registrá tu huella o cara para ingresar más rápido."
          : "Verificando estado de biometría..."
        }
      </p>

      <button
        type="button"
        onClick={handleRegister}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-2 bg-[#da5a47] text-white rounded-lg hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        {loading
          ? "Registrando..."
          : hasCredential
          ? "Registrar otra biometría"
          : "Registrar biometría"
        }
      </button>
    </div>
  )
}