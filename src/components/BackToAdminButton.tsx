"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function BackToAdminButtonInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fromAdmin = searchParams.get("from") === "admin";

  if (!fromAdmin) return null;

  return (
    <button
      onClick={() => router.push("/admin")}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
      style={{
        background: "#eee7d4",
        color: "#14130e",
        border: "2px solid #d4af37",
        boxShadow: "0 4px 24px rgba(212,175,55,0.35)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span className="text-sm font-bold tracking-wide">Volver al Panel</span>
    </button>
  );
}

export default function BackToAdminButton() {
  return (
    <Suspense fallback={null}>
      <BackToAdminButtonInner />
    </Suspense>
  );
}