import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

/**
 * Class to send emails using Denomailer
 * @class Mailer
 */
class Mailer {
	private senderEmail: string;
	private password: string;
	private hostname: string;

	constructor() {
		// Load credentials from environment variables
		this.senderEmail = Deno.env.get('EMAIL') || ''; // Your Gmail address
		this.password = Deno.env.get('EMAIL_PASSWORD') || ''; // Your Gmail password or App Password
		this.hostname = Deno.env.get('EMAIL_HOST') || ''; // SMTP server hostname

		if (!this.senderEmail || !this.password || !this.hostname) {
			throw new Error(
				'Missing EMAIL, EMAIL_PASSWORD or EMAIL_HOST environment variables.',
			);
		}
	}

	/**
	 * Sends an email
	 * @param {Object} options
	 * @param {string} options.email - Recipient's email
	 * @param {string} options.subject - Subject of the email
	 * @param {string} options.body - Body of the email
	 * @param {string} options.type - Type of email content ('html' or 'text')
	 * @returns {Promise<string>} - Response of the email send
	 */
	async sendEmail({
		email,
		subject,
		body,
		type,
	}: {
		email: string;
		subject: string;
		body: string;
		type: 'html' | 'text';
	}): Promise<string> {
		// Initialize the SMTP client
		const client = new SMTPClient({
			connection: {
				hostname: this.hostname,
				port: 465, // Use port 465 for Gmail with TLS
				tls: true,
				auth: {
					username: this.senderEmail,
					password: this.password,
				},
			},
		});

		try {
			// Send the email
			await client.send({
				from: this.senderEmail,
				to: email,
				subject: subject,
				content: type === 'html' ? undefined : body,
				html: type === 'html' ? body : undefined,
			});

			return `Email sent successfully`;
		} catch (error) {
			console.error('Error sending email:', error);
			throw new Error('Error sending email');
		} finally {
			// Ensure the client is closed
			await client.close();
		}
	}
}

export default new Mailer();
