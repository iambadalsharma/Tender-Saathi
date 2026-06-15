"use client";

import { useEffect, useRef } from "react";

interface InteractiveBackgroundProps {
  theme: "light" | "dark";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function InteractiveBackground({ theme }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const maxParticles = Math.min(60, Math.floor((width * height) / 20000));
    const connectionDistance = 140;
    const mouse = { x: -9999, y: -9999, active: false };

    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn temporary burst of particles
      const burstCount = 5;
      for (let i = 0; i < burstCount; i++) {
        if (particles.length > 100) particles.shift(); // Cap count
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          radius: Math.random() * 2 + 1.5,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("click", handleClick);

    // Color definitions based on theme
    const getThemeColors = () => {
      const isDark = theme === "dark";
      return {
        particleColor: isDark ? "rgba(52, 211, 153, 0.45)" : "rgba(7, 134, 106, 0.25)",
        lineColor: isDark ? "rgba(96, 165, 250, 0.12)" : "rgba(37, 99, 235, 0.08)",
        mouseLineColor: isDark ? "rgba(52, 211, 153, 0.22)" : "rgba(7, 134, 106, 0.15)",
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = getThemeColors();

      // Render & update particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off bounds
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Gravitate slightly to mouse if close
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const force = (200 - dist) / 3200;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;

            // Cap velocity
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1.2) {
              p.vx = (p.vx / speed) * 1.2;
              p.vy = (p.vy / speed) * 1.2;
            }
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.particleColor;
        ctx.fill();

        // Connect lines
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.85;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = colors.lineColor.replace(/[\d.]+\)$/, `${alpha})`);
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect lines to mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.7;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = colors.mouseLineColor.replace(/[\d.]+\)$/, `${alpha})`);
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("click", handleClick);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -5,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
