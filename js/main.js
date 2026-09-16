(function () {
  "use strict";

  /* Theme toggle, persisted */
  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored) root.setAttribute("data-theme", stored);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      if (next === "dark") {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "light");
      }
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* Mobile menu */
  var burger = document.getElementById("nav-burger");
  var mobileMenu = document.getElementById("mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Active nav link on scroll */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-links a");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navIo.observe(s); });
  }

  /* Role typing cycle */
  var roleEl = document.getElementById("hero-role-text");
  var roles = ["Senior Data Engineer", "SQL Developer", "Backend Developer", "Big Data Specialist"];
  if (roleEl) {
    var roleIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var word = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = word.slice(0, charIndex);
        if (charIndex === word.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 40 : 70);
    }
    tick();
  }

  /* Easter egg: click the photo 5 times for a game of Snake */
  var photoBtn = document.getElementById("hero-photo-btn");
  var overlay = document.getElementById("game-overlay");
  var closeBtn = document.getElementById("game-close");
  if (photoBtn && overlay) {
    var clicks = 0, clickTimer = null;
    photoBtn.addEventListener("click", function () {
      clicks++;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { clicks = 0; }, 1200);
      if (clicks >= 5) {
        clicks = 0;
        overlay.classList.add("open");
        Snake.start();
      }
    });
    closeBtn.addEventListener("click", closeGame);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeGame();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeGame();
    });
  }
  function closeGame() {
    overlay.classList.remove("open");
    Snake.stop();
  }
})();

/* Tiny self-contained Snake game for the click-5-times easter egg */
var Snake = (function () {
  var canvas = document.getElementById("game-canvas");
  if (!canvas) return { start: function () {}, stop: function () {} };
  var ctx = canvas.getContext("2d");
  var scoreEl = document.getElementById("game-score");
  var bestEl = document.getElementById("game-best");
  var cols = 15, cellSize, snake, dir, nextDir, food, score, best, loop, dead;

  try { best = parseInt(localStorage.getItem("snakeBest") || "0", 10); } catch (e) { best = 0; }
  if (bestEl) bestEl.textContent = best;

  function reset() {
    cellSize = canvas.width / cols;
    snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    dead = false;
    placeFood();
    if (scoreEl) scoreEl.textContent = score;
  }

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * cols) };
    } while (snake.some(function (s) { return s.x === food.x && s.y === food.y; }));
  }

  function step() {
    if (dead) return;
    dir = nextDir;
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= cols ||
      snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
      dead = true;
      if (score > best) {
        best = score;
        if (bestEl) bestEl.textContent = best;
        try { localStorage.setItem("snakeBest", String(best)); } catch (e) {}
      }
      draw();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      if (scoreEl) scoreEl.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    var styles = getComputedStyle(document.documentElement);
    ctx.fillStyle = styles.getPropertyValue("--bg-soft") || "#10131f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = styles.getPropertyValue("--accent-2") || "#ff5fa2";
    ctx.fillRect(food.x * cellSize + 2, food.y * cellSize + 2, cellSize - 4, cellSize - 4);

    snake.forEach(function (s, i) {
      ctx.fillStyle = i === 0 ? (styles.getPropertyValue("--accent-3") || "#34e6d3") : (styles.getPropertyValue("--accent-1") || "#7c6bff");
      ctx.fillRect(s.x * cellSize + 1, s.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });

    if (dead) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "600 15px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Game over — click to retry", canvas.width / 2, canvas.height / 2);
    }
  }

  function setDir(x, y) {
    if (dir.x === -x && dir.y === -y) return;
    nextDir = { x: x, y: y };
  }

  function onKey(e) {
    var map = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
    };
    if (map[e.key]) {
      e.preventDefault();
      setDir(map[e.key][0], map[e.key][1]);
    }
  }

  var touchStart = null;
  function onTouchStart(e) { touchStart = e.touches[0]; }
  function onTouchEnd(e) {
    if (!touchStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStart.clientX;
    var dy = t.clientY - touchStart.clientY;
    if (Math.abs(dx) > Math.abs(dy)) {
      setDir(dx > 0 ? 1 : -1, 0);
    } else {
      setDir(0, dy > 0 ? 1 : -1);
    }
    touchStart = null;
  }

  function onCanvasClick() {
    if (dead) { reset(); draw(); }
  }

  return {
    start: function () {
      reset();
      draw();
      document.addEventListener("keydown", onKey);
      canvas.addEventListener("touchstart", onTouchStart);
      canvas.addEventListener("touchend", onTouchEnd);
      canvas.addEventListener("click", onCanvasClick);
      loop = setInterval(step, 140);
    },
    stop: function () {
      clearInterval(loop);
      document.removeEventListener("keydown", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("click", onCanvasClick);
    }
  };
})();
