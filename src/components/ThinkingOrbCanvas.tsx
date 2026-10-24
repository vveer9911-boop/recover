import React, { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface Dot {
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  alpha: number;
}

interface Props {
  size?: number;
  state?: 'loading' | 'success';
}

function hashD(a: number, b: number): number {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return h - Math.floor(h);
}

// Faithful port of Jakubantalik/thinking-orbs (orbits.ts + core.ts)
function computeOrbitsFrame(size: number, t: number): Dot[] {
  const cx = size / 2;
  const cy = size / 2;
  const rBase = (size / 2) * 0.82;
  const yaw = t * 0.12;
  const tilt = 0.3;
  const sy = Math.sin(yaw);
  const cyw = Math.cos(yaw);
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);

  const dots: Dot[] = [];
  const orbitN = 8;
  const ghostN = 20;
  const particles = 2;

  for (let orb = 0; orb < orbitN; orb++) {
    const h1 = hashD(orb, 1.7);
    const h2 = hashD(orb, 5.2);
    const h3 = hashD(orb, 8.9);
    const ro = rBase * (0.45 + 0.52 * h1);
    const th = h1 * 2 * Math.PI;
    const phi = Math.acos(2 * h2 - 1);

    const nx = Math.sin(phi) * Math.cos(th);
    const ny = Math.cos(phi);
    const nz = Math.sin(phi) * Math.sin(th);
    let ux = -ny;
    let uy = nx;
    const uz = 0;
    const ul = Math.max(1e-6, Math.sqrt(ux * ux + uy * uy));
    ux /= ul;
    uy /= ul;
    const vx = ny * uz - nz * uy;
    const vy = nz * ux - nx * uz;
    const vz = nx * uy - ny * ux;
    const speed = (0.25 + 0.55 * h3) * (h3 > 0.5 ? 1 : -1);

    // Ghost path dots
    for (let k = 0; k < ghostN; k++) {
      const a = (k / ghostN) * 2 * Math.PI;
      const ox = (ux * Math.cos(a) + vx * Math.sin(a)) * ro;
      const oy = (uy * Math.cos(a) + vy * Math.sin(a)) * ro;
      const oz = (uz * Math.cos(a) + vz * Math.sin(a)) * ro;

      // makeProj
      const x1 = ox * cyw + oz * sy;
      const z1 = -ox * sy + oz * cyw;
      const y1 = oy * ct - z1 * st;
      const z2 = oy * st + z1 * ct;

      const px = cx + x1;
      const py = cy - y1;
      const depth = Math.min(1, Math.max(0, (z2 / ro + 1) / 2));
      const dotR = Math.max(1.2, 1.8 * (0.4 + 0.6 * depth));
      const alpha = Math.min(0.85, Math.max(0.1, 0.35 * (0.3 + 0.7 * depth)));

      dots.push({
        x: px,
        y: py,
        z: z2,
        r: dotR,
        color: '#38BDF8',
        alpha,
      });
    }

    // Running particles
    for (let m = 0; m < particles; m++) {
      const a = t * speed + (m / particles) * 2 * Math.PI + h2 * 6;
      const ox = (ux * Math.cos(a) + vx * Math.sin(a)) * ro;
      const oy = (uy * Math.cos(a) + vy * Math.sin(a)) * ro;
      const oz = (uz * Math.cos(a) + vz * Math.sin(a)) * ro;

      const x1 = ox * cyw + oz * sy;
      const z1 = -ox * sy + oz * cyw;
      const y1 = oy * ct - z1 * st;
      const z2 = oy * st + z1 * ct;

      const px = cx + x1;
      const py = cy - y1;
      const depth = Math.min(1, Math.max(0, (z2 / ro + 1) / 2));
      const dotR = Math.max(2.2, 3.8 * (0.5 + 0.8 * depth));
      const alpha = Math.min(1.0, Math.max(0.2, 0.7 + 0.3 * depth));

      dots.push({
        x: px,
        y: py,
        z: z2,
        r: dotR,
        color: '#FFFFFF',
        alpha,
      });
    }
  }

  dots.sort((a, b) => a.z - b.z);
  return dots;
}

export default function ThinkingOrbCanvas({ size = 140, state = 'loading' }: Props) {
  const [dots, setDots] = useState<Dot[]>(() => computeOrbitsFrame(size, 0));
  const tRef = useRef(0);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (state !== 'loading') return;

    let isMounted = true;
    let lastTime = Date.now();

    const loop = () => {
      if (!isMounted) return;
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      tRef.current += dt * 2.5;

      setDots(computeOrbitsFrame(size, tRef.current));
      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      isMounted = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [size, state]);

  const cx = size / 2;
  const cy = size / 2;
  const successR = size * 0.35;

  if (state === 'success') {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={successR}
            stroke="#10B981"
            strokeWidth={4}
            fill="rgba(16, 185, 129, 0.12)"
          />
          <Path
            d={`M ${cx - successR * 0.4} ${cy + successR * 0.05} L ${cx - successR * 0.08} ${cy + successR * 0.36} L ${cx + successR * 0.42} ${cy - successR * 0.28}`}
            stroke="#10B981"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {dots.map((dot, idx) => (
            <Circle
              key={idx}
              cx={dot.x}
              cy={dot.y}
              r={dot.r}
              fill={dot.color}
              opacity={dot.alpha}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}
