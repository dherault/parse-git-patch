  const gitPatchMetaInfo = splitMetaInfo(patch, lines)
    ...gitPatchMetaInfo,
function splitMetaInfo(patch, lines) {
  // Compatible with git output
  if (!/^From/g.test(patch)) {
    return {} 
  }

  const hashLine = lines.shift()
  const [, hash] = hashLine.match(hashRegex)

  const authorLine = lines.shift()
  const [, authorName,, authorEmail] = authorLine.match(authorRegex)

  const dateLine = lines.shift()
  const [, date] = dateLine.split('Date: ')

  const messageLine = lines.shift()
  const [, message] = messageLine.split('Subject: ')

  return {
    hash,
    authorName,
    authorEmail,
    date,
    message,
  }
}
