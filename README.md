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
* **😀 Stickers, Custom Emoji & Super Reactions:**
  - Server and Nitro stickers render inline, with animated PNG/APNG/GIF support
  - Lottie stickers animate automatically. The animation data is embedded by default (~70 KB per animated sticker) because Discord's sticker CDN sends no CORS headers and so a browser can never read the `.json` on its own
  - Set `inlineLottie: false` to keep transcripts smaller, in which case each animated sticker gets a **Play** button, plus an "Open raw file" link if it cannot be fetched
  - Custom emoji are inlined as base64 wherever they appear — message text, embeds, spoilers, reactions, and container components
  - Super reactions get Discord's authentic multi-colour gradient ring plus a burst marker
  - Optional click-through popover listing everyone who reacted
* **💬 Rich Message Components:**
  - V2 container messages render fully, including text displays, sections, thumbnails, file attachments, separators, and media galleries
  - Bare top-level action rows (buttons and select menus posted without a container) are rendered too, so bot messages never come out blank
  - `@user`, `@role`, and `#channel` mentions resolve to real names with role colours applied
  - Markdown is parsed inside containers, and `#`-style titles (which Discord has no syntax for) are rendered as real headings instead of literal `###`
* **👀 Discord-style reading:**
  - Transcripts open pinned to the **newest** message rather than the top, so you land where the conversation ended
  - Stays pinned as images, avatars and animations load in, but never fights you — scroll up to read history and it leaves you alone
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

Requires Discord.js `v14` as a peer dependency, and Node.js 18 or newer.

---

## 🩺 Troubleshooting

### "I updated but nothing changed"

The most common cause is a stale lockfile or a leftover `node_modules`. A plain `npm install` will happily keep the version already recorded in your lockfile, so you keep running the old code.

```bash
rm -rf node_modules package-lock.json
npm install nexus-transcripts@latest
```

Confirm you actually got the version you think you did:

```bash
npm ls nexus-transcripts
```

### Installing straight from GitHub

```bash
npm install github:SEJED-DEV/nexus-transcripts
```

The repository ships its own built output in `dist/`, and a `prepare` hook rebuilds it on install, so a git install gets the same code as the npm release rather than an unbuilt checkout.

### Updating

New transcripts are generated with the code in your installed version, not the version that generated an existing file. If a transcript already on disk looks out of date, regenerate it — re-running the bot is not enough.

Transcripts are self-contained HTML. You can open one from months ago and it will keep working; there is nothing to migrate.

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
| `includeReactionUsers` | `boolean` | `false` | If true, records who reacted to each message and shows a popover on click |
| `reactionUserLimit` | `number` | `100` | Maximum reactors recorded per reaction when `includeReactionUsers` is enabled |
| `resolveMentions` | `boolean` | `true` | If true, resolves `@user`, `@role`, and `#channel` references to real names using already-cached guild data (no extra API calls) |
| `inlineLottie` | `boolean` | `true` | Embeds Lottie sticker animation data so animated stickers play instantly. Set to false for smaller files that load animations on demand |

> **Note on stickers:** sticker images are linked from Discord's CDN by default. Set `saveAttachments: true` to embed them into the HTML file instead. Custom emoji are *always* inlined, since they are small and would otherwise render as broken images. Lottie animation data is embedded the same way, but the SVG-only player is included whenever a transcript contains a Lottie sticker, so playback needs no extra files.
> **Note on reaction users:** each reaction with users requires one extra Discord API request, which is why it is opt-in.
> **Note on mentions:** names are read from `MessageMentions` and the guild/client caches, so this costs no API requests. An ID that cannot be resolved renders as a neutral `@Unknown` rather than a raw snowflake. Members without a role colour (`#000000`) fall back to the default mention styling.

---

## 📋 What's new in 1.1.0

- **V2 components** — containers, sections, text displays, thumbnails, separators, and media galleries now render fully, and bare action rows no longer produce blank messages
- **Chronological ordering** — messages are sorted by timestamp in one place, so transcripts are consistently oldest → newest. Versions up to 1.0.1 could emit them reversed depending on which code path ran
- **Lottie stickers** — animation data is embedded by default with the SVG player bundled, so animated stickers play offline with no extra files
- **Mentions** — `@user`, `@role`, and `#channel` resolve to real names with role colours, using cached data at no extra API cost
- **Markdown headings** — `#`-style titles render as real headings instead of literal `###`
- **Discord-style scrolling** — transcripts open at the newest message and stay pinned as media loads, without fighting you when you scroll up

Upgrading from 1.0.x:

```bash
rm -rf node_modules package-lock.json
npm install nexus-transcripts@latest
```

---

## 🗺️ Roadmap

- [x] Stickers, custom emoji, and super reactions
- [x] Optional reactor lists
- [ ] **Live transcripts** — transcripts that stay open and update in real time as new messages arrive, instead of being a snapshot taken at load time. Currently the generated page shows a one-time toast pointing here so it is not mistaken for a live view.

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

# Run the offline renderer test suite
npm test

# Run local development watcher
npm run dev

# Start the real-time preview server (port 3000)
# This includes an SSE connection which reloads your browser automatically as you edit the ui.html
npm start
```

Open `http://localhost:3000` to preview your changes live as you code!

`dist/` is committed so that a plain clone is installable, and `prepublishOnly` rebuilds it on every publish. If you change anything under `src/`, run `npm run build` and commit the regenerated `dist/` alongside it.

## 📄 License & Credits

This library is made by **Sejed TRABELSSI** under **Cortex HQ**.
* **Support:** Join the [Support Discord Server](https://discord.gg/D4WPnx4yDn) for help and discussion.
* **License:** You are free to use this library however you want—just make sure to mention/link the original GitHub repository. The project is fully open for community contributions!
