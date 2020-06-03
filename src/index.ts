import app from './app'

const port = process.env.PORT || 3000

const server = app.listen(port, () => {
  console.log('Server is running at port: ' + port)
})

let shuttingDown = false

const gracefulShutdown = async () => {
  console.info('Got kill signal, starting graceful shutdown')
  if (shuttingDown) {
    return
  }
  shuttingDown = true
  try {
    if (server) {
      await server.close()
    }
  } catch (err) {
    console.error('Error happened during graceful shutdown', err)
    process.exit(1)
  }
  console.info('Graceful shutdown finished')
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
