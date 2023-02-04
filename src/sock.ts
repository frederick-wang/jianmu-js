import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

const getSocket = () => {
  if (!socket) {
    socket = io('ws://localhost:19020')
  }
  return socket
}

export { getSocket }
