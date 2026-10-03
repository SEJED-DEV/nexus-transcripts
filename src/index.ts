import { TranscriptOptions } from './types';
import { parseChannel, parseMessages, createEmojiCollector, createMentionCollector } from './parser';
import { compileTranscript } from './compiler';

/**
 * Generates an interactive HTML transcript from a Discord.js channel.
 * @param channel The Discord.js-like text channel object.
 * @param options Configurations for rendering.
 */
export async function createTranscript(
  channel: any,
  options: TranscriptOptions = {}
): Promise<string | Buffer | any> {
  const limit = options.limit ?? -1;
  
  // Fetch messages from Discord.js channel structure if fetch exists.
  // Ordering is normalised inside parseMessages(), so both branches can pass
  // messages through untouched (Discord returns them newest-first).
  let messagesList: any[] = [];
  if (channel.messages && typeof channel.messages.fetch === 'function') {
    const fetchLimit = limit === -1 ? 100 : Math.min(limit, 100);
    const fetched = await channel.messages.fetch({ limit: fetchLimit });
    messagesList = Array.from(fetched.values());
  } else if (Array.isArray(channel.messages)) {
    messagesList = channel.messages;
  }

  return generateFromMessages(messagesList, channel, options);
}

/**
 * Generates an interactive HTML transcript from a list of Discord.js messages.
 * @param messages Array or Collection of messages.
 * @param channel The Discord.js-like text channel object.
 * @param options Configurations for rendering.
 */
export async function generateFromMessages(
  messages: any[] | { values: () => Iterable<any> } | any,
  channel: any,
  options: TranscriptOptions = {}
): Promise<string | Buffer | any> {
  const messageArray = Array.isArray(messages) 
    ? messages 
    : (messages.values ? Array.from(messages.values()) : []);

  const parsedChannel = await parseChannel(channel);
  // Shared collectors so every custom emoji is inlined once and every
  // mention is resolved once across the whole transcript.
  const emojiCollector = createEmojiCollector();
  const mentionCollector = createMentionCollector(options);
  const parsedMessages = await parseMessages(messageArray, options, emojiCollector, mentionCollector);
  const htmlContent = await compileTranscript(
    parsedChannel,
    parsedMessages,
    options,
    emojiCollector.emojiMap,
    mentionCollector.mentionMap
  );

  const returnType = options.returnType || 'string';

  if (returnType === 'buffer') {
    return Buffer.from(htmlContent, 'utf-8');
  }

  // If discord.js AttachmentBuilder class is desired, we can return a mock structure
  // that behaves like an AttachmentBuilder so that it is drop-in compatible.
  if (returnType === 'attachment') {
    const filename = options.fileName || `transcript-${parsedChannel.name}.html`;
    return {
      attachment: Buffer.from(htmlContent, 'utf-8'),
      name: filename,
      description: 'Interactive transcript created by Nexus Transcripts'
    };
  }

  return htmlContent;
}

export * from './types';
export { parseChannel, parseMessages, createEmojiCollector, createMentionCollector } from './parser';
export { compileTranscript } from './compiler';
export default {
  createTranscript,
  generateFromMessages
};
