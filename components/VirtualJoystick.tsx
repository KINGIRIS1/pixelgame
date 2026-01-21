import React, {  useRef, useState, useEffect } from 'react';

interface Props {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

const VirtualJoystick: React.FC<Props> = ({ onMove, onStop }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Joystick cố định tâm
    setOrigin({ x: clientX, y: clientY }); 
    setActive(true);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!active) return;
    
    // Tính khoảng cách từ tâm container
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 40; // Bán kính tối đa của núm

    let finalX = dx;
    let finalY = dy;

    // Giới hạn trong vòng tròn
    if (distance > maxRadius) {
      const ratio = maxRadius / distance;
      finalX = dx * ratio;
      finalY = dy * ratio;
    }

    setPos({ x: finalX, y: finalY });
    
    // Normalize vector gửi ra ngoài (từ -1 đến 1)
    onMove(finalX / maxRadius, finalY / maxRadius);
  };

  const handleEnd = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
    onStop();
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
     // Chỉ bắt sự kiện nếu click vào joystick
     handleStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    if (active) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [active]);


  return (
    <div 
      ref={containerRef}
      className="relative w-32 h-32 rounded-full bg-black/30 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center select-none touch-none"
      onMouseDown={onMouseDown}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
    >
      {/* Joystick Knob */}
      <div 
        className="w-12 h-12 rounded-full bg-white/80 shadow-lg absolute pointer-events-none"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: active ? 'none' : 'transform 0.1s ease-out'
        }}
      />
    </div>
  );
};

export default VirtualJoystick;