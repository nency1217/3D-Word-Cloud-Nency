import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { WordData } from "../../types";
import Starfield from "./Starfield";
import WordSphere from "./WordSphere";

interface SceneProps {
  words: WordData[];
  onWordClick: (word: WordData) => void;
}

export default function Scene({ words, onWordClick }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 60 }}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    >
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#00f5ff" intensity={2} />

      <Starfield count={2000} />
      <WordSphere words={words} onWordClick={onWordClick} />
      <OrbitControls enableDamping dampingFactor={0.05} enablePan={false} />

      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
