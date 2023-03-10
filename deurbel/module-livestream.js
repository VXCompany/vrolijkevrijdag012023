import ffmpeg from 'ffmpeg';
import fs from 'fs';
import archiver from 'archiver';

const sleep = ms => new Promise(r => setTimeout(r, ms));

class livestream {
    static getLivestream = async (ringApiClient, cameraId, seconds) => { 
        console.log(`>> initiating live-stream for camera #${cameraId}`);

        // define where everything goes
        let random = Math.random();
        let recordingsFolder = `recordings/${random}`;
        let archiveFolder = `archives/${random}`;
        let mp4 = `${recordingsFolder}/recording.mp4`;
        let zipfile = `${archiveFolder}/recording.zip`;

        fs.mkdirSync(recordingsFolder, { recursive: true });
        fs.mkdirSync(archiveFolder, { recursive: true });

        try {
            // get camera
            let cameras = await ringApiClient.getCameras();
            let camera = cameras.filter(c => c.id == cameraId)[0];

            if(!camera) {
                throw `Camera with id ${cameraId} not found.`;
            }

            // activate the camera and the speaker
            let livecall = await camera.startLiveCall();
            livecall.activateCameraSpeaker();
            await sleep(500);

            // record
            await new Promise(async (resolve, reject) => {
                let inProgress = true; 

                console.log('start recording');
                camera.recordToFile(mp4, seconds).then(() => {
                    console.log('stopping');
                    livecall.stop()
                    console.log('recording stopped');
                    inProgress = false;
                    resolve();
                });

                setTimeout(() => {
                    if(inProgress){ 
                        console.log('aborting...');
                        reject(); 
                    }
                }, 20000);
            });

            console.log('converting the results');

            // convert output to mp3 and screen captures
            await new Promise(async (resolve, reject) => {
                console.log('initializing mpeg');
                var mpeg = new ffmpeg(mp4);
                mpeg.then(async (video) => {
                    let options = { start_time: '00:00:00', every_n_frames: 25 };
                    video.fnExtractFrameToJPG(recordingsFolder, options).then(() => {
                        video.fnExtractSoundToMP3(`${recordingsFolder}/recording.mp3`).then(() => {
                            resolve();
                        });
                    });
                }, function (err) {
                    console.log('Error: ' + err);
                    console.log('Are you sure you have ffmpeg installed? (brew install ffmpeg)');
                    reject(err);
                });
            });

            // zip the results
            console.log('archiving the results');
            var output = fs.createWriteStream(zipfile);

            var archive = archiver('zip', {
                zlib: { level: 9 } // Sets the compression level.
            });

            archive.pipe(output);
            archive.glob('*.*', {cwd: recordingsFolder});
            await archive.finalize();
            await sleep(100);

            return zipfile;
        }
        catch(e) {
            fs.rmSync(archiveFolder, { recursive: true, force: true });
            throw e;
        }
        finally {
            fs.rmSync(recordingsFolder, { recursive: true, force: true });
        }
    }
}

export default livestream;