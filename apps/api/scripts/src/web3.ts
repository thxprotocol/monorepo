import { Job, QuestWeb3, QuestWeb3Entry } from '@thxnetwork/api/models';
import { JobType } from '@thxnetwork/common/enums';
import { chainList } from '@thxnetwork/common/chains';
import { ethers } from 'ethers';

export default async function main() {
    const quest = await QuestWeb3.findById('66bfa0195da724b718e72649');
    const jobs = await Job.find({
        'name': JobType.CreateQuestEntry,
        'data.questId': quest.id,
    });

    for (const job of jobs) {
        const entries = await QuestWeb3Entry.find({
            ip: job.data.data.ip,
        });

        const address = job.data.data.metadata.metadata.address;

        const contract = quest.contracts.find((c) => c.chainId === chainId);
        if (!contract) return { result: false, reason: 'Smart contract not found.' };
        const { rpc, chainId } = chainList[contract.chainId];
        const instance = new ethers.Contract(
            contract.address,
            ['function ' + quest.methodName + '(address) view returns (uint256)'],
            new ethers.providers.JsonRpcProvider(rpc),
        );
        const value = await instance[quest.methodName](address);
        const callResult = value.toString();

        console.log({ callResult }, entries.length);
        console.log(`https://bscscan.com/address/${job.data.data.metadata.metadata.address}`);
    }
}
