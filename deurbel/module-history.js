const fs = require('fs');
const { exec } = require("child_process");
const ffmpeg = require('ffmpeg');
const archiver = require('archiver');
const sleep = ms => new Promise(r => setTimeout(r, ms));


exports.getHistory = async (ringApiClient, cameraId) => {
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

exports.getVideoStream = async (refreshToken, historyId) => {
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
};

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
    while (!url && !err404 && retries < 10)
    {
        retries = retries +1;

        let getUrl = new Promise(async resolve => {
            let endpointUri = `https://api.ring.com/clients_api/dings/${historyId}/share/download?disable_redirect=true`;
            console.log(`Url = null, attempt ${retries} of 10 fetching ${endpointUri}`);

            await fetch(endpointUri, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(async (data) => {
                console.log(`${data.status}: ${data.statusText}`);

                if(data.status == 404) {
                    err404 = true;
                    resolve(null);
                    return;
                }

                let d = await data.json();
                resolve(d.url);
            });
        });

        url = await getUrl;

        if(!url) await new Promise(r => setTimeout(r, 2000));
    }

    return url;
}

async function GetToken(refreshToken) {
    let token = await new Promise(async (resolve) => {
        fs.readFile('.accesstoken', (err, data) => {
            const { birthtime } = fs.statSync('.accesstoken');
            let createdAt = new Date(birthtime).getTime();
            let tokenExpiryDate = createdAt + (3540 * 1000);

            if(Date.now() > tokenExpiryDate) {
                console.log(`Token expired. \n${Date.now()} > \n${createdAt + 3500000}`);
                fs.unlink(`${__dirname}/.accesstoken`, () => {});
                resolve(null);
            }

            if(data) {
                let response = JSON.parse(data);
                resolve(response.access_token);
            } else {
                resolve(null);
            }
        })
    });

    let getToken = new Promise(async resolve => {
        await fetch('https://oauth.ring.com/oauth/token', {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=refresh_token&refresh_token=${refreshToken}`
        }).then(async data => {
            let text = await data.text();
            fs.writeFileSync('.accesstoken', text);
            let d = JSON.parse(text);
            resolve(d.access_token);
        });
    });

    if(!token)
    {
        console.log('renewing token..');
        token = await getToken;
    }

    return token;
}