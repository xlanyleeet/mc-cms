"use client";

import { useState } from "react";

interface CopyIPButtonProps {
  serverIP?: string;
}

export default function CopyIPButton({ serverIP = "play.yourserver.com" }: CopyIPButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyIP = () => {
    if (!serverIP) return;
    
    navigator.clipboard.writeText(serverIP);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleCopyIP}
      className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-lg text-base font-semibold transition relative"
    >
      {copied ? "IP скопійовано!" : `Скопіювати IP: ${serverIP}`}
    </button>
  );
}