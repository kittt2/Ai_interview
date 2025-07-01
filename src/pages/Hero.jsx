import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  Play,
  Award,
  TrendingUp
} from "lucide-react";
import * as THREE from 'three';

// 3D Scene Component with proper error handling
function ThreeScene() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const animationIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75, 
        mountRef.current.clientWidth / mountRef.current.clientHeight, 
        0.1, 
        1000
      );
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      mountRef.current.appendChild(renderer.domElement);
      sceneRef.current = { scene, camera, renderer };

      // Create animated shapes array
      const animatedObjects = [];
      
      // Create glowing neural network nodes
      const nodeGeometry = new THREE.SphereGeometry(0.15, 12, 12);
      const nodeMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(0x8b5cf6),
        transparent: true,
        opacity: 0.8
      });

      // Add glowing nodes
      for (let i = 0; i < 25; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
        node.position.set(
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 25
        );
        scene.add(node);
        
        animatedObjects.push({
          mesh: node,
          type: 'node',
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
          },
          floatAmplitude: Math.random() * 2 + 1,
          floatSpeed: Math.random() * 0.01 + 0.005,
          initialY: node.position.y
        });
      }

      // Create wireframe data cubes
      const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const cubeMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(0xa855f7),
        transparent: true,
        opacity: 0.6,
        wireframe: true
      });

      for (let i = 0; i < 12; i++) {
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial.clone());
        cube.position.set(
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 20
        );
        scene.add(cube);
        
        animatedObjects.push({
          mesh: cube,
          type: 'cube',
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.03,
            y: (Math.random() - 0.5) * 0.03,
            z: (Math.random() - 0.5) * 0.03
          },
          floatAmplitude: Math.random() * 1.5 + 0.5,
          floatSpeed: Math.random() * 0.008 + 0.003,
          initialY: cube.position.y
        });
      }

      // Create connection rings
      const ringGeometry = new THREE.TorusGeometry(1.2, 0.3, 8, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(0x6366f1),
        transparent: true,
        opacity: 0.5
      });

      for (let i = 0; i < 8; i++) {
        const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
        ring.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 25
        );
        scene.add(ring);
        
        animatedObjects.push({
          mesh: ring,
          type: 'ring',
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.025,
            y: (Math.random() - 0.5) * 0.025,
            z: (Math.random() - 0.5) * 0.025
          },
          floatAmplitude: Math.random() * 2 + 1,
          floatSpeed: Math.random() * 0.006 + 0.002,
          initialY: ring.position.y
        });
      }

      // Create connecting lines
      const connectionLines = [];
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: new THREE.Color(0x8b5cf6),
        transparent: true,
        opacity: 0.3
      });

      // Connect some nodes with lines
      const nodeObjects = animatedObjects.filter(obj => obj.type === 'node');
      for (let i = 0; i < nodeObjects.length && i < 15; i++) {
        if (Math.random() > 0.6) {
          const startNode = nodeObjects[i];
          const endNode = nodeObjects[Math.floor(Math.random() * nodeObjects.length)];
          
          if (startNode !== endNode) {
            const points = [startNode.mesh.position.clone(), endNode.mesh.position.clone()];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial.clone());
            scene.add(line);
            connectionLines.push({
              line,
              startNode,
              endNode,
              baseOpacity: 0.3
            });
          }
        }
      }

      // Position camera
      camera.position.set(0, 2, 20);
      camera.lookAt(0, 0, 0);

      // Animation variables
      let time = 0;
      const clock = new THREE.Clock();

      // Animation loop
      function animate() {
        animationIdRef.current = requestAnimationFrame(animate);
        
        const deltaTime = clock.getDelta();
        time += deltaTime;

        // Animate all objects
        animatedObjects.forEach((obj, index) => {
          // Rotation animation
          obj.mesh.rotation.x += obj.rotationSpeed.x;
          obj.mesh.rotation.y += obj.rotationSpeed.y;
          obj.mesh.rotation.z += obj.rotationSpeed.z;

          // Floating animation
          obj.mesh.position.y = obj.initialY + 
            Math.sin(time * obj.floatSpeed + index * 0.5) * obj.floatAmplitude;

          // Gentle orbital motion
          const orbitalSpeed = 0.1;
          const orbitalRadius = 0.5;
          obj.mesh.position.x += Math.sin(time * orbitalSpeed + index) * orbitalRadius * deltaTime;
          obj.mesh.position.z += Math.cos(time * orbitalSpeed + index) * orbitalRadius * deltaTime;

          // Pulsing effect for nodes
          if (obj.type === 'node') {
            const pulseScale = 1 + Math.sin(time * 2 + index * 0.3) * 0.2;
            obj.mesh.scale.setScalar(pulseScale);
          }
        });

        // Update connection lines
        connectionLines.forEach((connection, index) => {
          const points = [
            connection.startNode.mesh.position,
            connection.endNode.mesh.position
          ];
          connection.line.geometry.setFromPoints(points);
          
          // Pulsing opacity
          const pulseOpacity = connection.baseOpacity + 
            Math.sin(time * 3 + index * 0.5) * 0.2;
          connection.line.material.opacity = Math.max(0.1, pulseOpacity);
        });

        // Gentle camera movement
        camera.position.x = Math.sin(time * 0.1) * 3;
        camera.position.y = 2 + Math.cos(time * 0.08) * 2;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }

      // Start animation
      animate();
      setIsLoaded(true);

      // Handle window resize
      function handleResize() {
        if (!mountRef.current) return;
        
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      
      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        
        // Dispose of geometries and materials
        animatedObjects.forEach(obj => {
          if (obj.mesh.geometry) obj.mesh.geometry.dispose();
          if (obj.mesh.material) obj.mesh.material.dispose();
        });
        
        connectionLines.forEach(connection => {
          if (connection.line.geometry) connection.line.geometry.dispose();
          if (connection.line.material) connection.line.material.dispose();
        });
        
        if (renderer) {
          renderer.dispose();
        }
        
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
      };
      
    } catch (error) {
      console.error('3D Scene Error:', error);
      setIsLoaded(false);
    }
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 -z-10"
      style={{ 
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}
    />
  );
}

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* 3D Animated Background */}
      <ThreeScene />
      
      {/* Enhanced gradient background */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-violet-950/30 to-gray-950"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-violet-400/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500/20 border border-violet-500/30 rounded-full mb-8 backdrop-blur-md hover:bg-violet-500/30 transition-all duration-500 hover:scale-105 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
            <span className="text-sm text-violet-300 font-medium tracking-wide">AI-Powered Interview Platform</span>
          </div>

          {/* Enhanced Main Heading */}
          <div className="flex items-center justify-center gap-6 mb-8 float-animation">
            <div className="relative">
              <Brain className="w-16 h-16 text-violet-400" />
              <div className="absolute inset-0 bg-violet-400/30 blur-2xl rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-violet-400/10 blur-3xl rounded-full animate-ping"></div>
            </div>
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent hover:scale-105 transition-transform duration-500 cursor-default">
              IntelliHire
            </h1>
          </div>

          {/* Enhanced Subtitle */}
          <p className="text-2xl md:text-3xl mb-12 text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Master your interviews with our{" "}
            <span className="text-violet-300 font-semibold bg-violet-500/10 px-2 py-1 rounded">AI-powered platform</span>. 
            Get personalized feedback, practice with{" "}
            <span className="text-purple-300 font-semibold bg-purple-500/10 px-2 py-1 rounded">real-time simulations</span>, 
            and land your dream job.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button className="px-10 py-5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 group inline-flex items-center justify-center text-lg">
              Start Free Trial
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <button className="px-10 py-5 border-2 border-gray-600 hover:border-violet-500/60 text-gray-200 hover:text-violet-300 rounded-2xl backdrop-blur-md bg-gray-800/40 hover:bg-violet-500/20 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 group inline-flex items-center justify-center text-lg shadow-xl">
              <Play className="mr-3 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
              Watch Demo
            </button>
          </div>

         
        </div>
      </section>
    </div>
  );
}