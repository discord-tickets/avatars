const DISCORD_BASE_URL = 'https://cdn.discordapp.com/avatars';
const PORT = process.env.PORT || 80;

const fs = require('fs');
const fsp = fs.promises;
const request = require('request');
const app = require('express')();

if (!fs.existsSync('./avatars')) {
	fs.mkdirSync('./avatars');
}

const Logger = require('leekslazylogger-express');
const log = new Logger({
	name: 'Discord avatars',
	debug: true,
	timestamp: 'YYYY-MM-DD HH:mm:ss',
	levels: {
		_logger: {
			format: '&f&!7{timestamp}&r &0&!f logger &r &f{text}'
		},
		basic: {
			format: '&f&!7{timestamp}&r &f{text}'
		},
		console: {
			format: '&f&!7{timestamp}&r &0&!f info &r &f{text}'
		},
		info: {
			format: '&f&!7{timestamp}&r &0&!3 info &r &b{text}'
		},
		success: {
			format: '&f&!7{timestamp}&r &0&!2 success &r &a{text}'
		},
		debug: {
			format: '&f&!7{timestamp}&r &0&!1 debug &r &9{text}'
		},
		notice: {
			format: '&f&!7{timestamp}&r &0&!e notice &r &e{text}'
		},
		warn: {
			format: '&f&!7{timestamp}&r &0&!6 warn &r &e{text}'
		},
		error: {
			format: '&f&!7{timestamp}&r &0&!4 error &r &c{text}'
		},
		http: {
			format: '&f&!7{timestamp}&r &f&!5 http &r &d{text}'
		},
	}
});

app.use(log.express({
	level: 'http',
	format: '{status-colour}{status}&r &d{method} &r{path} {time-colour}({time})'
}));

app.get('/:user/:avatar', async (req, res) => {
	const { user, avatar } = req.params;
	const path = `./avatars/${user}-${avatar}`;

	try {
		await fsp.stat(path);
		fs.createReadStream(path).pipe(res);
	} catch {
		const url = `${DISCORD_BASE_URL}/${user}/${avatar}`;
		log.info(`Downloading ${user}/${avatar}`);

		request.head(url, () => { // err, res, body
			const stream = request(url);
			stream.pipe(fs.createWriteStream(path));
			stream.pipe(res);
		});
		
	}
});

app.listen(PORT, () => {
	log.info(`Listening for requests on port ${PORT}`);
});