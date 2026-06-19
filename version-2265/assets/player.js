(function () {
  var video = document.querySelector('.play-video');
  var overlay = document.querySelector('.play-overlay');
  var source = window.videoUrl || '';
  var loaded = false;
  var hls = null;

  if (!video || !overlay || !source) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function start() {
    attach();
    overlay.classList.add('is-hidden');
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
