import { TwitterApi, ETwitterStreamEvent } from 'twitter-api-v2';
import { WebhookClient } from 'discord.js';
import config from './config.json' assert { type: 'json' };

const client = new TwitterApi(config.bearerToken);

const webhook = new WebhookClient({
    url: config.webhookURL
});

const rules = await client.v2.streamRules();

if (rules.data) {
    await client.v2.updateStreamRules({
        delete: {
            values: rules.data.map(rule => rule.value),
        }
    });
};

await client.v2.updateStreamRules({
    add: [
      { value: `from:${config.username}`, tag: 'newTweet' }
    ]
});

const stream = await client.v2.searchStream();

stream.on(ETwitterStreamEvent.ConnectionError, console.error);

stream.on(ETwitterStreamEvent.Data, (data) => { 
    webhook.send({
        content: `[**@${config.username}**](https://twitter.com/${config.username}) just sent out a tweet!\nhttps://twitter.com/${config.username}/status/${data.data.id}`,
    });
});

console.log('Stream has started!');