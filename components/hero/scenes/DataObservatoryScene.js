"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 420;
const LANES = [-2, -1, 0, 1, 2];

function makeLine(points, color, opacity) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Line(geometry, material);
}

function DataStream() {
  const pointsRef = useRef(null);

  const { geometry, speeds, lanes, phases, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const particleSpeeds = new Float32Array(PARTICLE_COUNT);
    const particleLanes = new Float32Array(PARTICLE_COUNT);
    const particlePhases = new Float32Array(PARTICLE_COUNT);
    const rawColor = new THREE.Color("#4f5450");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = -12 + Math.random() * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
      particleSpeeds[i] = 0.35 + Math.random() * 0.55;
      particleLanes[i] = LANES[Math.floor(Math.random() * LANES.length)];
      particlePhases[i] = Math.random() * Math.PI * 2;
      rawColor.toArray(particleColors, i * 3);
    }

    const streamGeometry = new THREE.BufferGeometry();
    streamGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    streamGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    return {
      geometry: streamGeometry,
      speeds: particleSpeeds,
      lanes: particleLanes,
      phases: particlePhases,
      colors: particleColors
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const positions = points.geometry.attributes.position.array;
    const colorAttribute = points.geometry.attributes.color;
    const raw = new THREE.Color("#4f5450");
    const verified = new THREE.Color("#9aa09c");
    const time = clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const index = i * 3;
      positions[index] += speeds[i] * delta;

      if (positions[index] > 12) {
        positions[index] = -12;
        positions[index + 1] = (Math.random() - 0.5) * 7;
        positions[index + 2] = (Math.random() - 0.5) * 7;
      }

      const progress = THREE.MathUtils.clamp((positions[index] + 5) / 12, 0, 1);
      const targetY = lanes[i] * 0.58;
      positions[index + 1] = THREE.MathUtils.lerp(
        positions[index + 1],
        targetY + Math.sin(time * 0.7 + phases[i]) * 0.035,
        progress * 0.035
      );
      positions[index + 2] = THREE.MathUtils.lerp(positions[index + 2], 0, progress * 0.04);
      raw.clone().lerp(verified, progress).toArray(colors, index);
    }

    points.geometry.attributes.position.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.58}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function FlowRails() {
  const rails = useMemo(() => {
    return LANES.flatMap((lane, index) => {
      const y = lane * 0.58;
      const phase = index * 0.45;
      const left = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-12, y + Math.sin(phase) * 2.2, -3.2 + index * 0.45),
        new THREE.Vector3(-8.2, y + Math.cos(phase) * 1.5, -1.8),
        new THREE.Vector3(-4.6, y + Math.sin(phase) * 0.7, -0.5),
        new THREE.Vector3(0, y, 0)
      ]).getPoints(64);
      const right = [new THREE.Vector3(0, y, 0), new THREE.Vector3(12, y, 0)];

      return [
        makeLine(left, "#8b908c", 0.13),
        makeLine(right, "#68746f", index === 2 ? 0.3 : 0.18)
      ];
    });
  }, []);

  return rails.map((rail, index) => <primitive key={index} object={rail} />);
}

function ReconciliationGate({ x, height, active = false }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <boxGeometry args={[0.05, height, 5.4]} />
        <meshPhysicalMaterial
          color={active ? "#9aadb2" : "#788f96"}
          transparent
          opacity={active ? 0.26 : 0.14}
          roughness={0.28}
          metalness={0.55}
          depthWrite={false}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.07, height, 5.45)]} />
        <lineBasicMaterial
          color={active ? "#466a78" : "#718990"}
          transparent
          opacity={active ? 0.78 : 0.4}
        />
      </lineSegments>
      <mesh position={[0, 0, 2.8]}>
        <boxGeometry args={[0.13, active ? 1.2 : 0.55, 0.06]} />
        <meshBasicMaterial
          color={active ? "#8e3b46" : "#466a78"}
          transparent
          opacity={active ? 0.9 : 0.45}
        />
      </mesh>
    </group>
  );
}

function RecordSlabs() {
  const groupRef = useRef(null);
  const slabs = useMemo(() => {
    return Array.from({ length: 24 }, (_, index) => ({
      position: [-10 + Math.random() * 7, -3.8 + Math.random() * 7.6, -4.5 + Math.random() * 3],
      scale: [0.18 + Math.random() * 0.48, 0.025, 0.1 + Math.random() * 0.22],
      rotation: [Math.random() * 0.35, Math.random() * 0.8, Math.random() * 0.22],
      phase: index * 0.36
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((slab, index) => {
      slab.position.y += Math.sin(clock.elapsedTime * 0.35 + slabs[index].phase) * 0.0009;
      slab.rotation.y += 0.0007;
    });
  });

  return (
    <group ref={groupRef}>
      {slabs.map((slab, index) => (
        <mesh key={index} position={slab.position} rotation={slab.rotation} scale={slab.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={index % 4 === 0 ? "#8e3b46" : "#758a90"}
            metalness={0.55}
            roughness={0.42}
            transparent
            opacity={0.68}
          />
        </mesh>
      ))}
    </group>
  );
}

function AnalysisChamber() {
  const { size } = useThree();
  const isMobile = size.width < 640;

  return (
    <group
      position={isMobile ? [1.15, -0.45, 0] : [1.7, 0.25, 0]}
      rotation={[0.025, -0.08, -0.015]}
      scale={isMobile ? 0.64 : 1}
    >
      <FlowRails />
      <DataStream />
    </group>
  );
}

export default function DataObservatoryScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 15.5], fov: 43 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.96;
      }}
    >
      <color attach="background" args={["#e5e3dd"]} />
      <fog attach="fog" args={["#e5e3dd", 11, 27]} />
      <AnalysisChamber />
    </Canvas>
  );
}
