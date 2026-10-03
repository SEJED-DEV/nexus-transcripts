export interface TranscriptOptions {
  limit?: number;
  fileName?: string;
  returnType?: 'attachment' | 'buffer' | 'string';
  poweredBy?: boolean;
  inlineImages?: boolean;
  inlineAvatars?: boolean;
  saveAttachments?: boolean;
  /**
   * Embeds Lottie sticker animation data directly into the transcript.
   *
   * Defaults to true. Discord's sticker CDN sends no `Access-Control-Allow-Origin`
   * header, so a browser can never read the `.json` over `fetch()` on its own -
   * without embedding, animated stickers can only be offered behind a button that
   * may fail even on a working connection. Embedding makes them play instantly
   * with no network access, at the cost of roughly 70 KB per animated sticker.
   *
   * Set to false to keep transcripts smaller and load animations on demand.
   */
  inlineLottie?: boolean;
  /**
   * Resolves the list of users behind every reaction.
   * Costs one REST request per distinct reaction, so it is opt-in.
   */
  includeReactionUsers?: boolean;
  /**
   * Maximum number of users resolved per reaction when `includeReactionUsers` is enabled.
   * @default 100
   */
  reactionUserLimit?: number;
  /**
   * Resolve `<@id>`, `<@&id>` and `<#id>` mentions to real names.
   *
   * Uses the mentions Discord already attaches to each message, and only falls
   * back to extra API requests for ids that are missing. Defaults to true.
   */
  resolveMentions?: boolean;
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

export interface EmojiPayload {
  id: string;
  name: string;
  animated: boolean;
  /**
   * Inlined base64 data URI when available, otherwise the raw Discord CDN url.
   */
  url: string;
}

export type StickerFormat = 'png' | 'apng' | 'gif' | 'lottie' | 'unknown';

export interface StickerPayload {
  id: string;
  name: string;
  description?: string;
  format: StickerFormat;
  /**
   * Undefined for lottie stickers — they ship as a .json animation, not an image.
   */
  url?: string;
  tags?: string;
}

export interface ReactionUserPayload {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bot?: boolean;
  color?: string;
}

export interface ReactionPayload {
  emoji: string;
  count: number;
  me?: boolean;
  /** Present for custom (non-unicode) emoji, used to resolve the image via the payload emojiMap. */
  emojiId?: string;
  /** Number of users who reacted with the super (burst) variant. */
  burstCount?: number;
  /** Number of users who reacted normally. */
  normalCount?: number;
  /** Gradient colors Discord assigns to super reactions. Absent for normal reactions. */
  burstColors?: string[];
  meBurst?: boolean;
  /** Only populated when the `includeReactionUsers` option is enabled. */
  users?: ReactionUserPayload[];
}

export interface MentionUserPayload {
  id: string;
  /** Server nickname when available, otherwise the username. */
  name: string;
  username: string;
  discriminator?: string;
  avatarUrl?: string;
  color?: string;
  bot?: boolean;
}

export interface MentionRolePayload {
  id: string;
  name: string;
  color?: string;
  /** Roles are hoisted differently per viewer; kept for fidelity. */
  position?: number;
}

export interface MentionChannelPayload {
  id: string;
  name: string;
  type?: number;
}

/**
 * Resolved mentions keyed by id. Discord only sends mention *ids* in message
 * content, so names have to be looked up before a transcript is readable.
 */
export interface MentionMap {
  users: Record<string, MentionUserPayload>;
  roles: Record<string, MentionRolePayload>;
  channels: Record<string, MentionChannelPayload>;
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
  emojiId?: string;
  url?: string;
  disabled?: boolean;
}

export interface V2ContainerSelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  emojiId?: string;
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

/** Text shown alongside an accessory inside a Section (component type 9). */
export interface V2ContainerSectionText {
  type: 'text';
  content: string;
}

export interface V2ContainerSection {
  type: 'section';
  texts: V2ContainerSectionText[];
  accessory?: V2ContainerThumbnail | V2ContainerButton;
}

/** Small image accessory used by a Section (component type 11). */
export interface V2ContainerThumbnail {
  type: 'thumbnail';
  url: string;
  description?: string;
  spoiler?: boolean;
}

/** Uploaded file component (component type 13). */
export interface V2ContainerFile {
  type: 'file';
  url: string;
  name?: string;
  description?: string;
  spoiler?: boolean;
}

/** Vertical padding between other components (component type 14). */
export interface V2ContainerSeparator {
  type: 'separator';
  divider?: boolean;
  spacing?: number;
}

export type V2ContainerChild =
  | V2ContainerTextDisplay
  | V2ContainerMediaGallery
  | V2ContainerActionRow
  | V2ContainerSection
  | V2ContainerThumbnail
  | V2ContainerFile
  | V2ContainerSeparator;

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
  stickers?: StickerPayload[];
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
  /**
   * Every custom emoji referenced anywhere in the transcript, keyed by emoji id.
   * Lets the template resolve `<:name:id>` tags without re-deriving CDN urls.
   */
  emojiMap?: Record<string, EmojiPayload>;
  /**
   * Resolved user/role/channel mentions, keyed by id.
   * Discord only sends ids in content, so without this every mention renders as
   * a generic "@user" placeholder.
   */
  mentionMap?: MentionMap;
}
