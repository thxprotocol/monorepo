import axios from 'axios';
import { Webhook, WebhookDocument } from '@thxnetwork/api/models/Webhook';
import { Identity } from '@thxnetwork/api/models/Identity';
import { WebhookRequest, WebhookRequestDocument } from '@thxnetwork/api/models/WebhookRequest';
import { Job } from '@hokify/agenda';
import { agenda } from '@thxnetwork/api/util/agenda';
import { signPayload } from '@thxnetwork/api/util/signingsecret';
import { JobType, Event, WebhookRequestState } from '@thxnetwork/common/enums';
import { logger } from '../util/logger';

export default class WebhookService {
    static async request(webhook: WebhookDocument, account: TAccount, metadata?: string) {
        const identities = (await Identity.find({ accountId: account.sub })).map((i) => i.uuid);
        const webhookRequest = await WebhookRequest.create({
            webhookId: webhook._id,
            payload: JSON.stringify({ type: 'quest_entry.create', identities, metadata }),
            state: WebhookRequestState.Pending,
        });

        return await this.executeRequest(webhook, webhookRequest);
    }

    static async requestAsync(
        webhook: WebhookDocument,
        accountId: string,
        payload: { type: Event; data: any & { metadata: any } },
    ) {
        const identities = (await Identity.find({ accountId })).map((i) => i.uuid);
        const webhookRequest = await WebhookRequest.create({
            webhookId: webhook._id,
            payload: JSON.stringify({ ...payload, identities }),
            state: WebhookRequestState.Pending,
        });

        await agenda.now(JobType.RequestAttemp, {
            webhookRequestId: String(webhookRequest._id),
            sub: webhook.sub,
        });
    }

    static async requestAttemptJob(job: Job) {
        const { webhookRequestId } = job.attrs.data as any;

        const webhookRequest = await WebhookRequest.findById(webhookRequestId);
        if (!webhookRequest) throw new Error('No webhook request object found');

        const webhook = await Webhook.findById(webhookRequest.webhookId);
        if (!webhook) throw new Error('No webhook object found');

        await this.executeRequest(webhook, webhookRequest);
    }

    static async executeRequest(webhook: WebhookDocument, webhookRequest: WebhookRequestDocument) {
        try {
            const signature = signPayload(webhookRequest.payload, webhook.signingSecret);
            webhookRequest.state = WebhookRequestState.Sent;

            const response = await axios({
                method: 'POST',
                url: webhook.url,
                data: { signature, payload: webhookRequest.payload },
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            webhookRequest.response = JSON.stringify(response.data);
            webhookRequest.state = WebhookRequestState.Received;
            webhookRequest.httpStatus = response.status;

            logger.debug(`[${response.status}], ${JSON.stringify(response.data)}`);

            return response && response.data;
        } catch (error) {
            webhookRequest.state = WebhookRequestState.Failed;
            webhookRequest.failReason = error && error.toString();

            // If there is an HTTP response we store the HTTP error and status code
            if (error && error.response) {
                webhookRequest.httpStatus = error.response.status;
                webhookRequest.failReason = JSON.stringify(error.response.data);
            }

            logger.error(error);
        } finally {
            webhookRequest.attempts = webhookRequest.attempts++;
            await webhookRequest.save();
        }
    }
}
