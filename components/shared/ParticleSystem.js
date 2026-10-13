"use client";

import { useRef, useEffect } from "react";
import { roleTheme } from "@/lib/roleThemes";

export default function ParticleSystem({
  mode = "unstructured", // "unstructured" | "flow" | "reconciled"
  density = "normal",    // "low" | "normal" | "high"
  height = "100%",
  className = ""
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let heightPx = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const isMobile = width < 768;
    const baseCount = isMobile
      ? roleTheme.particleBehavior.countMobile
      : roleTheme.particleBehavior.countDesktop;

    const multiplier = density === "high" ? 1.5 : density === "low" ? 0.6 : 1.0;
    const particleCount = Math.floor(baseCount * multiplier);

    // Particle records
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * heightPx,
        vx: (Math.random() - 0.5) * roleTheme.particleBehavior.speed * (mode === "flow" ? 0.5 : 1),
        vy: mode === "flow" 
          ? (Math.random() * 0.4 + 0.2) 
          : (Math.random() - 0.5) * roleTheme.particleBehavior.speed,
        radius: Math.random() * 1.5 + 1.2,
        reconciled: Math.random() > 0.45,
        alpha: Math.random() * 0.5 + 0.35
      });
    }

    let mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      heightPx = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const connectionDist = isMobile ? 80 : roleTheme.particleBehavior.connectionDistance;

    const render = () => {
      ctx.clearRect(0, 0, width, heightPx);

      // Draw connections (foreign key / join simulation)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.25;
            ctx.strokeStyle = `rgba(79, 84, 80, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw particles (telemetry records)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = heightPx;
          if (p.y > heightPx) p.y = 0;

          // Mouse interaction (reconciliation influence)
          if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              const force = (100 - dist) / 100;
              p.x += (dx / dist) * force * 1.5;
              p.y += (dy / dist) * force * 1.5;
            }
          }
        }

        ctx.fillStyle = p.reconciled
          ? `rgba(79, 84, 80, ${p.alpha})`
          : `rgba(154, 160, 156, ${p.alpha * 0.72})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mode, density]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: height,
        overflow: "hidden"
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "auto"
        }}
      />
    </div>
  );
}
