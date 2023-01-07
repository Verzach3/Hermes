import Hermes from "../Hermes";
import BaileysAdapter from "../BaileysAdapter";
import makeWASocket, {useMultiFileAuthState} from "@verzach3/baileys-edge";
import BaileysAdapterSettings from "../BaileysAdapter.settings";
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
}
main().then(r => console.log("Done"));