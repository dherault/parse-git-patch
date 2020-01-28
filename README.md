# parse-git-patch

*Parse git patches with ease*

## Installation

`npm i parse-git-patch`

## Usage

```patch
From 0f6f88c98fff3afa0289f46bf4eab469f45eebc6 Mon Sep 17 00:00:00 2001
From: A dev <a-dev@users.noreply.github.com>
Date: Sat, 25 Jan 2020 19:21:35 +0200
Subject: [PATCH] JSON stringify string responses

---
 src/events/http/HttpServer.js | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)

diff --git a/src/events/http/HttpServer.js b/src/events/http/HttpServer.js
index 20bf454..c0fdafb 100644
--- a/src/events/http/HttpServer.js
+++ b/src/events/http/HttpServer.js
@@ -770,7 +770,9 @@ export default class HttpServer {
           override: false,
         })

-        if (result && typeof result.body !== 'undefined') {
+        if (typeof result === 'string') {
+          response.source = JSON.stringify(result)
+        } else if (result && typeof result.body !== 'undefined') {
           if (result.isBase64Encoded) {
             response.encoding = 'binary'
             response.source = Buffer.from(result.body, 'base64')
--
2.21.1 (Apple Git-122.3)
```

```js
const parseGitPatch = require('parse-git-patch')

const patch = fs.readFileSync(patchLocation, 'utf-8')
const parsedPatch = parseGitPatch(patch)
```

```js
{
  hash: '0f6f88c98fff3afa0289f46bf4eab469f45eebc6',
  date: 'Sat, 25 Jan 2020 19:21:35 +0200',
  message: '[PATCH] JSON stringify string responses',
  authorEmail: 'a-dev@users.noreply.github.com',
  authorName: 'A dev',
  files: [
    {
      added: false,
      deleted: false,
      beforeName: 'src/events/http/HttpServer.js',
      afterName: 'src/events/http/HttpServer.js',
      modifiedLines: [
        {
          line: '        if (result && typeof result.body !== \'undefined\') {',
          lineNumber: 774,
          added: false,
        },
        {
          line: '        if (typeof result === \'string\') {',
          lineNumber: 774,
          added: true,
        },
        {
          line: '          response.source = JSON.stringify(result)',
          lineNumber: 775,
          added: true,
        },
        {
          line: '        } else if (result && typeof result.body !== \'undefined\') {',
          lineNumber: 776,
          added: true,
        },
      ],
    },
  ],
}
```

## License

MIT
