(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }
            slides[index].classList.remove('is-active');
            if (dots[index]) {
                dots[index].classList.remove('is-active');
            }
            index = (next + slides.length) % slides.length;
            slides[index].classList.add('is-active');
            if (dots[index]) {
                dots[index].classList.add('is-active');
            }
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var cardGrid = document.querySelector('[data-card-grid]');
    if (localFilter && cardGrid) {
        var cards = Array.prototype.slice.call(cardGrid.querySelectorAll('.movie-card'));
        var yearSelect = document.querySelector('[data-card-filter="year"]');
        var regionSelect = document.querySelector('[data-card-filter="region"]');
        var addOptions = function (select, values) {
            if (!select) {
                return;
            }
            values.forEach(function (value) {
                if (!value) {
                    return;
                }
                var option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        };
        addOptions(yearSelect, Array.from(new Set(cards.map(function (item) {
            return item.getAttribute('data-year');
        }))).sort().reverse());
        addOptions(regionSelect, Array.from(new Set(cards.map(function (item) {
            return item.getAttribute('data-region');
        }))).sort());
        var applyLocalFilter = function () {
            var keyword = localFilter.value.trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            cards.forEach(function (item) {
                var textMatched = !keyword || item.textContent.toLowerCase().indexOf(keyword) > -1;
                var yearMatched = !year || item.getAttribute('data-year') === year;
                var regionMatched = !region || item.getAttribute('data-region') === region;
                item.style.display = textMatched && yearMatched && regionMatched ? '' : 'none';
            });
        };
        localFilter.addEventListener('input', applyLocalFilter);
        if (yearSelect) {
            yearSelect.addEventListener('change', applyLocalFilter);
        }
        if (regionSelect) {
            regionSelect.addEventListener('change', applyLocalFilter);
        }
    }

    var searchForm = document.querySelector('[data-search-page-form]');
    var resultBox = document.getElementById('searchResults');
    if (searchForm && resultBox && window.MOVIE_DATA) {
        var params = new URLSearchParams(window.location.search);
        var input = searchForm.querySelector('input[name="q"]');
        var category = searchForm.querySelector('select[name="category"]');
        var year = searchForm.querySelector('select[name="year"]');
        var years = Array.from(new Set(window.MOVIE_DATA.map(function (movie) {
            return movie.year;
        }).filter(Boolean))).sort().reverse();

        years.forEach(function (item) {
            var option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            year.appendChild(option);
        });

        input.value = params.get('q') || '';
        category.value = params.get('category') || '';
        year.value = params.get('year') || '';

        var render = function () {
            var q = input.value.trim().toLowerCase();
            var cat = category.value;
            var yy = year.value;
            var matched = window.MOVIE_DATA.filter(function (movie) {
                var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.genre, movie.category, movie.year, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                return (!q || haystack.indexOf(q) > -1) && (!cat || movie.category === cat) && (!yy || movie.year === yy);
            }).slice(0, 120);

            resultBox.innerHTML = matched.map(function (movie) {
                var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');
                return '<article class="movie-card">' +
                    '<a href="video/' + movie.id + '.html" class="movie-cover">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="card-category">' + escapeHtml(movie.category) + '</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<h3><a href="video/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="movie-meta"><span>' + escapeHtml(movie.year || '') + '</span><span>' + escapeHtml(movie.region || '') + '</span><span>' + escapeHtml(movie.duration || '') + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        };

        var escapeHtml = function (value) {
            return String(value || '').replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        };

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var next = new URLSearchParams();
            if (input.value.trim()) {
                next.set('q', input.value.trim());
            }
            if (category.value) {
                next.set('category', category.value);
            }
            if (year.value) {
                next.set('year', year.value);
            }
            history.replaceState(null, '', 'search.html' + (next.toString() ? '?' + next.toString() : ''));
            render();
        });

        category.addEventListener('change', render);
        year.addEventListener('change', render);
        input.addEventListener('input', render);
        render();
    }
})();
