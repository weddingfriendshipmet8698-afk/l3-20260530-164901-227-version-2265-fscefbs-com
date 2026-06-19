(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function uniqueValues(cards, key) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(key) || '';
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), 'zh-CN');
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function setupFilters() {
        var list = document.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        var textInput = document.querySelector('[data-filter-text]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var typeSelect = document.querySelector('[data-filter-type]');
        fillSelect(yearSelect, uniqueValues(cards, 'data-year'));
        fillSelect(regionSelect, uniqueValues(cards, 'data-region'));
        fillSelect(typeSelect, uniqueValues(cards, 'data-type'));

        var params = new URLSearchParams(window.location.search);
        if (textInput && params.get('q')) {
            textInput.value = params.get('q');
        }

        function apply() {
            var text = textInput ? textInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            cards.forEach(function (card) {
                var title = card.getAttribute('data-title') || '';
                var tags = card.getAttribute('data-tags') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var textMatched = !text || title.indexOf(text) !== -1 || tags.indexOf(text) !== -1 || cardYear.indexOf(text) !== -1 || cardRegion.toLowerCase().indexOf(text) !== -1 || cardType.toLowerCase().indexOf(text) !== -1;
                var matched = textMatched && (!year || cardYear === year) && (!region || cardRegion === region) && (!type || cardType === type);
                card.hidden = !matched;
            });
        }

        [textInput, yearSelect, regionSelect, typeSelect].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
            toggle.classList.toggle('open');
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function attachVideo(video, url, startAfterLoad) {
        if (!video || !url) {
            return;
        }
        var play = function () {
            if (startAfterLoad) {
                video.play().catch(function () {});
            }
        };
        if (video.dataset.ready === '1') {
            play();
            return;
        }
        video.dataset.ready = '1';
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            video.addEventListener('loadedmetadata', play, { once: true });
            play();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, play);
            return;
        }
        video.src = url;
        video.addEventListener('loadedmetadata', play, { once: true });
        play();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            var url = video ? video.getAttribute('data-video-url') : '';
            var start = function () {
                player.classList.add('playing');
                attachVideo(video, url, true);
            };
            if (button) {
                button.addEventListener('click', start);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.dataset.ready !== '1') {
                        start();
                    }
                });
                video.addEventListener('play', function () {
                    player.classList.add('playing');
                });
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
