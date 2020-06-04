import {Server} from 'http'
import socketio from 'socket.io'

import { SocketEvent } from './constants/SocketEvents'

export default (http: Server) => {
  const io = socketio(http)

  io.on(SocketEvent.CONNECT, (socket: socketio.Socket) => {
    console.log('a user connected')

    socket.on(SocketEvent.MESSAGE, (message: any) => {
      console.log('[server](message): %s', JSON.stringify(message))
      io.emit('message', message)
    })

    socket.on(SocketEvent.DISCONNECT, () => {
      console.log('Client disconnected')
    })
  })

  return io
}
