(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs('.nav-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var lists = qsa('.js-movie-list');
    lists.forEach(function (list) {
      var scope = list.closest('.js-filter-scope') || document;
      var input = qs('.js-filter-input', scope);
      var select = qs('.js-sort-select', scope);
      var empty = qs('.empty-state', scope);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (input && query && !input.value) {
        input.value = query;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var cards = qsa('.movie-card', list);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-category') || ''
          ].join(' ').toLowerCase();
          var matched = !keyword || haystack.indexOf(keyword) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      function sortCards() {
        if (!select) {
          apply();
          return;
        }
        var mode = select.value;
        var cards = qsa('.movie-card', list);
        cards.sort(function (a, b) {
          if (mode === 'year') {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          }
          if (mode === 'views') {
            return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
          }
          if (mode === 'rating') {
            return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
          }
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
        apply();
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', sortCards);
      }
      sortCards();
    });
  }

  function attachHls(video, stream) {
    if (video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      video._hls = hls;
    } else {
      video.src = stream;
    }
  }

  function initPlayer() {
    var boxes = qsa('[data-player]');
    boxes.forEach(function (box) {
      var video = qs('video', box);
      var cover = qs('.player-cover', box);
      var button = qs('.player-start', box);
      var status = qs('.player-status', box);
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      function startPlayback() {
        attachHls(video, stream);
        video.controls = true;
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (status) {
          status.textContent = '正在播放';
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (status) {
              status.textContent = '点击视频继续播放';
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }
      if (cover) {
        cover.addEventListener('click', startPlayback);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayer();
  });
}());
