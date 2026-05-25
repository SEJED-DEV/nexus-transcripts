import * as fs from 'fs';
import * as path from 'path';
import { TranscriptOptions, TranscriptPayload, ChannelPayload, MessagePayload } from './types';

export async function compileTranscript(
  channel: ChannelPayload,
  messages: MessagePayload[],
  options: TranscriptOptions
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
    poweredBy: options.poweredBy !== false
  };

  const jsonPayloadString = JSON.stringify(payload);
  
  // Replace the placeholder script data
  const compiledContent = templateContent.replace(
    '/* DATA_PLACEHOLDER */',
    jsonPayloadString
  );

  return compiledContent;
}
