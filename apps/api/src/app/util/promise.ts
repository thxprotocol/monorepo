import { logger } from './logger';

export class PromiseParser {
    static async parse(callback) {
        const results = await Promise.allSettled(callback);
        return results.reduce((acc, result) => {
            if (result.status === 'fulfilled') {
                acc.push(result.value);
            } else {
                logger.error('Token decoration failed:', result.reason);
            }
            return acc;
        }, []);
    }
}
