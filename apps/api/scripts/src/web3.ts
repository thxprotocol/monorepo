import { Job, QuestWeb3Entry } from '@thxnetwork/api/models';
import { JobType } from '@thxnetwork/common/enums';

export default async function main() {
    const jobs = await Job.find({
        'name': JobType.CreateQuestEntry,
        'data.questId': '66bfa0195da724b718e72649',
    });

    for (const job of jobs) {
        const entries = await QuestWeb3Entry.find({
            ip: job.data.data.ip,
        });
        console.log(entries.length);
        console.log(`https://bscscan.com/address/${job.data.data.metadata.metadata.address}`);
    }
}
