import { addMinutes, isAfter, isValid, parseISO } from "date-fns"
import { FastifyReply, FastifyRequest } from "fastify"
import { readFile } from "fs"
import { FileHandle } from "fs/promises"
import getReplay from "./replay"

const fastify = require("fastify")({ logger: true })

const cache: Record<string, Promise<unknown> | null> = {}

const isDateString = (s: string) =>
  /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}/.test(s)

const isValidNumber = (n: string) => n === `${Number.parseFloat(n)}`

// const apiUrl = `http://192.168.86.12:8080/c5482913e5ab68c7db95e308f91590ad/videos/rm/kitchen?end=${shiftedEndTime}&start=${shiftedStartTime}`
const web = {
  apiKey: "dWcrC621fBAH0JT7bYz0JDnl5gIL50",
  groupKey: "rm",
  host: "http://192.168.86.12:8080",
  monitorId: "poolroom",
}

const outputFolder = "out/"

const getFile = (path: string): Promise<{ data?: FileHandle; error?: Error }> =>
  new Promise((resolve, reject) => {
    readFile(path, {}, (error, data) => {
      if (error) return reject(error)
      if (data) return resolve(data)
    })
  })
    .then((data) => ({ data: data as FileHandle }))
    .catch((error) => ({ error }))

fastify.get(
  "/",
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    reply.send("Working!")
  }
)

fastify.get(
  "/replay/:start/:end",
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { end, start } = request.params as Record<string, string>
    const fileName = `${start}-${end}.mp4`
    const fullFileName = `${outputFolder}${fileName}`
    const { data: video, error: ve } = await getFile(fullFileName)

    if (video && !cache[fullFileName])
      return reply.type("video/mp4").send(video)

    if (!isDateString(start) && !isValidNumber(start))
      return reply.status(500).send("Start date is not valid.")

    if (!isDateString(end) && !isValidNumber(end))
      return reply.status(500).send("End date is not valid.")

    if (
      isDateString(start) &&
      isDateString(end) &&
      isAfter(new Date(start), new Date(end))
    )
      return reply.status(500).send("Start date cannot be after end date.")

    const getReplayPromise =
      cache[fullFileName] ??
      getReplay({
        end: isDateString(end)
          ? new Date(end)
          : addMinutes(new Date(), Number.parseFloat(end)),
        offset: 0,
        outputFolder,
        outputName: fileName,
        segmentLength: 5,
        start: isDateString(start)
          ? new Date(start)
          : addMinutes(new Date(), Number.parseFloat(start)),
        web,
      })
    cache[fullFileName] = getReplayPromise

    const { data: videoPath, error } = await getReplayPromise
      .then((data) => ({ data, error: null }))
      .catch((error) => ({ data: null, error }))

    if (error) {
      reply.status(500).send(error.message)
      return
    }
    const { data: stream } = await getFile(videoPath as string)
    cache[fullFileName] = null
    reply.type("video/mp4").send(stream)
  }
)

const start = async () => {
  try {
    console.log("listening on 3821")
    await fastify.listen(3821)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
