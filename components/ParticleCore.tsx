import React, { useRef, useEffect } from 'react';

interface ParticleCoreProps {
  mode: string;
  onSwitchMode: (mode: string) => void;
}

class Particle {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  mode: string;

  constructor(width: number, height: number, mode: string) {
    this.mode = mode;
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseX = this.x;
    this.baseY = this.y;
    
    // Config based on mode
    if (mode === 'BLUE_DOOR') {
      // Matrix rain / Digital Stream (Vertical flow)
      this.size = Math.random() * 1.5 + 0.5; 
      this.speedX = 0; // Strictly vertical
      this.speedY = Math.random() * 1.5 + 0.5;
      this.color = `rgba(6, 182, 212, ${Math.random() * 0.4 + 0.1})`; // Cyan-500
    } else if (mode === 'RED_DOOR') {
      // Synaptic Web / Organic
      this.size = Math.random() * 2 + 0.5; 
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.color = `rgba(244, 63, 94, ${Math.random() * 0.4 + 0.1})`; // Rose-500
    } else {
      // Home: HD Nebula Dust (Slow, floating)
      this.size = Math.random() * 1.5 + 0.1;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.speedY = (Math.random() - 0.5) * 0.2;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
    }
    
    this.alpha = Math.random();
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    // 1. Basic Movement
    this.x += this.speedX;
    this.y += this.speedY;

    // 2. Mouse Interaction
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.hypot(dx, dy);
    const forceDistance = 120;
    
    if (distance < forceDistance) {
        if (this.mode === 'HOME') {
            // Repulsion
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (forceDistance - distance) / forceDistance;
            this.x -= forceDirectionX * force * 1.5;
            this.y -= forceDirectionY * force * 1.5;
        } else if (this.mode === 'RED_DOOR') {
             // Attraction
            const force = (forceDistance - distance) / forceDistance;
            this.x += dx * force * 0.02;
            this.y += dy * force * 0.02;
        }
        // Blue door ignores mouse x-axis to maintain vertical integrity
    }

    // 3. Boundary / Reset
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      if (this.mode === 'BLUE_DOOR') {
        // Rain falls from top
        this.y = 0;
        this.x = Math.random() * width;
      } else {
        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this.mode === 'BLUE_DOOR') {
        ctx.rect(this.x, this.y, this.size, this.size * 4); // Elongated digital rain
    } else {
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

const ParticleCore: React.FC<ParticleCoreProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(0);
  const mouseRef = useRef<{x: number, y: number}>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const initParticles = () => {
      particlesRef.current = [];
      const baseCount = window.innerWidth < 768 ? 50 : 100;
      const count = mode === 'BLUE_DOOR' ? baseCount * 1.2 : baseCount; 
      
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(width, height, mode));
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Clear with trail effect
      if (mode === 'BLUE_DOOR') {
          ctx.fillStyle = 'rgba(5, 5, 8, 0.15)'; // Darker trail for matrix
      } else {
          ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
      }
      ctx.fillRect(0, 0, width, height);

      // Update & Draw
      const particles = particlesRef.current;
      particles.forEach((p, i) => {
        p.update(width, height, mouseRef.current.x, mouseRef.current.y);
        p.draw(ctx);

        // Connections (Only for Red/Home)
        if (mode !== 'BLUE_DOOR') {
            for (let j = i; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const distance = Math.hypot(dx, dy);
              const maxDist = 100;
    
              if (distance < maxDist) {
                ctx.beginPath();
                const opacity = 1 - distance / maxDist;
                ctx.strokeStyle = mode === 'RED_DOOR' 
                    ? `rgba(244, 63, 94, ${opacity * 0.15})`
                    : `rgba(150, 150, 180, ${opacity * 0.1})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
        }
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [mode]);

  return (
    <div className="absolute inset-0 z-0 bg-[#050505]">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_120%)] pointer-events-none opacity-60"></div>
    </div>
  );
};

export default ParticleCore;