// src/app/admin/PasskeyManager.tsx
"use client"

import { useState, useEffect } from "react"
import { startRegistration } from "@simplewebauthn/browser"

export default function PasskeyManager() {
  const [status, setStatus] = useState<"loading" | "registered" | "not_registered" | "unsupported">("loading")
  const [registering, setRegistering] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    checkCredentials()
  }, [])

  async function checkCredentials() {
    try {
      if (!window.PublicKeyCredential) {
        setStatus("unsupported")
        return
      }

      const res = await fetch("/admin/api/webauthn/check-credentials", { method: "POST" })
      const data = await res.json()
      setStatus(data.hasCredentials ? "registered" : "not_registered")
    } catch {
      setStatus("not_registered")
    }
  }

  async function handleRegister() {
    setRegistering(true)
    setMessage("")

    try {
      const optionsRes = await fetch("/admin/api/webauthn/register-options", { method: "POST" })

      if (!optionsRes.ok) {
        const errData = await optionsRes.json()
        setMessage(errData.error || "Error al obtener opciones de registro")
        setRegistering(false)
        return
      }

      const { options } = await optionsRes.json()

      const registrationResponse = await startRegistration(options)

      const verifyRes = await fetch("/admin/api/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationResponse),
      })

      const verifyData = await verifyRes.json()

      if (verifyRes.ok && verifyData.verified) {
        setStatus("registered")
        setMessage("Credencial biométrica registrada correctamente")
      } else {
        setMessage(verifyData.error || "Error al verificar el registro")
      }
    } catch (err: unknown) {
      console.error("[PasskeyManager] Registration error:", err)

      const errorMessage = err instanceof Error ? err.message : String(err)

      if (errorMessage.includes("cancel") || errorMessage.includes("Abort") || errorMessage.includes("NotAllowedError")) {
        setMessage("Registro cancelado")
      }
      else if (errorMessage.includes("NotSupportedError") || errorMessage.includes("not supported")) {
        setStatus("unsupported")
        setMessage("Tu navegador no soporta autenticación biométrica")
      }
      else if (errorMessage.includes("SecurityError")) {
        setMessage("Error de seguridad. Asegurate de usar HTTPS.")
      }
      else {
        setMessage("Error al registrar: " + errorMessage)
      }
    } finally {
      setRegistering(false)
    }
  }

  return (
    <div className="border-2 border-[#d4cbaf] rounded-xl bg-[#eee7d4] p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#14130e]">Acceso Biométrico</h3>
        {status === "loading" && (
          <span className="text-xs text-[#6b6858]">Verificando...</span>
        )}
        {status === "registered" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            Registrado
          </span>
        )}
        {status === "not_registered" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fde8e5] text-[#b9412f]">
            No registrado
          </span>
        )}
        {status === "unsupported" && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d4cbaf] text-[#6b6858]">
            No disponible
          </span>
        )}
      </div>

      <p className="text-xs text-[#6b6858] mb-3">
        {status === "unsupported"
          ? "Tu dispositivo no soporta autenticación biométrica (huella, cara o PIN)."
          : status === "registered"
          ? "Ya podés ingresar usando tu huella, cara o PIN de Windows."
          : "Registra tu huella, cara o PIN de Windows para ingresar sin contraseña."
        }
      </p>

      {status === "not_registered" && (
        <button
          type="button"
          onClick={handleRegister}
          disabled={registering}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#da5a47] text-white rounded-lg hover:bg-[#c44d3c] transition-colors font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registering ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Registrando...
            </>
          ) : (
            "Registrar Biometría"
          )}
        </button>
      )}

      {message && (
        <p className={`mt-3 text-xs font-medium ${
          message.includes("correctamente") || message.includes("Registrado")
            ? "text-emerald-700"
            : "text-[#b9412f]"
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}