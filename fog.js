// ============================================================
//  Blacklake Fog · Grid + Volumetric Fog + Custom Cursor
//  Standalone vanilla JS — loaded before React
// ============================================================

// ── Simplex Noise ──
class SimplexNoise {
  constructor(seed = Math.random()) {
    this.p = new Uint8Array(512);
    const perm = new Uint8Array(256);
    for (let i = 0; i < 256; i++) perm[i] = i;
    let s = seed * 2147483647 | 0;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
  }
  noise2D(x, y) {
    const F2 = 0.5*(Math.sqrt(3)-1), G2 = (3-Math.sqrt(3))/6;
    const s = (x+y)*F2;
    const i = Math.floor(x+s), j = Math.floor(y+s);
    const t = (i+j)*G2;
    const x0 = x-(i-t), y0 = y-(j-t);
    const i1 = x0>y0?1:0, j1 = x0>y0?0:1;
    const x1=x0-i1+G2, y1=y0-j1+G2;
    const x2=x0-1+2*G2, y2=y0-1+2*G2;
    const ii=i&255, jj=j&255;
    const grad = (hash,gx,gy) => {
      const h=hash&7;
      const u=h<4?gx:gy, v=h<4?gy:gx;
      return ((h&1)?-u:u)+((h&2)?-v:v);
    };
    let n0=0,n1=0,n2=0;
    let t0=0.5-x0*x0-y0*y0;
    if(t0>0){t0*=t0;n0=t0*t0*grad(this.p[ii+this.p[jj]],x0,y0);}
    let t1=0.5-x1*x1-y1*y1;
    if(t1>0){t1*=t1;n1=t1*t1*grad(this.p[ii+i1+this.p[jj+j1]],x1,y1);}
    let t2=0.5-x2*x2-y2*y2;
    if(t2>0){t2*=t2;n2=t2*t2*grad(this.p[ii+1+this.p[jj+1]],x2,y2);}
    return 70*(n0+n1+n2);
  }
}

const _simplex  = new SimplexNoise(42);
const _simplex2 = new SimplexNoise(137);

// ── Canvas refs ──
const gridCanvas = document.getElementById('gridCanvas');
const fogCanvas  = document.getElementById('fogCanvas');
const gCtx = gridCanvas.getContext('2d');
const fCtx = fogCanvas.getContext('2d');

// ── Cursor refs ──
const cursorRing = document.getElementById('cursorRing');
const cursorDot  = document.getElementById('cursorDot');
let rX=0, rY=0, dX=0, dY=0, tX=-100, tY=-100;

// ── Grid config ──
const COLS=80, ROWS=50, SPACING=30;
const CAM_H=160, CAM_D=550, FOCAL=650, HORIZ=0.35;
let gridPts = [];
let W, H, _time = 0;
let _mouse  = { x:-9999, y:-9999 };
let mSmooth = { x:-9999, y:-9999 };

// ── Fog config ──
let fogImg, fogData;
const FOG_SCALE = 4;
let fW, fH;

// ═══════════════════════════════════════════
// Resize
// ═══════════════════════════════════════════
function _resize() {
  W = gridCanvas.width = fogCanvas.width = window.innerWidth;
  H = gridCanvas.height = fogCanvas.height = window.innerHeight;
  initGrid();
  initFog();
}

function initGrid() {
  gridPts = [];
  const tw = (COLS-1)*SPACING, startX = -tw/2;
  for (let r=0; r<ROWS; r++)
    for (let c=0; c<COLS; c++)
      gridPts.push({
        bx: startX+c*SPACING, bz: -150+r*SPACING,
        wx: startX+c*SPACING, wz: -150+r*SPACING,
        wy:0, vy:0, row:r, col:c
      });
}

function initFog() {
  fW = Math.ceil(W / FOG_SCALE);
  fH = Math.ceil(H / FOG_SCALE);
  fogImg = fCtx.createImageData(fW, fH);
  fogData = fogImg.data;
}

// ═══════════════════════════════════════════
// Projection helpers
// ═══════════════════════════════════════════
function proj(wx,wy,wz) {
  const rz = wz + CAM_D;
  if (rz <= 5) return null;
  const s = FOCAL/rz;
  return { x: W/2+wx*s, y: H*HORIZ-(wy-CAM_H)*s, s, d:rz };
}

function unproj(sx,sy) {
  const hY = H*HORIZ;
  const d = sy - hY;
  if (d <= 1) return null;
  const rz = CAM_H*FOCAL/d;
  return { wx: (sx-W/2)/(FOCAL/rz), wz: rz-CAM_D };
}

// ═══════════════════════════════════════════
// Grid update & draw
// ═══════════════════════════════════════════
function updateGrid() {
  let mw = _mouse.x > 0 ? unproj(mSmooth.x, mSmooth.y) : null;
  for (const p of gridPts) {
    const amb = _simplex.noise2D(p.bx*0.003+_time*0.3, p.bz*0.004+_time*0.2) * 1.2;
    let md = 0;
    if (mw) {
      const dx=p.bx-mw.wx, dz=p.bz-mw.wz;
      const dist = Math.sqrt(dx*dx+dz*dz);
      if (dist < 200) { md = (1-dist/200)**2 * 18; }
    }
    p.vy += (amb+md - p.wy) * 0.03;
    p.vy *= 0.91;
    p.wy += p.vy;
  }
}

function drawGrid() {
  gCtx.clearRect(0,0,W,H);
  // Horizontal lines
  for (let r=ROWS-1; r>=0; r--) {
    gCtx.beginPath();
    let ok=false;
    for (let c=0; c<COLS; c++) {
      const p = gridPts[r*COLS+c];
      const pr = proj(p.wx, p.wy, p.wz);
      if (!pr) continue;
      if (!ok) { gCtx.moveTo(pr.x, pr.y); ok=true; } else gCtx.lineTo(pr.x, pr.y);
    }
    if (!ok) continue;
    const dr = r/ROWS;
    gCtx.strokeStyle = `rgba(255,235,210,${0.02 + 0.06*(1-dr)})`;
    gCtx.lineWidth = 0.3+0.3*(1-dr);
    gCtx.stroke();
  }
  // Vertical lines (sparse)
  for (let c=0; c<COLS; c+=4) {
    gCtx.beginPath();
    let ok=false;
    for (let r=ROWS-1; r>=0; r--) {
      const p = gridPts[r*COLS+c];
      const pr = proj(p.wx, p.wy, p.wz);
      if (!pr) continue;
      if (!ok) { gCtx.moveTo(pr.x, pr.y); ok=true; } else gCtx.lineTo(pr.x, pr.y);
    }
    if (!ok) continue;
    gCtx.strokeStyle = `rgba(255,235,210,0.015)`;
    gCtx.lineWidth = 0.25;
    gCtx.stroke();
  }
  // Dots
  let mw = _mouse.x > 0 ? unproj(mSmooth.x, mSmooth.y) : null;
  for (const p of gridPts) {
    if (p.col%3||p.row%3) continue;
    const pr = proj(p.wx, p.wy, p.wz);
    if (!pr) continue;
    let a = 0.08+0.15*(1-p.row/ROWS);
    let sz = 0.4+0.5*(1-p.row/ROWS);
    if (mw) {
      const dx=p.bx-mw.wx, dz=p.bz-mw.wz;
      const d=Math.sqrt(dx*dx+dz*dz);
      if (d<200) { const f=1-d/200; a+=f*0.4; sz+=f*1.2; }
    }
    a += Math.abs(p.wy)*0.015;
    gCtx.beginPath();
    gCtx.arc(pr.x, pr.y, sz, 0, Math.PI*2);
    gCtx.fillStyle = `rgba(255,240,220,${Math.min(1,a)})`;
    gCtx.fill();
  }
}

// ═══════════════════════════════════════════
// Fog draw
// ═══════════════════════════════════════════
function drawFog() {
  const mx = mSmooth.x / FOG_SCALE;
  const my = mSmooth.y / FOG_SCALE;
  const hasM = _mouse.x > 0;

  for (let y = 0; y < fH; y++) {
    for (let x = 0; x < fW; x++) {
      const idx = (y * fW + x) * 4;
      const nx = x * FOG_SCALE;
      const ny = y * FOG_SCALE;

      const n1 = _simplex.noise2D(nx * 0.0015 + _time * 0.15, ny * 0.0018 + _time * 0.1);
      const n2 = _simplex2.noise2D(nx * 0.003 + _time * 0.08, ny * 0.0035 - _time * 0.06);
      const n3 = _simplex.noise2D(nx * 0.006 - _time * 0.12, ny * 0.005 + _time * 0.09);

      let fog = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
      fog = (fog + 1) * 0.5;
      fog = fog * fog;

      let light = 0;
      let lightR = 0, lightG = 0, lightB = 0;

      if (hasM) {
        const dx = x - mx, dy = y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius1 = 80;
        if (dist < radius1) {
          const f = 1 - dist / radius1;
          light = f * f * f * 1.2;
        }
        const radius2 = 160;
        if (dist < radius2) {
          const f = 1 - dist / radius2;
          light += f * f * 0.3;
        }
        const colorMix = Math.min(1, dist / 100);
        lightR = 255 * (1 - colorMix * 0.3);
        lightG = 230 * (1 - colorMix * 0.1) + 40 * colorMix;
        lightB = 180 * (1 - colorMix * 0.5) + 80 * colorMix;
      }

      const scattered = light * (0.4 + fog * 0.6);
      const baseFog = fog * 0.06;
      let r = 8 + baseFog * 15 + scattered * lightR;
      let g = 8 + baseFog * 18 + scattered * lightG;
      let b = 14 + baseFog * 25 + scattered * lightB;

      const vx = (x / fW - 0.5) * 2;
      const vy = (y / fH - 0.5) * 2;
      const vignette = 1 - (vx*vx + vy*vy) * 0.3;
      r *= vignette;
      g *= vignette;
      b *= vignette;

      let alpha = 0.55 + fog * 0.25 + scattered * 0.2;
      alpha = Math.min(1, alpha);
      if (light > 0.3) alpha *= 1 - (light - 0.3) * 0.4;

      fogData[idx]   = Math.min(255, r) | 0;
      fogData[idx+1] = Math.min(255, g) | 0;
      fogData[idx+2] = Math.min(255, b) | 0;
      fogData[idx+3] = (alpha * 255) | 0;
    }
  }

  fCtx.clearRect(0, 0, W, H);
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = fW;
  tempCanvas.height = fH;
  tempCanvas.getContext('2d').putImageData(fogImg, 0, 0);
  fCtx.save();
  fCtx.imageSmoothingEnabled = true;
  fCtx.imageSmoothingQuality = 'high';
  fCtx.drawImage(tempCanvas, 0, 0, fW, fH, 0, 0, W, H);
  fCtx.restore();
}

// ═══════════════════════════════════════════
// Cursor animation
// ═══════════════════════════════════════════
function cursorLoop() {
  rX += (tX - rX) * 0.12;
  rY += (tY - rY) * 0.12;
  dX += (tX - dX) * 0.6;
  dY += (tY - dY) * 0.6;
  cursorRing.style.left = rX + 'px';
  cursorRing.style.top  = rY + 'px';
  cursorDot.style.left  = dX + 'px';
  cursorDot.style.top   = dY + 'px';
  requestAnimationFrame(cursorLoop);
}

// ═══════════════════════════════════════════
// Main loop
// ═══════════════════════════════════════════
let _frameCount = 0;

function fogLoop() {
  _time += 0.004;
  mSmooth.x += (_mouse.x - mSmooth.x) * 0.06;
  mSmooth.y += (_mouse.y - mSmooth.y) * 0.06;

  updateGrid();
  drawGrid();

  _frameCount++;
  if (_frameCount % 2 === 0) drawFog();

  requestAnimationFrame(fogLoop);
}

// ═══════════════════════════════════════════
// Events
// ═══════════════════════════════════════════
document.addEventListener('mousemove', function(e) {
  tX = e.clientX; tY = e.clientY;
  _mouse.x = e.clientX; _mouse.y = e.clientY;
});
document.addEventListener('mouseleave', function() {
  _mouse.x = -9999; _mouse.y = -9999;
});
document.addEventListener('touchmove', function(e) {
  _mouse.x = e.touches[0].clientX; _mouse.y = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', function() {
  _mouse.x = -9999; _mouse.y = -9999;
});

// Cursor hover effect on interactive elements
function bindCursorHovers() {
  document.querySelectorAll('a,button').forEach(function(el) {
    el.addEventListener('mouseenter', function() { cursorRing.classList.add('hovering'); });
    el.addEventListener('mouseleave', function() { cursorRing.classList.remove('hovering'); });
  });
}

window.addEventListener('resize', _resize);

// Init
_resize();
fogLoop();
cursorLoop();

// Re-bind cursor hovers after React mounts (slight delay)
setTimeout(bindCursorHovers, 1500);
// Also re-bind on any click (for dynamic content like filters)
document.addEventListener('click', function() { setTimeout(bindCursorHovers, 200); });

// ── Feature #6: CRT grain texture ──
(function initGrain() {
  var s = 256;
  var c = document.createElement('canvas');
  c.width = c.height = s;
  var ctx = c.getContext('2d');
  var img = ctx.createImageData(s, s);
  for (var i = 0; i < img.data.length; i += 4) {
    var v = Math.random() * 255 | 0;
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = (v * 0.12) | 0;
  }
  ctx.putImageData(img, 0, 0);
  var overlay = document.getElementById('crtOverlay');
  if (overlay) overlay.style.setProperty('--grain-url', 'url(' + c.toDataURL() + ')');
})();
