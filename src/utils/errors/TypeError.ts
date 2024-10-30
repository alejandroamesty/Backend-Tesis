export class MismatchTypeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MismatchTypeError';
	}
}
