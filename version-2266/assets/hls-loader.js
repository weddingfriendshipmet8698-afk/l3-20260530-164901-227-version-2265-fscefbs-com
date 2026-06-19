import { H as Hls } from './hls.js';

window.Hls = Hls;
window.dispatchEvent(new Event('hlsready'));
