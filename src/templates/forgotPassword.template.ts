export function getForgotPasswordTemplate(key: number): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Password Reset</title>
	<style>
		body {
			font-family: Arial, sans-serif;
			background-color: #f9fff9; /* Light green background */
			color: #333; /* Darker text for contrast */
			margin: 0;
			padding: 0;
			display: flex;
			justify-content: center;
			align-items: center;
			min-height: 100vh;
		}

		.container {
			background-color: #e6ffe6; /* Softer green for card */
			border: 1px solid #cceccc; /* Border to give structure */
			border-radius: 8px;
			padding: 20px;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
			max-width: 600px;
			width: 100%;
			text-align: center;
		}

		h1 {
			color: #228B22; /* Forest green */
		}

		p {
			line-height: 1.6;
		}

		strong {
			display: inline-block;
			background-color: #32CD32; /* Lime green */
			color: white;
			padding: 10px 20px;
			border-radius: 4px;
			font-size: 1.2em;
			margin: 10px 0;
		}

		a {
			color: #006400; /* Dark green for links */
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>Password Reset</h1>
		<p>Hi, we received a request to reset your password. If you didn't request this, you can ignore this email.</p>
		<p>If you did request a password reset, please use the following code:</p>
		<p><strong>${key}</strong></p>
		<p>If you have any questions, please contact us at <a href="mailto:joseandres102003@gmail.com">joseandres102003@gmail.com</a>.</p>
	</div>
</body>
</html>

`;
}
