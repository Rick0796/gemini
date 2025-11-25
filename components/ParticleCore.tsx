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
      // Matrix rain / Digital Stream
      this.size = Math.random() * 2 + 1; // Larger blocks
      this.speedX = 0;
      this.speedY = Math.random() * 2 + 1;
      this.color = `rgba(6, 182, 212, ${Math.random() * 0.4 + 0.1})`; // Cyan-500 equivalent
    } else if (mode === 'RED_DOOR') {
      // Synaptic Web / Blood Cells
      this.size = Math.random() * 3 + 1; // Organic variable size
      this.speedX = (Math.random() - 0.5) * 1;
      this.speedY = (Math.random() - 0.5) * 1;
      this.color = `rgba(244, 63, 94, ${Math.random() * 0.4 + 0.1})`; // Rose-500 equivalent
    } else {
      // Home: HD Nebula Dust
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.1})`;
    }
    
    this.alpha = Math.random();
  }

  update(width: number, height: number, mouseX: number, mouseY: number) {
    // 1. Basic Movement
    this.x += this.speedX;
    this.y += this.speedY;

    // 2. Mouse Interaction (Repulsion or Attraction)
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distance = Math.hypot(dx, dy);
    const forceDistance = 150;
    
    if (distance < forceDistance) {
        if (this.mode === 'HOME') {
            // Repulsion for Home (Parting clouds)
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (forceDistance - distance) / forceDistance;
            const directionX = forceDirectionX * force * 2;
            const directionY = forceDirectionY * force * 2;
            this.x -= directionX;
            this.y -= directionY;
        } else {
             // Subtle Attraction/Turbulence for Red/Blue
            const force = (forceDistance - distance) / forceDistance;
            this.x += dx * force * 0.01;
            this.y += dy * force * 0.01;
        }
    }

    // 3. Reset Logic (Boundary Check)
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
    // Square for digital feel in Blue mode
    if (this.mode === 'BLUE_DOOR') {
        ctx.rect(this.x, this.y, this.size, this.size * 2);
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

    // Handle High DPI (Retina)
    const dpr = window.devicePixelRatio || 1;

    const initParticles = () => {
      particlesRef.current = [];
      const baseCount = window.innerWidth < 768 ? 60 : 120;
      // More particles for matrix rain
      const count = mode === 'BLUE_DOOR' ? baseCount * 1.5 : baseCount; 
      
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      for (let i = 0; i < count; i++) {
        particlesRef.current.push(new Particle(width, height, mode));
      }
    };

    const resize = () => {
      // Scale canvas for HD
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current = {
            x: e.clientX,
            y: e.clientY
        };
    };

    const animate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Trail effect logic
      if (mode === 'BLUE_DOOR') {
          ctx.fillStyle = 'rgba(5, 5, 10, 0.1)'; // Long trails for rain
      } else {
          ctx.fillStyle = 'rgba(5, 5, 10, 0.2)'; // Standard trail
      }
      ctx.fillRect(0, 0, width, height);

      // Draw connections
      const particles = particlesRef.current;
      const connectionDistance = 100;
      
      particles.forEach((p, i) => {
        p.update(width, height, mouseRef.current.x, mouseRef.current.y);
        p.draw(ctx);

        // Connection Lines (Only for Red and Home, Matrix doesn't connect)
        if (mode !== 'BLUE_DOOR') {
            for (let j = i; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const distance = Math.hypot(dx, dy);
    
              if (distance < connectionDistance) {
                ctx.beginPath();
                const opacity = 1 - distance / connectionDistance;
                
                if (mode === 'RED_DOOR') {
                   ctx.strokeStyle = `rgba(244, 63, 94, ${opacity * 0.2})`; // Rose
                } else {
                   ctx.strokeStyle = `rgba(120, 120, 150, ${opacity * 0.15})`; // Grey/White
                }
                
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
    <div className="absolute inset-0 z-0 bg-[#050508]">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* Vignette & Noise Overlay for Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000000_120%)] pointer-events-none opacity-80"></div>
    </div>
  );
};

export default ParticleCore;