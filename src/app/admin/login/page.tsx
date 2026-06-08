import Image from 'next/image';
import LoginForm from "./LoginForm"

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#e6dec8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#eee7d4] border-2 border-[#da5a47] mb-4 overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="M&M Multiespacio"
              width={72}
              height={72}
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-[#14130e]">Panel de Administración</h1>
          <p className="text-sm text-[#6b6858] mt-1">Ingresá tus credenciales para continuar</p>
        </div>
        <div className="bg-[#eee7d4] rounded-2xl border border-[#d4cbaf] p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}