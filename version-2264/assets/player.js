var Hls = window.Hls;
var frames = document.querySelectorAll('[data-stream]');

frames.forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.video-play');
    var stream = frame.getAttribute('data-stream');
    var ready = false;

    var setup = function () {
        if (ready || !video || !stream) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
        } else {
            video.src = stream;
        }
    };

    var play = function () {
        setup();
        frame.classList.add('is-playing');
        var started = video.play();
        if (started && typeof started.catch === 'function') {
            started.catch(function () {
                frame.classList.remove('is-playing');
            });
        }
    };

    if (button) {
        button.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('play', function () {
            frame.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                frame.classList.remove('is-playing');
            }
        });
        video.addEventListener('click', function () {
            setup();
        });
    }
});
