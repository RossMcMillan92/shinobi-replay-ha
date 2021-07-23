import { addMinutes, isAfter } from "date-fns"
import type { NextApiRequest, NextApiResponse } from "next"
import getReplay from "../../../../replay"
import { OUTPUT_FOLDER } from "../../../../settings"
import { getFormattedDate } from "../../../../utils/dates"
import { getFile } from "../../../../utils/fs"

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

type Data = string | Buffer

const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<Data>
) => {
  const { end, start: initialStart } = request.query as {
    end: string
    start: string
  }

  if (!isDateString(initialStart) && !isValidNumber(initialStart))
    return response.status(500).send("Start date is not valid.")
  if (!isDateString(end))
    return response.status(500).send("End date is not valid.")

  const start = isDateString(initialStart)
    ? initialStart
    : getFormattedDate(
        addMinutes(new Date(end), Number.parseFloat(initialStart))
      )
  const fileName = `${start}-${end}.mp4`
  console.log("🚀 ~ file: [end].ts ~ line 32 ~ fileName", fileName)
  const fullFileName = `${OUTPUT_FOLDER}${fileName}`
  const { data: video, error: ve } = await getFile(fullFileName)

  if (video && !cache[fullFileName]) return response.send(fullFileName)

  if (
    isDateString(start) &&
    isDateString(end) &&
    isAfter(new Date(start), new Date(end))
  )
    return response.status(500).send("Start date cannot be after end date.")

  const getReplayPromise =
    cache[fullFileName] ??
    getReplay({
      end: new Date(end),
      offset: 0,
      outputFolder: OUTPUT_FOLDER,
      outputName: fileName,
      segmentLength: 5,
      start: isDateString(start)
        ? new Date(start)
        : addMinutes(new Date(end), Number.parseFloat(start)),
      web,
    })
  cache[fullFileName] = getReplayPromise

  const { data: videoPath, error } = await getReplayPromise
    .then((data) => ({ data, error: null }))
    .catch((error) => ({ data: null, error }))

  if (error) {
    response.status(500).send(error.message)
    return
  }

  cache[fullFileName] = null
  if (videoPath) response.send(videoPath)
  else response.status(500).send("Somthing went wrong")
}

export default handler
