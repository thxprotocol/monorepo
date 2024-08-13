import { logger } from './logger';

export class PromiseParser {
    static async parse(promises: Promise<any>[]) {
        const results = await Promise.allSettled(promises);
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
