"""Depth-aware 2.5D camera moves from single interior images (Depth Anything V2, open source)."""
import sys, os, subprocess, numpy as np, cv2, torch
from PIL import Image
from transformers import pipeline

src_dir, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
pipe = pipeline("depth-estimation", model="depth-anything/Depth-Anything-V2-Small-hf", device=-1)

# per-post camera move: kind, strength
MOVES = {1:("dolly",1.0),2:("truck",1.0),3:("dolly",1.0),4:("truck",-1.0),5:("dolly",1.0),6:("orbit",1.0),
         7:("truck",1.0),8:("dolly",0.8),9:("crane",1.0),10:("orbit",-1.0),11:("truck",-1.0),12:("dolly",1.0)}
S, FPS, DUR = 1080, 30, 2.6
N = int(FPS*DUR)

def ease(x): return x*x*(3-2*x)

for i in range(1, 13):
    p = f"{src_dir}/post-{i:02d}.jpg"
    img = Image.open(p).convert("RGB")
    d = np.array(pipe(img)["predicted_depth"].squeeze().cpu().numpy() if False else pipe(img)["depth"], dtype=np.float32)
    d = cv2.resize(d, (S, S), interpolation=cv2.INTER_CUBIC)
    d = (d - d.min()) / (d.max() - d.min() + 1e-6)          # 1 = near, 0 = far
    d = cv2.GaussianBlur(d, (0, 0), 9)                        # soften edges -> no tearing
    cv2.imwrite(f"{out_dir}/depth-{i:02d}.png", (d*255).astype(np.uint8))
    base = cv2.cvtColor(np.array(img.resize((S, S), Image.LANCZOS)), cv2.COLOR_RGB2BGR)
    kind, sgn = MOVES[i]
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    cx = cy = S/2
    w = subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","bgr24","-s",f"{S}x{S}","-r",str(FPS),"-i","-",
                          "-c:v","libx264","-preset","slow","-crf","20","-pix_fmt","yuv420p","-movflags","+faststart",f"{out_dir}/clip-{i:02d}.mp4"], stdin=subprocess.PIPE)
    for f in range(N):
        t = ease(f/(N-1))
        dd = d
        # overscan so edges never show
        zoom_far = 1.06 + 0.03*t if kind=="dolly" else 1.08
        if kind == "dolly":
            s = zoom_far + 0.10*t*sgn*dd                          # near grows faster than far
            mx = cx + (xx-cx)/s; my = cy + (yy-cy)/s
        elif kind == "truck":
            dx = sgn*(t-0.5)*(10 + 70*dd)                        # near slides more
            mx = cx + (xx-cx)/zoom_far - dx; my = cy + (yy-cy)/zoom_far
        elif kind == "crane":
            dy = (t-0.5)*(8 + 60*dd)
            mx = cx + (xx-cx)/zoom_far; my = cy + (yy-cy)/zoom_far + dy
        else:  # orbit: lateral parallax + slight push
            dx = sgn*(t-0.5)*(6 + 55*dd)
            s = zoom_far + 0.04*t*dd
            mx = cx + (xx-cx)/s - dx; my = cy + (yy-cy)/s
        # refine once: sample depth at the source location for a better inverse mapping
        dd2 = cv2.remap(d, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        if kind == "dolly":
            s = zoom_far + 0.10*t*sgn*dd2; mx = cx + (xx-cx)/s; my = cy + (yy-cy)/s
        elif kind == "truck":
            dx = sgn*(t-0.5)*(10 + 70*dd2); mx = cx + (xx-cx)/zoom_far - dx
        elif kind == "crane":
            dy = (t-0.5)*(8 + 60*dd2); my = cy + (yy-cy)/zoom_far + dy
        else:
            dx = sgn*(t-0.5)*(6 + 55*dd2); s = zoom_far + 0.04*t*dd2; mx = cx + (xx-cx)/s - dx; my = cy + (yy-cy)/s
        frame = cv2.remap(base, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        w.stdin.write(frame.tobytes())
    w.stdin.close(); w.wait()
    print("done", i, kind, flush=True)
