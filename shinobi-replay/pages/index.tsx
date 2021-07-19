import { readdir } from "fs"
import { GetServerSideProps } from "next"
import path from "path"

const IndexRoute = () => <>Hello!</>

const readDirectory = (dirPath: string) =>
  new Promise((resolve, reject) =>
    readdir(path.resolve(process.cwd(), dirPath), {}, (error, files) =>
      error ? reject(error) : resolve(files)
    )
  )

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const videoFolder = await readDirectory("./out")
  console.log(
    "🚀 ~ file: index.tsx ~ line 9 ~ constgetServerSideProps:GetServerSideProps= ~ videoFolder",
    videoFolder
  )
  return { props: {} }
}

export default IndexRoute
