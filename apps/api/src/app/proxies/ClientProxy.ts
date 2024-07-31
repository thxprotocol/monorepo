import { Client, TClient } from '@thxnetwork/api/models/Client';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { getSigningSecret } from '../util/signingsecret';

class ClientProxy {
    async get(clientId: string): Promise<TClient> {
        return await Client.findById(clientId);
    }

    async findByQuery(query: { poolId: string }, page = 1, limit = 10) {
        return paginatedResults(Client, page, limit, query);
    }

    async create(sub: string, { name }: { name: string }) {
        return await Client.create({
            sub,
            name,
            secret: getSigningSecret(32),
        });
    }

    async remove(clientId: string) {
        return await Client.findByIdAndDelete(clientId);
    }

    async update(clientId: string, { name }: { name: string }) {
        return await Client.findByIdAndUpdate(clientId, { name }, { new: true });
    }
}

export default new ClientProxy();
