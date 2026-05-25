export interface TranscriptOptions {
  limit?: number;
  fileName?: string;
  returnType?: 'attachment' | 'buffer' | 'string';
  poweredBy?: boolean;
  inlineImages?: boolean;
  inlineAvatars?: boolean;
  saveAttachments?: boolean;
  theme?: 'dark' | 'light' | 'oled' | 'aurora' | 'cyberpunk' | 'sunset' | 'rosegold' | 'forest';
}

export interface UserPayload {
  id: string;
  username: string;
  discriminator: string;
  avatarUrl: string;
  bot: boolean;
  color?: string;
  displayName?: string;
}

export interface EmbedFieldPayload {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedAuthorPayload {
  name: string;
  iconUrl?: string;
  url?: string;
}

export interface EmbedFooterPayload {
  text: string;
  iconUrl?: string;
}

export interface EmbedMediaPayload {
  url: string;
  width?: number;
  height?: number;
}

export interface EmbedPayload {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  thumbnail?: EmbedMediaPayload;
  image?: EmbedMediaPayload;
  author?: EmbedAuthorPayload;
  footer?: EmbedFooterPayload;
  fields?: EmbedFieldPayload[];
}

export interface AttachmentPayload {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType?: string;
  width?: number;
  height?: number;
}

export interface ReactionPayload {
  emoji: string;
  count: number;
  me?: boolean;
}

export interface MessageReferencePayload {
  messageId?: string;
  channelId?: string;
  guildId?: string;
}

export interface MessagePayload {
  id: string;
  author: UserPayload;
  content: string;
  timestamp: number;
  editedTimestamp?: number | null;
  embeds: EmbedPayload[];
  attachments: AttachmentPayload[];
  reactions?: ReactionPayload[];
  reference?: MessageReferencePayload;
  system?: boolean;
  pinned?: boolean;
}

export interface ChannelPayload {
  id: string;
  name: string;
  type: string;
  guildName: string;
  guildIconUrl: string | null;
  topic?: string | null;
  messageCount?: number;
}

export interface TranscriptPayload {
  channel: ChannelPayload;
  messages: MessagePayload[];
  generatedAt: number;
  poweredBy: boolean;
}
