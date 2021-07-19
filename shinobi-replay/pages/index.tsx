import { GetServerSideProps } from "next"
import { readDirectory } from "../utils/fs"

const IndexRoute = ({ videos }: { videos: string[] }) => (
  <>
    {videos.map((video) => (
      <p>
        <a target="_blank" href={`/out/${video}`}>
          {video}
        </a>
      </p>
    ))}
  </>
)

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const videos = (await readDirectory("./public/out")) ?? []
  return { props: { videos } }
}

export default IndexRoute
