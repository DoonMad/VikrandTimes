"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, PlusSquare } from "lucide-react";

export default function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || 
                             (window.navigator as any).standalone || 
                             document.referrer.includes("android-app://");
    
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Check if user dismissed it previously
    const hasDismissed = localStorage.getItem("pwa_prompt_dismissed");
    if (hasDismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for Android/Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt slightly delayed for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If iOS (which doesn't fire beforeinstallprompt), show prompt manually
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-96 bg-primary text-on-primary rounded-2xl shadow-2xl p-5 z-200 animate-in slide-in-from-bottom-5 fade-in duration-500 border border-primary-container">
      <button 
        onClick={dismissPrompt}
        className="absolute top-3 right-3 text-on-primary/70 hover:text-on-primary transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X size={20} />
      </button>

      <div className="pr-6">
        <h3 className="font-headline font-bold text-lg mb-1 flex items-center gap-2">
          <Download size={18} />
          Install Vikrand Times
        </h3>
        <p className="text-sm text-on-primary/90 leading-relaxed mb-4">
          Add our app to your home screen for a seamless, fullscreen reading experience.
        </p>

        {isIOS ? (
          <div className="bg-white/10 rounded-xl p-3 text-sm font-medium">
            <p className="flex items-center gap-2 mb-2">
              1. Tap the <Share size={16} className="mx-1" /> Share button
            </p>
            <p className="flex items-center gap-2">
              2. Select <PlusSquare size={16} className="mx-1" /> Add to Home Screen
            </p>
          </div>
        ) : (
          <button 
            onClick={handleInstallClick}
            className="w-full py-2.5 bg-white text-primary font-bold rounded-xl active:scale-95 transition-transform shadow-md cursor-pointer"
          >
            Add to Home Screen
          </button>
        )}
      </div>
    </div>
  );
}
