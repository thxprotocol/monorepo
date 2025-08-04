import { AptosClient, HexString } from 'aptos';
import { APTOS_NODE_URL } from '../config/secrets';
import axios from 'axios';

class AptosService {
    private static client: AptosClient;
    private static requestQueue: Array<() => Promise<any>> = [];
    private static isProcessing = false;
    private static lastRequestTime = 0;
    private static readonly MIN_REQUEST_INTERVAL = 100; // 100ms between requests

    private static cache = new Map<string, { data: any; timestamp: number }>();
    private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    private static getClient() {
        if (!this.client) {
            this.client = new AptosClient(APTOS_NODE_URL);
        }
        return this.client;
    }

    private static async processQueue() {
        if (this.isProcessing || this.requestQueue.length === 0) return;

        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            if (request) {
                try {
                    // Ensure minimum interval between requests
                    const now = Date.now();
                    const timeSinceLastRequest = now - this.lastRequestTime;
                    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
                        await new Promise(resolve =>
                            setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
                        );
                    }

                    await request();
                    this.lastRequestTime = Date.now();
                } catch (error) {
                    console.error('AptosService queue request failed:', error);
                }
            }
        }

        this.isProcessing = false;
    }

    private static async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push(async () => {
                try {
                    const result = await requestFn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }

    private static getCacheKey(method: string, ...args: string[]) {
        return `${method}:${args.join(':')}`;
    }

    private static getFromCache(key: string) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.data;
        }
        return null;
    }

    private static setCache(key: string, data: any) {
        this.cache.set(key, { data, timestamp: Date.now() });

        // Clean up old cache entries
        if (this.cache.size > 1000) {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > this.CACHE_TTL) {
                    this.cache.delete(key);
                }
            }
        }
    }

    async getCoinInfo(contractAddress: string) {
        const cacheKey = AptosService.getCacheKey('getCoinInfo', contractAddress);
        const cached = AptosService.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        return AptosService.queueRequest(async () => {
            const client = AptosService.getClient();

            try {
                const coinInfo = await client.getAccountResource(
                    new HexString(contractAddress.split('::')[0]),
                    `0x1::coin::CoinInfo<${contractAddress}>`,
                );
                const result = [coinInfo.data['name'], coinInfo.data['symbol'], coinInfo.data['decimals']];
                AptosService.setCache(cacheKey, result);
                return result;
            } catch (error) {
                console.error('Failed to fetch coin info:', error);
                return ['', '', 0];
            }
        });
    }

    async getCoinBalance(accountAddress: string, contractAddress: string) {
        const cacheKey = AptosService.getCacheKey('getCoinBalance', accountAddress, contractAddress);
        const cached = AptosService.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        return AptosService.queueRequest(async () => {
            const url = `${APTOS_NODE_URL}/v1/accounts/${accountAddress}/balance/${contractAddress}`;
            const response = await axios.get(url);

            const data = response.data;
            AptosService.setCache(cacheKey, data || "0");
            return data || '0';
        });
    }
}

export default new AptosService();
