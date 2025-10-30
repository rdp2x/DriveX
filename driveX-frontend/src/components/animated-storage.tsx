"use client";

import * as React from "react";

type Props = {
  used: number; // in bytes
  total: number; // in bytes
};

export default function AnimatedStorage({ used, total }: Props) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const [animatedPercentage, setAnimatedPercentage] = React.useState(0);
  const [particles, setParticles] = React.useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  // Animate percentage change
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Generate particles
  React.useEffect(() => {
    const particleCount = Math.min(
      12,
      Math.max(4, Math.floor(percentage / 10))
    );
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: i * 0.2,
    }));
    setParticles(newParticles);
  }, [percentage]);

  // Color based on usage
  const getColor = () => {
    if (percentage < 50) return "#B8C4A9"; // sage green
    if (percentage < 80) return "#D97D55"; // coral/orange
    return "#dc2626"; // red
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb < 1024 ? `${mb.toFixed(0)}MB` : `${(mb / 1024).toFixed(1)}GB`;
  };

  return (
    <div className="p-4">
      <div className="text-sm mb-4 font-medium">Storage Usage</div>

      {/* Main container - Vertical Bucket */}
      <div className="relative w-16 h-48 mx-auto mb-4">
        {/* Background bucket */}
        <div className="absolute inset-0 bg-card/40 backdrop-blur-sm border border-gray-800 rounded-t-lg rounded-b-3xl">
          {/* Animated fill */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out rounded-b-3xl"
            style={{
              height: `${animatedPercentage}%`,
              background: `linear-gradient(0deg, ${getColor()}60 0%, ${getColor()}40 50%, ${getColor()}20 100%)`,
              borderRadius:
                animatedPercentage > 95
                  ? "0.5rem 0.5rem 1.5rem 1.5rem"
                  : "0 0 1.5rem 1.5rem",
            }}
          />

          {/* Flowing particles */}
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                left: `${20 + particle.x * 0.6}%`, // Keep particles more centered in bucket
                top: `${Math.max(
                  100 - animatedPercentage + particle.y * 0.3,
                  100 - animatedPercentage
                )}%`, // Particles in filled area
                backgroundColor: getColor(),
                animationDelay: `${particle.delay}s`,
                animationDuration: "2s",
                transform: `translate(-50%, -50%)`,
              }}
            >
              {/* Particle glow effect */}
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: getColor(),
                  animationDelay: `${particle.delay + 0.5}s`,
                  animationDuration: "3s",
                }}
              />
            </div>
          ))}

          {/* Percentage display at top */}
          <div className="absolute top-2 left-0 right-0 text-center">
            <div className="text-sm font-bold" style={{ color: getColor() }}>
              {percentage}%
            </div>
          </div>

          {/* Used storage at bottom */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <div className="text-xs text-muted-foreground">
              {formatSize(used)}
            </div>
          </div>
        </div>

        {/* Flowing lines on sides */}
        <div className="absolute -left-1 top-4 bottom-4 w-0.5">
          <div
            className="w-full h-full animate-pulse"
            style={{
              background: `linear-gradient(0deg, transparent, ${getColor()}60, transparent)`,
              animationDuration: "3s",
            }}
          />
        </div>
        <div className="absolute -right-1 top-4 bottom-4 w-0.5">
          <div
            className="w-full h-full animate-pulse"
            style={{
              background: `linear-gradient(0deg, transparent, ${getColor()}60, transparent)`,
              animationDuration: "3s",
              animationDelay: "1.5s",
            }}
          />
        </div>
      </div>

      {/* Storage info */}
      <div className="text-center">
        <div className="text-xs text-muted-foreground">
          {formatSize(used)} of {formatSize(total)} used
        </div>

        {/* Particle flow indicator */}
        <div className="flex justify-center mt-2 space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{
                backgroundColor: getColor(),
                opacity: i < Math.floor(percentage / 20) ? 1 : 0.2,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
