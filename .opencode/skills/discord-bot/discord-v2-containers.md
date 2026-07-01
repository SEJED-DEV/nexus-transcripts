# Discord.js v2 Container Components

Discord.js v14.18+ has Container/TextDisplay components (v2-style messages). This replaces the old embed-only approach.

## Rules

<!-- Rule: The user explicitly said only use custom emojis from the bot app's dev portal -->
- **Emoji rule**: ONLY use custom emojis that belong to the bot application (uploaded via Discord Developer Portal). Never use external custom emojis. Use `config.emojis.xxx` from `src/config.ts` which loads emoji IDs from env vars. If no emoji ID is configured, fall back to an empty string (don't use external emojis).

## Imports

```ts
import {
  ContainerBuilder,
  TextDisplayBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  MessageFlags,
} from "discord.js";
```

## Utility Functions (recommended)

Put these in `src/utils/components.ts`:

### Ephemeral reply to a command interaction

```ts
export async function sendV2(
  interaction: ChatInputCommandInteraction,
  opts: { content: string; imageUrl?: string },
): Promise<void> {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(opts.content));

  if (opts.imageUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(opts.imageUrl)),
    );
  }

  const flags = MessageFlags.IsComponentsV2;

  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({ components: [container] as any, flags });
    return;
  }

  await interaction.reply({ components: [container] as any, flags });
}
```

### Build payload for channel/webhook sends

```ts
export function buildV2(content: string, imageUrl?: string) {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
  if (imageUrl) {
    container.addMediaGalleryComponents(
      new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(imageUrl)),
    );
  }
  return { components: [container] as any };
}
```

### Send to a text channel

```ts
export async function sendV2ToChannel(channel: TextChannel, content: string): Promise<void> {
  const container = new ContainerBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
  await channel.send({ components: [container] as any });
}
```

## Pattern: Pure text message

```ts
new ContainerBuilder()
  .addTextDisplayComponents(new TextDisplayBuilder().setContent("Hello world"));
```

## Pattern: Text + Buttons

```ts
const container = new ContainerBuilder()
  .addTextDisplayComponents(new TextDisplayBuilder().setContent("Are you sure?"))
  .addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("confirm").setLabel("Yes").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("cancel").setLabel("No").setStyle(ButtonStyle.Secondary),
    ),
  );

await interaction.reply({ components: [container] as any, flags: MessageFlags.IsComponentsV2 });
```

## Pattern: Text + Select Menu

```ts
const select = new StringSelectMenuBuilder()
  .setCustomId("pick")
  .setPlaceholder("Choose...")
  .addOptions(
    new StringSelectMenuOptionBuilder().setLabel("Option A").setValue("a"),
    new StringSelectMenuOptionBuilder().setLabel("Option B").setValue("b"),
  );

const container = new ContainerBuilder()
  .addTextDisplayComponents(new TextDisplayBuilder().setContent("Pick one:"))
  .addActionRowComponents(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select));

await interaction.reply({ components: [container] as any, flags: MessageFlags.IsComponentsV2 });
```

## Pattern: Text + Image/Media

```ts
const container = new ContainerBuilder()
  .addTextDisplayComponents(new TextDisplayBuilder().setContent("Check this out"))
  .addMediaGalleryComponents(
    new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL("https://example.com/image.png"),
    ),
  );
```

## Pattern: Multiple action rows

```ts
const container = new ContainerBuilder()
  .addTextDisplayComponents(new TextDisplayBuilder().setContent("Multiple rows"))
  .addActionRowComponents(row1 as any)
  .addActionRowComponents(row2 as any);
```

## Key Rules

- **Always** cast `components` with `as any` when using ContainerBuilder (TypeScript strict mode issue with discord.js v2 API)
- **Always** include `flags: MessageFlags.IsComponentsV2` in ALL messages using v2 components — interaction replies AND channel messages. Without this flag, Discord's API only accepts type 1 (ActionRow) in components.
- When `IsComponentsV2` is set, `content` and `embeds` no longer work. Use `TextDisplayBuilder` for text and `MediaGalleryBuilder`/`File` component for media.
- Use `interaction.editReply()` if already replied/deferred, `interaction.reply()` otherwise
- `ContainerBuilder` cannot be combined with traditional embeds in the same message
- Max 5 action rows per container, max 40 total components per message
- Container supports: TextDisplay, MediaGallery, Section, ActionRow, Separator, File as children
- Container has optional `setAccentColor(color)` for a colored accent bar
- MediaGallery items support `setURL(url)` (HTTP or `attachment://`), `setDescription(desc)`, `setSpoiler(bool)`
- For welcome/goodbye in channels: use `ContainerBuilder` + `TextDisplayBuilder` + `MediaGalleryBuilder` with `flags: MessageFlags.IsComponentsV2`. Files are sent via `attachment://` URLs in MediaGallery items.
- Welcome/goodbye config lives in `src/config.ts` (welcomeChannelId, goodbyeChannelId) and `.env`
- Both `GuildMemberAdd` and `GuildMemberRemove` handlers are in `src/events/greeter.ts`
