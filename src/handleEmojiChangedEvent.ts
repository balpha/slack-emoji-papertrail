import { App, EmojiChangedEvent, KnownBlock } from "@slack/bolt";

export async function handleEmojiChangedEvent({
  event,
  app,
  channel,
}: {
  event: EmojiChangedEvent;
  app: App;
  channel: string;
}) {
  if (isNewEmoji(event)) {
    await app.client.chat.postMessage({
      channel,
      text: `Emoji \`:${event.name}:\` :${event.name}: was added.`,
      mrkdwn: true,
      blocks: emojiAddedMessageBlocks(event),
    });
  } else if (isNewAlias(event)) {
    const target = event.value.substring("alias:".length);
    await app.client.chat.postMessage({
      channel,
      text: `:arrows_counterclockwise: Emoji \`:${event.name}:\` is a now an alias for \`:${target}:\` :${target}:.`,
      mrkdwn: true,
    });
  } else if (isRemoval(event)) {
    const message =
      event.names.length === 1
        ? `Emoji \`:${event.names[0]}:\` has been removed.`
        : `Emojis ${event.names
            .map((e) => `\`:${e}:\``)
            .join(", ")} have been removed.`;

    await app.client.chat.postMessage({
      channel,
      text: `:put_litter_in_its_place: ${message}`,
      mrkdwn: true,
    });
  }
}

function isNewEmoji(event: EmojiChangedEvent): event is EmojiAddedEvent {
  return (
    event.subtype === "add" &&
    !!event.value &&
    !event.value.startsWith("alias:")
  );
}

function isNewAlias(event: EmojiChangedEvent): event is EmojiAliasedEvent {
  return event.subtype === "add" && !!event.value?.startsWith("alias:");
}

function isRemoval(event: EmojiChangedEvent): event is EmojisRemovedEvent {
  return event.subtype === "remove";
}

type EmojiAddedEvent = EmojiChangedEvent & {
  subtype: "add";
  names: undefined;
  name: string;
  value: string;
};

type EmojiAliasedEvent = EmojiChangedEvent & {
  subtype: "add";
  names: undefined;
  name: string;
  value: `alias:${string}`;
};

type EmojisRemovedEvent = EmojiChangedEvent & {
  subtype: "remove";
  names: string[];
  name: undefined;
  value: undefined;
};

function emojiAddedMessageBlocks(event: EmojiAddedEvent): KnownBlock[] {
  return [
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:tada:  *New emoji alert!*  :tada:\n\nEmoji \`:${event.name}:\` :${event.name}: was added to this Slack.`,
      },
      accessory: {
        type: "image",
        image_url: event.value,
        alt_text: event.name,
      },
    },
    {
      type: "divider",
    },
  ];
}
