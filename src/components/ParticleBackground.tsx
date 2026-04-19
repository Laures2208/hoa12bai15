import React, { useEffect, useRef } from 'react';

interface ParticleProps {
  type?: string;
}

export const ParticleBackground: React.FC<ParticleProps> = ({ type = 'electrons' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Also disable if battery saver class is present
    if (type === 'none' || document.body.classList.contains('battery-saver')) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      char: string;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.1;
        
        if (type === 'snow') {
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.speedY = Math.random() * 1 + 0.5;
          this.char = '❄';
          this.color = `rgba(255, 255, 255, ${this.opacity})`;
          this.size = Math.random() * 2 + 1;
        } else if (type === 'cherry_blossoms') {
          this.speedX = Math.random() * 1 + 0.5;
          this.speedY = Math.random() * 1 + 0.5;
          this.char = '🌸';
          this.color = `rgba(255, 183, 197, ${this.opacity})`;
          this.size = Math.random() * 3 + 1;
        } else if (type === 'fireworks') {
          this.speedX = (Math.random() - 0.5) * 5;
          this.speedY = (Math.random() - 0.5) * 5;
          this.char = '✨';
          this.color = `rgba(255, 100, 100, ${this.opacity + 0.5})`;
          this.size = Math.random() * 3 + 1;
        } else if (type === 'autumn-leaves') {
          this.speedX = Math.random() * 1 + 0.5;
          this.speedY = Math.random() * 1 + 0.5;
          this.char = '🍂';
          this.color = `rgba(200, 100, 0, ${this.opacity})`;
          this.size = Math.random() * 3 + 2;
        } else if (type === 'bubbles') {
          this.speedX = (Math.random() - 0.5) * 0.2;
          this.speedY = (Math.random() - 0.5) * 0.2;
          this.char = Math.random() > 0.7 ? '+' : '.';
          this.color = `rgba(45, 212, 191, ${this.opacity + 0.2})`; 
          this.size = Math.random() * 2 + 0.5;
        } else if (type === 'hearts') {
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.speedY = -Math.random() * 1 - 0.5;
          this.char = '❤️';
          this.color = `rgba(255, 50, 100, ${this.opacity})`;
          this.size = Math.random() * 3 + 2;
        } else if (type === 'electrons' || type === 'neural-network') {
          this.speedX = (Math.random() - 0.5) * 2;
          this.speedY = (Math.random() - 0.5) * 2;
          this.char = '●';
          this.color = `rgba(34, 197, 94, ${this.opacity + 0.5})`;
          this.size = Math.random() * 2 + 1;
        } else if (type === 'classic') {
          this.speedX = (Math.random() - 0.5) * 0.2;
          this.speedY = (Math.random() - 0.5) * 0.2;
          this.char = Math.random() > 0.7 ? '+' : '.';
          this.color = `rgba(255, 255, 255, ${this.opacity})`; 
          this.size = Math.random() * 2 + 0.5;
        } else {
          // Default to Electrons
          this.speedX = (Math.random() - 0.5) * 2;
          this.speedY = (Math.random() - 0.5) * 2;
          this.char = '●';
          this.color = `rgba(34, 197, 94, ${this.opacity + 0.5})`;
          this.size = Math.random() * 2 + 1;
        }
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (type === 'fireflies' || type === 'fireworks') {
          this.speedX += (Math.random() - 0.5) * 0.1;
          this.speedY += (Math.random() - 0.5) * 0.1;
          this.speedX = Math.max(-1, Math.min(1, this.speedX));
          this.speedY = Math.max(-1, Math.min(1, this.speedY));
        } else if (type === 'classic') {
          // No mouse attraction for classic
        } else {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 300) {
            this.speedX += dx * 0.001;
            this.speedY += dy * 0.001;
          }
          this.speedX = Math.max(-3, Math.min(3, this.speedX));
          this.speedY = Math.max(-3, Math.min(3, this.speedY));
        }

        if (this.x > canvas!.width) this.x = 0;
        else if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        else if (this.y < 0) this.y = canvas!.height;

        if (type !== 'snow' && type !== 'cherry_blossoms' && type !== 'classic') {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            this.x += dx * 0.02;
            this.y += dy * 0.02;
          }
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size * 10}px monospace`;
        ctx.fillText(this.char, this.x, this.y);
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((window.innerWidth * window.innerHeight) / 8000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
};
