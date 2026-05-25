import { TranscriptOptions } from './types';
/**
 * Generates an interactive HTML transcript from a Discord.js channel.
 * @param channel The Discord.js-like text channel object.
 * @param options Configurations for rendering.
 */
export declare function createTranscript(channel: any, options?: TranscriptOptions): Promise<string | Buffer | any>;
/**
 * Generates an interactive HTML transcript from a list of Discord.js messages.
 * @param messages Array or Collection of messages.
 * @param channel The Discord.js-like text channel object.
 * @param options Configurations for rendering.
 */
export declare function generateFromMessages(messages: any[] | {
    values: () => Iterable<any>;
} | any, channel: any, options?: TranscriptOptions): Promise<string | Buffer | any>;
export * from './types';
export { parseChannel, parseMessages } from './parser';
export { compileTranscript } from './compiler';
declare const _default: {
    createTranscript: typeof createTranscript;
    generateFromMessages: typeof generateFromMessages;
};
export default _default;
