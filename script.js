/* =============================================
   TIMELINE
   0-1s  : "3" besar
   1-2s  : "2" besar
   2-3s  : "1" besar
   3-10s : "I Love You" + rain terus
   10s+  : Phase 2 — heart slideshow + fireworks
   45s+  : Phase 3 — You Are The Best
   ============================================= */

const rand  = (a,b) => Math.random()*(b-a)+a;
const randI = (a,b) => Math.floor(rand(a,b));
const pick  = a => a[randI(0,a.length)];

/* ── PHASES ── */
const p1 = document.getElementById('phase1');
const p2 = document.getElementById('phase2');
const p3 = document.getElementById('phase3');
function showPhase(n){
  [p1,p2,p3].forEach((p,i)=>{
    p.classList.remove('active');
    if(i===n) p.classList.add('active');
  });
}

/* ============================================
   PHASE 1 — LOVE / STAR / FIREWORK RAIN
   ============================================ */
const rainCanvas = document.getElementById('rainCanvas');
const rCtx = rainCanvas.getContext('2d');

const RAIN_CHARS = ['❤','💕','💖','💗','💓','✨','⭐','🌟','💫','★','♥','✦','☆','*','·'];

let rainDrops = [];
let rainRAF;

function initRain(){
  rainCanvas.width  = window.innerWidth;
  rainCanvas.height = window.innerHeight;
  const cols = Math.floor(rainCanvas.width / 22);
  rainDrops = Array.from({length:cols},()=>({
    y: rand(0, rainCanvas.height/22),
    speed: rand(0.3, 1.2),
    col: 0,
  }));
  rainDrops.forEach((d,i)=>{ d.col = i; d.y = rand(-20,0); });
}

function drawRain(){
  rCtx.fillStyle = 'rgba(0,0,0,0.06)';
  rCtx.fillRect(0,0,rainCanvas.width,rainCanvas.height);

  rainDrops.forEach(d=>{
    const ch = RAIN_CHARS[randI(0,RAIN_CHARS.length)];
    const bright = Math.random();
    if(bright > 0.93)      rCtx.fillStyle = '#fff';
    else if(bright > 0.65) rCtx.fillStyle = '#ff3fa4';
    else                   rCtx.fillStyle = `hsl(${330+rand(-25,25)},100%,${45+rand(0,25)}%)`;
    rCtx.font = `${16+rand(0,8)}px monospace`;
    rCtx.fillText(ch, d.col*22, d.y*22);
    d.y += d.speed;
    if(d.y*22 > rainCanvas.height && Math.random()>.975) d.y = 0;
  });
  rainRAF = requestAnimationFrame(drawRain);
}

/* Countdown */
const cdEl = document.getElementById('countdown');
function runCountdown(){
  const steps = ['3','2','1','I Love You 💕'];
  let i = 0;
  function next(){
    if(i >= steps.length){ return; }
    cdEl.style.opacity = '0';
    setTimeout(()=>{
      cdEl.textContent = steps[i];
      if(i===3){
        cdEl.style.fontSize = 'clamp(3rem,12vw,8rem)';
        cdEl.style.letterSpacing = '0.02em';
      }
      cdEl.style.opacity = '1';
      i++;
      if(i < steps.length) setTimeout(next, 1000);
    },250);
  }
  next();
  // to phase 2 after 10s
  setTimeout(()=>{
    cancelAnimationFrame(rainRAF);
    startPhase2();
  }, 10000);
}

/* ============================================
   FIREWORKS ENGINE (shared)
   ============================================ */
const PCOLORS = ['rgba(255,63,164,1)','rgba(255,0,110,1)','rgba(255,179,217,1)',
                 'rgba(255,215,0,1)','rgba(255,255,255,1)','rgba(201,0,90,1)',
                 'rgba(255,105,180,1)'];

let particles = [];

class Particle{
  constructor(x,y,color){
    this.x=x; this.y=y; this.color=color;
    const a=rand(0,Math.PI*2), s=rand(2,11);
    this.vx=Math.cos(a)*s; this.vy=Math.sin(a)*s;
    this.alpha=1; this.r=rand(2,5);
    this.grav=0.14; this.decay=rand(.012,.026);
    this.trail=[];
  }
  update(){
    this.trail.push({x:this.x,y:this.y,a:this.alpha});
    if(this.trail.length>5) this.trail.shift();
    this.vy+=this.grav; this.x+=this.vx; this.y+=this.vy;
    this.alpha-=this.decay;
  }
  draw(ctx){
    this.trail.forEach((t,i)=>{
      ctx.beginPath();ctx.arc(t.x,t.y,this.r*.4,0,Math.PI*2);
      ctx.fillStyle=this.color.replace('1)',`${(i/this.trail.length)*t.a*.4})`);ctx.fill();
    });
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle=this.color.replace('1)',`${this.alpha})`);ctx.fill();
  }
}

function burst(ctx,canvas,x,y){
  const c=pick(PCOLORS);
  for(let i=0;i<randI(60,120);i++) particles.push(new Particle(x,y,c));
}

function fwLoop(ctx,canvas){
  ctx.fillStyle='rgba(0,0,0,0.14)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  particles=particles.filter(p=>p.alpha>0);
  particles.forEach(p=>{p.update();p.draw(ctx);});
  return requestAnimationFrame(()=>fwLoop(ctx,canvas));
}

/* ============================================
   FLOATING EMOJIS
   ============================================ */
const EMOJIS=['💕','💖','💗','💓','💞','💝','❤️','🌸','✨','⭐','🌟','💫','🌺','🎆','🎇'];

function spawnFloat(layer){
  const el=document.createElement('div');
  el.className='float-item';
  el.textContent=pick(EMOJIS);
  el.style.left=rand(0,100)+'vw';
  el.style.fontSize=rand(.9,2.8)+'rem';
  const dur=rand(4,10);
  el.style.animationDuration=dur+'s';
  el.style.animationDelay=rand(0,1.5)+'s';
  layer.appendChild(el);
  setTimeout(()=>el.remove(),(dur+2)*1000);
}

/* ============================================
   PHASE 2 — HEART SLIDESHOW
   ============================================ */
const fwCanvas = document.getElementById('fwCanvas');
const fwCtx    = fwCanvas.getContext('2d');
const floatL2  = document.getElementById('floatLayer2');
const photos   = document.querySelectorAll('.heart-photo');
let curPhoto = 0;

function nextPhoto(){
  photos[curPhoto].classList.remove('active');
  curPhoto=(curPhoto+1)%photos.length;
  photos[curPhoto].classList.add('active');
}

function startPhase2(){
  showPhase(1);
  fwCanvas.width=window.innerWidth; fwCanvas.height=window.innerHeight;
  fwLoop(fwCtx,fwCanvas);

  // initial burst
  for(let i=0;i<6;i++) setTimeout(()=>burst(fwCtx,fwCanvas,rand(fwCanvas.width*.1,fwCanvas.width*.9),rand(fwCanvas.height*.1,fwCanvas.height*.55)),i*350);

  // ongoing fireworks
  setInterval(()=>burst(fwCtx,fwCanvas,rand(fwCanvas.width*.05,fwCanvas.width*.95),rand(fwCanvas.height*.05,fwCanvas.height*.55)),1100);

  // floaties
  setInterval(()=>spawnFloat(floatL2),250);

  // photo slideshow every 2.5s
  setInterval(nextPhoto,2500);

  // to phase 3 after 35s
  setTimeout(startPhase3, 35000);
}

/* ============================================
   PHASE 3 — YOU ARE THE BEST
   ============================================ */
const finalCanvas = document.getElementById('finalCanvas');
const finalCtx    = finalCanvas.getContext('2d');
const floatL3     = document.getElementById('floatLayer3');

function startPhase3(){
  showPhase(2);
  finalCanvas.width=window.innerWidth; finalCanvas.height=window.innerHeight;
  fwLoop(finalCtx,finalCanvas);

  for(let i=0;i<10;i++) setTimeout(()=>burst(finalCtx,finalCanvas,rand(finalCanvas.width*.1,finalCanvas.width*.9),rand(finalCanvas.height*.05,finalCanvas.height*.6)),i*280);
  setInterval(()=>burst(finalCtx,finalCanvas,rand(finalCanvas.width*.05,finalCanvas.width*.95),rand(finalCanvas.height*.05,finalCanvas.height*.55)),750);
  setInterval(()=>spawnFloat(floatL3),130);
}

/* ============================================
   RESIZE
   ============================================ */
window.addEventListener('resize',()=>{
  rainCanvas.width=window.innerWidth; rainCanvas.height=window.innerHeight;
  fwCanvas.width=window.innerWidth;   fwCanvas.height=window.innerHeight;
  finalCanvas.width=window.innerWidth;finalCanvas.height=window.innerHeight;
  initRain();
});

/* ── BOOT ── */
window.addEventListener('load',()=>{
  showPhase(0);
  initRain();
  drawRain();
  runCountdown();
});
