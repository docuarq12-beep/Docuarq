
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CompareSliderProps {
  beforeImage: string;
  afterImage: string;
  onFirstInteract?: () => void;
}

const CompareSlider: React.FC<CompareSliderProps> = ({ beforeImage, afterImage, onFirstInteract }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
    
    if (!interactedRef.current) {
      interactedRef.current = true;
      onFirstInteract?.();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden rounded-2xl cursor-col-resize select-none shadow-2xl bg-slate-200 border border-slate-200"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After Image (Base) */}
      <img 
        src={afterImage || 'https://picsum.photos/1500/1000'} 
        alt="Propuesta" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden border-r-2 border-white shadow-[10px_0_15px_rgba(0,0,0,0.1)]" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={beforeImage || 'https://picsum.photos/1500/1000?grayscale'} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
          Estado Actual
        </div>
      </div>

      <div className="absolute top-6 right-6 bg-blue-600/80 backdrop-blur-md text-white px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
        Propuesta Docuarq
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white z-20" 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-900/5 transition-transform hover:scale-110">
          <div className="flex gap-0.5">
            <ArrowLeft size={14} className="text-slate-900" />
            <ArrowRight size={14} className="text-slate-900" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;
