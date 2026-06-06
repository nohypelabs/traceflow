'use client';

import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  color: string;
}

interface Line {
  from: number;
  to: number;
  alpha: number;
}

/**
 * Animated GPS Network Background.
 * - Subtle tech grid
 * - Floating nodes representing tracked vehicles
 * - Animated connecting lines with glow (tracing routes)
 * - Pulse effects on active connections
 */
export function GpsNetworkBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const nodeCount = 18;
    const connectionDistance = 200;
    const nodes: Node[] = [];

    const colors = [
      'rgba(59, 130, 246,',   // blue
      'rgba(6, 182, 212,',    // cyan
      'rgba(139, 92, 246,',   // purple
      'rgba(16, 185, 129,',   // green
    ];

    function resize(): void {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function initNodes(): void {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      nodes.length = 0;

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 2 + Math.random() * 3,
          pulsePhase: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    function drawGrid(): void {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      const gridSize = 50;

      ctx!.strokeStyle = 'rgba(59, 130, 246, 0.06)';
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();

      for (let x = 0; x <= w; x += gridSize) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
      }
      ctx!.stroke();
    }

    function drawConnections(time: number): void {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.4;
            // Pulse effect on connections
            const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + i * 0.5);
            const lineAlpha = alpha * (0.6 + pulse * 0.4);

            // Glow line
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(59, 130, 246, ${lineAlpha})`;
            ctx!.lineWidth = 1;
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();

            // Brighter core line
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(6, 182, 212, ${lineAlpha * 0.6})`;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.stroke();
          }
        }
      }
    }

    function drawNodes(time: number): void {
      for (const node of nodes) {
        const pulse = 0.7 + 0.3 * Math.sin(time * 0.003 + node.pulsePhase);

        // Outer glow
        const gradient = ctx!.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 6,
        );
        gradient.addColorStop(0, `${node.color} ${0.3 * pulse})`);
        gradient.addColorStop(1, `${node.color} 0)`);
        ctx!.beginPath();
        ctx!.fillStyle = gradient;
        ctx!.arc(node.x, node.y, node.radius * 6, 0, Math.PI * 2);
        ctx!.fill();

        // Core dot
        ctx!.beginPath();
        ctx!.fillStyle = `${node.color} ${0.8 * pulse})`;
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.fill();

        // Bright center
        ctx!.beginPath();
        ctx!.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx!.arc(node.x, node.y, node.radius * 0.4, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function updateNodes(): void {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges with padding
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));
      }
    }

    function animate(time: number): void {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;

      ctx!.clearRect(0, 0, w, h);

      // Radial gradient atmosphere
      const bgGrad = ctx!.createRadialGradient(w * 0.3, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.7);
      bgGrad.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
      bgGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      bgGrad.addColorStop(1, 'transparent');
      ctx!.fillStyle = bgGrad;
      ctx!.fillRect(0, 0, w, h);

      drawGrid();
      updateNodes();
      drawConnections(time);
      drawNodes(time);

      animationId = requestAnimationFrame(animate);
    }

    resize();
    initNodes();
    animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      resize();
      initNodes();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
