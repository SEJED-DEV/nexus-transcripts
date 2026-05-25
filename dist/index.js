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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTranscript = exports.parseMessages = exports.parseChannel = void 0;
exports.createTranscript = createTranscript;
exports.generateFromMessages = generateFromMessages;
const parser_1 = require("./parser");
const compiler_1 = require("./compiler");
/**
 * Generates an interactive HTML transcript from a Discord.js channel.
 * @param channel The Discord.js-like text channel object.
 * @param options Configurations for rendering.
 */
async function createTranscript(channel, options = {}) {
    const limit = options.limit ?? -1;
    // Fetch messages from Discord.js channel structure if fetch exists
    let messagesList = [];
    if (channel.messages && typeof channel.messages.fetch === 'function') {
        const fetchLimit = limit === -1 ? 100 : Math.min(limit, 100);
        const fetched = await channel.messages.fetch({ limit: fetchLimit });
        messagesList = Array.from(fetched.values()).reverse();
    }
    else if (Array.isArray(channel.messages)) {
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
async function generateFromMessages(messages, channel, options = {}) {
    const messageArray = Array.isArray(messages)
        ? messages
        : (messages.values ? Array.from(messages.values()) : []);
    const parsedChannel = await (0, parser_1.parseChannel)(channel);
    const parsedMessages = await (0, parser_1.parseMessages)(messageArray, options);
    const htmlContent = await (0, compiler_1.compileTranscript)(parsedChannel, parsedMessages, options);
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
__exportStar(require("./types"), exports);
var parser_2 = require("./parser");
Object.defineProperty(exports, "parseChannel", { enumerable: true, get: function () { return parser_2.parseChannel; } });
Object.defineProperty(exports, "parseMessages", { enumerable: true, get: function () { return parser_2.parseMessages; } });
var compiler_2 = require("./compiler");
Object.defineProperty(exports, "compileTranscript", { enumerable: true, get: function () { return compiler_2.compileTranscript; } });
exports.default = {
    createTranscript,
    generateFromMessages
};
