import { readFile, readdir } from "fs"
import path from "path"

export const getFile = (
  path: string
): Promise<{ data?: Buffer; error?: Error }> =>
  new Promise((resolve, reject) => {
    readFile(path, {}, (error, data) => {
      if (error) return reject(error)
      if (data) return resolve(data)
    })
  })
    .then((data) => ({ data: data as Buffer }))
    .catch((error) => ({ error }))

export const readDirectory = (dirPath: string) =>
  new Promise((resolve, reject) =>
    readdir(path.resolve(process.cwd(), dirPath), {}, (error, files) =>
      error ? reject(error) : resolve(files)
    )
  )
