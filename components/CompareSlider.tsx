
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      className="relative w-full aspect-[16/10] md:aspect-[21/9] overflow-hidden rounded-[2rem] cursor-col-resize select-none architectural-shadow bg-slate-100 group"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After Image (Base) */}
      <img 
        src={afterImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1500'} 
        alt="Propuesta" 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Before Image (Clipped) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden" 
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={beforeImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1500&sat=-100'} 
          alt="Original" 
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-75"
        />
        <div className="absolute top-10 left-10 glass text-black px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
          Estado Actual
        </div>
      </div>

      <div className="absolute top-10 right-10 bg-black text-white px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase">
        Propuesta Digital
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-white/40 z-20" 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-[0_0_40px_rgba(0,0,0,0.3)] flex items-center justify-center border-[6px] border-black transition-all group-hover:scale-110">
          <div className="flex gap-1 text-black">
            <ChevronLeft size={16} strokeWidth={3} />
            <ChevronRight size={16} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;
