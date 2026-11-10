"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic reel: GPU transitions between studio images, in the spirit of interior reels.
 *   0 Liquid glass   — refractive, water-like displacement that resolves the next space
 *   1 Light sweep    — a warm architectural light beam wipes across the frame
 *   2 AI render      — the next image "denoises" out of generative grain and blocks
 *   3 Sketch→render  — the next space appears as line drawing first, then fills with material
 *   4 Zoom through   — the camera pushes through the frame into the next room
 * Raw WebGL1 (no library), one context, renders ONLY while a transition runs; DPR capped at 1.5.
 * Fallbacks: no WebGL → CSS crossfade; reduced motion → instant swap.
 */

export const TRANSITIONS = 5;

const VERT = `attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;

const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uFrom,uTo;
uniform vec2 uRes,uFromSize,uToSize;
uniform float uP,uTime;
uniform int uType;
vec2 cover(vec2 uv,vec2 img){float ra=uRes.x/uRes.y,ri=img.x/img.y;vec2 s=ra>ri?vec2(1.,ri/ra):vec2(ra/ri,1.);return (uv-.5)*s+.5;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.;a*=.5;}return v;}
vec4 A(vec2 uv){return texture2D(uFrom,cover(uv,uFromSize));}
vec4 B(vec2 uv){return texture2D(uTo,cover(uv,uToSize));}
float L(vec2 uv){return dot(B(uv).rgb,vec3(.299,.587,.114));}
vec3 sketch(vec2 uv){
  vec2 d=1.4/uRes;
  float tl=L(uv+vec2(-d.x,d.y)),t=L(uv+vec2(0.,d.y)),tr=L(uv+d),l=L(uv-vec2(d.x,0.)),r=L(uv+vec2(d.x,0.)),bl=L(uv-d),b=L(uv-vec2(0.,d.y)),br=L(uv+vec2(d.x,-d.y));
  float gx=-tl-2.*l-bl+tr+2.*r+br,gy=-tl-2.*t-tr+bl+2.*b+br;
  float e=smoothstep(.1,.42,length(vec2(gx,gy)));
  vec2 g=fract(uv*vec2(uRes.x/uRes.y,1.)*14.);float grid=(1.-smoothstep(0.,.02,min(g.x,g.y)))*.06;
  return mix(vec3(.965,.957,.94),vec3(.08),max(e*.9,grid));
}
void main(){
  vec2 uv=vUv;float p=uP;vec3 c;
  if(uType==0){
    float edge=fbm(uv*2.2+3.1);
    float front=p*1.3-.15;
    float m=smoothstep(edge-.1,edge+.1,front);
    vec2 n=vec2(fbm(uv*3.+uTime*.25),fbm(uv*3.+7.3-uTime*.25))-.5;
    float s=sin(p*3.14159);
    vec2 off=n*.16*s;
    vec3 a=A(uv+off*(1.-m)).rgb;
    vec3 b=vec3(B(uv-off*m+vec2(.004*s,0.)).r,B(uv-off*m).g,B(uv-off*m-vec2(.004*s,0.)).b);
    c=mix(a,b,m);
    float rim=1.-smoothstep(0.,.05,abs(front-edge));
    c+=rim*s*vec3(.32,.31,.29);
  } else if(uType==1){
    float d=(uv.x*.85+(1.-uv.y)*.55)/1.4;
    float pos=p*1.5-.25;
    float m=smoothstep(pos+.015,pos-.015,d);
    float glow=exp(-pow((d-pos)*16.,2.));
    vec3 a=A(uv).rgb*(1.+glow*.4);
    c=mix(a,B(uv).rgb,m)+glow*vec3(1.,.9,.74)*.85;
  } else if(uType==2){
    float k=smoothstep(.15,1.,p);
    float px=mix(56.,1.,k*k);
    vec2 q=(floor(uv*uRes/px)+.5)*px/uRes;
    vec3 b=B(q).rgb;
    float grain=hash(floor(uv*uRes/2.)+floor(uTime*30.));
    b=mix(b,vec3(grain)*.9+.05,(1.-k)*.6);
    float cell=hash(floor(uv*uRes/42.));
    float m=smoothstep(cell-.04,cell+.04,p*1.25);
    float scan=exp(-pow((fract(uv.y*3.-p*3.)-.5)*30.,2.))*(1.-k)*.15;
    c=mix(A(uv).rgb,b,m)+scan;
  } else if(uType==3){
    vec3 sk=sketch(uv);
    if(p<.42){
      float t=p/.42;float edge=fbm(uv*3.);
      float m=smoothstep(edge-.08,edge+.08,t*1.2-.1);
      c=mix(A(uv).rgb,sk,m);
    } else {
      float t=(p-.42)/.58;float edge=uv.y*.6+fbm(uv*4.)*.4;
      float m=smoothstep(edge-.06,edge+.06,t*1.15-.05);
      c=mix(sk,B(uv).rgb,m);
    }
  } else {
    float e=smoothstep(0.,1.,p);
    vec2 dirA=(uv-.5);vec2 dirB=(uv-.5);
    vec3 a=vec3(0.),b=vec3(0.);
    float blur=sin(p*3.14159)*.06;
    for(int i=0;i<8;i++){
      float f=float(i)/7.;
      a+=A(.5+dirA/(1.+e*.7)*(1.-blur*f)).rgb;
      b+=B(.5+dirB/(1.25-e*.25)*(1.-blur*f)).rgb;
    }
    a/=8.;b/=8.;
    c=mix(a,b,smoothstep(.38,.62,p))+exp(-pow((p-.5)*7.,2.))*.12;
  }
  gl_FragColor=vec4(c,1.);
}`;

type Tex = { tex: WebGLTexture; w: number; h: number };

export default function ReelGL({ srcs, index, type, alt, onReady }: { srcs: string[]; index: number; type: number; alt: string; onReady?: (gl: boolean) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ go: (i: number, t: number) => void } | null>(null);
  const [mode, setMode] = useState<"gl" | "css">("gl");
  const [shown, setShown] = useState(index);
  const first = useRef(true);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) { setMode("css"); onReady?.(false); return; }

    const sh = (t: number, s: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o) || "shader"); return o; };
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    } catch {
      setMode("css"); onReady?.(false); return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = { from: U("uFrom"), to: U("uTo"), res: U("uRes"), fs: U("uFromSize"), ts: U("uToSize"), p: U("uP"), time: U("uTime"), type: U("uType") };
    gl.uniform1i(u.from, 0);
    gl.uniform1i(u.to, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const cache = new Map<number, Promise<Tex>>();
    const load = (i: number) => {
      if (!cache.has(i)) {
        cache.set(i, new Promise<Tex>((res, rej) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            const tex = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
            res({ tex, w: img.naturalWidth, h: img.naturalHeight });
          };
          img.onerror = rej;
          img.src = srcs[i];
        }));
      }
      return cache.get(i)!;
    };

    let from: Tex | null = null, to: Tex | null = null, p = 1, t = 0, start = 0, raf = 0, dur = 1700;
    const draw = (time: number) => {
      if (!from || !to) return;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, from.tex);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, to.tex);
      gl.uniform2f(u.res, cv.width, cv.height);
      gl.uniform2f(u.fs, from.w, from.h);
      gl.uniform2f(u.ts, to.w, to.h);
      gl.uniform1f(u.p, p);
      gl.uniform1f(u.time, time / 1000);
      gl.uniform1i(u.type, t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      p = ease(k);
      draw(now);
      if (k < 1) raf = requestAnimationFrame(tick);
      else { from = to; p = 1; }
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      gl.viewport(0, 0, cv.width, cv.height);
      draw(performance.now());
    };
    let seq = 0;
    api.current = {
      go: async (i, type) => {
        const my = ++seq;
        const next = await load(i);
        load((i + 1) % srcs.length); // preload the following image
        if (my !== seq) return;
        cancelAnimationFrame(raf);
        if (!from || reduced) { from = to = next; p = 1; t = 0; draw(performance.now()); return; }
        if (p < 1) from = to; // interrupt: continue from the last target
        to = next; t = type; p = 0; start = performance.now();
        raf = requestAnimationFrame(tick);
      },
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    onReady?.(true);
    api.current.go(index, 0);
    const onLost = (e: Event) => { e.preventDefault(); setMode("css"); };
    cv.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("webglcontextlost", onLost);
      api.current = null;
      cache.forEach((pr) => pr.then((x) => gl.deleteTexture(x.tex)).catch(() => {}));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (mode === "gl") api.current?.go(index, type);
    else setShown(index);
  }, [index, type, mode]);

  return (
    <div className="reel-media">
      <canvas ref={canvas} className="reel-canvas" role="img" aria-label={alt} style={{ display: mode === "gl" ? "block" : "none" }} />
      {mode === "css" &&
        srcs.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s} src={s} alt={i === shown ? alt : ""} aria-hidden={i !== shown} className={`reel-img${i === shown ? " on" : ""}`} loading={i === shown ? "eager" : "lazy"} />
        ))}
    </div>
  );
}
