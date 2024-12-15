import { Server as Io, Socket } from 'socket.io';
import example from './handler.ts';

export default function index(io: Io, socket: Socket) {
	example(io, socket);
}
