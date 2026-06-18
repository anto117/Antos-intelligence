"use client";
/**
 * useCurtainAsset
 * Manages the active curtain image URL.
 * - Default: /assets/modern_velvet_curtain.png (served from Next.js public/)
 * - Upload: POSTs to backend /api/assets/upload, then swaps URL + busts cache
 */
import { useState, useCallback } from "react";

const BACKEND = typeof window !== "undefined"
  ? `http://${window.location.hostname}:8000`
  : "http://localhost:8000";

const DEFAULT_URL = "/assets/curtain_default.png";

export function useCurtainAsset() {
  const [curtainUrl, setCurtainUrl] = useState<string>(DEFAULT_URL);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadCurtain = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file (PNG recommended).");
      return;
    }
    setUploading(true);
    setUploadError(null);

    // Optimistic preview using object URL
    const localUrl = URL.createObjectURL(file);
    setCurtainUrl(localUrl);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BACKEND}/api/assets/upload`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const { url } = await res.json();
        // Add timestamp to bust cache
        setCurtainUrl(`${BACKEND}${url}?t=${Date.now()}`);
      }
      // If backend unavailable, keep using the local object URL
    } catch {
      // Keep local preview even if backend unreachable
    } finally {
      setUploading(false);
    }
  }, []);

  const resetCurtain = useCallback(() => {
    setCurtainUrl(DEFAULT_URL);
    setUploadError(null);
  }, []);

  return { curtainUrl, uploadCurtain, resetCurtain, uploading, uploadError };
}
