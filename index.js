  const hashLine = lines.shift()
  const [, hash] = hashLine.match(hashRegex)

  const authorLine = lines.shift()
  const [, authorName,, authorEmail] = authorLine.match(authorRegex)

  const dateLine = lines.shift()
  const [, date] = dateLine.split('Date: ')

  const messageLine = lines.shift()
  const [, message] = messageLine.split('Subject: ')
    hash,
    authorName,
    authorEmail,
    date,
    message,