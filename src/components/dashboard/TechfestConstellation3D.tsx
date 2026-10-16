'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OFFICIAL_HOUSES } from '@/lib/data/houses';
import { House } from '@/types';

interface Node3D {
  id: string;
  name: string;
  code: string;
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  color: string;
  isCurrentHouse?: boolean;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  color: string;
  speed: number;
}

export const TechfestConstellation3D: React.FC<{ className?: string; houses?: House[] }> = ({
  className = '',
  houses,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || 800);
    let height = (canvas.height = containerRef.current?.clientHeight || 460);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Refined HouseOS Electric Cyan / Violet / Coral / Paper palette
    const palette = ['#43E5D2', '#8B7CFF', '#FF896D', '#F3F0E8'];

    // Generate 12 house nodes distributed on a 3D sphere (Fibonacci lattice)
    const houseList = houses && houses.length > 0 ? houses : OFFICIAL_HOUSES;
    const nodes: Node3D[] = houseList.map((house: House, i: number) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 12);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      const radius = 175; // 3D constellation radius
      const isCurrent =
        house.id === 'house-saranda' ||
        house.name.toLowerCase().includes('saranda');
      return {
        id: house.id,
        name: house.name,
        code: house.code,
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta) * 0.8,
        z: radius * Math.cos(phi),
        baseRadius: isCurrent ? 6.5 : 5,
        color: isCurrent ? '#43E5D2' : palette[i % palette.length],
        isCurrentHouse: isCurrent,
      };
    });

    // Background floating stardust particles
    const particleCount = isMobile ? 30 : 70;
    const particles: Particle3D[] = Array.from({ length: particleCount }, (_, idx) => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 450,
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.6 + 0.2,
      color: palette[idx % palette.length],
      speed: Math.random() * 0.002 + 0.001,
    }));

    // Mouse tracking for desktop parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;

    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = normX * 0.5;
      targetRotX = -normY * 0.4;
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const container = containerRef.current;
    if (container && !isMobile) {
      container.addEventListener('mousemove', onMouseMove);
    }

    let angle = 0;
    const focalLength = 400;
    let lastHovered: string | null = null;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Camera rotation
      if (!prefersReducedMotion) {
        angle += 0.0045;
      }
      currentRotY += (targetRotY - currentRotY) * 0.06;
      currentRotX += (targetRotX - currentRotX) * 0.06;

      const totalRotY = angle + currentRotY;
      const totalRotX = currentRotX;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);

      // Center constellation slightly right to allow ample negative space for headline
      const centerX = width > 768 ? width * 0.72 : width * 0.5;
      const centerY = height * 0.5;

      // 1. Floating particles
      particles.forEach((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const scale = focalLength / (focalLength + z2 + 250);
        if (scale > 0) {
          const px = centerX + x1 * scale;
          const py = centerY + y1 * scale;
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * Math.max(0, scale) * 0.7;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // 2. Project 12 house nodes
      interface ProjectedNode {
        node: Node3D;
        px: number;
        py: number;
        scale: number;
        z: number;
        isHovered: boolean;
      }

      const projected: ProjectedNode[] = [];
      let closestHover: string | null = null;
      let minDistance = 30;

      nodes.forEach((node) => {
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.z * cosY + node.x * sinY;
        const y1 = node.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + node.y * sinX;

        const scale = focalLength / (focalLength + z2);
        const px = centerX + x1 * scale;
        const py = centerY + y1 * scale;

        const dist = Math.hypot(mouseX - px, mouseY - py);
        const isHover = dist < minDistance;
        if (isHover && dist < minDistance) {
          minDistance = dist;
          closestHover = node.name;
        }

        projected.push({
          node,
          px,
          py,
          scale,
          z: z2,
          isHovered: isHover,
        });
      });

      if (lastHovered !== closestHover) {
        lastHovered = closestHover;
        setHoveredHouse(closestHover);
      }

      // Depth sort
      projected.sort((a, b) => b.z - a.z);

      // 3. Draw cybernetic connecting lines between the 12 houses
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dist3D = Math.hypot(
            p1.node.x - p2.node.x,
            p1.node.y - p2.node.y,
            p1.node.z - p2.node.z
          );

          if (dist3D < 195) {
            const avgScale = (p1.scale + p2.scale) / 2;
            const isHighlight = p1.isHovered || p2.isHovered;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            if (isHighlight) {
              ctx.strokeStyle = '#43E5D2';
              ctx.lineWidth = 1.8;
              ctx.globalAlpha = 0.85 * avgScale;
            } else if (p1.node.isCurrentHouse || p2.node.isCurrentHouse) {
              ctx.strokeStyle = '#43E5D2';
              ctx.lineWidth = 1.2;
              ctx.globalAlpha = 0.35 * avgScale;
            } else {
              ctx.strokeStyle = '#8B7CFF';
              ctx.lineWidth = 0.8;
              ctx.globalAlpha = 0.18 * avgScale;
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 4. Render house nodes and festival glowing halos
      projected.forEach(({ node, px, py, scale, isHovered }) => {
        const radius = node.baseRadius * scale * (isHovered ? 1.7 : 1);
        const alpha = Math.min(1, Math.max(0.4, (scale - 0.4) / 0.8));

        // Outer glow halo - restrained, cohesive glow
        const glowRadius = radius * (node.isCurrentHouse ? 4.2 : 3.0);
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
        if (node.isCurrentHouse) {
          gradient.addColorStop(0, 'rgba(67, 229, 210, 0.55)');
          gradient.addColorStop(0.5, 'rgba(67, 229, 210, 0.15)');
          gradient.addColorStop(1, 'rgba(67, 229, 210, 0)');
        } else if (isHovered) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(139, 124, 255, 0.25)');
          gradient.addColorStop(1, 'rgba(139, 124, 255, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isCurrentHouse
          ? '#43E5D2'
          : isHovered
          ? '#FFFFFF'
          : node.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Border ring
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = node.isCurrentHouse ? '#101116' : '#FFFFFF';
        ctx.stroke();

        // Node label
        if (node.isCurrentHouse || isHovered) {
          ctx.font = `bold ${Math.round(11 * scale)}px monospace`;
          ctx.fillStyle = node.isCurrentHouse ? '#43E5D2' : '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, px, py + radius + 15 * scale);
          if (node.isCurrentHouse && !isHovered) {
            ctx.font = `600 ${Math.round(9 * scale)}px monospace`;
            ctx.fillStyle = '#8B7CFF';
            ctx.fillText('// YOUR HOUSE (RANK #1)', px, py + radius + 27 * scale);
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, [houses]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[420px] md:min-h-[500px] overflow-hidden ${className}`}
      aria-label="Interactive 3D Constellation of 12 Houses"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />
      {hoveredHouse && (
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-[#202631]/90 backdrop-blur-md border border-[#43E5D2]/50 text-[#43E5D2] font-mono text-xs font-bold shadow-sm pointer-events-none transition-all flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#43E5D2] animate-ping" />
          <span>{`// ${hoveredHouse.toUpperCase()}`}</span>
        </div>
      )}
    </div>
  );
};
