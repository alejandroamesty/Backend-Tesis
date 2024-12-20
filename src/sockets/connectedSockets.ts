import { Socket } from 'socket.io';

class connectedSockets {
	private sockets: { [user_id: string]: Socket } = {};
	constructor() {}

	addSocket(user_id: string, socket: Socket) {
		this.sockets[user_id] = socket;
	}

	removeSocket(user_id: string) {
		delete this.sockets[user_id];
	}

	getSocket(user_id: string) {
		return this.sockets[user_id];
	}

	get Sockets() {
		return this.sockets;
	}
}

export default new connectedSockets();
