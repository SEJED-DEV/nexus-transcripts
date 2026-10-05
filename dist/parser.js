"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmojiCollector = createEmojiCollector;
exports.createMentionCollector = createMentionCollector;
exports.parseChannel = parseChannel;
exports.parseMessages = parseMessages;
const https = __importStar(require("https"));
// Helper to download an asset and convert it to Base64
async function fetchBase64(url) {
    return new Promise((resolve) => {
        let settled = false;
        const done = (value) => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            resolve(value);
        };
        // A slow or black-holed CDN must never hang transcript generation
        const timer = setTimeout(() => {
            req.destroy();
            done(url); // Fallback to raw URL
        }, 10000);
        const req = https.get(url, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                done(url); // Fallback to raw URL if download fails
                return;
            }
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(data);
                const contentType = res.headers['content-type'] || 'image/png';
                done(`data:${contentType};base64,${buffer.toString('base64')}`);
            });
            res.on('error', () => done(url));
        });
        req.on('error', () => {
            done(url); // Fallback to raw URL
        });
    });
}
// Matches Discord custom emoji tags: <:name:id> and <a:name:id>
const CUSTOM_EMOJI_TAG = /<(a)?:([A-Za-z0-9_~]{1,64}):(\d+)/g;
function createEmojiCollector() {
    const emojiMap = {};
    const inflight = new Map();
    const load = (id, name, animated) => {
        const pending = inflight.get(id);
        if (pending)
            return pending;
        const task = (async () => {
            const isAnimated = !!animated;
            const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}`;
            emojiMap[id] = {
                id,
                name: name || 'emoji',
                animated: isAnimated,
                url: await fetchBase64(url)
            };
        })();
        inflight.set(id, task);
        return task;
    };
    const collector = {
        emojiMap,
        register: (id, name, animated) => (id ? load(String(id), name, animated) : Promise.resolve()),
        scan: async (raw) => {
            if (typeof raw !== 'string' || !raw)
                return;
            for (const match of raw.matchAll(CUSTOM_EMOJI_TAG)) {
                await collector.register(match[3], match[2], !!match[1]);
            }
        }
    };
    return collector;
}
// Mention syntax Discord accepts inside message content:
//   <@123> / <@!123> user, <@&123> role, <#123> channel, <@&everyone> @everyone
const USER_MENTION = /<@!?(\d+)>/g;
const ROLE_MENTION = /<@&(\d+)>/g;
const CHANNEL_MENTION = /<#(\d+)>/g;
function createMentionCollector(options) {
    const mentionMap = { users: {}, roles: {}, channels: {} };
    const attempted = new Set();
    const key = (kind, id) => kind + ':' + id;
    const addUser = (id, user, member) => {
        if (!user || mentionMap.users[id])
            return;
        let avatarUrl;
        try {
            avatarUrl = typeof user.displayAvatarURL === 'function'
                ? user.displayAvatarURL({ extension: 'png', size: 64 })
                : user.avatarUrl;
        }
        catch {
            avatarUrl = undefined;
        }
        // Discord reports #000000 when a member/role has no colour set.
        const hexColor = (member && member.displayHexColor) || user.displayHexColor;
        const color = hexColor && hexColor !== '#000000' ? hexColor : undefined;
        mentionMap.users[id] = {
            id,
            name: (member && member.displayName) || user.displayName || user.username || 'Unknown User',
            username: user.username || 'unknown',
            discriminator: user.discriminator || undefined,
            avatarUrl,
            color,
            bot: !!user.bot
        };
    };
    const addRole = (id, role) => {
        if (!role || mentionMap.roles[id])
            return;
        mentionMap.roles[id] = {
            id,
            name: role.name || 'unknown-role',
            color: role.hexColor && role.hexColor !== '#000000' ? role.hexColor : undefined,
            position: typeof role.position === 'number' ? role.position : undefined
        };
    };
    const addChannel = (id, channel) => {
        if (!channel || mentionMap.channels[id])
            return;
        mentionMap.channels[id] = {
            id,
            name: channel.name || 'unknown-channel',
            type: typeof channel.type === 'number' ? channel.type : undefined
        };
    };
    /** Cache/API lookup for ids discord.js did not attach to this message. */
    const resolveMissing = async (kind, id, msg) => {
        const k = key(kind, id);
        if (attempted.has(k))
            return;
        attempted.add(k);
        const guild = msg && msg.guild;
        try {
            if (kind === 'user') {
                const cached = guild && guild.members && guild.members.cache
                    ? guild.members.cache.get(id) : undefined;
                if (cached)
                    return addUser(id, cached.user, cached);
                if (options.resolveMentions === false)
                    return;
                if (guild && guild.members && typeof guild.members.fetch === 'function') {
                    const member = await guild.members.fetch(id).catch(() => null);
                    if (member)
                        return addUser(id, member.user, member);
                }
                return;
            }
            if (kind === 'role') {
                const cached = guild && guild.roles && guild.roles.cache ? guild.roles.cache.get(id) : undefined;
                if (cached)
                    return addRole(id, cached);
                if (options.resolveMentions === false)
                    return;
                if (guild && guild.roles && typeof guild.roles.fetch === 'function') {
                    const role = await guild.roles.fetch(id).catch(() => null);
                    if (role)
                        return addRole(id, role);
                }
                return;
            }
            const client = msg && msg.client;
            const cached = client && client.channels && client.channels.cache
                ? client.channels.cache.get(id) : undefined;
            if (cached)
                return addChannel(id, cached);
            if (options.resolveMentions === false)
                return;
            if (client && client.channels && typeof client.channels.fetch === 'function') {
                const channel = await client.channels.fetch(id).catch(() => null);
                if (channel)
                    return addChannel(id, channel);
            }
        }
        catch {
            // Never let a mention lookup fail transcript generation.
        }
    };
    const collector = {
        mentionMap,
        empty() {
            return !Object.keys(mentionMap.users).length
                && !Object.keys(mentionMap.roles).length
                && !Object.keys(mentionMap.channels).length;
        },
        scan: async (raw, msg) => {
            if (typeof raw !== 'string' || !raw)
                return;
            const mentions = msg && msg.mentions;
            const userIds = [...raw.matchAll(USER_MENTION)].map(m => m[1]);
            for (const id of new Set(userIds)) {
                if (mentionMap.users[id])
                    continue;
                const member = mentions && mentions.members && mentions.members.get ? mentions.members.get(id) : null;
                const user = (member && member.user)
                    || (mentions && mentions.users && mentions.users.get ? mentions.users.get(id) : null);
                if (user)
                    addUser(id, user, member || undefined);
                else
                    await resolveMissing('user', id, msg);
            }
            const roleIds = [...raw.matchAll(ROLE_MENTION)].map(m => m[1]);
            for (const id of new Set(roleIds)) {
                if (mentionMap.roles[id])
                    continue;
                const role = mentions && mentions.roles && mentions.roles.get ? mentions.roles.get(id) : null;
                if (role)
                    addRole(id, role);
                else
                    await resolveMissing('role', id, msg);
            }
            const channelIds = [...raw.matchAll(CHANNEL_MENTION)].map(m => m[1]);
            for (const id of new Set(channelIds)) {
                if (mentionMap.channels[id])
                    continue;
                const channel = mentions && mentions.channels && mentions.channels.get ? mentions.channels.get(id) : null;
                if (channel)
                    addChannel(id, channel);
                else
                    await resolveMissing('channel', id, msg);
            }
        }
    };
    return collector;
}
// Discord.js StickerFormatType: 1 = PNG, 2 = APNG, 3 = Lottie, 4 = GIF
function resolveStickerFormat(st) {
    const format = st.format;
    if (typeof format === 'number') {
        if (format === 1)
            return 'png';
        if (format === 2)
            return 'apng';
        if (format === 3)
            return 'lottie';
        if (format === 4)
            return 'gif';
        return 'unknown';
    }
    if (typeof format === 'string') {
        const value = format.toLowerCase();
        if (value.includes('lottie'))
            return 'lottie';
        if (value.includes('apng'))
            return 'apng';
        if (value.includes('gif'))
            return 'gif';
        if (value.includes('png'))
            return 'png';
    }
    const asset = st.asset_url || st.assetUrl;
    if (typeof asset === 'string' && /\.gif(\?|$)/.test(asset))
        return 'gif';
    return 'unknown';
}
/**
 * Component type codes from discord-api-types `ComponentType`.
 *
 * These must not be guessed: several are easy to confuse and getting them wrong
 * silently renders the wrong component (for example 5 is UserSelect, not
 * TextDisplay, and 12 is MediaGallery, not Container).
 */
const CT = {
    ACTION_ROW: 1,
    BUTTON: 2,
    STRING_SELECT: 3,
    USER_SELECT: 5,
    ROLE_SELECT: 6,
    MENTIONABLE_SELECT: 7,
    CHANNEL_SELECT: 8,
    SECTION: 9,
    TEXT_DISPLAY: 10,
    THUMBNAIL: 11,
    MEDIA_GALLERY: 12,
    FILE: 13,
    SEPARATOR: 14,
    CONTAINER: 17,
};
function parseThumbnail(child) {
    const url = child.url || (child.media && child.media.url);
    if (!url)
        return null;
    return {
        type: 'thumbnail',
        url,
        description: child.description || undefined,
        spoiler: !!child.spoiler,
    };
}
function parseFile(child) {
    // discord.js exposes the attachment as `file`; raw payloads use `file.url`
    const att = child.file || child;
    const url = att.url;
    if (!url)
        return null;
    return {
        type: 'file',
        url,
        name: att.name || undefined,
        description: child.description || undefined,
        spoiler: !!child.spoiler,
    };
}
async function parseSection(child, collector) {
    const texts = [];
    // A Section's first component is a TextDisplay
    for (const part of (child.components || [])) {
        if (part.type === CT.TEXT_DISPLAY || part.constructor?.name === 'TextDisplayComponent') {
            const entry = { type: 'text', content: part.content || '' };
            texts.push(entry);
        }
    }
    let accessory;
    if (child.accessory) {
        const acc = child.accessory;
        if (acc.type === CT.THUMBNAIL || acc.constructor?.name === 'ThumbnailComponent') {
            accessory = parseThumbnail(acc) || undefined;
        }
        else if (acc.type === CT.BUTTON || acc.constructor?.name === 'ButtonComponent') {
            const btn = {
                customId: acc.customId || acc.custom_id || undefined,
                label: acc.label || '',
                style: acc.style ?? 1,
                emoji: emojiToString(acc.emoji),
                url: acc.url || undefined,
                disabled: !!acc.disabled,
            };
            const btnEmojiId = resolveEmojiId(acc.emoji);
            if (btnEmojiId) {
                btn.emojiId = btnEmojiId;
                await collector.register(btnEmojiId, acc.emoji?.name, acc.emoji?.animated);
            }
            accessory = btn;
        }
    }
    if (!texts.length && !accessory)
        return null;
    return { type: 'section', texts, accessory };
}
function normalizeStickerTags(tags) {
    if (!tags)
        return undefined;
    if (Array.isArray(tags))
        return tags.join(', ') || undefined;
    const value = String(tags).trim();
    return value || undefined;
}
/**
 * Normalizes the several shapes Discord uses for keyed collections.
 *
 * `Message#stickers` is a Collection (a real Map), but `Message#reactions` is a
 * ReactionManager, which is *not* a Map - it keeps the reactions in `.cache`.
 * Accept arrays, maps/collections and manager-style objects so callers do not
 * silently get an empty list.
 */
function toCollectionArray(value) {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.filter(Boolean);
    if (value instanceof Map)
        return [...value.values()].filter(Boolean);
    if (value.cache instanceof Map)
        return [...value.cache.values()].filter(Boolean);
    if (Array.isArray(value.cache))
        return value.cache.filter(Boolean);
    return [];
}
async function parseStickers(msg, options) {
    const raw = toCollectionArray(msg.stickers);
    const stickers = [];
    for (const st of raw) {
        if (!st)
            continue;
        const format = resolveStickerFormat(st);
        let url;
        // Lottie stickers are .json animation data rather than an image, but the
        // template still needs the url to mount a player. Both variants can be
        // inlined when saveAttachments is set, so playback works offline.
        const source = st.url || st.assetUrl || st.asset_url
            || `https://cdn.discordapp.com/stickers/${st.id}.${format === 'gif' ? 'gif' : format === 'lottie' ? 'json' : 'png'}`;
        if (typeof source === 'string' && source) {
            // Lottie animations are embedded by default: the CDN blocks cross-origin
            // reads, so a linked .json simply cannot be played from the page.
            const wantsInline = format === 'lottie'
                ? options.inlineLottie !== false
                : !!options.saveAttachments;
            url = (wantsInline && source.startsWith('http')) ? await fetchBase64(source) : source;
        }
        stickers.push({
            id: String(st.id ?? ''),
            name: st.name || 'sticker',
            description: st.description || undefined,
            format,
            url,
            tags: normalizeStickerTags(st.tags)
        });
    }
    return stickers;
}
// Resolves the users behind a reaction. Costs one REST request per reaction,
// so it only runs when explicitly enabled and never breaks the transcript.
async function parseReactionUsers(reaction, options) {
    const manager = reaction?.users;
    if (!options.includeReactionUsers || !manager || typeof manager.fetch !== 'function')
        return undefined;
    const limit = options.reactionUserLimit ?? 100;
    try {
        const fetched = await manager.fetch({ limit });
        const list = fetched && typeof fetched.values === 'function'
            ? [...fetched.values()]
            : (Array.isArray(fetched) ? fetched : []);
        const users = [];
        for (const u of list.slice(0, limit)) {
            if (!u)
                continue;
            let avatarUrl = typeof u.displayAvatarURL === 'function'
                ? u.displayAvatarURL({ forceStatic: true, size: 64 })
                : (u.displayAvatarURL || u.avatarURL || u.avatarUrl || '');
            if (options.inlineAvatars && avatarUrl.startsWith('http')) {
                avatarUrl = await fetchBase64(avatarUrl);
            }
            users.push({
                id: u.id || '0',
                username: u.username || 'Deleted User',
                displayName: u.displayName || u.username || 'Deleted User',
                avatarUrl: avatarUrl || undefined,
                bot: !!u.bot,
                color: u.displayHexColor || undefined
            });
        }
        return users.length ? users : undefined;
    }
    catch {
        return undefined;
    }
}
// Reads an emoji id off a reaction emoji object, or out of a raw <:name:id> string.
function resolveEmojiId(emoji) {
    if (emoji && typeof emoji === 'object' && emoji.id)
        return String(emoji.id);
    if (typeof emoji === 'string') {
        const match = /<a?:[A-Za-z0-9_~]{1,64}:(\d+)>/.exec(emoji);
        if (match)
            return match[1];
    }
    return undefined;
}
/**
 * Normalises a component emoji into a display string.
 *
 * Discord.js hands back several different shapes here and they are NOT
 * interchangeable: reaction emoji are class instances that override toString(),
 * while component emoji are often bare API objects. A unicode button emoji
 * arrives as plain `{ name: '\u2795' }`, which inherits Object.prototype.toString,
 * so calling .toString() on it yields the literal text "[object Object]" and that
 * string ends up rendered inside the button.
 */
function emojiToString(emoji) {
    if (emoji === undefined || emoji === null)
        return undefined;
    if (typeof emoji === 'string')
        return emoji || undefined;
    if (typeof emoji === 'object') {
        // Custom emoji: rebuild the markdown tag rather than trusting toString().
        if (emoji.id) {
            const name = emoji.name || 'emoji';
            return emoji.animated ? `<a:${name}:${emoji.id}>` : `<:${name}:${emoji.id}>`;
        }
        // Unicode emoji: the name is the glyph itself.
        if (typeof emoji.name === 'string' && emoji.name)
            return emoji.name;
        return undefined;
    }
    return undefined;
}
async function parseChannel(channel) {
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
/**
 * Resolves a sortable timestamp for a raw Discord message.
 * Prefers the real timestamp, then falls back to decoding the snowflake ID
 * (Discord IDs embed their creation time in the top 42 bits).
 */
function messageTimeKey(msg) {
    if (typeof msg?.createdTimestamp === 'number' && Number.isFinite(msg.createdTimestamp)) {
        return msg.createdTimestamp;
    }
    if (typeof msg?.timestamp === 'number' && Number.isFinite(msg.timestamp)) {
        return msg.timestamp;
    }
    const id = msg?.id ?? msg?.messageId;
    if (id !== undefined && id !== null && /^\d+$/.test(String(id))) {
        try {
            return Number((BigInt(String(id)) >> 22n) + 1420070400000n);
        }
        catch {
            return null;
        }
    }
    return null;
}
/**
 * Sorts messages oldest -> newest so the transcript reads top-to-bottom the
 * same way Discord does (newest message last, at the bottom).
 *
 * Discord's API hands back messages newest-first, and callers may pass either
 * order, so ordering is normalised here instead of at each call site. The sort
 * is stable and does not mutate the caller's array.
 */
function sortChronologically(messages) {
    return messages
        .map((msg, index) => ({ msg, index, time: messageTimeKey(msg) }))
        .sort((a, b) => {
        if (a.time === null && b.time === null)
            return a.index - b.index;
        if (a.time === null)
            return -1;
        if (b.time === null)
            return 1;
        if (a.time !== b.time)
            return a.time - b.time;
        return a.index - b.index;
    })
        .map(entry => entry.msg);
}
async function parseMessages(messages, options, collector = createEmojiCollector(), mentions) {
    const parsedMessages = [];
    const mentionCollector = mentions;
    const ordered = sortChronologically(messages || []);
    for (const msg of ordered) {
        const author = msg.author || {};
        const member = msg.member || {};
        // Avatar URL (optionally inlined as base64)
        let avatarUrl = typeof author.displayAvatarURL === 'function' ? author.displayAvatarURL({ forceStatic: true, size: 64 }) : (author.displayAvatarURL || author.avatarURL || author.avatarUrl || '');
        if (options.inlineAvatars && avatarUrl.startsWith('http')) {
            avatarUrl = await fetchBase64(avatarUrl);
        }
        const userPayload = {
            id: author.id || '0',
            username: author.username || 'Deleted User',
            discriminator: author.discriminator || '0000',
            avatarUrl,
            bot: !!author.bot,
            color: member.displayHexColor || '#ffffff',
            displayName: member.displayName || author.username || 'Deleted User'
        };
        // Parse embeds — support both nested object format and flat field format
        const embedPayloads = (msg.embeds || []).map((embed) => {
            const parsedFields = (embed.fields || []).map((f) => ({
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
        // NOTE: text scanning for custom emoji and mentions happens in one pass
        // below, once the container components have been resolved.
        // Parse attachments — support Map (discord.js) or plain array (tests)
        const attachmentPayloads = [];
        const rawAttachments = msg.attachments instanceof Map
            ? [...msg.attachments.values()]
            : (Array.isArray(msg.attachments) ? msg.attachments : []);
        for (const att of rawAttachments) {
            let url = att.url;
            if ((options.saveAttachments || (options.inlineImages && att.contentType?.startsWith('image/')))
                && url.startsWith('http')) {
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
        // Parse stickers — Discord.js exposes these as a Collection keyed by sticker id
        const stickerPayloads = await parseStickers(msg, options);
        // Parse reactions
        const reactionPayloads = [];
        const rawReactions = toCollectionArray(msg.reactions);
        for (const rx of rawReactions) {
            // discord.js reaction objects have a .emoji property and .count
            const emoji = emojiToString(rx.emoji) || rx;
            const count = typeof rx.count === 'number' ? rx.count : (rx.count ?? 1);
            const me = rx.me ?? false;
            const emojiId = resolveEmojiId(rx.emoji);
            if (emojiId) {
                await collector.register(emojiId, rx.emoji?.name, rx.emoji?.animated);
            }
            const details = rx.countDetails;
            const payload = { emoji: emoji.toString(), count, me };
            if (emojiId)
                payload.emojiId = emojiId;
            // Super reactions: Discord splits the count and assigns a gradient
            if (details && typeof details === 'object') {
                if (typeof details.burst === 'number')
                    payload.burstCount = details.burst;
                if (typeof details.normal === 'number')
                    payload.normalCount = details.normal;
            }
            if (Array.isArray(rx.burstColors) && rx.burstColors.length) {
                payload.burstColors = rx.burstColors.map((c) => String(c));
            }
            if (rx.meBurst)
                payload.meBurst = true;
            const users = await parseReactionUsers(rx, options);
            if (users)
                payload.users = users;
            reactionPayloads.push(payload);
        }
        // Parse message reference (replies)
        let reference;
        if (msg.reference) {
            reference = {
                messageId: msg.reference.messageId || msg.reference.message_id,
                channelId: msg.reference.channelId || msg.reference.channel_id,
                guildId: msg.reference.guildId || msg.reference.guild_id,
            };
        }
        // Parse v2 container components (Discord.js v14.18+)
        let containers;
        if (msg.containers && Array.isArray(msg.containers)) {
            containers = msg.containers;
        }
        else if (msg.components && Array.isArray(msg.components)) {
            // A message can carry a real Container (type 17) or loose top-level
            // components. Loose ActionRows/TextDisplays are just as valid - plenty of
            // bots post buttons with no container at all, and skipping them renders
            // the whole message blank.
            const RENDERABLE = new Set([
                CT.CONTAINER, CT.ACTION_ROW, CT.SECTION, CT.TEXT_DISPLAY,
                CT.MEDIA_GALLERY, CT.FILE, CT.SEPARATOR, CT.THUMBNAIL
            ]);
            const rawContainers = msg.components.filter((c) => {
                if (c.type === CT.CONTAINER || c.constructor?.name === 'Container')
                    return true;
                if (typeof c.type === 'number' && RENDERABLE.has(c.type))
                    return true;
                if (c.components && Array.isArray(c.components)) {
                    return c.components.some((child) => child.type === CT.TEXT_DISPLAY || child.type === CT.MEDIA_GALLERY
                        || child.type === CT.ACTION_ROW || child.type === CT.SECTION
                        || child.type === CT.FILE || child.type === CT.SEPARATOR);
                }
                return false;
            });
            if (rawContainers.length) {
                const mappedContainers = [];
                for (const container of rawContainers) {
                    const isContainer = container.type === CT.CONTAINER
                        || container.constructor?.name === 'Container';
                    const children = [];
                    // A loose component is treated as a single-child container.
                    const rawChildren = isContainer ? (container.components || []) : [container];
                    for (const child of rawChildren) {
                        if (child.type === CT.TEXT_DISPLAY || child.constructor?.name === 'TextDisplayComponent') {
                            const td = {
                                type: 'text_display',
                                content: child.content || '',
                            };
                            children.push(td);
                        }
                        else if (child.type === CT.MEDIA_GALLERY || child.constructor?.name === 'MediaGalleryComponent') {
                            const rawItems = child.items || [];
                            const items = rawItems.map((item) => ({
                                url: item.url || '',
                                description: item.description || undefined,
                                spoiler: !!item.spoiler,
                            }));
                            const mg = { type: 'media_gallery', items };
                            children.push(mg);
                        }
                        else if (child.type === CT.SEPARATOR || child.constructor?.name === 'SeparatorComponent') {
                            const sep = {
                                type: 'separator',
                                divider: child.divider === undefined ? undefined : !!child.divider,
                                spacing: typeof child.spacing === 'number' ? child.spacing : undefined,
                            };
                            children.push(sep);
                        }
                        else if (child.type === CT.THUMBNAIL || child.constructor?.name === 'ThumbnailComponent') {
                            const thumb = parseThumbnail(child);
                            if (thumb)
                                children.push(thumb);
                        }
                        else if (child.type === CT.FILE || child.constructor?.name === 'FileComponent') {
                            const file = parseFile(child);
                            if (file)
                                children.push(file);
                        }
                        else if (child.type === CT.SECTION || child.constructor?.name === 'SectionComponent') {
                            const section = await parseSection(child, collector);
                            if (section)
                                children.push(section);
                        }
                        else if (child.type === CT.ACTION_ROW || child.constructor?.name === 'ActionRow') {
                            const rowComponents = [];
                            const rawRowChildren = child.components || [];
                            for (const rc of rawRowChildren) {
                                if (rc.type === CT.BUTTON || rc.constructor?.name === 'ButtonBuilder') {
                                    const btn = {
                                        customId: rc.customId || rc.custom_id || undefined,
                                        label: rc.label || '',
                                        style: rc.style ?? 1,
                                        emoji: emojiToString(rc.emoji),
                                        url: rc.url || undefined,
                                        disabled: !!rc.disabled,
                                    };
                                    const btnEmojiId = resolveEmojiId(rc.emoji);
                                    if (btnEmojiId) {
                                        btn.emojiId = btnEmojiId;
                                        await collector.register(btnEmojiId, rc.emoji?.name, rc.emoji?.animated);
                                    }
                                    rowComponents.push(btn);
                                }
                                else if (rc.type === CT.STRING_SELECT || rc.type === CT.USER_SELECT
                                    || rc.type === CT.ROLE_SELECT || rc.type === CT.MENTIONABLE_SELECT
                                    || rc.type === CT.CHANNEL_SELECT
                                    || rc.constructor?.name?.includes('SelectMenuBuilder')) {
                                    const rawOptions = rc.options || [];
                                    const options = [];
                                    for (const opt of rawOptions) {
                                        const entry = {
                                            label: opt.label || '',
                                            value: opt.value || '',
                                            description: opt.description || undefined,
                                            emoji: emojiToString(opt.emoji),
                                            default: !!opt.default,
                                        };
                                        const optEmojiId = resolveEmojiId(opt.emoji);
                                        if (optEmojiId) {
                                            entry.emojiId = optEmojiId;
                                            await collector.register(optEmojiId, opt.emoji?.name, opt.emoji?.animated);
                                        }
                                        options.push(entry);
                                    }
                                    const sm = {
                                        customId: rc.customId || rc.custom_id || undefined,
                                        placeholder: rc.placeholder || undefined,
                                        options,
                                        disabled: !!rc.disabled,
                                    };
                                    rowComponents.push(sm);
                                }
                            }
                            const ar = { type: 'action_row', components: rowComponents };
                            children.push(ar);
                        }
                    }
                    mappedContainers.push({
                        accentColor: isContainer
                            ? (container.accentColor ?? container.accent_color ?? undefined)
                            : undefined,
                        components: children,
                    });
                }
                containers = mappedContainers;
            }
        }
        // One pass over every piece of text in this message so custom emoji are
        // inlined and mentions are resolved identically everywhere.
        const scanText = async (raw) => {
            await collector.scan(raw);
            if (mentionCollector)
                await mentionCollector.scan(raw, msg);
        };
        await scanText(msg.content);
        for (const embed of embedPayloads) {
            await scanText(embed.title);
            await scanText(embed.description);
            await scanText(embed.footer?.text);
            await scanText(embed.author?.name);
            if (embed.fields) {
                for (const field of embed.fields)
                    await scanText(field.value);
            }
        }
        for (const container of containers || []) {
            for (const child of container.components) {
                if (child.type === 'text_display')
                    await scanText(child.content);
                else if (child.type === 'section') {
                    for (const text of child.texts)
                        await scanText(text.content);
                    // A section accessory is either a thumbnail or a button; buttons carry
                    // a label rather than a `type` discriminator.
                    if (child.accessory && 'label' in child.accessory)
                        await scanText(child.accessory.label);
                }
                else if (child.type === 'file') {
                    await scanText(child.description);
                }
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
            stickers: stickerPayloads.length ? stickerPayloads : undefined,
            reactions: reactionPayloads.length ? reactionPayloads : undefined,
            reference,
            system: !!msg.system,
            pinned: !!msg.pinned,
            containers,
        });
    }
    return parsedMessages;
}
