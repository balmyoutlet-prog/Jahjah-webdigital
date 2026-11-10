"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Glass pavilion hero. Three.js is imported lazily inside the effect so it never blocks first paint.
 * - Lines draw themselves, the scene "emerges from light" (exposure settles), then
 * - scrolling the hero section drives the camera from outside into the structure while glass panels slide.
 * Tiered quality: low-power devices get non-transmissive glass, lower DPR and smaller shadows.
 * Reduced motion: one static frame, no scroll camera, no emergence.
 */
export default function HeroScene({ heroId }: { heroId: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const el = host.current;
      if (!el) return;
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
      const low =
        window.innerWidth < 820 ||
        (nav.hardwareConcurrency ?? 8) <= 4 ||
        (nav.deviceMemory ?? 8) <= 4 ||
        !!nav.connection?.saveData;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: !low, powerPreference: "high-performance" });
      } catch {
        setFailed(true);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.25 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = reduced ? 1 : 4;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      el.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-hidden", "true");

      const BG = new THREE.Color("#f3f0ea");
      const scene = new THREE.Scene();
      scene.background = BG;
      scene.fog = new THREE.Fog(BG, 38, 110);
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      scene.environmentIntensity = 0.55;

      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);

      // ── Lights
      scene.add(new THREE.HemisphereLight("#ffffff", "#d9cdb9", 0.7));
      const sun = new THREE.DirectionalLight("#fff3e2", 2.6);
      sun.position.set(-16, 24, 12);
      sun.castShadow = true;
      sun.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
      const sc = sun.shadow.camera;
      sc.left = -22; sc.right = 22; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 80;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.03;
      sun.shadow.radius = 5;
      scene.add(sun);

      // ── Materials
      const mWhite = new THREE.MeshStandardMaterial({ color: "#f7f5f1", roughness: 0.62 });
      const mStone = new THREE.MeshStandardMaterial({ color: "#ddd1bd", roughness: 0.86 });
      const mStoneWarm = new THREE.MeshStandardMaterial({ color: "#d3c4aa", roughness: 0.78 });
      const mGround = new THREE.MeshStandardMaterial({ color: "#ebe5da", roughness: 0.96 });
      const mAlu = new THREE.MeshStandardMaterial({ color: "#d2d6da", metalness: 1, roughness: 0.32 });
      const mWater = new THREE.MeshPhysicalMaterial({ color: "#c9d4d6", roughness: 0.04, metalness: 0.1, clearcoat: 1 });
      const mGlass = low
        ? new THREE.MeshPhysicalMaterial({ color: "#eaf2f3", roughness: 0.04, metalness: 0.05, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })
        : new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.035, metalness: 0, transmission: 1, thickness: 0.35, ior: 1.5, attenuationColor: new THREE.Color("#e3eff0"), attenuationDistance: 2.5, specularIntensity: 1 });
      const mLine = new THREE.LineBasicMaterial({ color: "#151515", transparent: true, opacity: 0.5 });
      const mGrid = new THREE.LineBasicMaterial({ color: "#151515", transparent: true, opacity: 0.07 });
      const mats = [mWhite, mStone, mStoneWarm, mGround, mAlu, mWater, mGlass, mLine, mGrid];

      const world = new THREE.Group();
      scene.add(world);
      const linePositions: number[] = [];
      const geos: InstanceType<typeof THREE.BufferGeometry>[] = [];

      const box = (w: number, h: number, d: number, mat: InstanceType<typeof THREE.Material>, x: number, y: number, z: number, opts: { lines?: boolean; cast?: boolean; parent?: InstanceType<typeof THREE.Object3D> } = {}) => {
        const g = new THREE.BoxGeometry(w, h, d);
        geos.push(g);
        const m = new THREE.Mesh(g, mat);
        m.position.set(x, y, z);
        m.castShadow = opts.cast ?? true;
        m.receiveShadow = true;
        (opts.parent ?? world).add(m);
        if (opts.lines !== false) {
          m.updateMatrixWorld(true);
          const e = new THREE.EdgesGeometry(g);
          e.applyMatrix4(m.matrixWorld);
          linePositions.push(...(e.attributes.position.array as Float32Array));
          e.dispose();
        }
        return m;
      };

      // Ground + construction grid
      const groundGeo = new THREE.PlaneGeometry(400, 400);
      geos.push(groundGeo);
      const ground = new THREE.Mesh(groundGeo, mGround);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
      const gridPts: number[] = [];
      for (let i = -40; i <= 40; i += 2) {
        gridPts.push(i, 0.005, -40, i, 0.005, 40, -40, 0.005, i, 40, 0.005, i);
      }
      const gridGeo = new THREE.BufferGeometry();
      gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPts, 3));
      geos.push(gridGeo);
      scene.add(new THREE.LineSegments(gridGeo, mGrid));

      // Plinth + pool
      const PL = 0.6;
      box(26, PL, 15, mStone, 0, PL / 2, 0);
      box(9, 0.04, 4.2, mWater, 7.2, PL + 0.02, 5.4, { cast: false });

      // Ground floor pavilion: floating roof on slender columns, glass perimeter
      const H = 4.2;
      const roofY = PL + H;
      box(18, 0.36, 11, mWhite, -0.5, roofY + 0.18, -0.6);
      for (const [x, z] of [[-7.6, 3.6], [-7.6, -4.4], [6.4, 3.6], [6.4, -4.4], [-0.6, 3.6], [-0.6, -4.4]] as const) {
        box(0.14, H, 0.14, mAlu, x, PL + H / 2, z);
      }
      // Glass: front (z=3.7), back (z=-4.5), sides
      const panelW = 2.3;
      const sliders: { mesh: InstanceType<typeof THREE.Mesh>; baseX: number; dir: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const x = -7.6 + panelW / 2 + i * panelW;
        const sliding = i === 2 || i === 3;
        const z = sliding ? 3.84 : 3.7;
        const g = new THREE.BoxGeometry(panelW - 0.04, H - 0.04, 0.05);
        geos.push(g);
        const m = new THREE.Mesh(g, mGlass);
        m.position.set(x, PL + H / 2, z);
        m.castShadow = false;
        world.add(m);
        const e = new THREE.EdgesGeometry(g);
        geos.push(e);
        const l = new THREE.LineSegments(e, mLine);
        m.add(l);
        if (sliding) sliders.push({ mesh: m, baseX: x, dir: i === 2 ? -1 : 1 });
      }
      for (let i = 0; i < 6; i++) box(panelW - 0.04, H - 0.04, 0.05, mGlass, -7.6 + panelW / 2 + i * panelW, PL + H / 2, -4.5, { cast: false });
      for (let i = 0; i < 3; i++) box(0.05, H - 0.04, 2.7 - 0.04, mGlass, 6.4, PL + H / 2, 3.7 - 1.35 - i * 2.73, { cast: false });

      // Travertine wall slicing through the glass, and an inner stone core
      box(12, 3.4, 0.4, mStoneWarm, 5.5, PL + 1.7, -1.6);
      box(3.2, H, 2.2, mStone, -3.6, PL + H / 2, -2.6);

      // Brushed aluminium fins on the west facade
      for (let i = 0; i < 17; i++) box(0.06, H + 0.36, 0.75, mAlu, -9.1, PL + (H + 0.36) / 2, 4 - i * 0.55, { lines: false });

      // Upper glass volume, cantilevered
      const U = 3.1;
      const uy = roofY + 0.36;
      box(10.5, 0.3, 7.4, mWhite, -3.4, uy + U + 0.15, -1.2);
      for (let i = 0; i < 4; i++) box(2.4, U, 0.05, mGlass, -7.6 + 1.2 + i * 2.45, uy + U / 2, 2.4, { cast: false });
      for (let i = 0; i < 4; i++) box(2.4, U, 0.05, mGlass, -7.6 + 1.2 + i * 2.45, uy + U / 2, -4.8, { cast: false });
      box(0.05, U, 7.2, mGlass, 1.9, uy + U / 2, -1.2, { cast: false });
      box(3.4, U, 0.32, mStone, -5.6, uy + U / 2, -4.6);

      // Merged architectural linework — revealed progressively
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
      geos.push(lineGeo);
      const lines = new THREE.LineSegments(lineGeo, mLine);
      world.add(lines);
      const totalVerts = linePositions.length / 3;

      // ── Camera path (outside → approach → inside, looking toward the fins)
      const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
      const posPath = new THREE.CatmullRomCurve3([V(26, 11, 30), V(14, 6, 19), V(5, 3, 9), V(0.5, 2.5, 2.4), V(-2.4, 2.4, -0.2)]);
      const tgtPath = new THREE.CatmullRomCurve3([V(-1, 2.6, -1), V(-1.5, 2.6, -1), V(-2, 2.5, -1), V(-5, 2.6, -1.5), V(-9, 2.6, -2.5)]);
      const camPos = new THREE.Vector3();
      const camTgt = new THREE.Vector3();

      const heroEl = document.getElementById(heroId);
      let progress = 0;
      let smooth = 0;
      let mx = 0, my = 0, smx = 0, smy = 0;
      let portrait = false;

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        portrait = w / h < 0.9;
        camera.fov = portrait ? 52 : 34;
        camera.updateProjectionMatrix();
      };
      const readScroll = () => {
        if (!heroEl) return;
        const r = heroEl.getBoundingClientRect();
        const span = Math.max(1, r.height - window.innerHeight);
        progress = Math.min(1, Math.max(0, -r.top / span));
        heroEl.style.setProperty("--p", progress.toFixed(4));
      };
      const onMove = (e: PointerEvent) => {
        mx = (e.clientX / window.innerWidth) * 2 - 1;
        my = (e.clientY / window.innerHeight) * 2 - 1;
      };

      const offset = new THREE.Vector3();
      const place = (p: number) => {
        posPath.getPoint(p, camPos);
        tgtPath.getPoint(p, camTgt);
        if (portrait) {
          camPos.add(offset.set(0, 2.5 * (1 - p), 8 * (1 - p)));
          camTgt.y -= 3.2 * (1 - p); // lift the model into the upper half on phones, leaving room for the copy
        }
        camPos.x += smx * 0.8 * (1 - p * 0.7);
        camPos.y += -smy * 0.4 * (1 - p * 0.7);
        camera.position.copy(camPos);
        camera.lookAt(camTgt);
        for (const s of sliders) s.mesh.position.x = s.baseX + s.dir * Math.min(1, p * 1.8) * 2.1;
      };

      // Emergence timeline starts when the intro hands over
      let t0 = -1;
      const startEmerge = () => { if (t0 < 0) t0 = performance.now(); };
      const w = window as Window & { __dosIntroDone?: boolean };
      if (w.__dosIntroDone) startEmerge();
      window.addEventListener("dos:intro-done", startEmerge);

      resize();
      readScroll();
      if (reduced) {
        lineGeo.setDrawRange(0, totalVerts);
        place(0);
        renderer.render(scene, camera);
      } else {
        lineGeo.setDrawRange(0, 0);
      }

      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.intersectionRatio > 0; }, { threshold: [0, 0.01] });
      io.observe(el);

      let raf = 0;
      let rendered = false;
      const ease = (x: number) => 1 - Math.pow(1 - x, 3);
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) return;
        const now = performance.now();
        const e = t0 < 0 ? 0 : Math.min(1, (now - t0) / 2600);
        const le = t0 < 0 ? 0 : Math.min(1, (now - t0) / 2300);
        // Idle when settled: no emergence running, camera caught up with scroll and pointer.
        const settled = e >= 1 && Math.abs(progress - smooth) < 1e-4 && Math.abs(mx - smx) < 1e-3 && Math.abs(my - smy) < 1e-3;
        if (settled && rendered) return;
        rendered = settled;
        lineGeo.setDrawRange(0, Math.floor(ease(le) * totalVerts));
        renderer.toneMappingExposure = 4 - 3 * ease(e);
        world.position.y = -0.5 * (1 - ease(e));
        smooth += (progress - smooth) * 0.075;
        smx += (mx - smx) * 0.04;
        smy += (my - smy) * 0.04;
        place(smooth);
        renderer.render(scene, camera);
      };

      const ro = new ResizeObserver(() => { resize(); rendered = false; if (reduced) { place(0); renderer.render(scene, camera); } });
      ro.observe(el);
      window.addEventListener("scroll", readScroll, { passive: true });
      if (!reduced) {
        window.addEventListener("pointermove", onMove, { passive: true });
        raf = requestAnimationFrame(loop);
      }
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("scroll", readScroll);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("dos:intro-done", startEmerge);
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [heroId]);

  return (
    <>
      {(!ready || failed) && <HeroFallback />}
      <div ref={host} className="hero-canvas" style={{ opacity: ready && !failed ? 1 : 0, transition: "opacity 1.2s" }} />
    </>
  );
}

/** Static axonometric line drawing — first paint, no-WebGL and failure fallback. */
export function HeroFallback() {
  return (
    <div className="hero-fallback" aria-hidden="true">
      <svg viewBox="0 0 1000 600" fill="none" stroke="#151515" strokeWidth="0.8">
        <g opacity="0.08">
          {Array.from({ length: 21 }, (_, i) => (
            <line key={`a${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`b${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
          ))}
        </g>
        <path d="M180 420 L520 520 L860 400 L520 300 Z" fill="#e3d8c6" stroke="#151515" />
        <path d="M250 380 L520 460 L790 365 L520 290 Z" />
        <path d="M250 380 L250 250 M520 460 L520 330 M790 365 L790 235 M520 290 L520 160" />
        <path d="M220 255 L520 345 L830 235 L520 150 Z" fill="#faf9f6" />
        <path d="M320 245 L320 165 L540 225 L540 305 M540 225 L720 165 L720 240" />
        <path d="M300 170 L540 235 L740 165 L500 105 Z" fill="#faf9f6" />
        <g opacity="0.35">
          <path d="M270 382 L270 262 M300 391 L300 270 M330 400 L330 279 M360 409 L360 288 M390 418 L390 297" />
        </g>
      </svg>
    </div>
  );
}
