import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import './styles.css'
import { listen } from '@tauri-apps/api/event'
import { convertFileSrc } from '@tauri-apps/api/core'

async function init() {
    const videoEl = document.querySelector('video')
    let currentPlaybackRate = videoEl.playbackRate

    function applyPlaybackRate() {
        videoEl.defaultPlaybackRate = currentPlaybackRate
        videoEl.playbackRate = currentPlaybackRate
    }

    await listen('change-video', ({ payload }) => {
        videoEl.src = convertFileSrc(payload.videoPath)
        applyPlaybackRate()
    })
    await listen('clear-video-src', () => {
        videoEl.src = ''
    })
    await listen('set-video-css', ({ payload }) => {
        videoEl.style[payload.name] = payload.value
    })
    await listen('set-video-playback-rate', ({ payload }) => {
        currentPlaybackRate = payload.value
        applyPlaybackRate()
    })
    await listen('replay-video', () => {
        videoEl.currentTime = 0
        videoEl.play()
    })
    // The media load algorithm resets playbackRate to defaultPlaybackRate
    // once metadata for the new video is ready, which can clobber a rate
    // set synchronously right after assigning src.
    videoEl.addEventListener('loadedmetadata', applyPlaybackRate)
}
init()

document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') window.__TAURI__.core.invoke('open_devtools');
});
