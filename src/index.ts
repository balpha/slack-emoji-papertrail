import { App } from "@slack/bolt";
import { handleEmojiChangedEvent } from "./handleEmojiChangedEvent";

const channel = process.env.EPT_CHANNEL || "";
const token = process.env.EPT_TOKEN;
const signingSecret = process.env.EPT_SIGNING_SECRET;
const appToken = process.env.EPT_APP_TOKEN;

function ensure(value: string | undefined, error: string) {
  if (!value) {
    console.error(error);
    process.exit(1);
  }
}

ensure(channel, "Set the channel using the EPT_CHANNEL env var");
ensure(token, "Set the token using the EPT_TOKEN env var");
ensure(
  signingSecret,
  "Set the signing secret using the EPT_SIGNING_SECRET env var"
);
ensure(appToken, "Set the app token using the EPT_APP_TOKEN env var");

const app = new App({
  token,
  signingSecret,
  socketMode: true,
  appToken,
});

app.event("emoji_changed", ({ event }) =>
  handleEmojiChangedEvent({ event, channel, app })
);

(async () => {
  await app.start();
  console.log(`emoji-papertrail running as ${process.pid}`);
})();
