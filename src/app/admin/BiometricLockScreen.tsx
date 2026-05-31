"use client";

import { useRouter } from "next/navigation";

export default function OpenCartaButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/?from=admin")}
      className="text-sm font-semibold tracking-wide uppercase px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-105"
      style={{
        color: "#da5a47",
        background: "rgba(218,90,71,0.1)",
        border: "1px solid rgba(218,90,71,0.3)",
      }}
    >
      Ver Carta
    </button>
  );
}