"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Individual Pipeline Component
function ReconciliationPipelineMesh({ mousePos }) {
  const pointsRef = useRef();
  const gatesRef = useRef();

  // Particle records count
  const particleCount = 280;

  // Generate particle data: raw records streaming from left to right along x axis
  const [positions, speeds, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    const phs = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // x from -12 to +12
      pos[i * 3 + 0] = (Math.random() - 0.5) * 24;
      // y distributed around center plane
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      // z depth
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;

      spd[i] = 1.2 + Math.random() * 1.8;
      phs[i] = Math.random() * Math.PI * 2;
    }

    return [pos, spd, phs];
  }, [particleCount]);

  // Points geometry
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  // Three Reconciliation Verification Planes (Wireframes)
  const gates = useMemo(() => {
    return [
      { x: -5, label: "INGESTION & DEDUP", color: "#718990" },
      { x: 0, label: "PARITY RECONCILIATION", color: "#8E3B46" },
      { x: 5, label: "DIMENSIONAL MODELING", color: "#466A78" }
    ];
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArr = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Advance particle along x axis
      posArr[idx] += speeds[i] * delta * 1.4;

      // Wrap back to beginning
      if (posArr[idx] > 12) {
        posArr[idx] = -12;
        // Introduce gentle dispersion at ingress
        posArr[idx + 1] = (Math.random() - 0.5) * 6;
        posArr[idx + 2] = (Math.random() - 0.5) * 8;
      }

      // As particles pass the second gate (x > 0), they "reconcile" into tight, structured rows!
      if (posArr[idx] > 0) {
        // Converge toward discrete horizontal telemetry rails (y = -1, 0, 1)
        const targetRail = Math.round(posArr[idx + 1] * 0.75);
        posArr[idx + 1] += (targetRail - posArr[idx + 1]) * 0.05;
        // Flatten depth
        posArr[idx + 2] += (0 - posArr[idx + 2]) * 0.05;
      }
    }

    posAttr.needsUpdate = true;

    // Gentle camera tilt driven by normalized mouse position
    if (gatesRef.current && mousePos) {
      gatesRef.current.rotation.y = THREE.MathUtils.lerp(
        gatesRef.current.rotation.y,
        mousePos.current.x * 0.15,
        0.05
      );
      gatesRef.current.rotation.x = THREE.MathUtils.lerp(
        gatesRef.current.rotation.x,
        -mousePos.current.y * 0.1,
        0.05
      );
    }
  });

  return (
    <group ref={gatesRef}>
      {/* Dynamic Telemetry Particles */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          size={0.14}
          color="#8E3B46"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Structural Verification Planes (Reconciliation Gates) */}
      {gates.map((gate, idx) => (
        <group key={idx} position={[gate.x, 0, 0]}>
          {/* Wireframe Border */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(0.08, 6.5, 9)]} />
            <lineBasicMaterial
              color={gate.color}
              transparent
              opacity={0.4}
              linewidth={1}
            />
          </lineSegments>

          {/* Core Semi-transparent Plane */}
          <mesh>
            <planeGeometry args={[9, 6.5]} />
            <meshBasicMaterial
              color={gate.color}
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Structured Telemetry Guide Rails (Visible on right side post-reconciliation) */}
      {[-1, 0, 1].map((yRail) => (
        <line key={yRail}>
          <bufferGeometry
            attach="geometry"
            {...(() => {
              const pts = [
                new THREE.Vector3(0, yRail * 1.5, 0),
                new THREE.Vector3(12, yRail * 1.5, 0)
              ];
              const g = new THREE.BufferGeometry().setFromPoints(pts);
              return g;
            })()}
          />
          <lineBasicMaterial color="#466A78" transparent opacity={0.65} />
        </line>
      ))}
    </group>
  );
}

export default function DataPipelineScene() {
  const mousePos = useRef({ x: 0, y: 0 });

  const handlePointerMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mousePos.current = {
      x: (e.clientX / innerWidth - 0.5) * 2,
      y: (e.clientY / innerHeight - 0.5) * 2
    };
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto"
      }}
    >
      <Canvas
        camera={{ position: [0, 1, 14], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={["#D9D5CC"]} />
        <fog attach="fog" args={["#D9D5CC", 12, 22]} />
        <ambientLight intensity={0.4} />
        <ReconciliationPipelineMesh mousePos={mousePos} />
      </Canvas>
    </div>
  );
}
