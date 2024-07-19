import { toChecksumAddress } from 'web3-utils';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { ChainId, ERC20Type, TransactionState } from '@thxnetwork/common/enums';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { TransactionReceipt } from 'web3-core';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { contractNetworks, getArtifact } from '@thxnetwork/api/hardhat';
import {
    ERC20,
    ERC20Document,
    ERC20Token,
    ERC20TokenDocument,
    ERC20Transfer,
    PoolDocument,
    RewardCoin,
    Transaction,
    Wallet,
    WalletDocument,
} from '@thxnetwork/api/models';
import TransactionService from './TransactionService';
import PoolService from './PoolService';
import { fromWei } from 'web3-utils';

async function decorate(token: ERC20TokenDocument, wallet: WalletDocument) {
    const erc20 = await getById(token.erc20Id);
    if (!erc20) {
        throw new Error(`ERC20 not found for ${token.erc20Id}`);
    }

    if (erc20.chainId !== wallet.chainId) {
        throw new Error(`ERC20 chain ${erc20.chainId} not equal walllet chain ${wallet.chainId}`);
    }

    const walletBalanceInWei = await erc20.contract.methods.balanceOf(wallet.address).call();
    const walletBalance = fromWei(walletBalanceInWei, 'ether');

    return Object.assign(token.toJSON() as TERC20Token, {
        walletBalance,
        erc20,
    });
}

function getDeployArgs(erc20: ERC20Document, totalSupply?: string) {
    const { defaultAccount } = NetworkService.getProvider(erc20.chainId);

    switch (erc20.type) {
        case ERC20Type.Limited: {
            return [erc20.name, erc20.symbol, defaultAccount, totalSupply];
        }
        case ERC20Type.Unlimited: {
            return [erc20.name, erc20.symbol, defaultAccount];
        }
    }
}

export async function findBySub(sub: string) {
    const pools = await PoolService.getAllBySub(sub);
    const coinRewards = await RewardCoin.find({ poolId: pools.map((p) => String(p._id)) });
    const erc20Ids = coinRewards.map((c) => c.erc20Id);
    const erc20s = await ERC20.find({ sub });

    return erc20s.concat(await ERC20.find({ _id: erc20Ids }));
}

export const deploy = async (params: Partial<TERC20>, forceSync = true) => {
    const erc20 = await ERC20.create({
        name: params.name,
        symbol: params.symbol,
        chainId: params.chainId,
        type: params.type,
        sub: params.sub,
        logoImgUrl: params.logoImgUrl,
    });
    const { web3 } = NetworkService.getProvider(erc20.chainId);
    const { abi, bytecode } = getArtifact(erc20.contractName);
    const contract = new web3.eth.Contract(abi);
    const fn = contract.deploy({
        data: bytecode,
        arguments: getDeployArgs(erc20, String(params.totalSupply)),
    });

    const txId = await TransactionService.sendAsync(null, fn, erc20.chainId, forceSync, {
        type: 'Erc20DeployCallback',
        args: { erc20Id: String(erc20._id) },
    });

    return ERC20.findByIdAndUpdate(erc20._id, { transactions: [txId] }, { new: true });
};

export async function deployCallback({ erc20Id }: TERC20DeployCallbackArgs, receipt: TransactionReceipt) {
    const erc20 = await ERC20.findById(erc20Id);
    const { abi } = getArtifact(erc20.contractName);
    const events = parseLogs(abi, receipt.logs);

    // Limited and unlimited tokes emit different events. Check if one of the two is emitted.
    if (!findEvent('OwnershipTransferred', events) && !findEvent('Transfer', events)) {
        throw new ExpectedEventNotFound('Transfer or OwnershipTransferred');
    }

    await ERC20.findByIdAndUpdate(erc20Id, {
        address: toChecksumAddress(receipt.contractAddress),
    });
}

export async function queryDeployTransaction(erc20: ERC20Document): Promise<ERC20Document> {
    if (!erc20.address && erc20.transactions[0]) {
        const tx = await Transaction.findById(erc20.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc20 = await getById(erc20._id);
        }
    }

    return erc20;
}

const initialize = async (pool: PoolDocument, erc20: ERC20Document) => {
    if (erc20 && erc20.type === ERC20Type.Unlimited) {
        await addMinter(erc20, pool.safeAddress);
    }
};

const addMinter = async (erc20: ERC20Document, address: string) => {
    const receipt = await TransactionService.send(
        erc20.address,
        erc20.contract.methods.grantRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address),
        erc20.chainId,
    );

    assertEvent('RoleGranted', parseLogs(erc20.contract.options.jsonInterface, receipt.logs));
};

const addToken = async (wallet: WalletDocument, erc20: ERC20Document) => {
    const query = { sub: wallet.sub, erc20Id: erc20.id };
    await ERC20Token.findOneAndUpdate(
        query,
        {
            ...query,
            walletId: wallet.id,
            chainId: erc20.chainId,
        },
        { upsert: true, new: true },
    );
};

export const getAll = (sub: string) => {
    return ERC20.find({ sub });
};

export const getTokensForSub = (sub: string) => {
    return ERC20Token.find({ sub });
};

export const getTokensForWallet = async (wallet: WalletDocument, chainId: ChainId) => {
    const tokens = await ERC20Token.find({ sub: wallet.sub, walletId: wallet.id });
    const result = await Promise.allSettled(tokens.map((token) => decorate(token, wallet)));
    const erc20Tokens = result.filter((r) => r.status === 'fulfilled').map((r: any) => r.value);

    // We add additional veTHX related tokens for Polygon and Hardhat
    const defaults = await findDefaultTokens(wallet, chainId);
    const defaultTokens = defaults.filter(({ walletBalance }) => walletBalance > 0);

    return [...erc20Tokens, ...defaultTokens];
};

export const getById = async (id: string) => {
    const erc20 = await ERC20.findById(id);
    if (!erc20) return;

    erc20.logoImgUrl = erc20.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc20.address}`;
    return erc20;
};

export const getTokenById = (id: string) => {
    return ERC20Token.findById(id);
};

export const findBy = (query: { address: string; chainId: ChainId; sub?: string }) => {
    return ERC20.findOne(query);
};

export const addTokenForWallet = async (erc20: ERC20Document, wallet: WalletDocument) => {
    const hasToken = await ERC20Token.exists({
        sub: wallet.sub,
        walletId: wallet.id,
        erc20Id: erc20.id,
    });

    if (!hasToken) {
        await createERC20Token(erc20, wallet);
    }
};

export const importToken = async (chainId: number, address: string, sub: string, logoImgUrl: string) => {
    const { web3 } = NetworkService.getProvider(chainId);
    const { abi } = getArtifact('THXERC20_LimitedSupply');
    const contract = new web3.eth.Contract(abi);
    const [name, symbol] = await Promise.all([contract.methods.name().call(), contract.methods.symbol().call()]);
    const erc20 = await ERC20.create({
        name,
        symbol,
        address: toChecksumAddress(address),
        chainId,
        type: ERC20Type.Unknown,
        sub,
        logoImgUrl,
    });

    const wallets = await Wallet.find({ sub });
    for (const wallet of wallets) {
        await addTokenForWallet(erc20, wallet);
    }

    return erc20;
};

export const update = (erc20: ERC20Document, updates: Partial<TERC20>) => {
    return ERC20.findByIdAndUpdate(erc20._id, updates, { new: true });
};

export const approve = async (erc20: ERC20Document, wallet: WalletDocument, amountInWei: string) => {
    return await TransactionService.sendSafeAsync(
        wallet,
        erc20.address,
        erc20.contract.methods.approve(wallet.address, amountInWei),
    );
};

export const transferFrom = async (erc20: ERC20Document, wallet: WalletDocument, to: string, amountInWei: string) => {
    const erc20Transfer = await ERC20Transfer.create({
        erc20Id: erc20.id,
        from: wallet.address,
        to,
        amount: amountInWei,
        chainId: wallet.chainId,
        sub: wallet.sub,
    });

    // Check if an erc20Token exists for a known receiving wallet and create one if not
    const receiver = await Wallet.findOne({ address: toChecksumAddress(to) });
    if (receiver) {
        await createERC20Token(erc20, receiver);
    }

    const tx = await TransactionService.sendSafeAsync(
        wallet,
        erc20.address,
        erc20.contract.methods.transfer(to, amountInWei),
        { type: 'transferFromCallBack', args: { erc20Id: erc20.id } },
    );

    await erc20Transfer.updateOne({ transactionId: tx.id });

    return tx;
};

export const transferFromCallBack = async (args: TERC20TransferFromCallBackArgs, receipt: TransactionReceipt) => {
    const erc20 = await ERC20.findById(args.erc20Id);
    const events = parseLogs(erc20.contract.options.jsonInterface, receipt.logs);

    assertEvent('ERC20ProxyTransferFrom', events);
};

async function isMinter(erc20: ERC20Document, address: string) {
    return await erc20.contract.methods.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address).call();
}

async function createERC20Token(erc20: ERC20Document, wallet: WalletDocument) {
    const query = {
        sub: wallet.sub,
        walletId: wallet.id,
        erc20Id: erc20.id,
    };
    await ERC20Token.findOneAndUpdate(
        query,
        {
            ...query,
            chainId: erc20.chainId,
        },
        { upsert: true },
    );
}

async function findDefaultTokens(wallet: WalletDocument, chainId: ChainId) {
    if (![ChainId.Polygon, ChainId.Hardhat].includes(chainId)) return [];

    const defaultContracts = [
        {
            type: ERC20Type.Unknown,
            name: '20USDC-80THX',
            symbol: '20USDC-80THX',
            decimals: 18,
            chainId,
            address: contractNetworks[chainId].BPT,
            logoImgUrl: 'https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png',
        },
        {
            type: ERC20Type.Unknown,
            name: '20USDC-80THX (staked)',
            symbol: '20USDC-80THX-gauge',
            decimals: 18,
            chainId,
            address: contractNetworks[chainId].BPTGauge,
            logoImgUrl: 'https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png',
        },
        {
            type: ERC20Type.Unknown,
            name: 'Voting Escrow 20USDC-80THX-gauge',
            symbol: 'veTHX',
            decimals: 18,
            chainId,
            address: contractNetworks[chainId].VotingEscrow,
            logoImgUrl: 'https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png',
        },
    ];

    const promise = await Promise.allSettled(
        defaultContracts.map(async (erc20) => {
            const { web3 } = NetworkService.getProvider(erc20.chainId);
            const contract = new web3.eth.Contract(getArtifact('THXERC20_LimitedSupply').abi, erc20.address);
            const walletBalanceInWei = await contract.methods.balanceOf(wallet.address).call();
            const walletBalance = Number(fromWei(walletBalanceInWei, 'ether'));
            return {
                sub: wallet.sub,
                erc20Id: '',
                walletId: wallet.id,
                walletBalance,
                erc20,
            };
        }),
    );

    return promise.filter((r) => r.status === 'fulfilled').map((r: any) => r.value);
}

export default {
    findDefaultTokens,
    decorate,
    findBySub,
    deployCallback,
    deploy,
    getAll,
    findBy,
    getById,
    addToken,
    addMinter,
    isMinter,
    importToken,
    getTokensForSub,
    getTokenById,
    update,
    initialize,
    queryDeployTransaction,
    transferFrom,
    transferFromCallBack,
    getTokensForWallet,
    approve,
};
