import { ChainId } from '@thxnetwork/common/enums';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { NoDataAtAddressError } from '@thxnetwork/api/util/errors';

export async function getCodeForAddressOnNetwork(address: string, chainId: ChainId) {
    const { web3 } = NetworkService.getProvider(chainId);
    const code = await web3.eth.getCode(address);

    if (code === '0x') {
        throw new NoDataAtAddressError(address);
    }
}
