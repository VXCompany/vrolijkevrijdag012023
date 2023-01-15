import fs from 'fs';
import { exec } from 'child_process';
import ffmpeg from 'ffmpeg';
import archiver from 'archiver';
import https from 'https';
import path from 'path';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const __dirname = path.dirname('module-history.js');

class history {
    static getHistory = async (ringApiClient, cameraId) => {
        console.log(`>> getting camera history for camera #${cameraId}`);

        let cameras = await ringApiClient.getCameras();
        let camera = cameras.filter(c => c.id == cameraId)[0];

        if(!camera) {
            throw `Camera with id ${cameraId} not found.`;
        }

        let history = await camera.getEvents({ 'limit': 10});
        return history.events.map(e => {
            return {
                'id': e.ding_id_str,
                'kind': e.kind,
                'created_at': e.created_at
            };
        });
    };

    static getVideoStream = async (refreshToken, historyId) => {
        let zipfile = `recordings/${historyId}.zip`;
        if (fs.existsSync(zipfile)) {
            console.log(`${zipfile} exists. Returning it straight away.`);
            return zipfile;
        }

        let token = await GetToken(refreshToken);
        let url = await GetVideoUrl(historyId, token);

        if(!url) return null;

        await DownloadVideoToZipfile(url, historyId, zipfile);

        return zipfile;

        async function DownloadVideoToZipfile(url, historyId, zipfile) {
            let recordingsFolder = `recordings/${historyId}`;
            fs.mkdirSync(recordingsFolder, { recursive: true });
            let filename = `${recordingsFolder}/recording.mp4`;
    
            await new Promise(async (resolve, reject) => {
                console.log(`curl '${url}' > ${filename}`);
                exec(`curl '${url}' > ${filename}`, (error, stdout, stderr) => {
                    if(error) reject(error);
                    console.log('done');
                    resolve();
                });
            });
    
            await new Promise(async (resolve, reject) => {
                var mpeg = new ffmpeg(filename);
                mpeg.then(async (video) => {
                    let options = { start_time: '00:00:00', every_n_frames: 25 };
                    video.fnExtractFrameToJPG(recordingsFolder, options).then(() => {
                        video.fnExtractSoundToMP3(`${recordingsFolder}/recording.mp3`).then(resolve);
                    });
                }, function (err) {
                    console.log('Error: ' + err);
                    console.log('Are you sure you have ffmpeg installed? (brew install ffmpeg)');
                    reject(err);
                });
            });
    
            var output = fs.createWriteStream(zipfile);
    
            var archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });
    
            archive.pipe(output);
            archive.glob('*.*', {cwd: recordingsFolder});
            await archive.finalize();
            await sleep(250);
        }
    
        async function GetVideoUrl(historyId, token) {
            let url = null;
            let err404 = null;
            let retries = 0;

            let endpoint = `/clients_api/dings/${historyId}/share/download?disable_redirect=true`;

            while (!url && !err404 && retries < 10)
            {
                retries = retries +1;
    
                console.log(`Url = null, attempt ${retries} of 10 fetching ${endpoint}`);

                url = await new Promise((resolve, reject) => {
                    let responseText = '';

                    let request = https.request({
                        host: 'api.ring.com',
                        port: '443',
                        path: endpoint,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }, 
                    (response) => {
                        console.log(`Server response: ${response.statusCode}`);

                        response.setEncoding('utf8');
                        response.on('data', (text) => {
                            responseText += text;
                        });

                        response.on('end', () => {
                            try {
                                const body = JSON.parse(responseText);
                                resolve(body.url);
                            }
                            catch (e) {
                                console.log(`Unable to parse "${responseText}"`);
                                console.log('Ignoring...');
                                resolve(null);
                            }
                        });
                    });

                    request.on('error', (error) => {
                        console.log(error);
                        err404 = true
                        reject(error);
                    });

                    request.end();
                });
    
                if(!url) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
    
            return url;
        }
    
        async function GetToken(refreshToken) {
            let token = await new Promise(async (resolve, reject) => {
                if (!fs.existsSync('.accesstoken')) {
                    resolve(null);
                    return;
                }

                fs.readFile('.accesstoken', (err, data) => {
                    const { birthtime } = fs.statSync('.accesstoken');
                    let createdAt = new Date(birthtime).getTime();
                    let tokenExpiryDate = createdAt + (3540 * 1000);
    
                    if(Date.now() > tokenExpiryDate) {
                        fs.unlink(`${__dirname}/.accesstoken`, () => {});
                        resolve(null);
                    }
    
                    if(data && data != '') {
                        let response = JSON.parse(data);
                        resolve(response.access_token);
                    } else {
                        resolve(null);
                    }
                })
            });

            if(!token)
            {
                // If you want to learn how to violate the Single Responsibility Principle: read this code:
                console.log('renewing token..');
                token = await new Promise(async resolve => {
                    let filestream = fs.createWriteStream('.accesstoken');
                    let filestreamRefreshToken = fs.createWriteStream('.refreshtoken');
                    let responseText = '';

                    console.log(`Aquiring accesstoken from https://oauth.ring.com/oauth/token`);
                    let postData = `grant_type=refresh_token&refresh_token=${refreshToken}`;

                    let request = https.request({
                        host: 'oauth.ring.com',
                        port: '443',
                        path: '/oauth/token',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                            'Content-Length': Buffer.byteLength(postData)
                        }
                    }, (res) => {
                        console.log(`Server response: ${res.statusCode}`);
                        res.setEncoding('utf8');
                        res.on('data', (text) => {
                            filestream.write(text);
                            responseText += text;
                        });

                        res.on('end', () => {
                            console.log(responseText);
                            let responseObject = JSON.parse(responseText);
                            filestreamRefreshToken.write(responseObject.refresh_token);
                            resolve(responseObject.access_token);
                        });
                    });

                    request.write(postData);
                    request.end();
                });
            }
    
            return token;
        }
    };
}

export default history;