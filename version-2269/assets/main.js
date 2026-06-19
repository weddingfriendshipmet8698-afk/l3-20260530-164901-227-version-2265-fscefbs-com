(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (toggle && nav) {
      toggle.addEventListener('click', function() {
        nav.classList.toggle('open');
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function(slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function(dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          var nextIndex = Number(dot.getAttribute('data-hero-dot') || 0);
          show(nextIndex);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function(panel) {
      var scope = panel.parentElement || document;
      var list = scope.querySelector('[data-filter-list]');
      var input = panel.querySelector('[data-filter-input]');
      var reset = panel.querySelector('[data-filter-reset]');
      var result = panel.querySelector('[data-filter-result]');
      var yearSelect = panel.querySelector('[data-filter-select="year"]');
      var typeSelect = panel.querySelector('[data-filter-select="type"]');

      if (!list || !input) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

      function filterCards() {
        var keyword = input.value.trim().toLowerCase();
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var visible = 0;

        cards.forEach(function(card) {
          var title = (card.getAttribute('data-title') || '').toLowerCase();
          var region = (card.getAttribute('data-region') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var genre = (card.getAttribute('data-genre') || '').toLowerCase();
          var textMatched = !keyword || title.indexOf(keyword) > -1 || region.indexOf(keyword) > -1 || cardYear.indexOf(keyword) > -1 || genre.indexOf(keyword) > -1;
          var yearMatched = !year || cardYear === year || (year === 'older' && Number(cardYear) < 2020);
          var typeMatched = !type || cardType === type;
          var matched = textMatched && yearMatched && typeMatched;

          card.classList.toggle('is-filter-hidden', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = visible ? '已匹配 ' + visible + ' 部' : '暂无匹配';
        }
      }

      input.addEventListener('input', filterCards);

      if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
      }

      if (typeSelect) {
        typeSelect.addEventListener('change', filterCards);
      }

      if (reset) {
        reset.addEventListener('click', function() {
          input.value = '';

          if (yearSelect) {
            yearSelect.value = '';
          }

          if (typeSelect) {
            typeSelect.value = '';
          }

          filterCards();
        });
      }

      filterCards();
    });
  });
}());
