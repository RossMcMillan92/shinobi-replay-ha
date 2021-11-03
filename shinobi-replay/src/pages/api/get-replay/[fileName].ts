import { addMinutes, isAfter } from "date-fns"
import type { NextApiRequest, NextApiResponse } from "next"
import getReplay from "../../../../replay"
import { OUTPUT_FOLDER } from "../../../../settings"
import { getFile } from "../../../utils/fs"
import fs from "fs"

type Data = string | Buffer

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<Data>
) => {
  const { fileName } = request.query as { fileName: string }
  const fullFileName = `${OUTPUT_FOLDER}${fileName}`

  streamVideo({ path: fullFileName, request, response })
  // const { data: video, error: ve } = await getFile(fullFileName)

  // if (video) return response.send(video)
  // else response.status(404).send("No video found")
}

const streamVideo = ({
  path,
  request,
  response,
}: {
  path: string
  request: NextApiRequest
  response: NextApiResponse<Data>
}) => {
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = request.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

    if (start >= fileSize) {
      response
        .status(416)
        .send("Requested range not satisfiable\n" + start + " >= " + fileSize)
      return
    }

    const chunksize = end - start + 1
    const file = fs.createReadStream(path, { start, end })
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    }

    response.writeHead(206, head)
    file.pipe(response)
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    }
    response.writeHead(200, head)
    fs.createReadStream(path).pipe(response)
  }
}

export default handler
