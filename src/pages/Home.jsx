import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import "./Home.css";

function SportsCar() {
  const carRef = useRef(null);
  const { scene } = useGLTF("/models/velocity_car.glb");

  useEffect(() => {
    const wheels = [];

    scene.traverse((child) => {
      if (!child.isMesh) return;

      const name = (
        child.name + " " +
        (child.material?.name || "")
      ).toLowerCase();

      if (/wheel|tire|tyre/.test(name)) {
        wheels.push(child);
        return;
      }

      if (/glass|window|windshield|light|lamp/.test(name)) {
        return;
      }

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((mat) => {
        if (!mat.color) return;

        mat.map = null;
        mat.color.set("#93D5C3");
        mat.metalness = 0.35;
        mat.roughness = 0.3;
        mat.envMapIntensity = 0;
        mat.needsUpdate = true;
      });
    });

    const tl = gsap.timeline();

    tl.fromTo(
      carRef.current.position,
      { x: 9 },
      {
        x: 0,
        duration: 5,
        ease: "power1.out",
      }
    );

    wheels.forEach((wheel) => {
      tl.to(
        wheel.rotation,
        {
          x: wheel.rotation.x + Math.PI * 10,
          duration: 5,
          ease: "none",
        },
        0
      );
    });

    return () => tl.kill();
  }, [scene]);

  return (
    <group
      ref={carRef}
      position={[9, -1.8, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <primitive object={scene} scale={1.7} />
    </group>
  );
}

function Home() {
  return (
    <section className="home-page">
      <div className="home-heading">
        <span>WELCOME TO</span>
        <div className="velocity-logo">V E L O C I T Y</div>
        <h1>DRIVE THE IMPOSSIBLE</h1>
        <p>EXPERIENCE THE POWER. FEEL THE FREEDOM.</p>
      </div>

      <Canvas
        camera={{ position: [0, 2.5, 12], fov: 38 }}
      >
        <color attach="background" args={["#e9edf0"]} />

        <ambientLight intensity={1.5} />

        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
        />

        <SportsCar />
      </Canvas>
    </section>
  );
}

useGLTF.preload("/models/velocity_car.glb");

export default Home;