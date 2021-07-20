import { GetServerSideProps } from "next"
import React from "react"
import { readDirectory } from "../utils/fs"

const IndexRoute = ({ videos }: { videos: string[] }) => (
  <>
    {videos.length > 0
      ? videos.map((video) => <VideoItem video={video} />)
      : "No videos recorded yet!"}
  </>
)

export const getServerSideProps: GetServerSideProps = async () => {
  const videos = (await readDirectory("./public/out")) ?? []
  return { props: { videos: videos.filter((video) => video.endsWith(".mp4")) } }
}

export default IndexRoute

function VideoItem({ video }: { video: string }): JSX.Element {
  console.log("🚀 ~ file: index.tsx ~ line 21 ~ VideoItem ~ video", video)
  const [status, setStatus] = React.useState<"idle" | "open">("idle")
  return (
    <p>
      <button
        onClick={() =>
          setStatus((status) => (status === "idle" ? "open" : "idle"))
        }
      >
        {video}
      </button>

      {status === "open" ? (
        <>
          <video
            style={{ width: "100%" }}
            src={`/api/get-replay/${video}`}
            controls={true}
          ></video>
        </>
      ) : null}
    </p>
  )
}
