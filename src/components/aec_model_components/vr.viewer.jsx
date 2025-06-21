import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const VRViewer = ({ model }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !model) return;

    const isGLTF = ["gltf", "glb"].includes(model.split(".").pop().toLowerCase());
    if (!isGLTF) return () => {};

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);
    container.appendChild(VRButton.createButton(renderer));

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(
      model,
      (gltf) => {
        scene.add(gltf.scene);
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      },
      undefined,
      (err) => console.error("Error loading model", err)
    );

    camera.position.set(0, 1.6, 3);

    rendererRef.current = renderer;

    return () => {
      renderer.setAnimationLoop(null);
      renderer.dispose();
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, [model]);

  const isGLTF = model
    ? ["gltf", "glb"].includes(model.split(".").pop().toLowerCase())
    : false;

  return (
    <div className="w-full h-full" ref={containerRef}>
      {model && !isGLTF && (
        <p className="text-red-500">
          Modelo no soportado. Conviértalo a GLTF/GLB para usar el visor VR.
        </p>
      )}
    </div>
  );
};

export default VRViewer;
