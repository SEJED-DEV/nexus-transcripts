import { TranscriptOptions, ChannelPayload, MessagePayload } from './types';
export declare function parseChannel(channel: any): Promise<ChannelPayload>;
export declare function parseMessages(messages: any[], options: TranscriptOptions): Promise<MessagePayload[]>;
