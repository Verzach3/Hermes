
class HermesAdapter {
    protected isReady = false;
    constructor() {
        console.log("HermesAdapter constructor");
    }

    async start() {
        console.log("HermesAdapter start");
    }
}

export default HermesAdapter;