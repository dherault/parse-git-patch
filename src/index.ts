const hashRegex = /^From (\S*)/
const authorRegex = /^From:\s?([^<].*[^>])?\s+(<(.*)>)?/
const fileNameRegex = /^diff --git "?a\/(.*)"?\s*"?b\/(.*)"?/
const fileLinesRegex = /^@@ -([0-9]*),?\S* \+([0-9]*),?/
const similarityIndexRegex = /^similarity index /
const addedFileModeRegex = /^new file mode /
const deletedFileModeRegex = /^deleted file mode /

export type ParsedPatchModifiedLineType = {
  added: boolean
  lineNumber: number
  line: string
}

export type ParsedPatchFileDataType = {
  added: boolean
  deleted: boolean
  beforeName: string
  afterName: string
  modifiedLines: ParsedPatchModifiedLineType[]
}

export type ParsedPatchType = {
  hash?: string
  authorName?: string
  authorEmail?: string
  date?: string
  message?: string
  files: ParsedPatchFileDataType[]
}

function parseGitPatch(patch: string) {
  if (typeof patch !== 'string') {
    throw new Error('Expected first argument (patch) to be a string')
  }

  const lines = patch.split('\n')

  const gitPatchMetaInfo = splitMetaInfo(patch, lines)

  if (!gitPatchMetaInfo) return null

  const parsedPatch: ParsedPatchType = {
    ...gitPatchMetaInfo,
    files: [] as ParsedPatchFileDataType[],
  }

  splitIntoParts(lines, 'diff --git').forEach(diff => {
    const fileNameLine = diff.shift()

    if (!fileNameLine) return

    const match3 = fileNameLine.match(fileNameRegex)

    if (!match3) return

    const [, a, b] = match3
    const metaLine = diff.shift()

    if (!metaLine) return

    const fileData: ParsedPatchFileDataType = {
      added: false,
      deleted: false,
      beforeName: a.trim(),
      afterName: b.trim(),
      modifiedLines: [],
    }

    parsedPatch.files.push(fileData)

    if (addedFileModeRegex.test(metaLine)) {
      fileData.added = true
    }
    if (deletedFileModeRegex.test(metaLine)) {
      fileData.deleted = true
    }
    if (similarityIndexRegex.test(metaLine)) {
      return
    }

    splitIntoParts(diff, '@@ ').forEach(lines => {
      const fileLinesLine = lines.shift()

      if (!fileLinesLine) return

      const match4 = fileLinesLine.match(fileLinesRegex)

      if (!match4) return

      const [, a, b] = match4

      let nA = parseInt(a) - 1
      let nB = parseInt(b) - 1

      lines.forEach(line => {
        nA++
        nB++

        if (line === '-- ' || line === '--') {
          return
        }
        if (line.startsWith('+')) {
          nA--

          fileData.modifiedLines.push({
            added: true,
            lineNumber: nB,
            line: line.substring(1),
          })
        }
        else if (line.startsWith('-')) {
          nB--

          fileData.modifiedLines.push({
            added: false,
            lineNumber: nA,
            line: line.substring(1),
          })
        }
      })
    })
  })

  return parsedPatch
}

function splitMetaInfo(patch: string, lines: string[]) {
  // Compatible with git output
  if (!/^From/g.test(patch)) {
    return {}
  }

  const hashLine = lines.shift()

  if (!hashLine) return null

  const match1 = hashLine.match(hashRegex)

  if (!match1) return null

  const [, hash] = match1

  let authorLine = lines.shift()

  // Parsing of long names
  while (lines[0].startsWith(' ')) {
    authorLine += ` ${lines.shift()}`
  }

  if (!authorLine) return null

  const match2 = authorLine.match(authorRegex)

  if (!match2) return null

  const [, authorName, , authorEmail] = match2

  const dateLine = lines.shift()

  if (!dateLine) return null

  const [, date] = dateLine.split('Date: ')

  const messageLine = lines.shift()

  if (!messageLine) return null

  const [, message] = messageLine.split('Subject: ')

  return {
    hash,
    authorName: formatAuthorName(authorName),
    authorEmail,
    date,
    message,
  }
}

function splitIntoParts(lines: string[], separator: string) {
  const parts = []
  let currentPart: string[] | undefined

  lines.forEach(line => {
    if (line.startsWith(separator)) {
      if (currentPart) {
        parts.push(currentPart)
      }

      currentPart = [line]
    }
    else if (currentPart) {
      currentPart.push(line)
    }
  })

  if (currentPart) {
    parts.push(currentPart)
  }

  return parts
}

function formatAuthorName(name: string) {
  return (name.startsWith('"') && name.endsWith('"') ? name.slice(1, -1) : name).trim()
}

export default parseGitPatch
