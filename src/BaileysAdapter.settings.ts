import {makeInMemoryStore} from "@verzach3/baileys-edge";

export default interface BaileysAdapterSettings {
    printQRInTerminal?: boolean;
    generateHighQualityLinkPreview?: boolean;
    shouldIgnoreJid?: ((jid: string) => boolean | undefined) | undefined;
    store?: ReturnType<typeof makeInMemoryStore>;
    makeStore?: boolean;
    storePath?: string;
}