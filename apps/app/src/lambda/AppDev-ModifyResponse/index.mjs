import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = 'dev-app.thx.network';
const API_URL = 'https://dev.api.thx.network';

const s3 = new S3Client({ region: 'eu-west-3' });
const response = await fetch('https://dev.api.thx.network/v1/leaderboards?page=1&limit=50');
const { results: campaigns } = await response.json();

export const handler = async (event) => {
    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    console.log(request);

    // If no request or request.uri, return the response as is
    if (!request || !request.uri) return response;

    const url = new URL(request.uri);
    const campaign = campaigns.find((c) => url.pathname.startsWith(`/c/${c.slug}`));
    console.log(campaign);
    if (!campaign) return response;

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'index.html',
    });
    console.log(command);
    const res = await s3.send(command);
    console.log(response);
    const content = await res.Body.transformToString();
    console.log(content);
    const metadata = {
        id: campaign._id,
        title: `#${campaign.rank} | ${campaign.title}`,
        description: `Already ${campaign.participantCount} completed quests! ${campaign.description}`,
        image: `${API_URL}/v1/leaderboards/facebook/${metadata.id}.png`,
        type: 'website',
        url: request.uri,
    };
    console.log(metadata);

    return {
        body: upsertMetaTags(metadata, content),
        bodyEncoding: 'text',
        status: '200',
        statusDescription: 'OK',
        headers: {
            'content-type': [
                {
                    value: 'text/html',
                },
            ],
        },
    };
};

// Helper function to replace or insert meta tags
function upsertMetaTags(metadata, currentBody) {
    let newBody = currentBody;
    const ogToChange = [
        { key: 'og:title', value: metadata.title },
        { key: 'og:description', value: metadata.description },
        { key: 'og:image', value: metadata.image },
        { key: 'og:url', value: metadata.url },
        { key: 'twitter:image', value: metadata.image },
        { key: 'twitter:title', value: metadata.title },
        { key: 'twitter:description', value: metadata.description },
    ];

    ogToChange.forEach((item) => {
        newBody = modifyMetaTag(newBody, item.key, item.value);
    });

    return newBody;
}

// Helper function to modify a single meta tag
function modifyMetaTag(data, dynamicProperty, newContent) {
    const regex = new RegExp(`<meta\\s+property="${dynamicProperty}"\\s+content="[^"]*"\\s*/?>`, 'g');

    return data.replace(regex, (match) => {
        return match.replace(/content="[^"]*"/, `content="${newContent}"`);
    });
}
