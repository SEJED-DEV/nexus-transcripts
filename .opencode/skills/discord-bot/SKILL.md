---
name: discord-bot
description: Use when building or maintaining a Discord bot with discord.js v14, TypeScript, Drizzle ORM, PostgreSQL, and Redis. Covers v2 components, slash commands, economy, AI chat, AI moderation, rate limiting, tickets, logging.
---

# Discord Bot — discord.js v14 + TypeScript + Drizzle + PostgreSQL + Redis

## Stack
- **Runtime**: Node.js 20+, TypeScript (strict), `tsx` for dev
- **Library**: discord.js v14 (GatewayIntentBits: Guilds, GuildMessages, MessageContent, GuildMembers, GuildModeration)
- **Database**: PostgreSQL via `pg` + `drizzle-orm` (async, connection pool)
- **Cache**: Redis via `ioredis` (rate limits, guild config cache, moderation cache)
- **ORM**: Drizzle ORM with `drizzle-kit` for migrations
- **AI**: Provider-agnostic (OpenAI, Anthropic, or Ollama)
- **Other**: `dotenv`, `node-cron`, `zod`

## Project structure
```
src/
  shard.ts              — ShardingManager entry point
  index.ts              — client init, login, register event listeners
  config.ts             — env vars via dotenv + zod validation
  deploy-commands.ts    — slash command registration via REST
  client/
    BotClient.ts        — extended Client with services attached
  events/               — one file per Discord event
  commands/             — one folder per category (roblox/, admin/, mod/, chat/, economy/), one file per command
  components/           — button/select/modal handlers by customId prefix
  services/             — business logic (Economy, Moderation, Ticket, Logger, Scheduler, Premium, Verification)
  ai/
    provider.ts         — AI provider factory (OpenAI/Anthropic/Ollama)
    types.ts            — AI message/request/response types
    ChatService.ts      — conversation manager + AI chat
    Moderation.ts       — AI-based content moderation
    providers/
      openai.ts         — OpenAI provider (GPT-4o-mini)
      anthropic.ts      — Anthropic provider (Claude)
      ollama.ts         — Ollama local provider
  database/
    index.ts            — PostgreSQL pool + drizzle client
    schema.ts           — Drizzle table definitions (pg dialect)
    redis.ts            — Redis client singleton
  ratelimit/
    RateLimiter.ts      — Redis-backed sliding window rate limiter
  cache/
    GuildCache.ts       — Redis-based guild config cache
  utils/
    embed.ts            — embed factory (info, success, error, warn)
    cooldown.ts         — fallback in-memory rate limiter
    logger.ts           — colorful console logger
    permissions.ts      — permission check helpers
    emojis.ts           — custom emoji resolution
    guildConfig.ts      — emoji serialization helpers
  types/
    index.ts            — custom interfaces, enums, type aliases
```

## Premium System

Monetization via multiple freemium paths. Premium is tracked per-guild (guildId) with cumulative subscriptions.

### Getting Premium

| Method | How | Reward |
|---|---|---|
| **Support Server** | Run `/premium claim` while a member of the support guild | 14 days (once) |
| **Referral** | Run `/premium referral` to get a code; others redeem via `/premium redeem` | 7 days per referral (both parties) |
| **Premium Key** | Redeem a `PREM-XXXX-XXXX` key via `/premium redeem` | Configurable days |
| **Robux** | Contact dev in support server; manual key grant | 30/90/Lifetime |

### Premium Commands

The following commands require active premium (checked via `requirePremium()` utility):
- `/ask` — AI chat with history
- `/chat` — One-shot AI chat  
- `/config` — Guild configuration (currency, prefix, emojis, prompt, etc.)
- `/modconfig` — AI moderation settings (threshold, action, toggle)
- `/announce` — Send announcements to channels
- `/ticket panel\|open` — Ticket system
- `/leaderboard` — Richest/most active members

### Database tables

**`premium_subscriptions`**
```ts
id: serial('id').primaryKey(),
guildId: text('guild_id').notNull(),
grantedByUserId: text('granted_by_user_id'),  // nullable
source: text('source').notNull(),             // referral | support_server | robux | key | admin
days: integer('days').notNull(),
expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
```

**`referral_codes`**
```ts
id: serial('id').primaryKey(),
code: text('code').notNull().unique(),   // 8-char alphanumeric or PREM-XXXX-XXXX
creatorUserId: text('creator_user_id').notNull(),
creatorGuildId: text('creator_guild_id').notNull(),
rewardDays: integer('reward_days').notNull().default(7),
maxUses: integer('max_uses').notNull().default(10),
currentUses: integer('current_uses').notNull().default(0),
expiresAt: timestamp('expires_at', { withTimezone: true }),  // nullable
createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
```
Unique index on `code`.

**`referral_redemptions`**
```ts
id: serial('id').primaryKey(),
codeId: integer('code_id').references(() => referralCodes.id).notNull(),
redeemerUserId: text('redeemer_user_id').notNull(),
redeemerGuildId: text('redeemer_guild_id').notNull(),
rewardDays: integer('reward_days').notNull(),
createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
```

### PremiumService (`src/services/PremiumService.ts`)

- `isPremium(guildId)` — checks DB for active subscription, caches in-memory for 30s, invalidates on write
- `getPremiumInfo(guildId)` — returns `{ active, expiresAt, subscriptions[] }`
- `addPremium(guildId, days, source, userId?)` — inserts subscription, invalidates cache
- `generateReferralCode(userId, guildId, rewardDays?, maxUses?)` — creates unique code
- `redeemReferralCode(code, userId, guildId)` — validates and redeems, gives premium to both parties
- `claimSupportPremium(guildId, userId)` — verifies user is in `SUPPORT_GUILD_ID`, grants 14 days once
- `generateKey(days, maxUses)` — admin creates a `PREM-*` key
- `redeemKey(code, guildId, userId)` — validates and redeems a premium key

### Premium check utility (`src/utils/premiumCheck.ts`)

```ts
async function requirePremium(interaction, client): Promise<boolean>
```
Sends a premium-required ephemeral embed if the guild has no active subscription.

### Admin

- `/premiumkey generate <days> [uses]` — Admins generate premium keys (**ephemeral**, outputs the key)

### Config

`SUPPORT_GUILD_ID` env var (optional) — set to your support server's ID for `/premium claim`.

## Roblox Buy Flow

`/premium buy` shows step-by-step instructions:
1. User buys a Roblox Gamepass on Roblox
2. User copies their Roblox User ID from `https://www.roblox.com/users/123456/profile`
3. User runs `/premium redeem code:<roblox-id>` (custom webhook/game integration needed for automated verification)
4. Alternatively, user gets a premium key from the dev and uses `/premium redeem code:PREM-XXXX-XXXX`

## Roblox Verification System (like Bloxlink)

Users link their Roblox account to Discord for server identity verification.

### How it works
1. Admin enables verification via `/verifyconfig enable true`
2. Admin optionally sets a verified role and nickname format
3. User runs `/verify link <roblox-id-or-url>` — bot fetches user info via `https://users.roblox.com/v1/users/{id}`
4. Bot stores the link, assigns role, updates nickname
5. User can check status with `/verify status` or unlink with `/verify unlink`

### Database tables

**`roblox_links`**
```ts
id: serial('id').primaryKey(),
userId: text('user_id').notNull(),
guildId: text('guild_id').notNull(),
robloxId: text('roblox_id').notNull(),
robloxUsername: text('roblox_username').notNull(),
verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow()
```
Unique index on `(userId, guildId)`.

**`verification_configs`**
```ts
guildId: text('guild_id').primaryKey(),
enabled: boolean('enabled').notNull().default(false),
roleId: text('role_id'),
nicknameFormat: text('nickname_format').default('{roblox_username}'),
logChannel: text('log_channel')
```

### VerificationService (`src/services/VerificationService.ts`)

- `getConfig(guildId)` / `setConfig(guildId, data)` — CRUD for verification config
- `verifyUser(userId, guildId, robloxId, robloxUsername)` — links account + applies role/nickname
- `unverifyUser(userId, guildId)` — removes link + role
- `fetchRobloxUser(identifier)` — resolves Roblox user ID or profile URL via Roblox API
- `applyVerification(guildId, userId, robloxUsername, config)` — assigns role + syncs nickname

### Commands

- `/verify link <user-id-or-url>` — Links your Roblox account (ephemeral)
- `/verify unlink` — Unlinks your Roblox account
- `/verify status` — Shows your linked Roblox account
- `/verifyconfig enable <true|false>` — Toggle verification
- `/verifyconfig role [role]` — Set verified role
- `/verifyconfig nickname <format>` — Nickname template (`{roblox_username}` placeholder)
- `/verifyconfig log [channel]` — Set log channel
- `/verifyconfig show` — Show current config

## AI Providers — BYOK (Bring Your Own Key)

Now supports **5 provider types** via a common `AIProvider` interface:

| Provider | Env `AI_PROVIDER` | Key/Config |
|---|---|---|
| OpenAI | `openai` | `OPENAI_API_KEY` |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` |
| Google Gemini | `gemini` | `GEMINI_API_KEY` |
| Ollama (local) | `ollama` | `OLLAMA_BASE_URL` |
| OpenAI-Compatible | `openai-compatible` | `OPENAI_API_KEY` + `OPENAI_BASE_URL` |

The **OpenAI-Compatible** provider covers: **Groq, DeepSeek, Together, OpenRouter, Perplexity, Mistral AI, Azure OpenAI, Fireworks, Anyscale, Replicate**, and any other API that follows the OpenAI chat completions format. Just set the base URL and API key.

Provider selection is done via `AI_PROVIDER` env var. Each provider has a `getModel()` method for model identification.

## AI Auto-Respond Channels (Premium)

Admins can configure channels where the AI auto-responds to **every message** — no need to ping the bot or use a command.

### How it works
1. Premium guild: `/config aichannel add #channel`
2. In that channel, every message (not from bots) gets an AI reply
3. In other channels, users must ping `@Bot` or use `/ask` / `/chat`
4. The guild must have active premium (checked via `PremiumService.isPremium()`)
5. Channels stored as a JSON array in `guilds.auto_ai_channels`

### Auto-respond flow in `messageCreate.ts`
1. Check premium
2. If premium and channel is in `autoAiChannels` → auto AI reply (no ping check)
3. If mention detected and premium → AI reply
4. If mention detected and not premium → status embed with premium prompt
5. Bare mention → status embed (free)

### Commands
- `/config aichannel add #channel` — Add auto-respond channel (premium)
- `/config aichannel remove #channel` — Remove auto-respond channel (premium)
- `/config aichannel list` — List auto-respond channels (free)

## Custom Bot Identity (Premium)

Premium guilds can set a custom bot nickname visible only in their server.

- `/config botname <name>` — Changes bot's nickname via `member.setNickname()` (max 32 chars)
- `/config botname reset` — Resets to default
- Shown in `/config show` as "Bot Nickname"

This uses Discord's native per-guild nickname feature, so the nickname only appears in that specific server.

## Database schema (Drizzle + PostgreSQL)

All tables use `pgTable` from `drizzle-orm/pg-core`. Strings use `text()`, auto-increment IDs use `serial()`, booleans use `boolean()`, timestamps use `timestamp().defaultNow()`.

### `guilds` table
```ts
guildId: text('guild_id').primaryKey(),
currencyName: text('currency_name').notNull().default('coins'),
xpEnabled: boolean('xp_enabled').notNull().default(true),
welcomeChannel: text('welcome_channel'),
welcomeMessage: text('welcome_message').default('Welcome {user} to {guild}!'),
logChannel: text('log_channel'),
autoModEnabled: boolean('auto_mod_enabled').notNull().default(true),
aiModEnabled: boolean('ai_mod_enabled').notNull().default(false),
aiModThreshold: text('ai_mod_threshold').notNull().default('0.7'),
aiModAction: text('ai_mod_action').notNull().default('warn'),
aiSystemPrompt: text('ai_system_prompt').default('You are a helpful Discord bot assistant.'),
prefix: text().default('!'),
customEmojis: text('custom_emojis'),
autoAiChannels: text('auto_ai_channels'),  // JSON array of channel IDs
createdAt: timestamp('created_at').notNull().defaultNow()
```

### `members` table
```ts
id: serial('id').primaryKey(),
guildId: text('guild_id').notNull(),
userId: text('user_id').notNull(),
xp: integer('xp').notNull().default(0),
level: integer('level').notNull().default(0),
balance: integer('balance').notNull().default(0),
lastDaily: text('last_daily'),
joinedAt: timestamp('joined_at').notNull().defaultNow()
```
Unique index on `(guildId, userId)`.

### `infractions`, `tickets`, `scheduled_tasks` — same columns, `serial()` id, `timestamp()` for dates.

### `conversations` table (new for AI chat)
```ts
id: serial('id').primaryKey(),
guildId: text('guild_id').notNull(),
userId: text('user_id').notNull(),
channelId: text('channel_id').notNull(),
role: text('role').notNull(),          // 'user' | 'assistant'
content: text('content').notNull(),
model: text('model').notNull(),
tokens: integer('tokens').notNull().default(0),
createdAt: timestamp('created_at').notNull().defaultNow()
```

## AI Module

### Provider-agnostic architecture

All AI features go through a common interface defined in `src/ai/types.ts`:

```ts
interface AIProvider {
  complete(req: CompletionRequest): Promise<CompletionResponse>
  moderate?(content: string): Promise<ModerationResult>
}
```

Provider is selected via `AI_PROVIDER` env var: `openai`, `anthropic`, or `ollama`.

### ChatService (`src/ai/ChatService.ts`)
- Loads conversation history from `conversations` table (last 20 messages)
- Prepends guild-specific system prompt
- Calls AI provider, saves both user message and response to DB
- Trims old conversations (keeps last 50 per user per channel)
- Token counting for cost tracking

### AI Moderation (`src/ai/Moderation.ts`)
- Two-tier: regex fast path → AI slow path
- OpenAI: uses Moderation API endpoint (free to a degree)
- Anthropic/Ollama: uses GPT prompt-based classification
- Results cached in Redis for 1 hour (key: `modcache:<content_hash>`)

## Rate limiting (`src/ratelimit/RateLimiter.ts`)

Redis-backed sliding window rate limiter:

| Limit | Key pattern | Default |
|---|---|---|
| Per-command (user) | `rl:{guild}:{user}:{cmd}` | 3 per 5s |
| AI chat (user) | `rl:{guild}:{user}:ai` | 20 per 60s |
| AI moderation | `rl:global:mod` | soft limit |

Falls back to in-memory `CooldownManager` when Redis is unavailable.

## Guild config caching

On `ready`, load all guild configs:
1. Read from PostgreSQL
2. Write to Redis hash `guild:{guildId}:config`
3. Keep in-memory Map for fast access inside the current process

On writes (config command), update both PostgreSQL and Redis.

This setup means when sharding is added later, each shard can read from Redis instead of a local Map.

## Sharding (`src/shard.ts`)

Not active until explicitly run. Uses `ShardingManager` from discord.js:
```ts
const manager = new ShardingManager('./dist/index.js', {
  token: config.DISCORD_TOKEN,
  totalShards: 'auto',
  respawn: true,
})
```

All state is in PostgreSQL + Redis, so adding shards requires zero code changes to services.

## Bot client pattern
```ts
class BotClient extends Client {
  public db!: DbClient
  public redis!: Redis
  public economy!: EconomyService
  public moderation!: ModerationService
  public tickets!: TicketService
  public loggerService!: LoggerService
  public scheduler!: SchedulerService
  public chat!: ChatService
  public aiMod!: AIModeration
  public rateLimiter!: RateLimiter
  public premium!: PremiumService
  public verification!: VerificationService
  public guildCache!: Map<string, GuildConfig>
}
```

## Commands

| Command | Description | Category |
|---|---|---|
| `/ping` | Check latency | utility |
| `/help` | Category select menu | utility |
| `/info server\|user` | Server/user info | utility |
| `/balance [user]` | Check balance | economy |
| `/daily` | Claim daily reward | economy |
| `/transfer <user> <amount>` | Send currency | economy |
| `/leaderboard [type]` *(premium)* | Top members | economy |
| `/warn <user> <reason>` | Warn a user | mod |
| `/infractions <user>` | List warnings | mod |
| `/clear <amount>` | Bulk delete | mod |
| `/modconfig ai <enable\|threshold\|action>` *(premium)* | AI mod settings | mod |
| `/ticket panel\|open` *(premium)* | Support tickets | utility |
| `/chat <message>` *(premium)* | One-shot AI chat | ai |
| `/ask <question>` *(premium)* | AI with history | ai |
| `/config <sub>` *(premium)* | Guild settings | admin |
| `/announce <title> <msg>` *(premium)* | Send announcement | admin |
| `/config aichannel add\|remove\|list` *(premium)* | AI auto-respond channels | admin |
| `/config botname <name>` *(premium)* | Custom bot nickname | admin |
| `/premium status\|claim\|referral\|redeem\|buy` | Premium management | premium |
| `/premiumkey generate` | Generate premium keys (admin) | admin |
| `/verify link\|unlink\|status` | Link Roblox account | utility |
| `/verifyconfig enable\|role\|nickname\|log\|show` | Configure verification | admin |

## Key conventions
- Always `as const` for enums/magic strings
- All replies via `interaction.reply({ embeds, ephemeral })` unless public
- Embed factory: `embed.success()`, `embed.error()`, `embed.info()`
- Database writes via `db.insert()` / `db.update()` (async — await)
- Command files re-export `{ data, execute }`
- Component handlers keyed by `customId` prefix in a Map
- Never hardcode currency name — always read from guildCache
- Never hardcode emojis — always use `resolveEmoji()` / `emojiInTitle()`
- AI calls are always wrapped in try/catch with fallback to user-facing error
- Rate limits checked before any command execution
