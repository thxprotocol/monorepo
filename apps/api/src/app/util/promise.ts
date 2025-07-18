import { logger } from './logger';

export class PromiseParser {
    static async parse(promises: Promise<any>[]) {
        const results = await Promise.allSettled(promises);
        return results.reduce((acc, result) => {
            if (result.status === 'fulfilled') {
                acc.push(result.value);
            } else {
                // Log error but don't let it crash the application
                logger.error('Promise failed:', result.reason);
                // Return a default value instead of failing completely
                acc.push(null);
            }
            return acc;
        }, []).filter(item => item !== null); // Remove null results
    }
}
