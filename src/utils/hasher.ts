import { crypto } from 'jsr:@std/crypto';

const baseSaltLength = 16;

class Hasher {
	private baseSalt: Uint8Array;

	constructor(baseSaltLength: number) {
		// Generate a base salt based on the provided length
		this.baseSalt = crypto.getRandomValues(new Uint8Array(baseSaltLength));
	}

	/**
	 * @param data - The data to hash
	 * @param saltRounds - The number of rounds to hash the data
	 * @returns - The hashed data
	 */
	async hash(data: string, saltRounds: number): Promise<string> {
		// Generate a new salt for each data hash, based on the base salt and saltRounds
		const salt = await this.generateSalt(saltRounds);

		const passwordKey = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(data),
			{ name: 'PBKDF2' },
			false,
			['deriveBits', 'deriveKey'],
		);

		const derivedKey = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			passwordKey,
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt'],
		);

		const hashedData = new Uint8Array(await crypto.subtle.exportKey('raw', derivedKey));
		return `${this.encodeHex(salt)}:${this.encodeHex(hashedData)}`; // Return salt and hash as a combined string
	}

	/**
	 * @param data - The data to verify
	 * @param hashedData - The hashed data to verify against
	 * @returns - A boolean indicating whether the data matches the hashed data
	 */
	async verify(data: string, hashedData: string): Promise<boolean> {
		// Separate salt and hash
		const [saltHex, hashHex] = hashedData.split(':');
		const salt = this.decodeHex(saltHex);

		const passwordKey = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(data),
			{ name: 'PBKDF2' },
			false,
			['deriveBits', 'deriveKey'],
		);

		const derivedKey = await crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: salt,
				iterations: 100000,
				hash: 'SHA-256',
			},
			passwordKey,
			{ name: 'AES-GCM', length: 256 },
			true,
			['encrypt', 'decrypt'],
		);

		const newHashedData = new Uint8Array(
			await crypto.subtle.exportKey('raw', derivedKey),
		);
		return this.encodeHex(newHashedData) === hashHex;
	}

	private generateSalt(rounds: number): Uint8Array {
		const expandedSalt = new Uint8Array(this.baseSalt.length * rounds);
		for (let i = 0; i < rounds; i++) {
			expandedSalt.set(this.baseSalt, i * this.baseSalt.length);
		}
		return expandedSalt;
	}

	private encodeHex(buffer: Uint8Array): string {
		return Array.from(buffer)
			.map((byte) => byte.toString(16).padStart(2, '0'))
			.join('');
	}

	private decodeHex(hex: string): Uint8Array {
		const bytes = new Uint8Array(hex.length / 2);
		for (let i = 0; i < bytes.length; i++) {
			bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
		}
		return bytes;
	}
}

export default new Hasher(baseSaltLength);
