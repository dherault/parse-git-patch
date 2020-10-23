/* eslint-env jest */
const fs = require('fs')
const path = require('path')

const parse = require('./index')

const dataLocation = path.resolve(__dirname, 'tests-data')
const data = {}

fs.readdirSync(dataLocation).forEach(fileName => {
  data[fileName] = fs.readFileSync(path.resolve(dataLocation, fileName), 'utf-8')
})

test('is a function', () => {
  expect(typeof parse).toBe('function')
})

test('parses a simple patch', () => {
  const patchResult = parse(data['one-file.patch'])
  const diffResult = parse(data['one-file-diff.patch'])
  expect.assertions(2)

  const expectResultFiles = [
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
  ]

  expect(patchResult).toEqual({
    hash: '0f6f88c98fff3afa0289f46bf4eab469f45eebc6',
    date: 'Sat, 25 Jan 2020 19:21:35 +0200',
    message: '[PATCH] JSON stringify string responses',
    authorEmail: '13507001+arnas@users.noreply.github.com',
    authorName: 'Arnas Gecas',
    files: expectResultFiles,
  })

  expect(diffResult).toEqual({
    files: expectResultFiles,
  })
})

test('parses a complex patch', () => {
  const result = parse(data['many-files.patch'])

  expect(result).toEqual({
    hash: 'a7696becf41fa2b5c9c93770e25a5cce6174d3b8',
    date: 'Sat, 11 Jan 2020 08:19:48 -0500',
    message: '[PATCH] Fix path/resource/resourcePath in Lambda events, fixes #868',
    authorEmail: 'dnalborczyk@gmail.com',
    authorName: 'Daniel Nalborczyk',
    files: [
      {
        added: false,
        deleted: false,
        beforeName: 'src/events/http/HttpServer.js',
        afterName: 'src/events/http/HttpServer.js',
        modifiedLines: [
          {
            added: true,
            line: '              _path,',
            lineNumber: 477,
          },
          {
            added: true,
            line: '          _path,',
            lineNumber: 493,
          },
        ],
      },
      {
        added: false,
        deleted: false,
        beforeName: 'src/events/http/lambda-events/LambdaIntegrationEvent.js',
        afterName: 'src/events/http/lambda-events/LambdaIntegrationEvent.js',
        modifiedLines: [
          {
            added: true,
            line: '  #path = null',
            lineNumber: 6,
          },
          {
            added: false,
            line: '  constructor(request, stage, requestTemplate) {',
            lineNumber: 10,
          },
          {
            added: true,
            line: '  constructor(request, stage, requestTemplate, path) {',
            lineNumber: 11,
          },
          {
            added: true,
            line: '    this.#path = path',
            lineNumber: 12,
          },
          {
            added: true,
            line: '      this.#path,',
            lineNumber: 23,
          },
        ],
      },
      {
        added: false,
        deleted: false,
        beforeName: 'src/events/http/lambda-events/LambdaProxyIntegrationEvent.js',
        afterName: 'src/events/http/lambda-events/LambdaProxyIntegrationEvent.js',
        modifiedLines: [
          {
            added: true,
            line: '  #path = null',
            lineNumber: 20,
          },
          {
            added: false,
            line: '  constructor(request, stage) {',
            lineNumber: 23,
          },
          {
            added: true,
            line: '  constructor(request, stage, path) {',
            lineNumber: 24,
          },
          {
            added: true,
            line: '    this.#path = path',
            lineNumber: 25,
          },
          {
            added: false,
            line: '      path,',
            lineNumber: 110,
          },
          {
            added: false,
            line: '      path,',
            lineNumber: 129,
          },
          {
            added: true,
            line: '      path: this.#path,',
            lineNumber: 130,
          },
          {
            added: false,
            // eslint-disable-next-line
            line: '        path: `/${this.#stage}${this.#request.route.path}`,',
            lineNumber: 174,
          },
          {
            added: true,
            line: '        path: this.#request.route.path,',
            lineNumber: 175,
          },
          {
            added: false,
            line: '        resourcePath: this.#request.route.path,',
            lineNumber: 180,
          },
          {
            added: true,
            line: '        resourcePath: this.#path,',
            lineNumber: 181,
          },
          {
            added: false,
            line: '      resource: this.#request.route.path,',
            lineNumber: 183,
          },
          {
            added: true,
            line: '      resource: this.#path,',
            lineNumber: 184,
          },
        ],
      },
      {
        added: false,
        deleted: false,
        beforeName: 'src/events/http/lambda-events/VelocityContext.js',
        afterName: 'src/events/http/lambda-events/VelocityContext.js',
        modifiedLines: [
          {
            added: true,
            line: '  #path = null',
            lineNumber: 40,
          },
          {
            added: false,
            line: '  constructor(request, stage, payload) {',
            lineNumber: 44,
          },
          {
            added: true,
            line: '  constructor(request, stage, payload, path) {',
            lineNumber: 45,
          },
          {
            added: true,
            line: '    this.#path = path',
            lineNumber: 46,
          },
          {
            added: false,
            line: '        resourcePath: this.#request.route.path,',
            lineNumber: 110,
          },
          {
            added: true,
            line: '        resourcePath: this.#path,',
            lineNumber: 112,
          },
        ],
      },
    ],

  })
})

test('parses a renaming patch', () => {
  const result = parse(data['rename-file.patch'])

  expect(result).toEqual({
    hash: '68ec4bbde5244929afee1b39e09dced6fad1a725',
    date: 'Mon, 27 Jan 2020 17:35:01 +0100',
    message: '[PATCH] Rename README',
    authorEmail: 'dherault@gmail.com',
    authorName: '=?UTF-8?q?David=20H=C3=A9rault?=',
    files: [
      {
        added: false,
        deleted: false,
        beforeName: 'README.md',
        afterName: 'README.mdx',
        modifiedLines: [
        ],
      },
    ],
  })
})

test('parses a add and delete patch', () => {
  const result = parse(data['add-and-delete-file.patch'])

  expect(result).toEqual({
    hash: '74d652cd9cda9849591d1c414caae0af23b19c8d',
    message: '[PATCH] Rename and edit README',
    authorEmail: 'dherault@gmail.com',
    authorName: '=?UTF-8?q?David=20H=C3=A9rault?=',
    date: 'Mon, 27 Jan 2020 17:36:29 +0100',
    files: [
      {
        added: false,
        deleted: true,
        afterName: 'README.md',
        beforeName: 'README.md',
        modifiedLines: [
          {
            added: false,
            line: '# stars-in-motion',
            lineNumber: 2,
          },
          {
            added: false,
            line: '',
            lineNumber: 3,
          },
          {
            added: false,
            line: 'A canvas full of stars',
            lineNumber: 4,
          },
        ],
      },
      {
        added: true,
        deleted: false,
        afterName: 'README.mdx',
        beforeName: 'README.mdx',
        modifiedLines: [
          {
            added: true,
            line: '# stars-in-motion',
            lineNumber: 2,
          },
          {
            added: true,
            line: '',
            lineNumber: 3,
          },
          {
            added: true,
            line: 'A canvas full of stars.',
            lineNumber: 4,
          },
        ],
      },
    ],
  })
})

test('parses a complex patch', () => {
  parse(data['complex.patch'])
})
