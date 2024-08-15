# THX Network JS SDK

This SDK contains API wrappers and an OIDC OAuth manager to simplify access to THX API resources.

## Prerequisites

1. [Sign up for an account](https://dashboard.thx.network/)
2. Create an API key (Account -> Developer -> API)
3. Store your API key in a secure location

## SDK Contents

-   [1. THXWidget](#1-thxwidget)

    -   [1.1 ContainerSelector](#11-containerselector)
    -   [1.2 Identity](#12-identity)

-   [2. THXAPIClient](#2-thxapiclient)

    -   [2.1 Identities](#21-identities)
    -   [2.2 Events](#22-events)

## 1. THXWidget

Meant for loading the HTML widget in a website using JavaScript.

```typescript
import { THXWidget, THXWidgetOptions } from '@thxnetwork/sdk';

const options: THXWidgetOptions = {
    campaignId: '6571c9c6b7d775decb45a8f0',
    containerSelector: '#your-html-container', // Optional
    identity: '36d33a59-5398-463a-ac98-0f7d9b201648', // Optional
};
THXWidget.create(options);
```

### 1.1 ContainerSelector

Providing a `containerSelector` is optional and will inject the application in a given HTML element. Make sure to provide CSS styles for proper dimensions within your page.

```html
<div id="your-html-container" style="height: 750px;"></div>
```

No messagbox, launcher and notification elements will be injected if a container selector is specified!

### 1.2 Identity

Providing an identity is optional and alternatively you can set an identity at a later moment, for example after successful authentication with your app.

```typescript
window.THXWidget.setIdentity('36d33a59-5398-463a-ac98-0f7d9b201648');
```

## 2. THXAPIClient

Meant for JavaScript backend applications.

```typescript
import { THXAPIClient, THXAPIClientOptions } from '@thxnetwork/sdk';

const options: THXAPIClientOptions = {
    apiKey: 'WtMTSdvSuLaCL7YVYgn2OBT9Bp/WV6xxcosLiqj9CWo=',
};
const thx = new THXAPIClient(options);
```

### 2.1 Identities

Identities are used to connect THX accounts to users in your database.

```typescript
const identity = await thx.identity.create();
// 36d33a59-5398-463a-ac98-0f7d9b201648
```

### 2.2 Events

Events can be used to add requirements for Daily, Invite and Custom Quests.

```typescript
thx.events.create({ name: 'level_up', identity: '36d33a59-5398-463a-ac98-0f7d9b201648' });
```

### 2.3 Quests

Quests can be managed programatically. Specify `content` and `contentMetadata` according to the requirements in order to generate proper card previews.

#### Twitter Post Previews

Use this `content` and `contentMetadata` for these `interaction` variants: `QuestRequirement.TwitterRetweet`.

```typescript
const interaction = QuestRequirement.TwitteRetweet;
const content = '46927555';
const contentMetadata = {
    url: 'https://twitter.com/twitter/status/1603121182101970945',
    username: 'johndoe',
    name: 'John Doe',
    text: '✨ Loyalty Networks are here✨ #fintech meets #loyalty',
    minAmountFollowers: 123,
};
```

#### Twitter User Previews

Use this `content` and `contentMetadata` for these `interaction` variants: `QuestRequirement.TwitterFollow`.

```typescript
const interaction = QuestRequirement.TwitterFollow;
const content = '13241234';
const contentMetadata = {
    id: 46927555,
    name: 'John doe',
    profileImgUrl: 'https://picsum.com/avatar.jpg',
    username: 'johndoe',
    minAmountFollowers: 123,
};
```

#### Twitter Message Preview

Use this `content` and `contentMetadata` for these `interaction` variants: ` QuestRequirement.TwitterMessage`,

```typescript
const interaction = QuestRequirement.TwitterMessage;
const content = '✨ Loyalty Networks are here✨ #fintech meets #loyalty';
const contentMetadata = {
    minFollowersCount: 123,
};
```

#### Create Twitter Quest

```typescript
thx.campaigns.quests.create({
    variant: QuestVariant.Twitter,
    title: 'Farm along!',
    description: 'Get these pointzz...',
    amount: 123,
    isPublished: true,
    interaction,
    content,
    contentMetadata,
});
```
