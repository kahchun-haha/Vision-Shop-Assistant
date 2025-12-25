import React, { useState, useEffect, useRef } from 'react';
import { CameraFeed, CameraFeedHandle } from './components/CameraFeed';
import { CartSummary } from './components/CartSummary';
import { CartItem, AppState, DetectionResponse } from './types';
import { detectObjectInImage } from './services/yoloService';
import { speak, playSound } from './services/ttsService';
import { ShoppingBag, HelpCircle, Power, ScanLine, Plus, Check } from 'lucide-react';

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [lastSeen, setLastSeen] = useState<DetectionResponse | null>(null);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null); // Visual feedback state

  // LOGIC: Track memories
  const lastSpokenNameRef = useRef<string | null>(null);
  const lastSpokenTimeRef = useRef<number>(0);
  const lastAddClickTimeRef = useRef<number>(0); // Prevent accidental double-taps

  const cameraRef = useRef<CameraFeedHandle>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // --- SCANNING LOOP ---
  useEffect(() => {
    if (isAutoScanning) {
      speak("Scanner active.", 'high');

      const performScan = async () => {
        if (isProcessingRef.current) return;

        const frame = cameraRef.current?.captureFrame();
        if (frame) {
          isProcessingRef.current = true;
          try {
            const result = await detectObjectInImage(frame);

            if (result.itemFound && result.name) {
              const now = Date.now();
              const timeSinceLastSpoken = now - lastSpokenTimeRef.current;

              // Speak only if new item OR 5 seconds passed
              if (result.name !== lastSpokenNameRef.current || timeSinceLastSpoken > 5000) {
                playSound('success');
                speak(`${result.name}. ${result.price}`, 'high'); // Shortened speech for speed

                lastSpokenNameRef.current = result.name;
                lastSpokenTimeRef.current = now;
              }
              setLastSeen(result);
            } else {
              setLastSeen(null);
            }
          } catch (e) {
            console.error("Scan failed", e);
          } finally {
            isProcessingRef.current = false;
          }
        }
      };

      performScan();
      scanIntervalRef.current = window.setInterval(performScan, 500);

    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      lastSpokenNameRef.current = null;
      isProcessingRef.current = false;
      setLastSeen(null);
    }

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isAutoScanning]);

  // --- BUG FIXED ADD HANDLER ---
  const handleAddToItem = () => {
    // 1. Safety Check: Don't allow clicks faster than 500ms (Debounce)
    const now = Date.now();
    if (now - lastAddClickTimeRef.current < 500) return;
    lastAddClickTimeRef.current = now;

    if (!lastSeen?.itemFound || !lastSeen.name) {
      playSound('error');
      speak("Nothing to add.", 'high');
      return;
    }

    // 2. Visual Feedback Trigger
    setAddedFeedback(lastSeen.name);
    setTimeout(() => setAddedFeedback(null), 1500);

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: lastSeen.name,
      price: lastSeen.price || 0,
      category: lastSeen.category || 'General',
      confidence: 0.9,
      quantity: 1,
      timestamp: Date.now(),
    };

    setCart(prev => {
      const existingIndex = prev.findIndex(i => i.name === newItem.name);

      // BUG FIX: Deep copy the specific object being updated
      if (existingIndex !== -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1
        };
        speak(`Added another ${newItem.name}.`, 'high');
        return updatedCart;
      }

      speak(`Added ${newItem.name}.`, 'high');
      return [newItem, ...prev]; // Add new items to TOP of list
    });

    playSound('success');
  };

  // --- CART HANDLERS ---
  const handleRemoveItem = (timestamp: number) => {
    const item = cart.find(i => i.timestamp === timestamp);
    if (item) {
      setCart(prev => prev.filter(i => i.timestamp !== timestamp));
      speak(`Removed.`, 'high');
    }
  };

  const handleUpdateQuantity = (timestamp: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.timestamp === timestamp) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty !== item.quantity) speak(`${newQty}`, 'high');
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const announceTotal = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cart.length === 0) {
      speak("Cart empty.", 'high');
    } else {
      speak(`Total ${total.toFixed(2)} dollars.`, 'high');
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-yellow-500 selection:text-black">

      {/* 1. Header Area */}
      <div className="fixed top-0 inset-x-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800 p-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg shadow-lg shadow-yellow-400/20">
              <ShoppingBag className="text-black w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase leading-none">Vision Shop</h1>
              <p className="text-xs text-zinc-400 font-mono tracking-widest">AI ASSISTANT</p>
            </div>
          </div>
          <button
            type="button"  // FIX 1: Explicitly state this is a button, not a form submitter
            aria-label="Help Guide" // FIX 2: Gives a name to the button for screen readers
            onClick={() => speak("Scan items with camera. Tap screen to add. Scroll down for cart.", 'high')}
            className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-700 active:scale-95 transition-transform"
          >
            <HelpCircle className="text-yellow-400 w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <main className="max-w-md mx-auto pt-24 px-4 pb-32 flex flex-col gap-6">

        {/* 2. Camera Section (The HUD) */}
        <section
          className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black border border-zinc-800 isolate"
          onClick={handleAddToItem}
        >
          <div className="absolute inset-0 z-10 border-[6px] border-zinc-900/50 rounded-3xl pointer-events-none"></div>

          {/* The Camera Feed */}
          <CameraFeed
            ref={cameraRef}
            isProcessing={false}
            isAutoScanning={isAutoScanning}
          />

          {/* HUD Overlay - Only visible when Scanning */}
          {isAutoScanning && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* Corner Markers */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl opacity-80"></div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl opacity-80"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl opacity-80"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-xl opacity-80"></div>

              {/* Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <ScanLine size={120} className="text-white animate-pulse" strokeWidth={1} />
              </div>
            </div>
          )}

          {/* Detection Label */}
          {lastSeen?.itemFound && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-full font-bold shadow-xl z-30 flex items-center gap-2 whitespace-nowrap animate-bounce-short">
              <Plus size={18} strokeWidth={3} />
              <span>ADD {lastSeen.name.toUpperCase()}</span>
            </div>
          )}

          {/* Success Feedback Overlay */}
          {addedFeedback && (
            <div className="absolute inset-0 bg-green-500/80 z-40 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-fade-in-out">
              <div className="bg-white text-green-600 p-4 rounded-full mb-4 shadow-xl">
                <Check size={48} strokeWidth={4} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-widest">ADDED</h2>
              <p className="font-mono text-lg">{addedFeedback}</p>
            </div>
          )}
        </section>

        {/* 3. Main Control Button */}
        <button
          onClick={() => {
            setIsAutoScanning(!isAutoScanning);
            playSound('click');
          }}
          className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg ${isAutoScanning
            ? 'bg-zinc-900 border-2 border-red-500/50 text-red-400 hover:bg-zinc-800'
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black border-none hover:brightness-110'
            }`}
        >
          <Power size={28} strokeWidth={3} />
          <span className="text-2xl font-black uppercase tracking-wide">
            {isAutoScanning ? "STOP SCANNER" : "START SCANNER"}
          </span>
        </button>

        {/* 4. Cart Section */}
        <CartSummary
          items={cart}
          onClear={() => { setCart([]); speak("Cleared.", 'high'); }}
          onRemove={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
        />

      </main>

      {/* 5. Sticky Footer Total */}
      <footer className="fixed bottom-0 inset-x-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 p-4 pb-8 z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={announceTotal}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-between px-6 shadow-xl shadow-blue-900/20 transition-all"
          >
            <span className="text-lg font-bold opacity-80 uppercase">Total Estimate</span>
            <span className="text-3xl font-mono font-black">
              ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </span>
          </button>
        </div>
      </footer>

    </div>
  );
};

export default App;