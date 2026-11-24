// Bong bóng nền
(function () {
  var b = document.getElementById("bubbles");
  for (var i = 0; i < 22; i++) {
    var e = document.createElement("i"), s = 10 + Math.random() * 50;
    e.style.cssText = "left:" + Math.random() * 100 + "%;width:" + s + "px;height:" + s + "px;animation-duration:" + (8 + Math.random() * 14) + "s;animation-delay:" + Math.random() * 10 + "s";
    b.appendChild(e);
  }
})();

// Hiệu ứng gõ chữ
(function () {
  var t = ["Xin chào, mình là Thịnh 👋", "Học sinh lớp 12A10 📚", "Chào mừng bạn đến trang của mình ✨"], i = 0, j = 0, del = false, el = document.getElementById("typing");
  function tick() {
    var s = t[i]; el.textContent = s.slice(0, j);
    if (!del && j < s.length) { j++; setTimeout(tick, 90); }
    else if (!del) { del = true; setTimeout(tick, 1400); }
    else if (j > 0) { j--; setTimeout(tick, 40); }
    else { del = false; i = (i + 1) % t.length; setTimeout(tick, 300); }
  }
  tick();
})();

// Hiện thẻ khi cuộn
(function () {
  var c = document.querySelectorAll(".card");
  if (!("IntersectionObserver" in window)) { c.forEach(function (x) { x.classList.add("show"); }); return; }
  var o = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("show"); o.unobserve(e.target); } });
  }, { threshold: .15 });
  c.forEach(function (x, k) { x.style.transitionDelay = (k % 3) * .12 + "s"; o.observe(x); });
})();

// ===== NHẠC NỀN =====
// Ưu tiên phát file music/nhac.mp3. Nếu chưa có file, tự phát giai điệu dự phòng.
var bgm = document.getElementById("bgm");
var musicBtn = document.getElementById("music");
var playing = false, useSynth = false;
var ctx = null, master = null, timer = null, step = 0;
var notes = [261.63,329.63,392.00,523.25,392.00,329.63,293.66,349.23,440.00,587.33,440.00,349.23,246.94,311.13,392.00,493.88,392.00,311.13,261.63,329.63,392.00,659.25,523.25,392.00];

function beep(f, t, d, type, v) {
  var o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
}
function schedule() {
  var t = ctx.currentTime + .05;
  for (var k = 0; k < 4; k++) {
    var n = notes[step % notes.length];
    beep(n, t + k * .28, .9, "triangle", .18);
    if (step % 4 === 0 && k === 0) beep(n / 2, t, 1.6, "sine", .2);
    step++;
  }
}
function startSynth() {
  try {
    if (!ctx) { var AC = window.AudioContext || window.webkitAudioContext; ctx = new AC(); master = ctx.createGain(); master.gain.value = .5; master.connect(ctx.destination); }
    if (ctx.state === "suspended") ctx.resume();
    if (timer) clearInterval(timer);
    schedule(); timer = setInterval(schedule, 1120);
    useSynth = true; setOn(true);
  } catch (e) {}
}
function setOn(v) { playing = v; musicBtn.classList.toggle("on", v); }

function startMusic() {
  if (useSynth) { startSynth(); return; }
  var p = bgm.play();
  if (p && p.then) {
    p.then(function () { setOn(true); }).catch(function (err) {
      // Trình duyệt chặn tự phát -> chờ người xem chạm vào trang lần đầu
      if (err && err.name === "NotAllowedError") waitForTouch();
      else startSynth(); // chưa có file mp3 -> phát giai điệu dự phòng
    });
  } else { setOn(true); }
}
function stopMusic() {
  if (useSynth) { if (timer) clearInterval(timer); timer = null; }
  else bgm.pause();
  setOn(false);
}
bgm.addEventListener("error", function () { if (!useSynth) startSynth(); });

var waiting = false;
function waitForTouch() {
  if (waiting) return; waiting = true;
  function go(e) {
    if (e.target.closest && e.target.closest("#music")) return;
    ["pointerdown", "keydown", "touchstart", "wheel"].forEach(function (n) { window.removeEventListener(n, go); });
    waiting = false;
    if (!playing) startMusic();
  }
  ["pointerdown", "keydown", "touchstart", "wheel"].forEach(function (n) { window.addEventListener(n, go, { passive: true }); });
}

musicBtn.onclick = function () { playing ? stopMusic() : startMusic(); };
// Mở trang là thử phát nhạc ngay; nếu bị chặn thì phát ở lần chạm đầu tiên
startMusic();
