(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function getQuery(name) {
        return new URLSearchParams(window.location.search).get(name) || "";
    }

    function renderMovie(movie) {
        return [
            '<article class="movie-card">',
            '  <a href="' + escapeHtml(movie.url) + '">',
            '    <span class="card-thumb">',
            '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
            '      <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
            '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '      <span class="play-chip">▶</span>',
            '    </span>',
            '    <span class="card-body">',
            '      <strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
            '      <span class="card-desc">' + escapeHtml(movie.desc) + '</span>',
            '      <span class="meta-row">',
            '        <span class="pill primary">' + escapeHtml(movie.categoryName) + '</span>',
            '        <span>' + escapeHtml(movie.region) + '</span>',
            '      </span>',
            '    </span>',
            '  </a>',
            '</article>'
        ].join("");
    }

    function run() {
        var input = document.querySelector("[data-search-page-input]");
        var select = document.querySelector("[data-search-page-select]");
        var form = document.querySelector("[data-search-page-form]");
        var results = document.querySelector("[data-search-page-results]");
        var initial = getQuery("q");

        if (!input || !select || !form || !results) {
            return;
        }

        input.value = initial;

        function draw() {
            var term = normalize(input.value);
            var category = select.value;
            var items = (window.SEARCH_INDEX || []).filter(function (movie) {
                var text = normalize([movie.title, movie.desc, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.categoryName].join(" "));
                var matchedText = !term || text.indexOf(term) !== -1;
                var matchedCategory = category === "all" || movie.category === category;
                return matchedText && matchedCategory;
            }).slice(0, 120);

            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试更换关键词。</div>';
                return;
            }

            results.innerHTML = items.map(renderMovie).join("");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            draw();
        });

        input.addEventListener("input", draw);
        select.addEventListener("change", draw);
        draw();
    }

    document.addEventListener("DOMContentLoaded", run);
})();
