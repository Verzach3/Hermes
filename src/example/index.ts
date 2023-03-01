import Hermes from "../Hermes";
import BaileysAdapter from "../BaileysAdapter";
import makeWASocket, {useMultiFileAuthState} from "@verzach3/baileys-edge";
import BaileysAdapterSettings from "../BaileysAdapter.settings";
import inquirer from "inquirer";
async function main() {
    const auth = await useMultiFileAuthState("test_auth");
    const settings: BaileysAdapterSettings = {
        printQRInTerminal: true,
        generateHighQualityLinkPreview: true,
        makeStore: true,
        storePath: "./test_store"
    }
    const hermes = new Hermes(new BaileysAdapter(auth, settings));

    await hermes.start();
    await hermes.loadPlugins();
    hermes.handleMessages()
    hermes.adapter.seteventEmitter(hermes.eventEmitter);
    hermes.consoleHandler();
}
main().then(r => console.log("Done"));
