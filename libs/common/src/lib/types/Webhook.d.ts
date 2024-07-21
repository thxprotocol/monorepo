type TWebhook = {
    _id?: string;
    sub: string;
    url: string;
    status: WebhookStatus;
    active: boolean;
    signingSecret: string;
    webhookRequests: TWebhookRequest[];
    createdAt?: Date;
};

type TWebhookRequest = {
    _id?: string;
    webhookId: string;
    response: string;
    payload: string;
    payloadFormatted?: HighlightResult;
    attempts: number;
    httpStatus: number;
    state: WebhookRequestState;
    failReason: string;
    createdAt?: Date;
};
