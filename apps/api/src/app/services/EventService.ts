import { Event, EventDocument, Identity } from '@thxnetwork/api/models';
import AccountProxy from '../proxies/AccountProxy';

class EventService {
    async list(sub: string, { page, limit }: TPaginationParams) {
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Event.find({ sub }).countDocuments().exec();
        const events = {
            previous: startIndex > 0 && {
                page: page - 1,
            },
            next: endIndex < total && {
                page: page + 1,
            },
            limit,
            total,
            results: await Event.aggregate([
                { $match: { sub } },
                { $sort: { createdAt: -1 } },
                { $skip: startIndex },
                { $limit: limit },
            ]).exec(),
            metadata: {
                eventTypes: await Event.find({ sub }).distinct('name'),
            },
        };

        const identityIds = events.results.filter(({ identityId }) => !!identityId).map(({ identityId }) => identityId);
        const identities = await Identity.find({ _id: { $in: identityIds } });
        const accountIds = identities.map(({ accountId }) => accountId);
        const accounts = await AccountProxy.find({ subs: accountIds });

        events.results = events.results.map((event: EventDocument) => {
            const identity = identities.find(({ _id }) => String(_id) === event.identityId);
            if (!identity) return event;

            const account = accounts.find(({ sub }) => sub === identity.accountId);
            return { ...event, identity, account };
        });

        return events;
    }
}

export default new EventService();
