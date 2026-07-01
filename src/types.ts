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

// V2 Container Component types (Discord.js v14.18+)
export interface V2ContainerButton {
  customId?: string;
  label: string;
  style: number;
  emoji?: string;
  url?: string;
  disabled?: boolean;
}

export interface V2ContainerSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}

export interface V2ContainerSelectMenu {
  customId?: string;
  placeholder?: string;
  options: V2ContainerSelectOption[];
  disabled?: boolean;
}

export interface V2ContainerTextDisplay {
  type: 'text_display';
  content: string;
}

export interface V2ContainerMediaItem {
  url: string;
  description?: string;
  spoiler?: boolean;
}

export interface V2ContainerMediaGallery {
  type: 'media_gallery';
  items: V2ContainerMediaItem[];
}

export interface V2ContainerActionRow {
  type: 'action_row';
  components: (V2ContainerButton | V2ContainerSelectMenu)[];
}

export type V2ContainerChild = V2ContainerTextDisplay | V2ContainerMediaGallery | V2ContainerActionRow;

export interface V2Container {
  accentColor?: number;
  components: V2ContainerChild[];
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
  containers?: V2Container[];
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
