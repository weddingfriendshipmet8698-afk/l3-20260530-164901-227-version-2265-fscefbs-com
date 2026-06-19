(function () {
    window.mountMoviePlayer = function (videoId, layerId, streamUrl) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var hls = null;
        var pendingPlay = false;

        if (!video || !streamUrl) {
            return;
        }

        function hideLayer() {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        }

        function nativePlay() {
            if (video.src !== streamUrl) {
                video.src = streamUrl;
            }

            video.play().catch(function () {});
        }

        function hlsPlay() {
            var Hls = window.Hls;

            if (!Hls || !Hls.isSupported()) {
                nativePlay();
                return;
            }

            if (!hls) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    if (pendingPlay) {
                        video.play().catch(function () {});
                    }
                });

                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                    }
                });
            }

            video.play().catch(function () {});
        }

        function start() {
            pendingPlay = true;
            hideLayer();

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                nativePlay();
            } else {
                hlsPlay();
            }
        }

        if (layer) {
            layer.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", hideLayer);
    };
})();
