import { pipeline as pipelineCb } from 'node:stream'
import { promisify } from 'node:util'
import https from 'node:https'
import { createWriteStream, existsSync, readdirSync, statSync } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import { basename, join } from 'node:path'
import { v4 as uuidv4 } from 'uuid'
import archiver from 'archiver'

import { httpsAgent } from '@/utils'

const pipeline = promisify(pipelineCb)

export function safePath(path: string): string {
  return path.replace(/[^a-zA-Z0-9_\-\/.]/g, '_')
}

export function readableFileSize(size: number, decimal_places = 2): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  while (size >= 1024.0 && i < units.length - 1) {
    size /= 1024.0
    i++
  }
  const unit = units[i]
  return `${size.toFixed(decimal_places)} ${unit}`
}

export async function downloadFile(url: string, file_path: string) {
  const session: IncomingMessage = await new Promise((resolve, reject) => {
    https.get(url, { agent: httpsAgent }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP error: ${res.statusCode}`))
        return
      }
      resolve(res)
    }).on('error', (error: Error) => {
      reject(new Error(`Error while downloading file: ${error}`))
    })
  })

  const totalSize = parseInt(session.headers['content-length'] || '0')

  // const gzip = createGzip()
  const stream = createWriteStream(file_path)

  try {
    await pipeline(session, stream)
  }
  catch (error) {
    throw new Error(`Error while downloading file: ${error}`)
  }

  // session.on('data', (chunk) => {
  //   downloadedSize += chunk.length
  // })

  // Timeout in 5 minutes
  const timeoutId = setTimeout(() => {
    session.destroy()
  }, 5 * 60 * 1000)

  session.on('close', () => {
    clearTimeout(timeoutId)
  })

  return {
    totalSize,
    fileName: basename(file_path),
  }
}

export async function downloadFileByLinks(links: string[], baseFile = '') {
  const quene = links.map((url: string) => downloadFile(url, `${baseFile}${uuidv4()}.jpg`))
  const imgs = await new Promise((resolve, reject) => {
    Promise.allSettled(quene)
      .then((results) => {
        const res = results
          .filter(e => e.status === 'fulfilled')
          .map((e: any) => e.value.fileName)
        resolve(res)
      })
      .catch(reject)
  })

  return imgs
}

export function createZipFile(inputPath: string) {
  const archive = archiver('zip', {
    zlib: { level: 9 }, // 设置压缩级别
  })

  archive.on('error', (err) => {
    throw err
  })

  archive.directory(inputPath, false)
  archive.finalize()

  return archive
}

export function getAllFilesInfo(folderPath: string, relativePath = '') {
  if (!existsSync(folderPath))
    return []

  const fileNames = readdirSync(folderPath)
  if (!fileNames.length)
    return []

  // 定义一个数组来保存所有文件和文件夹信息
  const filesAndFoldersInfo = []

  // 遍历所有文件名，获取每个文件或文件夹的信息
  fileNames.forEach((name) => {
    // 拼接文件或文件夹路径
    const filePath = join(folderPath, name)

    // 获取文件或文件夹信息
    const stat = statSync(filePath)

    // 如果是文件夹，则递归获取其下所有文件和文件夹信息
    if (stat.isDirectory()) {
      const subFolderInfo = {
        name,
        path: join(relativePath, name),
        type: 'folder',
        children: getAllFilesInfo(filePath, join(relativePath, name)),
      }
      filesAndFoldersInfo.push(subFolderInfo)
    }
    else {
      // 如果是文件，则保存文件信息
      const fileInfo = {
        name,
        path: join(relativePath, name),
        type: 'file',
        size: stat.size,
        createTime: stat.birthtimeMs,
        updateTime: stat.mtimeMs,
      }
      filesAndFoldersInfo.push(fileInfo)
    }
  })

  return filesAndFoldersInfo
}
