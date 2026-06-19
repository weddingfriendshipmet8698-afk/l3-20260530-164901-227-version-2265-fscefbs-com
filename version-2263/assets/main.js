(function () {
  function initMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('#navMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) return;
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function initCategoryFilters() {
    var grid = document.querySelector('#categoryMovieGrid');
    if (!grid) return;
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var year = button.getAttribute('data-year-filter');
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        cards.forEach(function (card) {
          var matched = year === 'all' || card.getAttribute('data-year') === year;
          card.style.display = matched ? '' : 'none';
        });
      });
    });
  }

  function initSearch() {
    var results = document.querySelector('#searchResults');
    if (!results || !window.MOVIE_DATA) return;
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.querySelector('#searchInput');
    var summary = document.querySelector('#searchSummary');
    if (input) input.value = q;
    if (!q) return;

    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.MOVIE_DATA.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(' '), movie.one_line].join(' ').toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    }).slice(0, 240);

    if (summary) {
      summary.textContent = '关键词“' + q + '”找到 ' + matched.length + ' 条结果。';
    }

    results.innerHTML = matched.map(function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '  <a href="movie/' + movie.id + '.html" class="movie-poster">',
        '    <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="poster-img" onerror="handleImageError(this, this.alt)" />',
        '    <span class="play-badge">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a href="movie/' + movie.id + '.html" class="movie-title">' + escapeHtml(movie.title) + '</a>',
        '    <div class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <p>' + escapeHtml(movie.one_line) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  window.escapeHtml = function (value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  };

  window.handleImageError = function (image, title) {
    var parent = image.parentElement;
    image.classList.add('image-missing');
    image.removeAttribute('src');
    image.alt = title || image.alt || '影片封面';
    if (parent && !parent.querySelector('.missing-title')) {
      var label = document.createElement('span');
      label.className = 'missing-title';
      label.textContent = title || '影片封面';
      label.style.position = 'absolute';
      label.style.inset = 'auto 12px 12px';
      label.style.color = '#f8fafc';
      label.style.fontWeight = '800';
      label.style.textShadow = '0 2px 12px rgba(0,0,0,.6)';
      parent.appendChild(label);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCategoryFilters();
    initSearch();
  });
})();
