import {proto} from "@verzach3/baileys-edge";
import {NormalizedTextMessage, NormalizedImageMessage} from "./NormalizedMessage";

export function forgeMessage(messageInfo: proto.IWebMessageInfo){
    if (messageInfo.message === null) {
        return null;
    }
    console.dir(messageInfo);
    if (messageInfo.message?.extendedTextMessage) {
        return forgeTextMessage(messageInfo);
    }
}

function forgeTextMessage(messageInfo: proto.IWebMessageInfo): NormalizedTextMessage {
    const extendedTextMessage = messageInfo.message!.extendedTextMessage;
    return {
        sender: messageInfo.key.remoteJid ?? "",
        text: extendedTextMessage?.text ?? "",
        mentions: extendedTextMessage?.contextInfo?.mentionedJid ?? [],
        quoted: extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage ? {
            text: (extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || messageInfo.message?.conversation) ?? "",
            mentions: extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.contextInfo?.mentionedJid ?? []
        } : undefined
    }
}

