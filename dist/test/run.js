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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("../index");
async function runTest() {
    console.log('Starting Nexus Transcripts compilation test...');
    // Mock Discord channel object
    const mockChannel = {
        id: '123456789',
        name: 'lounge',
        type: 'GUILD_TEXT',
        topic: 'Welcome to the Nexus Premium lounge! Chat, share ideas, and view interactive transcripts.',
        guild: {
            name: 'Nexus HQ',
            iconURL: () => 'https://cdn.discordapp.com/icons/8786567890/a_abcdef.png'
        }
    };
    // Mock Discord messages with full feature coverage
    const mockMessages = [
        {
            id: '1',
            author: {
                id: '101',
                username: 'Alice',
                discriminator: '1111',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#34d399',
                displayName: 'Alice ✨'
            },
            content: 'Hello everyone! Has anyone checked out the new **nexus-transcripts** library yet? It is absolutely *amazing*! 🌟\n> This is a blockquote test\nAnd back to normal text with `inline code` here.',
            createdTimestamp: Date.now() - 86400000 - 3600000, // Yesterday
            pinned: true,
            embeds: [],
            attachments: [],
            reactions: [
                { emoji: '🌟', count: 5, me: false },
                { emoji: '🔥', count: 3, me: true },
                { emoji: '✨', count: 2, me: false }
            ]
        },
        {
            id: '2',
            author: {
                id: '102',
                username: 'Bob',
                discriminator: '2222',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#60a5fa',
                displayName: 'Bob (Core Dev)'
            },
            content: 'Yeah, I built it! Watch this code block:\n```typescript\nconst transcript = await createTranscript(channel, {\n  returnType: "string",\n  poweredBy: true\n});\nconsole.log("Done!");\n```\nAlso check out this spoiler: ||it supports spoilers too!||',
            createdTimestamp: Date.now() - 86400000 - 3000000, // Yesterday
            pinned: true,
            embeds: [],
            attachments: [
                {
                    id: 'att-1',
                    name: 'nature.jpg',
                    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600',
                    size: 102400,
                    contentType: 'image/jpeg',
                    width: 600,
                    height: 400
                }
            ],
            reactions: [
                { emoji: '👍', count: 4, me: true },
                { emoji: '💯', count: 2, me: false }
            ]
        },
        {
            id: '3',
            author: {
                id: '102',
                username: 'Bob',
                discriminator: '2222',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#60a5fa',
                displayName: 'Bob (Core Dev)'
            },
            content: 'Also supports ~~strikethrough~~, __underline__, and mixed **bold _italic_** formatting! Plus mentions: <@101> check this out.',
            createdTimestamp: Date.now() - 86400000 - 2800000,
            pinned: false,
            embeds: [],
            attachments: [],
            reactions: []
        },
        {
            id: '4',
            author: {
                id: '103',
                username: 'Nexus Helper',
                discriminator: '9999',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                bot: true
            },
            member: {
                displayHexColor: '#a78bfa',
                displayName: 'Nexus Assistant'
            },
            content: '',
            createdTimestamp: Date.now() - 86400000 - 2500000, // Yesterday
            embeds: [
                {
                    title: 'Nexus Transcripts — Feature Overview',
                    description: 'A summary of the core modules included in the next-generation library release. Built to be **fast**, **interactive**, and **beautiful**.',
                    color: 0x6366f1,
                    url: 'https://github.com/',
                    timestamp: new Date().toISOString(),
                    author: {
                        name: 'Nexus System',
                        iconUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'
                    },
                    footer: {
                        text: 'System Diagnostics | Version 2.0.0',
                        iconUrl: 'https://cdn.discordapp.com/embed/avatars/0.png'
                    },
                    thumbnail: {
                        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80'
                    },
                    fields: [
                        { name: '🔥 Interactive Filters', value: 'Filter instantly by sender, media type, or embeds.', inline: true },
                        { name: '⚡ Real-time Search', value: 'Instant client-side matching across all messages.', inline: true },
                        { name: '🎨 8 Premium Themes', value: 'Dark, Light, OLED, Aurora, Cyberpunk, Sunset, Rose Gold, Forest.', inline: false },
                        { name: '📊 Analytics', value: 'Speaker share, hourly heatmap, and top-words chart.', inline: true },
                        { name: '📥 HTML/JSON Export', value: 'One-click standalone HTML or raw JSON download.', inline: true }
                    ]
                }
            ],
            attachments: [],
            reactions: [
                { emoji: '🤖', count: 7, me: false }
            ]
        },
        {
            id: '5',
            author: {
                id: '104',
                username: 'Charlie',
                discriminator: '3333',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#f472b6',
                displayName: 'Charlie 🎸'
            },
            content: 'Alice that is so sick! Replying to say I love the pinboard feature.',
            createdTimestamp: Date.now() - 86400000 - 1000000,
            pinned: false,
            embeds: [],
            attachments: [],
            reactions: [],
            reference: { messageId: '1' }
        },
        {
            id: '6',
            author: {
                id: '102',
                username: 'Bob',
                discriminator: '2222',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#60a5fa',
                displayName: 'Bob (Core Dev)'
            },
            content: 'Here is an audio voice clip for you as well!',
            createdTimestamp: Date.now() - 3600000, // Today
            pinned: false,
            embeds: [],
            attachments: [
                {
                    id: 'att-2',
                    name: 'voice-note.mp3',
                    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    size: 45000,
                    contentType: 'audio/mpeg'
                }
            ],
            reactions: []
        },
        {
            id: '7',
            author: {
                id: '101',
                username: 'Alice',
                discriminator: '1111',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#34d399',
                displayName: 'Alice ✨'
            },
            content: 'And here is a file attachment example!',
            createdTimestamp: Date.now() - 1800000,
            pinned: false,
            embeds: [],
            attachments: [
                {
                    id: 'att-3',
                    name: 'project-report.pdf',
                    url: '#',
                    size: 2048000,
                    contentType: 'application/pdf'
                }
            ],
            reactions: [
                { emoji: '📎', count: 2, me: false }
            ]
        },
        {
            id: '8',
            author: {
                id: '104',
                username: 'Charlie',
                discriminator: '3333',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#f472b6',
                displayName: 'Charlie 🎸'
            },
            content: 'This is the most feature-rich transcript library I\'ve ever seen! The analytics dashboard is 🔥🔥🔥',
            createdTimestamp: Date.now() - 600000,
            pinned: false,
            embeds: [],
            attachments: [],
            reactions: [
                { emoji: '💯', count: 6, me: true },
                { emoji: '🔥', count: 4, me: false },
                { emoji: '😍', count: 3, me: false }
            ]
        },
        {
            id: '9',
            author: {
                id: '105',
                username: 'Nexus Bot v2',
                discriminator: '8888',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
                bot: true
            },
            member: {
                displayHexColor: '#f59e0b',
                displayName: 'Nexus v2 Bot'
            },
            content: '',
            createdTimestamp: Date.now() - 300000,
            pinned: false,
            embeds: [],
            attachments: [],
            reactions: [],
            containers: [
                {
                    accentColor: 0xf59e0b,
                    components: [
                        {
                            type: 'text_display',
                            content: '**Welcome to the v2 Container system!**\nThis message uses the new Discord.js v2 `ContainerBuilder` with `TextDisplayBuilder`, `MediaGalleryBuilder`, and `ActionRowBuilder`.\n\n> All rendered statically in the transcript — showing exactly what users saw.'
                        },
                        {
                            type: 'media_gallery',
                            items: [
                                { url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600' },
                                { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600' }
                            ]
                        },
                        {
                            type: 'action_row',
                            components: [
                                { label: 'Approve', style: 3, emoji: '✅' },
                                { label: 'Deny', style: 4, emoji: '❌' },
                                { label: 'Details', style: 5, url: 'https://example.com' },
                                { placeholder: 'Choose an option', options: [{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }] }
                            ]
                        }
                    ]
                }
            ]
        },
        // ---- Stickers as a Collection (Map), matching discord.js ----
        {
            id: '10',
            author: {
                id: '106',
                username: 'Stella',
                discriminator: '6666',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#a78bfa',
                displayName: 'Stella'
            },
            content: '',
            createdTimestamp: Date.now() - 5400000,
            pinned: false,
            embeds: [],
            attachments: [],
            stickers: new Map([
                ['1051665016680650823', {
                        id: '1051665016680650823',
                        name: 'Wave Hello',
                        description: 'A friendly wave',
                        format: 1, // PNG
                        tags: null,
                        available: true,
                        url: 'https://cdn.discordapp.com/stickers/1051665016680650823.png'
                    }],
                ['1051665016680650824', {
                        id: '1051665016680650824',
                        name: 'Party Blob',
                        description: 'Celebration',
                        format: 3, // Lottie -> placeholder, no image src
                        tags: null,
                        available: true,
                        url: 'https://cdn.discordapp.com/stickers/1051665016680650824.json'
                    }]
            ]),
            reactions: []
        },
        // ---- Stickers as a plain array, mixed with an embed using custom emoji ----
        {
            id: '11',
            author: {
                id: '107',
                username: 'Rex',
                discriminator: '7777',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#38bdf8',
                displayName: 'Rex'
            },
            content: 'Look at this <:nexus:123456789012345678> reaction',
            createdTimestamp: Date.now() - 3600000,
            pinned: false,
            attachments: [],
            stickers: [
                {
                    id: '1051665016680650825',
                    name: 'Animated Yippee',
                    description: 'Yippee animation',
                    format: 4, // GIF
                    tags: null,
                    available: true,
                    url: 'https://cdn.discordapp.com/stickers/1051665016680650825.gif'
                }
            ],
            embeds: [
                {
                    type: 'rich',
                    title: 'Deploy <a:partyparrot:234567890123456789>',
                    description: 'Build passed with <:nexus:123456789012345678>',
                    color: 0x5865f2,
                    timestamp: new Date(Date.now() - 3500000).toISOString(),
                    footer: { text: 'CI bot' }
                }
            ],
            reactions: []
        },
        // ---- Emoji inside code must stay literal ----
        {
            id: '12',
            author: {
                id: '108',
                username: 'Iris',
                discriminator: '8888',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#fb7185',
                displayName: 'Iris'
            },
            content: 'Inline `<:nexus:123456789012345678>` stays text\n```\nconst e = "<:nexus:123456789012345678>";\n```\nSpoiler ||<:secret:123456789012345680> hidden|| done',
            createdTimestamp: Date.now() - 1800000,
            pinned: false,
            embeds: [],
            attachments: [],
            reactions: []
        },
        // ---- Super reactions, custom emoji reactions, and reactor lists ----
        {
            id: '13',
            author: {
                id: '109',
                username: 'Juno',
                discriminator: '9999',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#facc15',
                displayName: 'Juno'
            },
            content: 'Ship it! <a:partyparrot:234567890123456789>',
            createdTimestamp: Date.now() - 600000,
            pinned: false,
            embeds: [],
            attachments: [],
            // Shaped like discord.js: Message#reactions is a ReactionManager, whose
            // reactions live in `.cache` (it is NOT a Map). Message 1 above covers the
            // plain-array shape.
            reactions: {
                cache: new Map([
                    ['<:nexus:123456789012345678>', {
                            emoji: {
                                id: '123456789012345678',
                                name: 'nexus',
                                animated: false,
                                toString() { return '<:nexus:123456789012345678>'; }
                            },
                            count: 6,
                            me: true,
                            meBurst: true,
                            burstColors: ['#ff73fa', '#c9a0ff', '#53f0ff'],
                            countDetails: { burst: 3, normal: 3 },
                            users: {
                                fetch: async () => [
                                    { id: '201', username: 'Carol', displayName: 'Carol ✨', displayAvatarURL: () => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', displayHexColor: '#f472b6' },
                                    { id: '202', username: 'Dave', displayName: 'Dave', displayAvatarURL: () => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
                                    { id: '203', username: 'Eve', displayName: 'Eve', displayAvatarURL: () => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }
                                ]
                            }
                        }],
                    ['🎉', {
                            emoji: '🎉',
                            count: 4,
                            countDetails: { burst: 0, normal: 4 },
                            users: {
                                fetch: async () => new Map([
                                    ['204', { id: '204', username: 'Frank', displayName: 'Frank', displayAvatarURL: () => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' }]
                                ])
                            }
                        }],
                    ['🔥', {
                            emoji: '🔥',
                            count: 2,
                            countDetails: { burst: 0, normal: 2 }
                            // no users.fetch -> no reactor list requested
                        }]
                ])
            }
        },
        // ---- Raw discord.js V2 components (the shape the gateway actually sends).
        //      Mirrors the "Cortex" auto-responder bot, which posts Containers with
        //      no content/embeds/attachments at all - if this is mis-parsed the whole
        //      message renders blank. ----
        {
            id: '14',
            author: {
                id: '999',
                username: 'Cortex',
                discriminator: '0001',
                displayAvatarURL: () => 'https://cdn.discordapp.com/avatars/1481721720099569848/a_abcdef.png',
                bot: true
            },
            member: {
                displayHexColor: '#5865f2',
                displayName: 'Cortex'
            },
            content: '',
            createdTimestamp: Date.now() - 120000,
            pinned: false,
            embeds: [],
            attachments: [],
            stickers: [],
            components: [
                {
                    type: 17, // Container
                    accent_color: 5793266,
                    components: [
                        { type: 10, content: '### 🤖 Advanced Auto Responder' }, // TextDisplay
                        { type: 10, content: '🔹 **discord** (`exact`)\nStatus: 🟢 Active | Text | Cooldown: 3s' },
                        { type: 14, divider: true, spacing: 8 }, // Separator
                        {
                            type: 9, // Section
                            components: [{ type: 10, content: 'Managed by Cortex <:nexus:123456789012345678>' }],
                            accessory: { type: 11, url: 'https://cdn.discordapp.com/avatars/985444871722631199/a_abcdef.png', description: 'Owner' }
                        },
                        {
                            type: 13, // File
                            file: { url: 'https://cdn.discordapp.com/attachments/1/2/report.txt', name: 'report.txt' },
                            description: 'Generated report'
                        },
                        {
                            type: 1, // ActionRow
                            components: [
                                { type: 2, customId: 'ar_add_init', style: 3, label: 'Add New', emoji: { name: '➕', id: null, animated: false } },
                                { type: 2, customId: 'ar_prev', style: 2, label: 'Prev', disabled: true, emoji: { name: '⏪', id: null, animated: false } },
                                {
                                    type: 3, // StringSelect
                                    customId: 'ar_pick',
                                    placeholder: 'Choose an option',
                                    options: [{ label: 'Option A', value: 'a', description: 'First' }]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        // ---- Loose top-level ActionRows with NO container wrapper (type 17).
        //      Real bots post these; if only type 17 is handled the message renders
        //      completely blank because content/embeds/attachments are all empty. ----
        {
            id: '16',
            author: {
                id: '998',
                username: 'QueueBot',
                discriminator: '0002',
                displayAvatarURL: () => 'https://cdn.discordapp.com/avatars/998/a_abcdef.png',
                bot: true
            },
            member: {
                displayHexColor: '#1db954',
                displayName: 'QueueBot'
            },
            content: '',
            createdTimestamp: Date.now() - 60000,
            pinned: false,
            embeds: [],
            attachments: [],
            stickers: [],
            components: [
                {
                    type: 1,
                    components: [
                        { type: 3, customId: 'selectMenu', placeholder: 'Select a filter to apply.', minValues: 1, maxValues: 1 }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, customId: 'queue_prev', style: 2, label: 'Previous', disabled: true },
                        { type: 2, customId: 'queue_play', style: 1, label: 'Play' },
                        { type: 2, customId: 'queue_next', style: 2, label: 'Next' }
                    ]
                }
            ]
        },
        // ---- Mentions: discord.js pre-parses these onto msg.mentions ----
        {
            id: '15',
            author: {
                id: '110',
                username: 'Mika',
                discriminator: '1212',
                displayAvatarURL: () => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
                bot: false
            },
            member: {
                displayHexColor: '#22d3ee',
                displayName: 'Mika'
            },
            content: 'hey <@106> and <@!106>, check <#153456789012345678>, devs <@&153456789012345679> only',
            createdTimestamp: Date.now() - 90000,
            pinned: false,
            embeds: [],
            attachments: [],
            stickers: [],
            mentions: {
                members: new Map([
                    ['106', {
                            displayName: 'Stella',
                            displayHexColor: '#a78bfa',
                            user: {
                                id: '106',
                                username: 'Stella',
                                discriminator: '6666',
                                bot: false,
                                displayAvatarURL: () => 'https://cdn.discordapp.com/avatars/106/a_abcdef.png'
                            }
                        }]
                ]),
                users: new Map(),
                roles: new Map([
                    ['153456789012345679', { id: '153456789012345679', name: 'Developers', hexColor: '#57f287', position: 3 }]
                ]),
                channels: new Map([
                    ['153456789012345678', { id: '153456789012345678', name: 'showcase', type: 0 }]
                ])
            }
        }
    ];
    // Map messages to createTranscript
    const result = await (0, index_1.createTranscript)({
        ...mockChannel,
        messages: mockMessages
    }, {
        poweredBy: true,
        fileName: 'test-transcript.html',
        returnType: 'string',
        includeReactionUsers: true,
        reactionUserLimit: 10
    });
    const outputPath = path.join(process.cwd(), 'test-transcript.html');
    fs.writeFileSync(outputPath, result, 'utf-8');
    console.log(`✅ Success! Test transcript compiled and saved to: ${outputPath}`);
}
runTest().catch(console.error);
