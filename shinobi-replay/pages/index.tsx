import { subMinutes } from "date-fns/esm"
import { GetServerSideProps } from "next"
import React from "react"
import { getFormattedDate } from "../utils/dates"
import { OUTPUT_FOLDER } from "../settings"
import { readDirectory } from "../utils/fs"

const IndexRoute = ({ videos }: { videos: string[] }) => (
  <>
    {videos.length > 0
      ? videos.map((video) => <VideoItem key={video} video={video} />)
      : "No videos recorded yet!"}

    <div>
      <ReplayButton length={1} />
      <ReplayButton length={5} />
      <ReplayButton length={10} />
    </div>
  </>
)

const ReplayButton = ({ length }: { length: number }) => {
  const [status, setStatus] = React.useState<"idle" | "loading">("idle")

  React.useEffect(() => {
    if (status === "loading") {
      const end = new Date()
      const start = subMinutes(end, length)
      fetch(`/api/create-replay/-${length}/${getFormattedDate(end)}`)
        .then((path) => {
          console.log("Video done", path)
          setStatus("idle")
        })
        .catch((error) => {
          console.error("Video error", error)
        })
    }
  }, [status])

  return (
    <button
      onClick={() => setStatus("loading")}
      disabled={status === "loading"}
    >
      {status === "loading" ? "Loading" : "Take"} {length} minute replay
    </button>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const videos = (await readDirectory(OUTPUT_FOLDER)) ?? []
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
