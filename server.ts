import app from './src/app/index.ts';
const port = Number(Deno.env.get('PORT')) || 3000;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
