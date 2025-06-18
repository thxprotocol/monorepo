import { logger } from '@thxnetwork/api/util/logger';
import { QuestSocialRequirement } from '@thxnetwork/common/enums';
import { AccessTokenKind } from '@thxnetwork/common/enums';

export default class TelegramDataProxy {
    static async validateUser(account: TAccount, quest: TQuestSocial): Promise<TValidationResult> {
        const token = account.tokens.find((t) => t.kind === AccessTokenKind.Telegram);
        if (!token) {
            return { result: false, reason: 'Please connect your Telegram account first.' };
        }

        return { result: true, reason: '' };
    }

    static async validateJoin(account: TAccount, channelId: string): Promise<TValidationResult> {
        try {
            const validationResult = await this.validateUser(account, { content: channelId } as TQuestSocial);
            if (!validationResult.result) return validationResult;

            // TODO: Implement actual Telegram channel join validation
            // This would typically involve checking if the user is a member of the specified channel
            // using the Telegram Bot API

            return { result: true, reason: '' };
        } catch (error) {
            logger.error(error);
            return { result: false, reason: 'We were unable to verify your Telegram channel membership.' };
        }
    }

    static async validateMessage(account: TAccount, channelId: string): Promise<TValidationResult> {
        try {
            const validationResult = await this.validateUser(account, { content: channelId } as TQuestSocial);
            if (!validationResult.result) return validationResult;

            // TODO: Implement actual Telegram message validation
            // This would typically involve checking if the user has sent a message in the specified channel
            // using the Telegram Bot API

            return { result: true, reason: '' };
        } catch (error) {
            logger.error(error);
            return { result: false, reason: 'We were unable to verify your Telegram message.' };
        }
    }
}
