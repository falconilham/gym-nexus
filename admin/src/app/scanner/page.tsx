'use client';

import { useState, useEffect } from 'react';
import { Scan, XCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);

  // Mock Scanning Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isScanning && !scanResult) {
       // Simulate a random scan event every 5 seconds for demo
       timer = setTimeout(() => {
          const randomOutcome = Math.random() > 0.3 ? 'success' : 'error';
          setScanResult(randomOutcome);
          setIsScanning(false);
       }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isScanning, scanResult]);

  const resetScan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F0F] flex flex-col items-center justify-center p-4">
      {/* Kiosk Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
         <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
            Exit Kiosk Mode
         </Link>
         <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">
                {isScanning ? 'Camera Active' : 'Standby'}
            </span>
         </div>
      </div>

      {/* Main Scanner Container */}
      <div className="relative w-full max-w-lg aspect-square bg-black rounded-3xl overflow-hidden border-2 border-[#333] shadow-2xl">
         
         {/* Live Camera Feed Placeholder */}
         <div className="absolute inset-0 bg-[#151515] flex items-center justify-center">
            {isScanning ? (
                <div className="text-center space-y-4">
                     <div className="relative w-64 h-64 border-2 border-[var(--primary)] rounded-lg flex items-center justify-center opacity-50">
                        <div className="absolute inset-0 border-t-2 border-[var(--primary)] animate-scan"></div>
                     </div>
                     <p className="text-gray-500 font-medium animate-pulse">Position QR Code within frame</p>
                </div>
            ) : scanResult === 'success' ? (
                <div className="text-center animate-in zoom-in duration-300">
                    <CheckCircle size={80} className="text-[#CCFF00] mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">Access Granted</h2>
                    <p className="text-gray-400 text-lg">Detailed Member Info Here</p>
                </div>
            ) : (
                <div className="text-center animate-in zoom-in duration-300">
                    <XCircle size={80} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-red-400 text-lg">Membership Expired</p>
                </div>
            )}
         </div>

         {/* Overlay UI */}
         <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent text-center">
             {!isScanning && (
                <button 
                    onClick={resetScan}
                    className="w-full py-4 bg-[var(--primary)] text-black font-bold text-xl rounded-xl hover:bg-[#bbe300] transition-transform active:scale-95 shadow-lg shadow-[#ccff0030]"
                >
                    Scan Next Member
                </button>
             )}
         </div>

      </div>

      <div className="mt-8 text-center space-y-2">
         <h1 className="text-4xl font-black tracking-tighter text-white">GYM<span className="text-[var(--primary)]">NEXUS</span></h1>
         <p className="text-gray-500 uppercase tracking-widest text-sm">Access Control Terminal 01</p>
      </div>

    </div>
  );
}
