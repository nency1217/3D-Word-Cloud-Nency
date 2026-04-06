import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import StatusMessages from "./StatusMessages";

function SpinningCube() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.8;
      meshRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshBasicMaterial color="#00f5ff" wireframe />
    </mesh>
  );
}

export default function Loader3D() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <div style={{ width: 160, height: 160 }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          style={{ background: "transparent" }}
        >
          <SpinningCube />
        </Canvas>
      </div>
      <StatusMessages />
    </div>
  );
}
