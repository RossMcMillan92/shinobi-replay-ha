import { FastifyReply, FastifyRequest } from "fastify"
import { readFile } from "fs"
import { FileHandle } from "fs/promises"
import getReplay from "./replay"

const fastify = require("fastify")({ logger: true })

const cache: Record<string, Promise<unknown> | null> = {}

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

// Declare a route
fastify.get(
  "/replay/:start/:end",
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const { end, start } = request.params as Record<string, string>
    const fileName = `${start}-${end}.mp4`
    const fullFileName = `${outputFolder}${fileName}.mp4`
    const { data: video } = await getFile(fullFileName)

    if (video) return reply.type("video/mp4").send(video)

    console.log(
      "🚀 ~ file: server.ts ~ line 70 ~ cache[fullFileName]",
      cache[fullFileName]
    )

    const getReplayPromise =
      cache[fullFileName] ??
      getReplay({
        end: new Date(end),
        offset: 0,
        outputFolder,
        outputName: fileName,
        segmentLength: 5,
        start: new Date(start),
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

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3232)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
