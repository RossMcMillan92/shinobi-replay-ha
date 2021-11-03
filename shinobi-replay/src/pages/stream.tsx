import React from "react"

const StreamPage = () => {
  const [screenshotVisible, setScreenshotVisible] = React.useState(false)
  const [screenshotCounter, setScreenshotCounter] = React.useState(0)

  return (
    <div className="relative h-full">
      <iframe
        className="h-full w-full"
        src={
          "http://192.168.86.12:8080/dWcrC621fBAH0JT7bYz0JDnl5gIL50/embed/rm/poolroom/fullscreen%7Cjquery%7Crelative%7Cgui/"
        }
      />

      <div className="absolute bottom-4 left-4 z-30">
        <button
          onClick={() => {
            setScreenshotVisible(true)
            setScreenshotCounter((n) => n + 1)
          }}
          className="bg-blue-800 text-white px-3 py-2 mr-4"
        >
          Take screenshot
        </button>

        <button
          onClick={() => {
            setScreenshotVisible(false)
          }}
          className="bg-blue-800 text-white px-3 py-2 mr-4"
        >
          Clear screenshot
        </button>
      </div>

      {screenshotVisible ? (
        <img
          key={screenshotCounter}
          className="absolute left-0 top-0 w-full h-full z-10 opacity-50"
          src="http://192.168.86.12:8080/a7169f32af683ecb663798f98b59d255/hls/rm/poolroom/s.jpg"
        />
      ) : null}
    </div>
  )
}

export default StreamPage
