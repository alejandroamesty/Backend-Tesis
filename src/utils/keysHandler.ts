class keysHandler {
	private keys: Record<string, number> = {};
	private id: Record<string, number> = {};

	public generateKey(user_id: string) {
		const key = Math.floor(10000 + Math.random() * 90000);
		this.keys[user_id] = key;
		const id = setTimeout(() => {
			this.deleteKey(user_id);
		}, 900000);
		this.id[user_id] = id;
		return key;
	}

	public verifyKey(user_id: string, key: number) {
		return this.keys[user_id] === key;
	}

	public deleteKey(user_id: string) {
		delete this.keys[user_id];
		clearTimeout(this.id[user_id]);
	}
}

export default new keysHandler();
