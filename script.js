/* =============================================
   LOVE WEBSITE — FULL ANIMATION CONTROLLER
   Phase 1 (0–10s): Pink CMatrix → "1 > 2 > 3 > I Love You"
   Phase 2 (10–45s): Floating hearts, stars, fireworks, photo grid
   Phase 3 (45s+):  "You Are The Best" + grand finale
   ============================================= */

/* ── UTILS ── */
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const pick = arr => arr[randInt(0, arr.length)];

/* ── PHASE CONTROLLER ── */
const phases = [
  document.getElementById('phase1'),
  document.getElementById('phase2'),
  document.getElementById('phase3'),
];

function showPhase(idx) {
  phases.forEach((p, i) => {
    p.classList.remove('active', 'fade-out');
    if (i === idx) {
      p.classList.add('active');
    }
  });
}

/* ============================================
   PHASE 1 — PINK CMATRIX
   ============================================ */
const matrixCanvas = document.getElementById('matrixCanvas');
const mCtx = matrixCanvas.getContext('2d');
let matrixRAF;

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン01❤♥♡💚💙♥️💜🖤💛💚';

function initMatrix() {
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;

  const fontSize = 16;
  const cols = Math.floor(matrixCanvas.width / fontSize);
  const drops = Array(cols).fill(1).map(() => randInt(0, matrixCanvas.height / fontSize));

  function drawMatrix() {
    mCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

    drops.forEach((y, i) => {
      const char = CHARS[randInt(0, CHARS.length)];
      const brightness = Math.random();
      if (brightness > 0.95) {
        mCtx.fillStyle = '#fff';
      } else if (brightness > 0.7) {
        mCtx.fillStyle = '#ff3fa4';
      } else {
        mCtx.fillStyle = `hsl(${330 + rand(-20, 20)}, 100%, ${40 + rand(0, 30)}%)`;
      }
      mCtx.font = `${fontSize}px monospace`;
      mCtx.fillText(char, i * fontSize, y * fontSize);

      drops[i] = (y * fontSize > matrixCanvas.height && Math.random() > 0.975) ? 0 : y + 1;
    });

    matrixRAF = requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
}

/* Typewriter sequence for phase 1 */
const phase1Text = document.getElementById('phase1Text');
const SEQUENCE = [
  { text: '1', delay: 0 },
  { text: '1 > 2', delay: 2500 },
  { text: '1 > 2 > 3', delay: 5000 },
  { text: 'I Love You 💕', delay: 7500 },
];

let typewriterTimeout;

function runPhase1Sequence() {
  SEQUENCE.forEach(({ text, delay }) => {
    setTimeout(() => {
      phase1Text.textContent = text;
      if (text.includes('I Love You')) {
        phase1Text.style.fontSize = 'clamp(3rem, 10vw, 7rem)';
        phase1Text.style.color = '#fff';
      }
    }, delay);
  });

  // Transition to phase 2 after ~10s
  setTimeout(() => {
    cancelAnimationFrame(matrixRAF);
    startPhase2();
  }, 10000);
}

/* ============================================
   PHASE 2 — FLOATING HEARTS, STARS, FIREWORKS, PHOTOS
   ============================================ */
const floatLayer = document.getElementById('floatLayer');
const fwCanvas = document.getElementById('fireworksCanvas');
const fwCtx = fwCanvas.getContext('2d');

const FLOAT_EMOJIS = ['💕', '💖', '💗', '💓', '💞', '💝', '❤️', '🌸', '✨', '⭐', '🌟', '💫', '🌺'];

let floatInterval, fireworkInterval2, floatItems = [];

function spawnFloat(layer, emojis, count = 30) {
  const el = document.createElement('div');
  el.className = 'float-item';
  el.textContent = pick(emojis);
  el.style.left = rand(0, 100) + 'vw';
  el.style.fontSize = rand(1, 3) + 'rem';
  const dur = rand(4, 10);
  el.style.animationDuration = dur + 's';
  el.style.animationDelay = rand(0, 2) + 's';
  layer.appendChild(el);
  floatItems.push(el);
  setTimeout(() => el.remove(), (dur + 2) * 1000);
}

/* Fireworks */
let particles = [];

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2, 10);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.radius = rand(2, 5);
    this.gravity = 0.15;
    this.decay = rand(0.012, 0.025);
    this.trail = [];
  }
  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
    if (this.trail.length > 6) this.trail.shift();
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }
  draw(ctx) {
    this.trail.forEach((t, i) => {
      ctx.beginPath();
      ctx.arc(t.x, t.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace('1)', `${(i / this.trail.length) * t.alpha * 0.5})`);
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color.replace('1)', `${this.alpha})`);
    ctx.fill();
  }
}

function explodeFirework(canvas, ctx, x, y) {
  const PINK_COLORS = [
    `rgba(255, 63, 164, 1)`,
    `rgba(255, 0, 110, 1)`,
    `rgba(255, 179, 217, 1)`,
    `rgba(255, 215, 0, 1)`,
    `rgba(255, 255, 255, 1)`,
    `rgba(201, 0, 90, 1)`,
  ];
  const color = pick(PINK_COLORS);
  const count = randInt(60, 120);
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function initFireworksCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function fireworksLoop(ctx, canvas) {
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => { p.update(); p.draw(ctx); });
  return requestAnimationFrame(() => fireworksLoop(ctx, canvas));
}

function startPhase2() {
  showPhase(1);

  initFireworksCanvas(fwCanvas);
  const fwRAF2 = fireworksLoop(fwCtx, fwCanvas);

  // Spawn floaties
  floatInterval = setInterval(() => {
    spawnFloat(floatLayer, FLOAT_EMOJIS);
  }, 300);

  // Fireworks every ~1.2s
  fireworkInterval2 = setInterval(() => {
    const x = rand(fwCanvas.width * 0.1, fwCanvas.width * 0.9);
    const y = rand(fwCanvas.height * 0.1, fwCanvas.height * 0.6);
    explodeFirework(fwCanvas, fwCtx, x, y);
  }, 1200);

  // Multiple bursts on start
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const x = rand(fwCanvas.width * 0.2, fwCanvas.width * 0.8);
      const y = rand(fwCanvas.height * 0.1, fwCanvas.height * 0.5);
      explodeFirework(fwCanvas, fwCtx, x, y);
    }, i * 400);
  }

  // Transition to phase 3 after 35 more seconds (45s total)
  setTimeout(() => {
    clearInterval(floatInterval);
    clearInterval(fireworkInterval2);
    cancelAnimationFrame(fwRAF2);
    startPhase3();
  }, 35000);
}

/* ============================================
   PHASE 3 — YOU ARE THE BEST
   ============================================ */
const finalCanvas = document.getElementById('finalFireworks');
const finalCtx = finalCanvas.getContext('2d');
const finalFloat = document.getElementById('finalFloat');

function startPhase3() {
  showPhase(2);

  initFireworksCanvas(finalCanvas);
  const fwRAF3 = fireworksLoop(finalCtx, finalCanvas);

  // Big burst on entry
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const x = rand(finalCanvas.width * 0.1, finalCanvas.width * 0.9);
      const y = rand(finalCanvas.height * 0.05, finalCanvas.height * 0.6);
      explodeFirework(finalCanvas, finalCtx, x, y);
    }, i * 300);
  }

  // Continuous fireworks
  setInterval(() => {
    const x = rand(finalCanvas.width * 0.05, finalCanvas.width * 0.95);
    const y = rand(finalCanvas.height * 0.05, finalCanvas.height * 0.55);
    explodeFirework(finalCanvas, finalCtx, x, y);
  }, 800);

  // Dense floaties
  setInterval(() => {
    spawnFloat(finalFloat, FLOAT_EMOJIS, 1);
  }, 150);
}

/* ============================================
   RESIZE HANDLER
   ============================================ */
window.addEventListener('resize', () => {
  matrixCanvas.width = window.innerWidth;
  matrixCanvas.height = window.innerHeight;
  fwCanvas.width = window.innerWidth;
  fwCanvas.height = window.innerHeight;
  finalCanvas.width = window.innerWidth;
  finalCanvas.height = window.innerHeight;
});

/* ============================================
   BOOT
   ============================================ */
window.addEventListener('load', () => {
  showPhase(0);
  initMatrix();
  runPhase1Sequence();
});
