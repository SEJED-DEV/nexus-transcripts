# 🌌 Nexus Transcripts

> A premium, interactive, and next-generation HTML transcript generation library for Discord channels.

[![NPM Version](https://img.shields.io/npm/v/nexus-transcripts?color=indigo&style=flat-square)](https://www.npmjs.com/package/nexus-transcripts)
[![TypeScript](https://img.shields.io/badge/TypeScript-Supported-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**Nexus Transcripts** is an ultra-premium, feature-rich HTML transcript compiler built from the ground up for modern Discord bots. It turns standard chat logs into highly polished, standalone offline dashboards complete with 8 gorgeous selectable themes, powerful client-side search, real-time message filtering, advanced chat analytics (including heatmaps and word clouds), interactive audio/video players, and quick-export controls.

---

## ✨ Features

* **🎨 8 Premium Built-in Themes:** Transition smoothly between:
  - `👾 Discord Dark` — Polished classic dark mode
  - `☀️ Discord Light` — Perfectly balanced clean theme
  - `⬛ AMOLED Black` — Deepest contrast for high-end OLED screens
  - `🔥 Neon Cyberpunk` — Glowing futuristic pink-orange accents
  - `🧛 Dracula Developer` — Beloved sleek developer palette
  - `❄️ Nordic Frost` — Calming arctic slate-blue theme
  - `🌲 Moss Forest` — Deep organic green with mint tones
  - `🔮 Glassmorphism` — Beautiful frosted glass layout with backdrop blur
* **📊 Visual Chat Analytics Dashboard:**
  - 4 dynamic stat cards (Total messages, total speakers, active attachments, days spanned)
  - Animated speaker share progress bars
  - Interactive hourly activity heatmap grid
  - Frequency-scaled word cloud of key words (excluding common stop-words)
* **🔍 Instant Search & Live Filters:**
  - Fast client-side search highlighting keywords in real-time
  - Sidebar message filters: All / Media Only / Embeds Only / Pinned Messages / Bots Only
  - Members directory with per-speaker message counters (click to filter by speaker)
* **📑 Interactive Features:**
  - Reply references with clickable "jump-to" smooth scroll and glowing focus highlight
  - Interactive pinboard drawer panel listing all pinned messages
  - Interactive audio and video attachment players
  - Full Discord Markdown parser: custom spoilers (`||spoiler||` toggles), blockquotes, custom formatting, and styled copyable code blocks
  - Elegant fullscreen image lightbox viewer
* **💾 Export Options:**
  - **Download HTML** (fully self-contained offline backup file)
  - **Export JSON** (structured raw data payload)
  - **Print/PDF** with dedicated clean stylesheet overrides
* **⌨️ Keyboard Shortcuts:** Focus search with `Ctrl+F`, escape overlays with `Esc`, jump around with `GG` / `Shift+G`, toggle pinboard with `P`, switch views with `1` / `2`, or open the shortcut keys map modal with `?`.

---

## 🚀 Installation

```bash
npm install nexus-transcripts
# or
yarn add nexus-transcripts
# or
pnpm add nexus-transcripts
```

---

## 🛠️ Quick Start

### 1. Simple Discord.js Usage

Generate transcripts directly from a text channel. Supports Discord.js v14+ out of the box:

```typescript
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { createTranscript } from 'nexus-transcripts';
import * as fs from 'fs';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('messageCreate', async (message) => {
  if (message.content === '!transcript') {
    const channel = message.channel as TextChannel;

    // Generate the transcript as an attachment object
    const transcript = await createTranscript(channel, {
      limit: 100, // Load last 100 messages (use -1 for all)
      returnType: 'attachment',
      fileName: `transcript-${channel.name}.html`,
      inlineAvatars: true, // Base64 inline avatars for offline accessibility
      inlineImages: true // Base64 inline images/attachments
    });

    // Send the transcript file in the channel
    await message.reply({
      files: [transcript]
    });
  }
});

client.login('YOUR_BOT_TOKEN');
```

### 2. Manual Custom Array Input

If you're not using Discord.js or want to load logs from a custom database or API, use the raw payload generator:

```typescript
import { generateFromMessages } from 'nexus-transcripts';
import * as fs from 'fs';

// Mock/Custom channel and messages
const channelData = {
  id: '1234567890',
  name: 'ticket-support-04',
  topic: 'Customer billing inquiry transcript',
  guild: {
    name: 'Acme Corp Support',
    iconURL: () => 'https://cdn.discordapp.com/icons/...'
  }
};

const messagesPayload = [
  {
    id: '1000000001',
    createdTimestamp: Date.now() - 3600000,
    author: {
      id: '999999901',
      username: 'Alice',
      displayAvatarURL: () => 'https://cdn.discordapp.com/avatars/...',
      bot: false
    },
    member: {
      displayName: 'Alice (VIP Client)',
      displayHexColor: '#fbbf24'
    },
    content: 'Hello Support team! I need assistance with my billing.',
    attachments: [],
    embeds: [],
    reactions: []
  },
  {
    id: '1000000002',
    createdTimestamp: Date.now() - 3000000,
    author: {
      id: '999999902',
      username: 'Bob',
      bot: true
    },
    member: {
      displayName: 'Support Assistant',
      displayHexColor: '#6366f1'
    },
    content: 'Hi Alice! Let me check that for you. I will attach your latest invoice below.',
    attachments: [
      {
        id: 'att-1',
        name: 'invoice_may_2026.pdf',
        url: 'https://acme.org/files/invoice.pdf',
        size: 14205,
        contentType: 'application/pdf'
      }
    ],
    embeds: [],
    reactions: [
      { emoji: '👋', count: 1, me: true }
    ]
  }
];

async function main() {
  const htmlContent = await generateFromMessages(messagesPayload, channelData, {
    returnType: 'string', // Return raw HTML string
  });
  
  fs.writeFileSync('custom-transcript.html', htmlContent);
  console.log('Successfully written custom offline transcript!');
}

main();
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|:---|:---|:---|:---|
| `limit` | `number` | `-1` | Number of messages to fetch (sets to -1 to load all) |
| `returnType` | `'string' \| 'buffer' \| 'attachment'` | `'string'` | Output format returned by `createTranscript` |
| `fileName` | `string` | `'transcript-[channelName].html'` | Filename used when returning `'attachment'` format |
| `inlineAvatars` | `boolean` | `false` | If true, downloads and embeds user avatars as base64 |
| `inlineImages` | `boolean` | `false` | If true, downloads and embeds image attachments as base64 |

---

## 📦 Build & Development

For developers interested in customizing the transcripts and styles:

```bash
# Clone the repository
git clone https://github.com/SEJED-DEV/nexus-transcripts.git
cd nexus-transcripts

# Install dependencies
npm install

# Build files (transpile TS to JS and bundle templates)
npm run build

# Run local development watcher
npm run dev

# Start the real-time preview server (port 3000)
# This includes an SSE connection which reloads your browser automatically as you edit the ui.html
npm start
```

Open `http://localhost:3000` to preview your changes live as you code!

## 📄 License & Credits

This library is made by **Sejed TRABELSSI** under **Cortex HQ**.
* **Support:** Join the [Support Discord Server](https://discord.gg/D4WPnx4yDn) for help and discussion.
* **License:** You are free to use this library however you want—just make sure to mention/link the original GitHub repository. The project is fully open for community contributions!
