import Video from "../components/Video"

const VideoRoute = () => {
  return (
    <Video
      options={{
        src: "http://192.168.86.12:8080/80f764c81ade0b3688cae57ac00ca77d/hls/rm/poolroom/s.m3u8",
        // type: "application/x-mpegURL",
        controls: true,
      }}
    />
  )
}

export default VideoRoute
