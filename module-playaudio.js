const fs = require('fs');
const ffmpeg = require('ffmpeg');

exports.play = async (ringApiClient, cameraId, pathToAudioFile) => {
    // get camera
    console.log('listing cameras');
    let cameras = await ringApiClient.getCameras();
    let camera = cameras.filter(c => c.id == cameraId)[0];

    if(!camera) {
        throw `Camera with id ${cameraId} not found.`;
    }

    console.log('activate livecall');
    let livecall = await camera.startLiveCall();

    console.log('activate speaker');
    livecall.activateCameraSpeaker();

    setTimeout(() => {
        console.log(`streaming file ${pathToAudioFile}`);
        livecall.transcodeReturnAudio({
            input: [pathToAudioFile]
        }).then(() => {
            new ffmpeg(pathToAudioFile, (err, audio) => {
                var duration = audio.metadata.duration;
                if(!duration && ! duration.seconds) {
                    return;
                }

                var durationInMs = duration.seconds * 1000;
                var justToBeSure = durationInMs + 1000;

                console.log(`waiting ${justToBeSure} to end the livecall`);

                fs.unlink(pathToAudioFile, () => {});
                setTimeout(() => {
                    livecall.stop();
                }, justToBeSure);
            });
        });
    }, 1500);

};