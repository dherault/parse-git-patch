const hashRegex = /^From (\S*)/
const authorRegex = /^From:\s?([^<].*[^>])?\s+(<(.*)>)?/
const fileNameRegex = /^diff --git "?a\/(.*)"?\s*"?b\/(.*)"?/
const fileLinesRegex = /^@@ -([0-9]*),?\S* \+([0-9]*),?/
const similarityIndexRegex = /^similarity index /
const addedFileModeRegex = /^new file mode /
const deletedFileModeRegex = /^deleted file mode /

function parseGitPatch(patch) {
  if (typeof patch !== 'string') {
    throw new Error('Expected first argument (patch) to be a string')
  }

  const lines = patch.split('\n')

  const hashLine = lines.shift()
  const [, hash] = hashLine.match(hashRegex)

  const authorLine = lines.shift()
  const [, authorName,, authorEmail] = authorLine.match(authorRegex)

  const dateLine = lines.shift()
  const [, date] = dateLine.split('Date: ')

  const messageLine = lines.shift()
  const [, message] = messageLine.split('Subject: ')

  const parsedPatch = {
    hash,
    authorName,
    authorEmail,
    date,
    message,
    files: [],
  }

  splitIntoParts(lines, 'diff --git').forEach(diff => {
    const fileNameLine = diff.shift()
    const [, a, b] = fileNameLine.match(fileNameRegex)
    const metaLine = diff.shift()

    const fileData = {
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
      const [, a, b] = fileLinesLine.match(fileLinesRegex)

      let nA = parseInt(a)
      let nB = parseInt(b)

      lines.forEach(line => {
        nA++
        nB++

        if (line.startsWith('-- ')) {
          return
        }
        if (line.startsWith('+')) {
          nA--

          fileData.modifiedLines.push({
            added: true,
            lineNumber: nB,
            line: line.substr(1),
          })
        }
        else if (line.startsWith('-')) {
          nB--

          fileData.modifiedLines.push({
            added: false,
            lineNumber: nA,
            line: line.substr(1),
          })
        }
      })
    })
  })

  return parsedPatch
}

function splitIntoParts(lines, separator) {
  const parts = []
  let currentPart

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

module.exports = parseGitPatch
