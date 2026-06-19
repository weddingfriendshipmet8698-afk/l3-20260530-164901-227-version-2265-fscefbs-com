
(function () {
  const prefix = window.SITE_PREFIX || "";
  const movies = window.MOVIES || [];

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function normalize(text) {
    return (text || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "");
  }

  function joinMeta(movie) {
    return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.one]
      .join(" ")
      .toLowerCase();
  }

  function bindMenu() {
    const btn = qs("[data-menu-toggle]");
    const nav = qs("[data-nav]");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function bindSearchForms() {
    qsa("[data-search-form]").forEach((form) => {
      const input = qs("[data-search-input]", form);
      if (!input) return;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const keyword = input.value.trim();
        window.location.href = `${prefix}search.html?q=${encodeURIComponent(keyword)}`;
      });
    });
  }

  function initHeroCarousel() {
    const root = qs("[data-hero-carousel]");
    if (!root) return;
    const slides = qsa("[data-hero-slide]", root);
    const dots = qsa("[data-hero-dot]", root);
    if (!slides.length) return;
    let index = 0;
    let timer = null;

    function setActive(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function start() {
      if (slides.length <= 1) return;
      timer = window.setInterval(() => setActive(index + 1), 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        stop();
        setActive(i);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    setActive(0);
    start();
  }

  function bindPageFilter() {
    const input = qs("[data-filter-input]");
    const grid = qs("[data-filter-grid]");
    if (!input || !grid) return;
    const cards = qsa("[data-filter-card]", grid);
    const empty = qs("[data-filter-empty]", grid);

    function apply() {
      const keyword = normalize(input.value);
      let shown = 0;
      cards.forEach((card) => {
        const text = normalize(card.getAttribute("data-filter-text") || card.textContent);
        const visible = !keyword || text.includes(keyword);
        card.style.display = visible ? "" : "none";
        if (visible) shown += 1;
      });
      if (empty) {
        empty.style.display = shown ? "none" : "";
      }
    }

    input.addEventListener("input", apply);
    apply();
  }

  function initSearchPage() {
    const root = qs("[data-search-page]");
    if (!root || !Array.isArray(movies)) return;
    const input = qs("[data-search-input]", root);
    const results = qs("[data-search-results]", root);
    const count = qs("[data-search-count]", root);
    const queryHint = qs("[data-search-hint]", root);

    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim();
    if (input) input.value = q;

    function render(list) {
      if (!results) return;
      results.innerHTML = "";
      if (!list.length) {
        results.innerHTML = `
          <div class="empty-state">
            <h3>没有找到匹配影片</h3>
            <p>请尝试更换关键词，或者直接浏览分类页。</p>
          </div>
        `;
        if (count) count.textContent = "0";
        return;
      }

      const html = list.slice(0, 120).map((movie) => `
        <a class="movie-card" href="${movie.path}">
          <div class="movie-poster">
            <img src="${prefix}${movie.poster}" alt="${movie.title}">
          </div>
          <div class="movie-body">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-meta">
              <span class="badge">${movie.year}</span>
              <span class="badge">${movie.region}</span>
              <span class="badge">${movie.type}</span>
            </div>
            <div class="movie-excerpt">${movie.one}</div>
          </div>
        </a>
      `).join("");

      results.innerHTML = html;
      if (count) count.textContent = String(list.length);
    }

    function run() {
      const keyword = normalize(input ? input.value : q);
      const list = !keyword ? movies.slice().sort((a, b) => b.year - a.year) : movies.filter((movie) => normalize(joinMeta(movie)).includes(keyword));
      if (queryHint) {
        queryHint.textContent = keyword ? `“${keyword}” 的搜索结果` : "输入任意片名、地区、类型、标签即可搜索";
      }
      render(list);
    }

    if (input) {
      input.addEventListener("input", run);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          run();
        }
      });
    }
    run();
  }

  function initPlayer() {
    const stage = qs("[data-player-stage]");
    if (!stage) return;
    const video = qs("video", stage);
    const btn = qs("[data-play-toggle]", stage);
    if (!video || !btn) return;

    const src = video.getAttribute("data-stream") || video.querySelector("source")?.getAttribute("src") || "";
    const poster = video.getAttribute("poster") || "";
    if (poster) stage.style.backgroundImage = `url(${poster})`;

    async function ensureHls() {
      if (!src || !/\.m3u8(\?|$)/i.test(src)) return false;
      if (window.Hls) return true;
      await new Promise((resolve) => {
        const existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        script.async = true;
        script.dataset.hlsLoader = "1";
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
      return !!window.Hls;
    }

    async function attachSource() {
      if (/\.m3u8(\?|$)/i.test(src)) {
        const ready = await ensureHls();
        if (ready && window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          return;
        }
      }
      if (src) {
        video.src = src;
      }
    }

    function syncState() {
      stage.classList.toggle("is-paused", video.paused || video.ended);
      btn.innerHTML = video.paused || video.ended
        ? '<span>▶</span><span>点击播放</span>'
        : '<span>❚❚</span><span>暂停播放</span>';
    }

    btn.addEventListener("click", async () => {
      await attachSource();
      if (video.paused || video.ended) {
        try {
          await video.play();
        } catch (err) {
          console.warn(err);
        }
      } else {
        video.pause();
      }
      syncState();
    });

    video.addEventListener("play", syncState);
    video.addEventListener("pause", syncState);
    video.addEventListener("ended", syncState);
    attachSource().then(syncState);
    syncState();
  }

  function initCards() {
    qsa("[data-href]").forEach((el) => {
      el.addEventListener("click", () => {
        window.location.href = el.getAttribute("data-href");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindMenu();
    bindSearchForms();
    initHeroCarousel();
    bindPageFilter();
    initSearchPage();
    initPlayer();
    initCards();
  });
})();
