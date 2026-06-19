(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!button || !panel) {
            return;
        }

        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = selectAll("[data-hero-slide]", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        if (!slides.length) {
            return;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });

        hero.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });

        hero.addEventListener("mouseleave", play);

        show(0);
        play();
    }

    function setupFilters() {
        selectAll("[data-filter-area]").forEach(function (area) {
            var input = area.querySelector("[data-filter-input]");
            var selects = selectAll("[data-filter-select]", area);
            var cards = selectAll("[data-card]", area);

            function apply() {
                var term = normalize(input ? input.value : "");
                var activeFilters = selects.map(function (select) {
                    return {
                        key: select.getAttribute("data-key"),
                        value: select.value
                    };
                });

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var matchedText = !term || text.indexOf(term) !== -1;
                    var matchedSelects = activeFilters.every(function (filter) {
                        if (!filter.key || !filter.value || filter.value === "all") {
                            return true;
                        }

                        return card.getAttribute("data-" + filter.key) === filter.value;
                    });

                    card.classList.toggle("is-hidden", !(matchedText && matchedSelects));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });

            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
