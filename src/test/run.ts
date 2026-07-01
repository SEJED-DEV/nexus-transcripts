import * as fs from 'fs';
import * as path from 'path';
import { createTranscript } from '../index';

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
    }
  ];

  // Map messages to createTranscript
  const result = await createTranscript({
    ...mockChannel,
    messages: mockMessages
  }, {
    poweredBy: true,
    fileName: 'test-transcript.html',
    returnType: 'string'
  });

  const outputPath = path.join(process.cwd(), 'test-transcript.html');
  fs.writeFileSync(outputPath, result as string, 'utf-8');
  console.log(`✅ Success! Test transcript compiled and saved to: ${outputPath}`);
}

runTest().catch(console.error);
