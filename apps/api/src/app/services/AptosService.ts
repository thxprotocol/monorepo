import { AptosClient, HexString } from 'aptos';
import { APTOS_NODE_URL } from '../config/secrets';

class AptosService {
    async getCoinInfo(contractAddress: string) {
        const client = new AptosClient(APTOS_NODE_URL);

        try {
            const coinInfo = await client.getAccountResource(
                new HexString(contractAddress.split('::')[0]),
                `0x1::coin::CoinInfo<${contractAddress}>`,
            );
            return [coinInfo.data['name'], coinInfo.data['symbol'], coinInfo.data['decimals']];
        } catch (error) {
            console.error('Failed to fetch coin info:', error);
            return ['', ''];
        }
    }

    async getCoinBalance(accountAddress: string, contractAddress: string) {
        const client = new AptosClient(APTOS_NODE_URL);

        try {
            const coinInfo = await client.getAccountResource(
                accountAddress,
                `0x1::coin::CoinStore<${contractAddress}>`,
            );
            return coinInfo.data['coin']['value'];
        } catch (error) {
            return '0';
        }
    }
}

export default new AptosService();
