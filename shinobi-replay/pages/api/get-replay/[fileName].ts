import { addMinutes, isAfter } from "date-fns"
import type { NextApiRequest, NextApiResponse } from "next"
import getReplay from "../../../replay"
import { getFile } from "../../../utils/fs"

const isDateString = (s: string) =>
  /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/.test(s)
const isValidNumber = (n: string) => n === `${Number.parseFloat(n)}`

const cache: Record<string, Promise<string> | null> = {}

const web = {
  apiKey: "dWcrC621fBAH0JT7bYz0JDnl5gIL50",
  groupKey: "rm",
  host: "http://192.168.86.12:8080",
  monitorId: "poolroom",
}
const outputFolder = "out/"

type Data = string | Buffer

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<Data>
) => {
  const { fileName } = request.query as { fileName: string }
  const fullFileName = `${outputFolder}${fileName}`
  const { data: video, error: ve } = await getFile(fullFileName)

  if (video) return response.send(video)
  else response.status(404).send("No video found")
}

export default handler
