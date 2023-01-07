import HermesAdapter from "./HermesAdapter";

class Hermes {
    adapter: HermesAdapter;
    constructor(adapter: HermesAdapter) {
        this.adapter = adapter;

        console.log("Hermes constructor");
    }

    async start() {
        await this.adapter.start();
    }
}

export default Hermes;