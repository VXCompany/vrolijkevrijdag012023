class cameras {
    static getCameras = async (ringApiClient) => {
        let cameras = await ringApiClient.getCameras();
        
        return cameras.map(c => {
            return { 
                'id': c.id, 
                'name': c.name, 
                'kind': c.data.kind 
            };
        });
    };
}

export default cameras;