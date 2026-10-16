'use client';

import React from 'react';

export const TechfestCssHero: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full min-h-[380px] md:min-h-[440px] overflow-hidden select-none ${className}`}
      aria-label="Lightweight CSS and SVG Hero Graphic"
    >
      {/* Radial Midnight Ink & Cyber Atmosphere Background */}
      <div className="absolute inset-0 bg-radial from-[#1A1D2B]/80 via-[#101116] to-[#0B0C0E]" />

      {/* SVG Geometric Lattice connecting 12 Houses */}
      <svg
        className="absolute inset-0 w-full h-full opacity-70"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 440"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="festivalLattice" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#43E5D2" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8B7CFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#43E5D2" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="cyanNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#43E5D2" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#43E5D2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="violetNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B7CFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B7CFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Constellation lines */}
        <g stroke="url(#festivalLattice)" strokeWidth="1" fill="none">
          <line x1="580" y1="120" x2="680" y2="180" />
          <line x1="680" y1="180" x2="720" y2="280" />
          <line x1="720" y1="280" x2="640" y2="350" />
          <line x1="640" y1="350" x2="520" y2="320" />
          <line x1="520" y1="320" x2="480" y2="220" />
          <line x1="480" y1="220" x2="580" y2="120" />
          {/* Inner cross chords */}
          <line x1="580" y1="120" x2="640" y2="350" stroke="#8B7CFF" strokeOpacity="0.25" strokeDasharray="3 3" />
          <line x1="480" y1="220" x2="680" y2="180" stroke="#43E5D2" strokeOpacity="0.25" strokeDasharray="3 3" />
          <line x1="520" y1="320" x2="720" y2="280" stroke="#43E5D2" strokeOpacity="0.25" strokeDasharray="3 3" />
          {/* Outer satellites */}
          <line x1="580" y1="120" x2="530" y2="80" strokeOpacity="0.2" />
          <line x1="680" y1="180" x2="750" y2="140" strokeOpacity="0.2" />
          <line x1="720" y1="280" x2="760" y2="340" strokeOpacity="0.2" />
          <line x1="640" y1="350" x2="610" y2="390" strokeOpacity="0.2" />
          <line x1="520" y1="320" x2="440" y2="360" strokeOpacity="0.2" />
          <line x1="480" y1="220" x2="430" y2="160" strokeOpacity="0.2" />
        </g>

        {/* 12 House Nodes with cohesive Electric Cyan / Violet / Coral palette */}
        {[
          { x: 580, y: 120, name: 'Saranda', isCurrent: true, color: '#43E5D2' },
          { x: 680, y: 180, name: 'Nallamala', color: '#43E5D2' },
          { x: 720, y: 280, name: 'Pichavaram', color: '#8B7CFF' },
          { x: 640, y: 350, name: 'Sundarbans', color: '#FF896D' },
          { x: 520, y: 320, name: 'Wayanad', color: '#43E5D2' },
          { x: 480, y: 220, name: 'Namdapha', color: '#8B7CFF' },
          { x: 530, y: 80, name: 'Gir', color: '#8B7CFF' },
          { x: 750, y: 140, name: 'Kanha', color: '#FF896D' },
          { x: 760, y: 340, name: 'Bandipur', color: '#43E5D2' },
          { x: 610, y: 390, name: 'Corbett', color: '#8B7CFF' },
          { x: 440, y: 360, name: 'Nilgiri', color: '#8B7CFF' },
          { x: 430, y: 160, name: 'Kaziranga', color: '#FF896D' },
        ].map((node, i) => (
          <g key={i} className="transition-transform duration-300 hover:scale-125">
            {node.isCurrent ? (
              <circle cx={node.x} cy={node.y} r="16" fill="url(#cyanNodeGlow)" />
            ) : (
              <circle cx={node.x} cy={node.y} r="10" fill="url(#violetNodeGlow)" />
            )}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.isCurrent ? 6 : 4}
              fill={node.color}
              stroke="#101116"
              strokeWidth="2"
            />
            <text
              x={node.x}
              y={node.y + 16}
              textAnchor="middle"
              fontSize="9"
              fontWeight={node.isCurrent ? '700' : '500'}
              fill={node.isCurrent ? '#43E5D2' : '#F3F0E8'}
              className="font-sans tracking-wide"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Atmospheric lighting accents */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#8B7CFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#43E5D2]/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
