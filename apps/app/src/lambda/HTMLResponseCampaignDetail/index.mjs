import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

console.log('Lambda started!');
const BUCKET_NAME = 'dev-app.thx.network';
const APP_URL = 'https://dev-app.thx.network';
const API_URL = 'https://dev.api.thx.network';

console.log('Fetch campaigns...');
const httpResponse = await fetch(`${API_URL}/v1/leaderboards?page=1&limit=50`);
const { results: campaigns } = await httpResponse.json();
console.log('Fetched campaigns!');

console.log('Fetch HTML...');
const s3 = new S3Client({ region: 'eu-west-3' });
const responseS3 = await s3.send(
    new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'index.html',
    }),
);
const html = await responseS3.Body.transformToString();
console.log('Fetched HTML!');

export const handler = async (event) => {
    const response = event.Records[0].cf.response;
    const request = event.Records[0].cf.request;
    console.log(request);
    console.log(response);

    // If no request or request.uri, return the response as is
    // Also Check the requests accept header for being html
    const acceptHeader = request.headers['accept'] || request.headers['Accept'];
    if (!acceptHeader || !acceptHeader[0].value.toLowerCase().includes('text/html')) {
        return event.Records[0].cf.response;
    }

    // Search the campaign in the cached campaign results
    const campaign = campaigns.find((c) => request.uri.includes(`/c/${c.slug}`));
    if (!campaign) return response;

    const metadata = {
        id: campaign._id,
        title: `#${campaign.rank} | ${campaign.title}`,
        description: `Already ${campaign.participantCount} completed quests! ${campaign.description || ''}`,
        image: `${API_URL}/v1/leaderboards/facebook/${campaign._id}.png`,
        type: 'website',
        url: `${APP_URL}${request.uri}`,
    };

    return {
        body: upsertMetaTags(metadata, html),
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
