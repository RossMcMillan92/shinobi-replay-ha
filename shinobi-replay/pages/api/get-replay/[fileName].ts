import { addMinutes, isAfter } from "date-fns"
import type { NextApiRequest, NextApiResponse } from "next"
import getReplay from "../../../replay"
import { OUTPUT_FOLDER } from "../../../settings"
import { getFile } from "../../../utils/fs"

type Data = string | Buffer

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<Data>
) => {
  const { fileName } = request.query as { fileName: string }
  const fullFileName = `${OUTPUT_FOLDER}${fileName}`
  const { data: video, error: ve } = await getFile(fullFileName)

  if (video) return response.send(video)
  else response.status(404).send("No video found")
}

export default handler
