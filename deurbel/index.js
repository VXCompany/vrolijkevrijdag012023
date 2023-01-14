import express from "express";
import bodyParser from "body-parser";
import busboy from "connect-busboy";
import path from 'path';
import ringClientApi from 'ring-client-api';
import fs from 'fs';

import cameras from "./module-cameras.js";
import history from "./module-history.js";
import livestream from './module-livestream.js';
import playaudio from './module-playaudio.js';

const __dirname = path.dirname('index.js');

// === get ring refresh token and initiate the ring api client ===

let ringApiClient = null;
let refreshToken = null;

let apiClientInitiated = new Promise(async (resolve, reject) => { 
    fs.readFile('.refreshtoken', 'utf8', (err, data) => {
        if(err) {
            throw `Unable to retreive .refreshtoken ${err}`
        }

        refreshToken = data.trim();
        try {
            ringApiClient = new ringClientApi.RingApi({
                refreshToken: data.trim()
            });

            resolve();
        }
        catch (e) {
            reject();
        }
    });
});

// === detect motion ===
// Lazy-load the history endpoint to prevent DDOSing the Ring API and getting a ban.
apiClientInitiated.then(async () => {
    let cameras = null;
    try {
        cameras = await ringApiClient.getCameras();
    }
    catch (e) {
        console.log(e);
        return;
    }

    cameras.forEach(camera => {
        let createFile = (filename, content, cb, err) => {
            fs.writeFile(filename, JSON.stringify(content), (e) => {  
                if (!e){
                    cb();
                } else {
                    err(e);
                }
            });
        };

        let listener = async () => {
            console.log('!! motion detected!!');
            let filename = `events.${camera.id}.json`;

            let events = await history.getHistory(ringApiClient, camera.id); 
            createFile(filename, events, 
                () => console.log(`${filename} updated`), 
                (e) => console.error(`Error while updating events ${e}`));
          };

        camera.onDoorbellPressed.subscribe(async () => { await listener(); });
        camera.onMotionDetected.subscribe(async () => { await listener(); });
    });
});

// === bootstrap the API ===

const app = express();
app.use(busboy());
app.use(bodyParser.json());

// // === API endpoints ===

app.get('/cameras', async (req, res) => {
    try {
        let results = await cameras.getCameras(ringApiClient);
        res.send(results);
    }
    catch(e) {
        console.error(e);
        res.statusCode = 500;
        res.send(e);
    }
});

app.get('/cameras/:cameraId/history', async (req, res) => {
    let readFile = (filename) => {
        fs.readFile(filename, (err, events) => { 
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.send(err);
            } else {
                res.send(JSON.parse(events));
            }
        });
    }

    let cameraId = '';
    try {
        cameraId = req.params.cameraId;
        readFile(`${__dirname}/events.${cameraId}.json`);
    }
    catch(e) {
        res.statusCode = 500;
        res.send(e);
    }
});

app.get('/cameras/:cameraId/history/:historyId', async (req, res) => {
    let archive = await history.getVideoStream(refreshToken, req.params.historyId);
    if (!archive) {
        res.statusCode = 404;
        res.send({ error: `A recording with event id ${req.params.historyId} does not exist.` });
        return;
    }

    var file = fs.readFileSync(`${__dirname}/${archive}`, 'binary');

    res.setHeader('Content-Length', file.length);
    res.write(file, 'binary');
    res.end();
});

app.get('/cameras/:cameraId/livestream', async (req, res) => {
    try {
        let cameraId = req.params.cameraId;
        let archive = await livestream.getLivestream(ringApiClient, cameraId, req.query.seconds ?? 10);
        
        let fullPathToArchive = `${__dirname}/${archive}`;

        var file = fs.readFileSync(`${__dirname}/${archive}`, 'binary');
        res.setHeader('Content-Length', file.length);
        res.write(file, 'binary');
        res.end();

        fs.unlink(fullPathToArchive, () => {});
    }
    catch(e) {
        res.statusCode = 500;
        res.send(e);
    }
});

app.route('/cameras/:cameraId/livestream')
    .post(function (req, res, next) {
        try {
            let cameraId = req.params.cameraId;

            var fstream;
            req.pipe(req.busboy);
            req.busboy.on('file', function (fieldname, file, filename) {
                // set foldername and make sure it exists
                let location = `${__dirname}/audio`;
                fs.mkdirSync(location, { recursive: true });

                // where to store the thing
                let mp4 = `${location}/${Math.random()}.mp4`;

                fstream = fs.createWriteStream(mp4);
                file.pipe(fstream);

                fstream.on('close', async () => {    
                    try {
                        await playaudio.play(ringApiClient, cameraId,mp4);
                        res.send({});
                    }
                    catch(e) {
                        res.send(e);
                    }       
                });
            });
        } 
        catch(e) {
            res.send({
                'message': 'An error occured!!',
                'error': e
            });
        }
    });

// // === start listening ===

app.listen(80, () => {
    console.log('listening on port 80');
});