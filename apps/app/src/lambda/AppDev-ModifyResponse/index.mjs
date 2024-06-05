import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'eu-west-3' });
const BUCKET_NAME = 'dev-app.thx.network';
const response = await fetch('https://dev.api.thx.network/v1/leaderboards?page=1&limit=50');
const { results: campaigns } = await response.json();

export const handler = async (event) => {
    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;

    // If no request, uri or metatags, return the response as is
    if (!request || !request.uri || !metatags[request.uri]) {
        return response;
    }
    const campaign = campaigns.find((c) => c.slug === request.uri);
    if (!campaign) return response;

    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'index.html',
    });
    const { Body } = await s3.send(command);
    const content = await Body.transformToString();

    const metadata = {
        id: campaign._id,
        title: `${campaign.participantCount} completed "${metatags[path].title}" quests!`,
        description: `#${campaign.rank}: ${metatags[path].description}`,
        type: 'website',
        url: request.uri,
    };

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
        { key: 'og:type', value: metadata.type },
        { key: 'og:title', value: metadata.title },
        { key: 'og:description', value: metadata.description },
        { key: 'og:image', value: `https://dev.api.thx.network/v1/leaderboards/facebook/${metadata.id}.png` },
        { key: 'og:url', value: metadata.url },
        { key: 'twitter:image', value: `https://dev.api.thx.network/leaderboards/twitter/${metadata.id}.png` },
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
