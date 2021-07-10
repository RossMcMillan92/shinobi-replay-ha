const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path
const ffprobePath = require("@ffprobe-installer/ffprobe").path
const ffmpeg = require("fluent-ffmpeg")
const fetch = require("isomorphic-unfetch")
const r = require("ramda")
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

const {
  formatISO,
  subHours,
  subMinutes,
  isAfter,
  isBefore,
  addMinutes,
  differenceInSeconds,
  secondsToMinutes,
  secondsToHours,
} = require("date-fns")

const START_OFFSET = 10
const VIDEO_SEGMENT_LENGTH = 5
const TARGET_VIDEO_LENGTH = 0.5

const hoursToShift = parseInt(formatISO(new Date()).split("+")[1].split(":")[0])
const FETCH_TIMEOUT_S = (VIDEO_SEGMENT_LENGTH * 60) / 100

const getFormattedDate = (date) => formatISO(date).split("+")[0]

const endDate = subMinutes(new Date(), START_OFFSET)
const startDate = subMinutes(endDate, TARGET_VIDEO_LENGTH)
const shiftedStartTime = getFormattedDate(
  subHours(subMinutes(startDate, VIDEO_SEGMENT_LENGTH), hoursToShift)
)
const shiftedEndTime = getFormattedDate(
  addMinutes(subHours(endDate, hoursToShift), VIDEO_SEGMENT_LENGTH)
)
const startTime = getFormattedDate(startDate)
const endTime = getFormattedDate(endDate)

// const apiUrl = `http://192.168.86.12:8080/c5482913e5ab68c7db95e308f91590ad/videos/rm/kitchen?end=${shiftedEndTime}&start=${shiftedStartTime}`
const apiUrl = `http://192.168.86.12:8080/dWcrC621fBAH0JT7bYz0JDnl5gIL50/videos/rm/poolroom?end=${shiftedEndTime}&start=${shiftedStartTime}`
console.log("apiUrl", apiUrl)

const getVideos = (res) =>
  new Promise((resolve) =>
    fetch(apiUrl)
      .then((d) => d.json())
      .then(({ videos }) => {
        const earliestVideo = videos[videos.length - 1] || {}
        const earliestStartTime = new Date(earliestVideo.time)
        const latestVideo = videos[0]
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
          videos: videos.map(({ time: start, end }) => ({
            start: new Date(start).toLocaleTimeString(),
            end: new Date(end).toLocaleTimeString(),
          })),
        })

        if (isAfter(new Date(latestVideo.end), new Date(endTime))) {
          ;(res || resolve)(r.reverse(videos))
        } else {
          console.log(`Not enough videos... Waiting ${FETCH_TIMEOUT_S}s`)
          setTimeout(() => getVideos(res || resolve), FETCH_TIMEOUT_S * 1000)
        }
      })
  )

getVideos().then((videos) => {
  console.log("Done")
  const vid = ffmpeg()

  const earliestVideo = videos[0]
  const earliestStartTime = new Date(earliestVideo.time)
  const startTimeString = getDiffTimeString(startTime, earliestStartTime)

  videos.forEach((video) => {
    vid.addInput(`http://192.168.86.12:8080${video.href}`)
  })

  console.log(
    "🚀 ~ file: run.js ~ line 99 ~ getVideos ~ TARGET_VIDEO_LENGTH * 60",
    TARGET_VIDEO_LENGTH * 60
  )
  vid
    .seek(startTimeString)
    .duration(TARGET_VIDEO_LENGTH * 60)
    .videoCodec("libx264")
    .audioCodec("libmp3lame")
    .on("progress", function (progress) {
      console.log(`Processing: ${Math.floor(progress.percent * 10) / 10}%`)
    })
    .on("error", function (err) {
      console.log("An error occurred: " + err.message)
    })
    .on("end", function () {
      console.log("Processing finished !")
    })
    .mergeToFile("output.mp4")
})

function getDiffTimeString(startTime, earliestStartTime) {
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
