const express = require('express')
const http = require('http')
const {Server} = require('socket.io')
var bodyParser = require('body-parser')

const fs = require("fs");
const { exec } = require("child_process");
const stream = require('node:stream');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker();


const app = express()
const cors = require('cors')
app.use(
  cors({
    origin: "*",
  })
)

const server = http.createServer(app)

const io = require("socket.io")(server, {
	cors: {
	  origin: "*",
	}
});

app.use(express.json());
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const userSocketMap = {}
const userRoomMap = {}

function getAllConnectedClients(roomName) {
	return Array.from(io.sockets.adapter.rooms.get(roomName) || []).map(socketId => {
		return {
			socketId,
			username: userSocketMap[socketId]
		}
	})
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
	
	socket.on("join", ({roomName, username}) => {
		userSocketMap[socket.id] = username
		userRoomMap[socket.id] = roomName
		socket.join(roomName);   // upsert

		console.log("USER JOINED ROOM ->", roomName)

		// notify other clients that a new user joined
		const clients = getAllConnectedClients(roomName);
		console.log("YEH RAHE CLIENTS->")
		clients.forEach(client => console.log(client))
		console.log('---------------------------')
		clients.forEach( ({socketId}) => {
			io.to(socketId).emit("joined", {
				clients,
				username,
				socketId: socket.id  // socket id of the new user that joined
			})
		})
	})

	socket.on('disconnect', () => {
		console.log("socket disconnected", socket.id);
		
		socket.in(userRoomMap[socket.id])?.emit("disconnected" , {
			socketId: socket.id,
			username: userSocketMap[socket.id],
		});

        delete userSocketMap[socket.id];
        delete userRoomMap[socket.id];
        socket.leave();
	})
})

app.post('/compile', async (req, res) => {
    const {language, code, input} = req.body
    console.log(language)
    console.log(code)
    console.log(input)
    try {
        // Create a directory
        const dateStr = getDate();
        let dir = path.join(__dirname, 'code_volume', language, dateStr)
        await mkdirIfNotExists(dir)      // __dirname/code_volume/lang/<date>

        const random = Math.floor(Math.random()*10000000000);
        dir = path.join(dir, `${random}`);  // __dirname/code_volume/lang/<date>/<random>/
        await mkdirIfNotExists(dir)

        const codeFilePath = path.join(dir, `${'code' + getFileExtention(language)}`);
        const inputFilePath = path.join(dir, 'input.txt');

        fs.writeFileSync(codeFilePath, code)
        fs.writeFileSync(inputFilePath, input)

        // Create Docker Container
        const containerConf = {
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
        }
        const container = await docker.createContainer({
            Image: getImage(language),
            HostConfig: {
                Binds: [
                    `${dir}:/run`
                ]
            },
            ...containerConf
        })

        await container.start();

        container.exec({
            Cmd: ['/bin/bash', '-c', getRunCommand(language)],
            ...containerConf,
        }, (err, exec) => {
            if (err) {
                return res.json({error: true})
            }
            
            exec.start({}, (err, stream) => {
                if (err) {
                    return res.json({error: true})
                }
                
                let output = '';
                stream.on('data', (chunk) => {
                    output += chunk
                })
                
                stream.on('end', () => {
                    output = output.replace(/[^\x20-\x7E\n\r]/g, '');
                    return res.json({error: false, output })
                })
            })
        })
    }catch(e) {
        console.log(e)
        return res.json({error: true})
    }
})

function getDate() {
    const currDate = Date.now();
    const date = new Date(currDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

function getFileExtention(language) {
    if (language === "python") return '.py' 
    else if (language === "cpp") return '.cpp'
}

function getImage(language) {
    if (language === "python") return 'python_3.10_image'
}

function getRunCommand(language) {
    // if (language === "python") return 'python run/code.py < run/input.txt > run/output.txt && cat run/output.txt'
    if (language === "python") return 'python run/code.py < run/input.txt'
}

function mkdirIfNotExists(dir) {
    return new Promise((resolve, reject) => {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            return resolve();
        } catch(e) {
            return reject();
        }
    })
}


server.listen(3000, () => {
    console.log("Listening on Port 3000")
})