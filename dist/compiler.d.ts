import { TranscriptOptions, ChannelPayload, MessagePayload } from './types';
export declare function compileTranscript(channel: ChannelPayload, messages: MessagePayload[], options: TranscriptOptions): Promise<string>;
