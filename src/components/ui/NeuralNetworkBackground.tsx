'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Shader otimizado com cores mais vibrantes e sem transparência
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec2 vUv;
  
  // Função de ruído simplificada
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  // Função de ruído suave
  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Função de ruído fractal
  float fractalNoise(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for(int i = 0; i < 5; i++) {
      value += amplitude * smoothNoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.5;
    
    // Animação temporal mais lenta e suave
    float time = iTime * 0.15;  // Reduzido de 0.5 para 0.15
    p += vec2(sin(time * 0.3), cos(time * 0.2));  // Reduzido multiplicadores
    
    // Gerar padrão neural com animação mais suave
    float n1 = fractalNoise(p + time * 0.5);  // Reduzido multiplicador
    float n2 = fractalNoise(p * 1.4 + time * 0.3);  // Reduzido de 0.8 para 0.3
    float n3 = fractalNoise(p * 0.6 - time * 0.2);  // Reduzido de 0.6 para 0.2
    float n4 = fractalNoise(p * 2.1 + time * 0.1);  // Reduzido de 0.3 para 0.1
    
    // Combinar ruídos para criar efeito neural complexo
    float pattern = (n1 + n2 * 0.8 + n3 * 0.6 + n4 * 0.4) / 2.8;
    
    // Cores vibrantes do tema Lumenix - sem transparência
    // Cores mais intensas e saturadas
    vec3 baseColor = vec3(0.02, 0.01, 0.08);     // Preto com toque roxo
    vec3 primaryColor = vec3(0.9, 0.3, 1.0);     // Roxo muito vibrante
    vec3 secondaryColor = vec3(0.6, 0.1, 0.9);   // Roxo intenso
    vec3 accentColor = vec3(1.0, 0.8, 0.3);      // Amarelo dourado
    
    // Criar gradiente mais contrastante
    vec3 color1 = mix(baseColor, secondaryColor, pattern * 1.2);
    vec3 color2 = mix(color1, primaryColor, pattern * 1.1);
    vec3 finalColor = mix(color2, accentColor, pattern * 0.3);
    
    // Adicionar conexões neurais mais brilhantes
    float connections = smoothstep(0.2, 0.8, pattern) * smoothstep(0.95, 0.4, pattern);
    finalColor += accentColor * connections * 1.2;
    
    // Aumentar contraste e saturação
    finalColor = pow(finalColor, vec3(0.7));
    finalColor *= 1.8;
    
    // Garantir que não há transparência
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const NeuralShaderMaterial = shaderMaterial(
  { 
    iTime: 0, 
    iResolution: new THREE.Vector2(1, 1) 
  },
  vertexShader,
  fragmentShader
);

extend({ NeuralShaderMaterial });

function AnimatedPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<any>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.iTime = state.clock.elapsedTime;
      const { width, height } = state.size;
      materialRef.current.iResolution.set(width, height);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <planeGeometry args={[12, 12]} />
      <neuralShaderMaterial ref={materialRef} />
    </mesh>
  );
}

export default function NeuralNetworkBackground() {
  const camera = useMemo(() => ({ 
    position: [0, 0, 2] as [number, number, number], 
    fov: 50, 
    near: 0.1, 
    far: 1000 
  }), []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black" style={{ zIndex: 0 }}>
      <Canvas
        camera={camera}
        gl={{ 
          antialias: true, 
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
          clearColor: '#000000'
        }}
        dpr={[1, 2]}
        style={{ 
          width: '100%', 
          height: '100%',
          background: '#000000'
        }}
      >
        <AnimatedPlane />
      </Canvas>
    </div>
  );
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    neuralShaderMaterial: any;
  }
}