export interface NormalizedMessage {
    sender: string;
}

export interface NormalizedTextMessage extends NormalizedMessage {
    text: string;
    mentions: string[];
    quoted?: {
        text: string;
        mentions: string[];
    };
}

export interface NormalizedImageMessage extends NormalizedMessage {
    text: string;
    mentions: string[];
    quoted?: {
        text: string;
        mentions: string[];
    }

}


