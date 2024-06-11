import { DiscordGuild } from '@thxnetwork/api/models';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [
    param('id').isMongoId(),
    body('settings.adminRoleId').optional().isString(),
    body('notifications.questCreated.isDisabled').optional().isBoolean(),
    body('notifications.questCreated.message').optional().isString(),
    body('notifications.questCreated.channelId').optional().isString(),
    body('notifications.questEntryCreated.isDisabled').optional().isBoolean(),
    body('notifications.questEntryCreated.message').optional().isString(),
    body('notifications.questEntryCreated.channelId').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const { guildId, name, adminRoleId, notifications } = req.body;
    const guild = await DiscordGuild.create({
        poolId: req.params.id,
        sub: req.auth.sub,
        guildId,
        name,
        adminRoleId,
        notifications,
    });
    const result = await DiscordDataProxy.getGuild({ ...guild.toJSON(), isConnected: true });

    res.json(result);
};

export { controller, validation };
