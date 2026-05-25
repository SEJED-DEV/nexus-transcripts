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
exports.parseChannel = parseChannel;
exports.parseMessages = parseMessages;
const https = __importStar(require("https"));
// Helper to download an asset and convert it to Base64
async function fetchBase64(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                resolve(url); // Fallback to raw URL if download fails
                return;
            }
            const data = [];
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
async function parseMessages(messages, options) {
    const parsedMessages = [];
    for (const msg of messages) {
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
        // Parse reactions
        const reactionPayloads = [];
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
        let reference;
        if (msg.reference) {
            reference = {
                messageId: msg.reference.messageId || msg.reference.message_id,
                channelId: msg.reference.channelId || msg.reference.channel_id,
                guildId: msg.reference.guildId || msg.reference.guild_id,
            };
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
        });
    }
    return parsedMessages;
}
