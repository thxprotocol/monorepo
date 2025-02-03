import { ERC20, Wallet } from '@thxnetwork/api/models';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import SafeService from '@thxnetwork/api/services/SafeService';
import { ChainId } from '@thxnetwork/common/enums';
import { fromWei } from 'web3-utils';

const TO = '';

export default async function main() {
    const safe = await Wallet.findById('');
    if (!safe) throw new Error('Safe not found');
    console.log({ safe });

    const txs = [];
    for (const erc20 of await ERC20.find({
        _id: {
            $in: [],
        },
        chainId: ChainId.Linea,
    })) {
        const balance = await erc20.contract.methods.balanceOf(safe.address).call();
        txs.push(await ERC20Service.transferFrom(erc20, safe, TO, balance.toString()));

        console.log(`Transfering ${fromWei(balance, 'ether')} ${erc20.symbol} from ${safe.address}`);
    }

    await SafeService.proposeTransaction(safe, txs);
    console.log(txs);
}
