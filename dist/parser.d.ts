import { TranscriptOptions, ChannelPayload, MessagePayload, EmojiPayload, MentionMap } from './types';
/**
 * Collects every custom emoji referenced by a transcript so each one is
 * downloaded and inlined exactly once, keyed by emoji id.
 */
export interface EmojiCollector {
    emojiMap: Record<string, EmojiPayload>;
    register(id: string | null | undefined, name?: string | null, animated?: boolean | null): Promise<void>;
    scan(raw: unknown): Promise<void>;
}
export declare function createEmojiCollector(): EmojiCollector;
/**
 * Collects resolved mentions across a transcript.
 *
 * Discord only ever puts ids in content, so names must be looked up. Everything
 * reachable from `msg.mentions` (already parsed by discord.js, no API cost) is
 * used first; the guild caches cover most of the rest. Anything still unknown
 * falls back to a single API request per id, and failing that renders as the
 * generic placeholder rather than breaking generation.
 */
export interface MentionCollector {
    mentionMap: MentionMap;
    scan(raw: unknown, msg?: any): Promise<void>;
    empty(): boolean;
}
export declare function createMentionCollector(options: TranscriptOptions): MentionCollector;
export declare function parseChannel(channel: any): Promise<ChannelPayload>;
export declare function parseMessages(messages: any[], options: TranscriptOptions, collector?: EmojiCollector, mentions?: MentionCollector): Promise<MessagePayload[]>;
