
"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  distance: number;
  length: number;
  opacity: number;
}

const NUM_PARTICLES = 100; 
const MAX_DISTANCE_SCALE = 1.5; 
const BASE_PARTICLE_LENGTH = 2; 
const MAX_PARTICLE_LENGTH_ADD = 30; 
const PARTICLE_SPEED_MIN = 0.2;
const PARTICLE_SPEED_MAX = 1.0;
const FADE_DISTANCE_START = 0.7; 

const HyperspaceBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const createParticle = (id: number, centerX: number, centerY: number, maxDim: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN) + PARTICLE_SPEED_MIN;
    const distance = Math.random() * (maxDim * 0.05); // Start very close to center
    return {
      id,
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      angle,
      speed,
      distance,
      length: BASE_PARTICLE_LENGTH,
      opacity: 1,
    };
  };

  useEffect(() => {
    let localAnimationFrameId: number | null = null;
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDim = Math.max(width, height);

    const initialParticles = Array.from({ length: NUM_PARTICLES }, (_, i) =>
      createParticle(i, centerX, centerY, maxDim)
    );
    setParticles(initialParticles);

    const animate = () => {
      setParticles(prevParticles =>
        prevParticles.map(p => {
          let newDistance = p.distance + p.speed;
          let newX = centerX + Math.cos(p.angle) * newDistance;
          let newY = centerY + Math.sin(p.angle) * newDistance;

          if (newDistance > maxDim / MAX_DISTANCE_SCALE + MAX_PARTICLE_LENGTH_ADD) { // Ensure particle is fully off effective screen
            return createParticle(p.id, centerX, centerY, maxDim);
          }
          
          const normalizedDistance = newDistance / (maxDim / MAX_DISTANCE_SCALE); 
          const newLength = Math.min(BASE_PARTICLE_LENGTH + normalizedDistance * MAX_PARTICLE_LENGTH_ADD, BASE_PARTICLE_LENGTH + MAX_PARTICLE_LENGTH_ADD);
          
          let newOpacity = 1;
          if (normalizedDistance > FADE_DISTANCE_START) {
            newOpacity = Math.max(0, 1 - (normalizedDistance - FADE_DISTANCE_START) / (1 - FADE_DISTANCE_START));
          }

          return {
            ...p,
            x: newX,
            y: newY,
            distance: newDistance,
            length: newLength,
            opacity: newOpacity,
          };
        })
      );
      localAnimationFrameId = requestAnimationFrame(animate);
      animationFrameId.current = localAnimationFrameId;
    };

    localAnimationFrameId = requestAnimationFrame(animate);
    animationFrameId.current = localAnimationFrameId;

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDim = Math.max(width, height);
      
      setParticles(prevParticles => prevParticles.map(p => createParticle(p.id, centerX, centerY, maxDim)));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[0] overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bg-white rounded-full" 
          style={{
            left: p.x,
            top: p.y,
            width: `1.5px`, 
            height: `${p.length}px`,
            opacity: p.opacity * 0.35, // Further reduced opacity for "svagt synliga"
            transformOrigin: 'center center',
            transform: `translate(-50%, -50%) rotate(${p.angle + Math.PI / 2}rad)`, 
          }}
        />
      ))}
    </div>
  );
};

export default HyperspaceBackground;
