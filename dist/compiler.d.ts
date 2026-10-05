import { TranscriptOptions, ChannelPayload, MessagePayload, EmojiPayload, MentionMap } from './types';
export declare function compileTranscript(channel: ChannelPayload, messages: MessagePayload[], options: TranscriptOptions, emojiMap?: Record<string, EmojiPayload>, mentionMap?: MentionMap): Promise<string>;
