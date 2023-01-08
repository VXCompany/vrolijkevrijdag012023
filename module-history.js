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
            'id': e.ding_id,
            'kind': e.kind,
            'created_at': e.created_at
        };
    });
};