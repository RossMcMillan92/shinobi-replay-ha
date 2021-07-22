import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg"
import { path as ffprobePath } from "@ffprobe-installer/ffprobe"
import ffmpeg from "fluent-ffmpeg"
import fetch from "isomorphic-unfetch"
import r from "ramda"
import {
  formatISO,
  subHours,
  subMinutes,
  isAfter,
  isBefore,
  addMinutes,
  differenceInSeconds,
  secondsToMinutes,
  secondsToHours,
} from "date-fns"
import { getFormattedDate } from "./utils/dates"

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

const DEFAULT_TARGET_VIDEO_DURATION = 4

interface Video {
  end: string
  href: string
  time: string
}

const getReplay = ({
  end = new Date(),
  offset = 0,
  start = subMinutes(end, DEFAULT_TARGET_VIDEO_DURATION),
  outputFolder,
  outputName,
  segmentLength,
  web: { apiKey, groupKey, host, monitorId },
}: {
  end: Date
  offset?: number
  start: Date
  outputFolder: string
  outputName: string
  segmentLength: 5
  web: { apiKey: string; groupKey: string; host: string; monitorId: string }
}): Promise<string> =>
  new Promise((resolve, reject) => {
    console.log("🚀 ~ file: replay.js ~ line 26 ~ start", start)
    console.log("🚀 ~ file: replay.js ~ line 24 ~ end", end)
    const hoursToShift = parseInt(
      formatISO(new Date()).split("+")[1].split(":")[0]
    )
    const FETCH_TIMEOUT_S = (segmentLength * 60) / 100
    const endDate = addMinutes(end, offset)
    const startDate = addMinutes(start, offset)
    const shiftedStartTime = getFormattedDate(
      subHours(subMinutes(startDate, segmentLength), hoursToShift)
    )
    const shiftedEndTime = getFormattedDate(
      addMinutes(subHours(endDate, hoursToShift), segmentLength)
    )
    const startTime = getFormattedDate(startDate)
    const endTime = getFormattedDate(endDate)

    const apiUrl = `${host}/${apiKey}/videos/${groupKey}/${monitorId}?end=${shiftedEndTime}&start=${shiftedStartTime}`
    console.log("apiUrl", apiUrl)

    const getVideos = (
      res?: (value: Video[] | PromiseLike<Video[]>) => void
    ): Promise<Video[]> =>
      new Promise((resolve) =>
        fetch(apiUrl)
          .then((d) => d.json())
          .then(({ videos }: { videos: Video[] }) => {
            const earliestVideo = videos[videos.length - 1] || {}
            const earliestStartTime = new Date(earliestVideo.time)
            const latestVideo = videos[0] || {}
            const latestEndTime = new Date(latestVideo.end)
            const hasVideosBeforeStartTime = isBefore(
              new Date(earliestStartTime),
              new Date(startTime)
            )

            console.log({
              targetStartTime: new Date(startTime).toLocaleTimeString(),
              targetEndTime: new Date(endTime).toLocaleTimeString(),
              earliestStartTime: earliestStartTime.toLocaleTimeString(),
              latestEndTime: latestEndTime.toLocaleTimeString(),
              hasVideosBeforeStartTime,
              isAfter: isAfter(new Date(latestVideo.end), new Date(endTime)),
              videos: videos.map(
                ({ time: start, end }: { time: string; end: string }) => ({
                  start: new Date(start).toLocaleTimeString(),
                  end: new Date(end).toLocaleTimeString(),
                })
              ),
            })

            if (isAfter(new Date(latestVideo.end), new Date(endTime))) {
              ;(res || resolve)(r.reverse(videos))
            } else {
              console.log(`Not enough videos... Waiting ${FETCH_TIMEOUT_S}s`)
              setTimeout(
                () => getVideos(res || resolve),
                FETCH_TIMEOUT_S * 1000
              )
            }
          })
      )

    getVideos().then((videos) => {
      const vid = ffmpeg()
      const earliestVideo = videos[0]
      const earliestStartTime = new Date(earliestVideo.time)
      const startTimeString = getDiffTimeString(startTime, earliestStartTime)

      videos.forEach((video) => {
        vid.addInput(`http://192.168.86.12:8080${video.href}`)
      })

      vid
        .seek(startTimeString)
        .duration(differenceInSeconds(endDate, startDate))
        .videoCodec("libx264")
        .audioCodec("libmp3lame")
        .on("progress", function (progress) {
          console.log(`Processing: ${Math.floor(progress.percent * 10) / 10}%`)
        })
        .on("error", function (err) {
          console.log("An error occurred: " + err.message)
          reject(err.message)
        })
        .on("end", function () {
          console.log("Processing finished !")
          resolve(`${outputFolder}${outputName}`)
        })
        .mergeToFile(`/api/get-replay/${outputName}`)
    })
  })

function getDiffTimeString(
  startTime: Date | string,
  earliestStartTime: Date | string
): string {
  const diffInSeconds = differenceInSeconds(
    new Date(startTime),
    new Date(earliestStartTime)
  )

  const startTimeHours = secondsToHours(diffInSeconds)
    .toString()
    .padStart(2, "0")
  const startTimeMinutes = secondsToMinutes(diffInSeconds)
    .toString()
    .padStart(2, "0")
  const startTimeSeconds =
    diffInSeconds < 60
      ? diffInSeconds
      : (diffInSeconds % (parseInt(startTimeMinutes) * 60))
          .toString()
          .padStart(2, "0")

  return `${startTimeHours}:${startTimeMinutes}:${startTimeSeconds}.000`
}

export default getReplay
