(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve);
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function canPlayNative(video, source) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL') || /\.mp4(\?|$)/i.test(source);
  }

  function attachSource(video, source) {
    if (!source) {
      return Promise.reject(new Error('没有可用播放源'));
    }

    if (canPlayNative(video, source)) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return Promise.resolve();
    }

    return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js').then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        return;
      }
      throw new Error('当前浏览器不支持 HLS 播放');
    });
  }

  function initPlayer() {
    var video = document.querySelector('.video-player');
    var trigger = document.querySelector('[data-play-trigger]');
    if (!video || !trigger) return;

    trigger.addEventListener('click', function () {
      var source = video.getAttribute('data-hls-src');
      trigger.querySelector('strong').textContent = '正在载入播放源';
      attachSource(video, source)
        .then(function () {
          trigger.classList.add('is-hidden');
          return video.play();
        })
        .catch(function () {
          trigger.querySelector('strong').textContent = '播放源载入失败';
          trigger.querySelector('em').textContent = '请检查网络或替换 m3u8 地址';
        });
    });
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
})();
