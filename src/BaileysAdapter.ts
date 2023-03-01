import HermesAdapter from "./HermesAdapter";
import makeWASocket, {
    AuthenticationState, DisconnectReason, isJidBroadcast,
    makeCacheableSignalKeyStore, makeInMemoryStore, MessageRetryMap,
    useMultiFileAuthState
} from "@verzach3/baileys-edge";
import BaileysAdapterSettings from "./BaileysAdapter.settings";
import { logger } from "./BaileysAdapter.util";
import { Boom } from "@hapi/boom";
import {forgeMessage} from "./BaileysAdapter.messageforge";
class BaileysAdapter extends HermesAdapter {
    socket: ReturnType<typeof makeWASocket> | undefined;
    settings: BaileysAdapterSettings;
    authState: { state: AuthenticationState, saveCreds: () => Promise<void> }
    socketLogger: ReturnType<typeof logger.child>;
    msgRetryCounterMap: MessageRetryMap = {}
    store: ReturnType<typeof makeInMemoryStore> | undefined;
    constructor(authState: { state: AuthenticationState, saveCreds: () => Promise<void> }, settings: BaileysAdapterSettings) {
        super();
        this.authState = authState;
        this.settings = settings;
        logger.level =settings.silentLogger ? "silent" : "info";
        this.socketLogger = logger.child({name: "BaileysAdapter"});
        if (settings.makeStore){
            this.store = makeInMemoryStore({logger: this.socketLogger });
        }
        this.store = settings.store ?? undefined;
        if (this.store){
            setInterval(() => {
                if (!this.settings.storePath) {
                    throw new Error("Store path not provided");
                };
                this.store?.writeToFile(this.settings.storePath);
            })
        }
        console.log("BaileysAdapter constructor");
    }

    async start() {
        console.log("Starting BaileysAdapter");
        this.socket = makeWASocket({
            printQRInTerminal: this.settings.printQRInTerminal,
            generateHighQualityLinkPreview: this.settings.generateHighQualityLinkPreview,
            shouldIgnoreJid: this.settings.shouldIgnoreJid ?? ((jid) => isJidBroadcast(jid)),
            auth: {
                creds: this.authState.state.creds,
                keys: makeCacheableSignalKeyStore(this.authState.state.keys, this.socketLogger),
            },
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    // || message.templateMessage
                    message.listMessage
                );
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    };
                }

                return message;
            },
            msgRetryCounterMap: this.msgRetryCounterMap,
            logger: this.socketLogger,
            getMessage: async key => {
                return (await this.store?.loadMessage(key.remoteJid!, key.id!))?.message ?? { conversation: "null" };
            }
        });
        this.store?.bind(this.socket.ev);

        this.socket.ev.process(
            async (events) => {
                if (events["connection.update"]){
                    const update = events["connection.update"];
                    const { connection, lastDisconnect } = update;
                    if (connection === "close") {
                        if ((lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut){
                            this.start();
                        } else {
                            this.isReady = false;
                        }
                    }
                }
                if (events["creds.update"]){
                    await this.authState.saveCreds();
                }
                if (events["messages.upsert"]){
                    const upsert = events["messages.upsert"];
                    if (upsert?.type === "notify"){
                        for (const message of upsert.messages){
                            const normalizedMessage = forgeMessage(message);
                            if (normalizedMessage){
                                this.emit("message", normalizedMessage);
                                console.log("Emitting message");
                            }
                        }
                    }
                }
            }
        )
    }
}

export default BaileysAdapter;