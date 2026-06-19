(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      panel.setAttribute('aria-hidden', String(!isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle('is-active', i === active);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      var index = Number(thumb.getAttribute('data-hero') || '0');
      showSlide(index);
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterInput = document.querySelector('.page-filter');
  var yearFilter = document.querySelector('.year-filter');
  var items = Array.prototype.slice.call(document.querySelectorAll('.search-item'));

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';

    items.forEach(function (item) {
      var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || text.indexOf(year) !== -1;
      item.classList.toggle('is-filtered-out', !(matchKeyword && matchYear));
    });
  }

  if (filterInput && items.length) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      filterInput.value = q;
    }
    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (yearFilter && items.length) {
    yearFilter.addEventListener('change', applyFilter);
  }
})();
