import * as https from 'https';
import { 
  TranscriptOptions, 
  ChannelPayload, 
  MessagePayload, 
  UserPayload, 
  EmbedPayload, 
  AttachmentPayload,
  ReactionPayload,
  MessageReferencePayload,
  V2Container,
  V2ContainerChild,
  V2ContainerTextDisplay,
  V2ContainerMediaGallery,
  V2ContainerMediaItem,
  V2ContainerActionRow,
  V2ContainerButton,
  V2ContainerSelectMenu,
  V2ContainerSelectOption
} from './types';

// Helper to download an asset and convert it to Base64
async function fetchBase64(url: string): Promise<string> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(url); // Fallback to raw URL if download fails
        return;
      }
      const data: Buffer[] = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const contentType = res.headers['content-type'] || 'image/png';
        resolve(`data:${contentType};base64,${buffer.toString('base64')}`);
      });
    }).on('error', () => {
      resolve(url); // Fallback to raw URL
    });
  });
}

export async function parseChannel(channel: any): Promise<ChannelPayload> {
  const guild = channel.guild || {};
  return {
    id: channel.id,
    name: channel.name || 'unnamed-channel',
    type: channel.type?.toString() || 'GUILD_TEXT',
    guildName: guild.name || 'Unknown Server',
    guildIconUrl: typeof guild.iconURL === 'function' ? guild.iconURL({ forceStatic: true, size: 64 }) : (guild.iconURL || guild.iconUrl || null),
    topic: channel.topic || null
  };
}

export async function parseMessages(
  messages: any[], 
  options: TranscriptOptions
): Promise<MessagePayload[]> {
  const parsedMessages: MessagePayload[] = [];

  for (const msg of messages) {
    const author = msg.author || {};
    const member = msg.member || {};

    // Avatar URL (optionally inlined as base64)
    let avatarUrl = typeof author.displayAvatarURL === 'function' ? author.displayAvatarURL({ forceStatic: true, size: 64 }) : (author.displayAvatarURL || author.avatarURL || author.avatarUrl || '');
    if (options.inlineAvatars && avatarUrl.startsWith('http')) {
      avatarUrl = await fetchBase64(avatarUrl);
    }

    const userPayload: UserPayload = {
      id: author.id || '0',
      username: author.username || 'Deleted User',
      discriminator: author.discriminator || '0000',
      avatarUrl,
      bot: !!author.bot,
      color: member.displayHexColor || '#ffffff',
      displayName: member.displayName || author.username || 'Deleted User'
    };

    // Parse embeds — support both nested object format and flat field format
    const embedPayloads: EmbedPayload[] = (msg.embeds || []).map((embed: any) => {
      const parsedFields = (embed.fields || []).map((f: any) => ({
        name: f.name || '',
        value: f.value || '',
        inline: !!f.inline
      }));

      // Handle both Discord.js embed objects and plain objects from tests
      const thumbnail = embed.thumbnail?.url ? { url: embed.thumbnail.url, width: embed.thumbnail.width, height: embed.thumbnail.height } : undefined;
      const image = embed.image?.url ? { url: embed.image.url, width: embed.image.width, height: embed.image.height } : undefined;
      const embedAuthor = embed.author ? { name: embed.author.name || '', iconUrl: embed.author.iconURL || embed.author.iconUrl, url: embed.author.url } : undefined;
      const footer = embed.footer ? { text: embed.footer.text || '', iconUrl: embed.footer.iconURL || embed.footer.iconUrl } : undefined;

      return {
        title: embed.title || undefined,
        description: embed.description || undefined,
        url: embed.url || undefined,
        color: embed.color || undefined,
        timestamp: embed.timestamp || undefined,
        thumbnail,
        image,
        author: embedAuthor,
        footer,
        fields: parsedFields.length ? parsedFields : undefined
      };
    });

    // Parse attachments — support Map (discord.js) or plain array (tests)
    const attachmentPayloads: AttachmentPayload[] = [];
    const rawAttachments = msg.attachments instanceof Map
      ? [...msg.attachments.values()]
      : (Array.isArray(msg.attachments) ? msg.attachments : []);

    for (const att of rawAttachments) {
      let url = att.url;
      if (
        (options.saveAttachments || (options.inlineImages && att.contentType?.startsWith('image/'))) 
        && url.startsWith('http')
      ) {
        url = await fetchBase64(url);
      }
      attachmentPayloads.push({
        id: att.id,
        name: att.name || 'attachment',
        url,
        size: att.size || 0,
        contentType: att.contentType || undefined,
        width: att.width || undefined,
        height: att.height || undefined
      });
    }

    // Parse reactions
    const reactionPayloads: ReactionPayload[] = [];
    const rawReactions = msg.reactions instanceof Map
      ? [...msg.reactions.values()]
      : (Array.isArray(msg.reactions) ? msg.reactions : []);

    for (const rx of rawReactions) {
      // discord.js reaction objects have a .emoji property and .count
      const emoji = rx.emoji?.toString() || rx.emoji || rx;
      const count = typeof rx.count === 'number' ? rx.count : (rx.count ?? 1);
      const me = rx.me ?? false;
      reactionPayloads.push({ emoji: emoji.toString(), count, me });
    }

    // Parse message reference (replies)
    let reference: MessageReferencePayload | undefined;
    if (msg.reference) {
      reference = {
        messageId: msg.reference.messageId || msg.reference.message_id,
        channelId: msg.reference.channelId || msg.reference.channel_id,
        guildId: msg.reference.guildId || msg.reference.guild_id,
      };
    }

    // Parse v2 container components (Discord.js v14.18+)
    let containers: V2Container[] | undefined;
    if (msg.containers && Array.isArray(msg.containers)) {
      containers = msg.containers;
    } else if (msg.components && Array.isArray(msg.components)) {
      const rawContainers = msg.components.filter((c: any) => {
        if (c.type === 12) return true;
        if (c.components && Array.isArray(c.components)) {
          return c.components.some((child: any) => child.type === 5 || child.type === 6);
        }
        return false;
      });
      if (rawContainers.length) {
        containers = rawContainers.map((container: any) => {
          const children: V2ContainerChild[] = [];
          const rawChildren = container.components || [];
          for (const child of rawChildren) {
            if (child.type === 5 || child.constructor?.name === 'TextDisplayBuilder') {
              const td: V2ContainerTextDisplay = {
                type: 'text_display',
                content: child.content || '',
              };
              children.push(td);
            } else if (child.type === 6 || child.constructor?.name === 'MediaGalleryBuilder') {
              const rawItems = child.items || [];
              const items: V2ContainerMediaItem[] = rawItems.map((item: any) => ({
                url: item.url || '',
                description: item.description || undefined,
                spoiler: !!item.spoiler,
              }));
              const mg: V2ContainerMediaGallery = { type: 'media_gallery', items };
              children.push(mg);
            } else if (child.type === 1 || child.constructor?.name === 'ActionRowBuilder') {
              const rowComponents: (V2ContainerButton | V2ContainerSelectMenu)[] = [];
              const rawRowChildren = child.components || [];
              for (const rc of rawRowChildren) {
                if (rc.type === 2 || rc.constructor?.name === 'ButtonBuilder') {
                  const btn: V2ContainerButton = {
                    customId: rc.customId || undefined,
                    label: rc.label || '',
                    style: rc.style ?? 1,
                    emoji: rc.emoji?.toString() || rc.emoji || undefined,
                    url: rc.url || undefined,
                    disabled: !!rc.disabled,
                  };
                  rowComponents.push(btn);
                } else if (rc.type === 3 || rc.type === 5 || rc.type === 6 || rc.type === 7 || rc.type === 8 ||
                           rc.constructor?.name?.includes('SelectMenuBuilder')) {
                  const rawOptions = rc.options || [];
                  const options: V2ContainerSelectOption[] = rawOptions.map((opt: any) => ({
                    label: opt.label || '',
                    value: opt.value || '',
                    description: opt.description || undefined,
                    emoji: opt.emoji?.toString() || opt.emoji || undefined,
                    default: !!opt.default,
                  }));
                  const sm: V2ContainerSelectMenu = {
                    customId: rc.customId || undefined,
                    placeholder: rc.placeholder || undefined,
                    options,
                    disabled: !!rc.disabled,
                  };
                  rowComponents.push(sm);
                }
              }
              const ar: V2ContainerActionRow = { type: 'action_row', components: rowComponents };
              children.push(ar);
            }
          }
          return {
            accentColor: container.accentColor ?? container.accent_color ?? undefined,
            components: children,
          } satisfies V2Container;
        });
      }
    }

    parsedMessages.push({
      id: msg.id,
      author: userPayload,
      content: msg.content || '',
      timestamp: msg.createdTimestamp || Date.now(),
      editedTimestamp: msg.editedTimestamp || null,
      embeds: embedPayloads,
      attachments: attachmentPayloads,
      reactions: reactionPayloads.length ? reactionPayloads : undefined,
      reference,
      system: !!msg.system,
      pinned: !!msg.pinned,
      containers,
    });
  }

  return parsedMessages;
}
