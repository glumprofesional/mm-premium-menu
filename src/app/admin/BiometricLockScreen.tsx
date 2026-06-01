"use client";

import { useState, useEffect } from "react";
import { startAuthentication } from "@simplewebauthn/browser";

interface BiometricLockScreenProps {
  email: string;
  onUnlocked: () => void;
}

export default function BiometricLockScreen({ email, onUnlocked }: BiometricLockScreenProps) {
  const [loading, setLoading] = useState(false);