(function () {
  var video = document.querySelector('.movie-video');
  var cover = document.querySelector('.player-cover');
  var button = document.querySelector('.player-start');

  if (!video || !cover || !button) {
    return;
  }

  var url = video.getAttribute('data-video');
  var attached = false;
  var hlsInstance = null;

  function attach() {
    if (attached || !url) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = url;
  }

  function start() {
    attach();
    cover.classList.add('is-hidden');
    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  cover.addEventListener('click', start);
  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
