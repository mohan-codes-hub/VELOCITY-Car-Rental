
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";

import "./Experience.css";

gsap.registerPlugin(ScrollTrigger, Observer);

const cars = [
  {
    file: "car1.glb",
    name: "THE BEAST",
    line: "POWER HAS A NEW NAME",
    bg: "#dcece4",
    accent: "#477e68",
    watermark: "rgba(71,126,104,0.10)",
  },
  {
    file: "car2.glb",
    name: "PURE ELEGANCE",
    line: "DESIGNED TO INSPIRE",
    bg: "#dce5f0",
    accent: "#496b9b",
    watermark: "rgba(73,107,155,0.10)",
  },
  {
    file: "car3.glb",
    name: "THE DARK KNIGHT",
    line: "BORN TO COMMAND",
    bg: "#eee0dc",
    accent: "#9b5148",
    watermark: "rgba(155,81,72,0.10)",
  },
  {
    file: "car4.glb",
    name: "SPEED LEGEND",
    line: "BEYOND EVERY LIMIT",
    bg: "#eee7d5",
    accent: "#9a783b",
    watermark: "rgba(154,120,59,0.10)",
  },
  {
    file: "car5.glb",
    name: "THE FINAL ICON",
    line: "MADE FOR THE EXTRAORDINARY",
    bg: "#e4e3e1",
    accent: "#62615e",
    watermark: "rgba(98,97,94,0.10)",
  },
];

function CarModel({ file, carRef, enterFrom, onEnterComplete }) {
  const { scene } = useGLTF(`/models/${file}`);
  const { viewport } = useThree();

  const groupRef = useRef(null);
  const previousX = useRef(enterFrom);

  const model = useMemo(() => {
    const clone = scene.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    clone.position.sub(center);

    const wheels = [];

    clone.traverse((child) => {
      if (!child.isMesh) return;

      const name = child.name.toLowerCase();

      if (
        name.includes("wheel") ||
        name.includes("tire") ||
        name.includes("tyre") ||
        name.includes("rim")
      ) {
        wheels.push(child);
      }
    });

    return {
      object: clone,
      maxSize: Math.max(size.x, size.y, size.z) || 1,
      wheels,
    };
  }, [scene]);

  const scale =
    Math.min(9, viewport.width * 0.88) / model.maxSize;

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    group.position.x = enterFrom;
    previousX.current = enterFrom;

    const animation = gsap.to(group.position, {
      x: 0,
      duration: 0.75,
      ease: "power3.out",
      onComplete: onEnterComplete,
    });

    return () => animation.kill();
  }, [file, enterFrom, onEnterComplete]);

  useFrame((state, delta) => {
    const group = groupRef.current;

    if (!group) return;

    const currentX = group.position.x;
    const speed =
      (currentX - previousX.current) / Math.max(delta, 0.001);

    if (Math.abs(speed) > 0.02) {
      const rotation = THREE.MathUtils.clamp(
        speed * delta * 1.3,
        -0.35,
        0.35
      );

      model.wheels.forEach((wheel) => {
        wheel.rotation.x += rotation;
      });
    }

    previousX.current = currentX;
  });

  return (
    <group
      ref={(element) => {
        groupRef.current = element;
        carRef(element);
      }}
      position={[enterFrom, -0.45, 0]}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <primitive object={model.object} scale={scale} />
    </group>
  );
}

function Experience() {
  const sectionRef = useRef(null);
  const carGroupRef = useRef(null);
  const observerRef = useRef(null);
  const lockedRef = useRef(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [enterFrom, setEnterFrom] = useState(12);

  const activeCar = cars[activeIndex];

  const unlock = useCallback(() => {
    lockedRef.current = false;
  }, []);

  const setCarGroup = useCallback((element) => {
    carGroupRef.current = element;
  }, []);

  const changeCar = useCallback((direction) => {
    if (lockedRef.current) return;

    const nextIndex = activeIndex + direction;

    // Allow normal page scrolling beyond the first/last car.
    if (nextIndex < 0 || nextIndex >= cars.length) {
      observerRef.current?.disable();

      window.scrollBy({
        top: direction * window.innerHeight,
        behavior: "smooth",
      });

      return;
    }

    lockedRef.current = true;

    const oldCar = carGroupRef.current;

    if (!oldCar) {
      lockedRef.current = false;
      return;
    }

    // Move the current car completely out first.
    gsap.to(oldCar.position, {
      x: direction > 0 ? -12 : 12,
      duration: 0.55,
      ease: "power3.in",
      onComplete: () => {
        setEnterFrom(direction > 0 ? 12 : -12);
        setActiveIndex(nextIndex);

        // Move the page to the matching scroll position.
        const sectionTop =
          sectionRef.current.getBoundingClientRect().top +
          window.scrollY;

        window.scrollTo({
          top: sectionTop + nextIndex * window.innerHeight,
          behavior: "smooth",
        });
      },
    });
  }, [activeIndex]);

  useEffect(() => {
    const observer = Observer.create({
      target: window,
      type: "wheel,touch,pointer",
      preventDefault: true,
      allowClicks: true,
      tolerance: 60,
      dragMinimum: 10,
      onDown: () => changeCar(1),
      onUp: () => changeCar(-1),
    });

    observer.disable();
    observerRef.current = observer;

    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      onEnter: () => observer.enable(),
      onEnterBack: () => observer.enable(),
      onLeave: () => observer.disable(),
      onLeaveBack: () => observer.disable(),
    });

    return () => {
      observer.kill();
      trigger.kill();
      observerRef.current = null;
    };
  }, [changeCar]);

  return (
    <section
      className="experience-page"
      ref={sectionRef}
    >
      <div
        className="experience-sticky"
        style={{ backgroundColor: activeCar.bg }}
      >
        <div
          className="experience-watermark"
          style={{ color: activeCar.watermark }}
        >
          V
        </div>

        <div className="experience-heading">
          <span className="experience-label">
            VELOCITY PRESENTS
          </span>

          <h1
            key={activeCar.name}
            style={{ color: activeCar.accent }}
          >
            {activeCar.name}
          </h1>

          <p key={activeCar.line}>
            {activeCar.line}
          </p>
        </div>

        <div className="experience-canvas">
          <Canvas
            camera={{
              position: [0, 2.2, 14],
              fov: 45,
            }}
            dpr={[1, 1.25]}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "high-performance",
            }}
          >
            <ambientLight intensity={1.8} />

            <directionalLight
              position={[5, 8, 5]}
              intensity={2.2}
            />

            <directionalLight
              position={[-5, 4, -5]}
              intensity={1.2}
            />

            <Suspense fallback={null}>
              <CarModel
                key={activeCar.file}
                file={activeCar.file}
                carRef={setCarGroup}
                enterFrom={enterFrom}
                onEnterComplete={unlock}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="experience-footer">
          <span>0{activeIndex + 1} / 05</span>
          <span>SCROLL TO DISCOVER</span>
        </div>
      </div>
    </section>
  );
}

cars.forEach((car) => {
  useGLTF.preload(`/models/${car.file}`);
});

export default Experience;
