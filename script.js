const PHRASES = [
  "Прости, пожалуйста", "Please forgive me", "Perdóname, por favor",
  "Pardonne-moi, s'il te plaît", "Bitte verzeih mir", "Perdonami, per favore",
  "Por favor, perdoa-me", "请原谅我", "お願い、許して", "제발 용서해 줘",
  "من فضلك سامحني", "कृपया मुझे माफ़ कर दो", "Lütfen beni affet",
  "Proszę, wybacz mi", "Förlåt mig, snälla", "Anteeksi, ole kiltti",
  "Συγχώρεσέ με, σε παρακαλώ", "סלח לי, בבקשה", "Xin hãy tha lỗi cho mình",
  "Tolong maafkan aku", "Te rog, iartă-mă", "Пробач, будь ласка",
  "Odpusť mi, prosím", "Bocsáss meg, kérlek", "Tilgiv mig, vær så venlig",
  "Vergeef me alsjeblieft", "ได้โปรดยกโทษให้ฉัน", "Prašau, atleisk man",
  "Lūdzu, piedod man", "Tafadhali nisamehe"
];

const heart = document.getElementById("heart");
const hint = document.getElementById("hint");
let timers = [], words = [];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Точки сердца, равномерно по длине кривой
function heartRing(count, scale, W, H) {
  const dense = 1500, pts = [];
  for (let i = 0; i <= dense; i++) {
    const t = (i / dense) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push([x, y]);
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = cum[cum.length - 1];
  const R = Math.min(W / 38, H / 36);
  const out = [];
  for (let k = 0; k < count; k++) {
    const target = (k / count) * total;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const [x, y] = pts[i];
    const [px, py] = pts[Math.max(0, i - 3)];
    const [nx, ny] = pts[Math.min(pts.length - 1, i + 3)];
    let ang = Math.atan2(ny - py, nx - px) * 180 / Math.PI;
    if (ang > 90) ang -= 180;
    if (ang < -90) ang += 180;
    out.push({
      x: W / 2 + x * R * scale,
      y: H / 2 + (y + 2.5) * R * scale,
      ang
    });
  }
  return { points: out, perimeter: total * R * scale };
}

function layout(counts) {
  const W = innerWidth, H = innerHeight;
  const fs = Math.max(9, Math.min(16, Math.min(W / 38, H / 36) * 0.62));
  const scales = [1, 0.7, 0.42];
  let all = [];
  scales.forEach((s, ri) => {
    const n = counts ? counts[ri] : Math.max(6, Math.round(heartRing(10, s, W, H).perimeter / (fs * 10)));
    all.push({ n, ring: heartRing(n, s, W, H).points });
  });
  return { fs, rings: all };
}

let counts = null;

function place(animate) {
  const L = layout(counts);
  if (!counts) counts = L.rings.map(r => r.n);
  const flat = L.rings.flatMap(r => r.ring);
  return { fs: L.fs, flat };
}

function run() {
  timers.forEach(clearTimeout); timers = [];
  heart.innerHTML = ""; heart.classList.remove("beat");
  hint.classList.remove("show");
  counts = null;

  const { fs, flat } = place();
  const total = flat.length;
  let list = [];
  while (list.length < total) list = list.concat(shuffle(PHRASES.slice()));
  list = list.slice(0, total);

  words = list.map((text, i) => {
    const el = document.createElement("span");
    el.className = "w";
    el.textContent = text;
    el.style.fontSize = fs + "px";
    el.style.color = `hsl(${335 + Math.random() * 30}, ${70 + Math.random() * 25}%, ${68 + Math.random() * 22}%)`;
    heart.appendChild(el);
    return el;
  });

  const step = Math.min(160, 11000 / total);
  words.forEach((el, i) => {
    timers.push(setTimeout(() => {
      el.style.fontSize = (fs * 2.2) + "px";
      el.classList.add("in");
    }, i * step));
    timers.push(setTimeout(() => {
      const p = place().flat[i];
      el.style.fontSize = fs + "px";
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
      el.style.transform = `translate(-50%, -50%) rotate(${p.ang}deg) scale(1)`;
    }, i * step + 650));
  });

  timers.push(setTimeout(() => {
    heart.classList.add("beat");
    hint.classList.add("show");
  }, total * step + 2200));
}

let rz;
addEventListener("resize", () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    if (!heart.classList.contains("beat")) return;
    const { fs, flat } = place();
    words.forEach((el, i) => {
      const p = flat[i]; if (!p) return;
      el.style.fontSize = fs + "px";
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
      el.style.transform = `translate(-50%, -50%) rotate(${p.ang}deg) scale(1)`;
    });
  }, 150);
});
hint.addEventListener("click", run);
run();
