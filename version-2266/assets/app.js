(function () {
  var remoteLoading = false;
  var remoteReadyCallbacks = [];

  function each(selector, root, callback) {
    Array.prototype.forEach.call((root || document).querySelectorAll(selector), callback);
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var box = document.querySelector('[data-hero-carousel]');
    if (!box) {
      return;
    }
    var slides = Array.prototype.slice.call(box.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(box.querySelectorAll('[data-hero-dot]'));
    var prev = box.querySelector('[data-hero-prev]');
    var next = box.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function auto() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        auto();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        auto();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        auto();
      });
    }
    show(0);
    auto();
  }

  function initFilters() {
    each('[data-filter-panel]', document, function (panel) {
      var scope = panel.parentElement ? panel.parentElement.parentElement : document;
      var input = panel.querySelector('[data-search-input]');
      var year = panel.querySelector('[data-year-filter]');
      var genre = panel.querySelector('[data-genre-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedGenre = genre ? genre.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-text') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardGenre = card.getAttribute('data-genre') || '';
          var okQuery = !query || text.indexOf(query) !== -1;
          var okYear = !selectedYear || cardYear === selectedYear;
          var okGenre = !selectedGenre || cardGenre.indexOf(selectedGenre) !== -1 || text.indexOf(selectedGenre.toLowerCase()) !== -1;
          card.classList.toggle('is-filtered-out', !(okQuery && okYear && okGenre));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (genre) {
        genre.addEventListener('change', apply);
      }
    });
  }

  function loadRemoteHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    remoteReadyCallbacks.push(callback);
    if (remoteLoading) {
      return;
    }
    remoteLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.onload = function () {
      remoteReadyCallbacks.splice(0).forEach(function (ready) {
        ready();
      });
    };
    document.head.appendChild(script);
  }

  function initPlayer() {
    each('[data-player]', document, function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var url = box.getAttribute('data-src');
      var hlsInstance = null;
      var prepared = false;

      function attachAndPlay() {
        if (!video || !url) {
          return;
        }
        if (prepared) {
          video.play().catch(function () {});
          if (button) {
            button.classList.add('is-hidden');
          }
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          prepared = true;
          video.play().catch(function () {});
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          prepared = true;
          video.play().catch(function () {});
        } else {
          loadRemoteHls(attachAndPlay);
          return;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
      }

      if (button) {
        button.addEventListener('click', attachAndPlay);
      }
      if (video) {
        video.addEventListener('click', attachAndPlay);
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('is-hidden');
          }
        });
      }
    });
  }

  window.addEventListener('hlsready', function () {});
  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
