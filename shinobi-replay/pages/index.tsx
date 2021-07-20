import { GetServerSideProps } from "next"
import { readDirectory } from "../utils/fs"

const IndexRoute = ({ videos }: { videos: string[] }) => (
  <>
    {videos.length > 0
      ? videos.map((video) => (
          <p>
            <a target="_blank" href={`/out/${video}`}>
              {video}
            </a>
          </p>
        ))
      : "No videos recorded yet!"}
  </>
)

export const getServerSideProps: GetServerSideProps = async () => {
  const videos = (await readDirectory("./public/out")) ?? []
  return { props: { videos: videos.filter((video) => video.endsWith(".mp4")) } }
}

export default IndexRoute
