import * as fs from 'fs';
import * as path from 'path';
import { TranscriptOptions, TranscriptPayload, ChannelPayload, MessagePayload, EmojiPayload, MentionMap } from './types';

export async function compileTranscript(
  channel: ChannelPayload,
  messages: MessagePayload[],
  options: TranscriptOptions,
  emojiMap?: Record<string, EmojiPayload>,
  mentionMap?: MentionMap
): Promise<string> {
  const templatePath = path.join(__dirname, 'template', 'ui.html');
  
  let templateContent = '';
  try {
    templateContent = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    // Fallback if running from a different relative path
    const altPath = path.join(process.cwd(), 'src', 'template', 'ui.html');
    templateContent = fs.readFileSync(altPath, 'utf8');
  }

  const payload: TranscriptPayload = {
    channel,
    messages,
    generatedAt: Date.now(),
    poweredBy: options.poweredBy !== false,
    emojiMap: emojiMap && Object.keys(emojiMap).length ? emojiMap : undefined,
    mentionMap: mentionMap && (
      Object.keys(mentionMap.users).length
      || Object.keys(mentionMap.roles).length
      || Object.keys(mentionMap.channels).length
    ) ? mentionMap : undefined
  };

  const jsonPayloadString = JSON.stringify(payload);

  // Discord serves Lottie stickers as .json animation data, so something has to
  // play them. The player is ~240KB, so it is only inlined when the transcript
  // actually contains a Lottie sticker - otherwise those files would carry it
  // for nothing.
  const needsLottie = messages.some(m => (m.stickers || []).some(s => s.format === 'lottie'));
  if (needsLottie) {
    templateContent = templateContent.replace(
      '/* LOTTIE_RUNTIME */',
      readLottieRuntime()
    );
  } else {
    // Leave the placeholder as a comment so the file stays valid HTML.
    templateContent = templateContent.replace('/* LOTTIE_RUNTIME */', '');
  }

  // Replace the placeholder script data
  const compiledContent = templateContent.replace(
    '/* DATA_PLACEHOLDER */',
    jsonPayloadString
  );

  return compiledContent;
}

function readLottieRuntime(): string {
  const candidates = [
    path.join(__dirname, 'template', 'vendor', 'lottie_svg.min.js'),
    path.join(process.cwd(), 'src', 'template', 'vendor', 'lottie_svg.min.js')
  ];
  for (const candidate of candidates) {
    try {
      return fs.readFileSync(candidate, 'utf8');
    } catch {
      // try the next location
    }
  }
  console.warn(
    '[nexus-transcripts] Lottie sticker found but the vendored lottie player ' +
    'was not found; Lottie stickers will fall back to a static placeholder.'
  );
  return '';
}
