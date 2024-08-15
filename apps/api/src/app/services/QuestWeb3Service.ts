import { ethers } from 'ethers';
import { QuestWeb3Entry, QuestWeb3, QuestWeb3Document } from '@thxnetwork/api/models';
import { IQuestService } from './interfaces/IQuestService';
import { BigNumber } from 'alchemy-sdk';
import { Request } from 'express';
import { chainList } from '@thxnetwork/common/chains';
import NetworkService from './NetworkService';

export default class QuestWeb3Service implements IQuestService {
    models = {
        quest: QuestWeb3,
        entry: QuestWeb3Entry,
    };

    async getDataForRequest(
        req: Request,
        options: { quest: QuestWeb3Document; account: TAccount },
    ): Promise<Partial<TQuestEntry>> {
        const address = NetworkService.recoverSigner(req.body.message, req.body.signature);
        const { rpc, chainId } = chainList[req.body.chainId];

        const contract = options.quest.contracts.find((c) => c.chainId === chainId);
        if (!contract) return { result: false, reason: 'Smart contract not found.' };

        const instance = new ethers.Contract(
            contract.address,
            ['function ' + options.quest.methodName + '(address) view returns (uint256)'],
            new ethers.providers.JsonRpcProvider(rpc),
        );
        const value = await instance[options.quest.methodName](address);
        const callResult = value.toString();

        return { metadata: { address, rpc, chainId: req.body.chainId, callResult } };
    }

    findEntryMetadata(options: { quest: TQuestWeb3 }) {
        return {};
    }

    async decorate({
        quest,
        account,
        data,
    }: {
        quest: QuestWeb3Document;
        data: Partial<TQuestWeb3Entry>;
        account?: TAccount;
    }): Promise<TQuestWeb3 & { isAvailable: boolean }> {
        const isAvailable = await this.isAvailable({ quest, account, data });

        return {
            ...quest,
            isAvailable: isAvailable.result,
            amount: quest.amount,
            contracts: quest.contracts,
            methodName: quest.methodName,
            threshold: quest.threshold,
        };
    }

    async isAvailable({
        quest,
        account,
        data,
    }: {
        quest: QuestWeb3Document;
        account: TAccount;
        data: Partial<TQuestWeb3Entry>;
    }): Promise<TValidationResult> {
        if (!account) return { result: true, reason: '' };

        const ids: any[] = [{ sub: account.sub }];
        if (data.metadata && data.metadata.address) ids.push({ 'metadata.address': data.metadata.address });

        const isCompleted = await QuestWeb3Entry.exists({
            questId: quest.id,
            $or: ids,
        });
        if (!isCompleted) return { result: true, reason: '' };

        return { result: false, reason: 'You have completed this quest with this account and/or address already.' };
    }

    async getAmount({ quest }: { quest: TQuestWeb3; account: TAccount }): Promise<number> {
        return quest.amount;
    }

    async getValidationResult({
        quest,
        account,
        data,
    }: {
        quest: QuestWeb3Document;
        account: TAccount;
        data: Partial<TQuestWeb3Entry>;
    }): Promise<TValidationResult> {
        const isCompleted = await QuestWeb3Entry.exists({
            questId: quest.id,
            $or: [{ sub: account.sub }, { 'metadata.address': data.metadata.address }],
        });
        if (isCompleted) return { result: false, reason: 'You have claimed this quest already' };

        const threshold = BigNumber.from(quest.threshold);
        const result = BigNumber.from(data.metadata.callResult);
        if (result.lt(threshold)) {
            return { result: false, reason: 'Result does not meet the threshold' };
        }

        if (!isCompleted && result.gte(threshold)) {
            return { result: true, reason: '' };
        } else {
            return { result: false, reason: 'Validation did not succeed.' };
        }
    }
}
