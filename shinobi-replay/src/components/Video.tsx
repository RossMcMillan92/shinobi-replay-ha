import React from "react"
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js"
import "video.js/dist/video-js.css"

export const Video = (props: { options: VideoJsPlayerOptions }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const playerRef = React.useRef<VideoJsPlayer | null>(null)
  const { options } = props

  React.useEffect(() => {
    // make sure Video.js player is only initialized once
    if (!playerRef.current) {
      const videoElement = videoRef.current
      if (!videoElement) return

      const player = videojs(videoElement, options, () => {
        console.log("player is ready")
        // onReady && onReady(player)
      })
      playerRef.current = player
    } else {
      // you can update player here [update player through props]
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options])

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
    }
  }, [])

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  )
}

export default Video
