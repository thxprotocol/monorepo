import { ERC721, ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata, ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Token, ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import { assertEvent, ExpectedEventNotFound, findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { ERC721TokenState, TransactionState, WalletVariant } from '@thxnetwork/common/enums';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { TransactionReceipt } from 'web3-core';
import { toChecksumAddress } from 'web3-utils';
import { ADDRESS_ZERO } from '../config/secrets';
import { getArtifact } from '../hardhat';
import { QRCodeEntry } from '../models';
import { RewardNFT } from '../models/RewardNFT';
import { Wallet, WalletDocument } from '../models/Wallet';
import IPFSService from './IPFSService';
import PoolService from './PoolService';
import SafeService from './SafeService';
import TransactionService from './TransactionService';
import WalletService from './WalletService';

const contractName = 'THXERC721';

async function deploy(data: Partial<TERC721>, forceSync = true): Promise<ERC721Document> {
    const { web3, defaultAccount } = NetworkService.getProvider(data.chainId);
    const { abi, bytecode } = getArtifact(contractName);
    const contract = new web3.eth.Contract(abi);
    const erc721 = await ERC721.create(data);
    const fn = contract.deploy({
        data: bytecode,
        arguments: [erc721.name, erc721.symbol, erc721.baseURL, defaultAccount],
    });
    const txId = await TransactionService.sendAsync(null, fn, erc721.chainId, forceSync, {
        type: 'Erc721DeployCallback',
        args: { erc721Id: String(erc721._id) },
    });

    return await ERC721.findByIdAndUpdate(erc721._id, { transactions: [txId] }, { new: true });
}

async function deployCallback({ erc721Id }: TERC721DeployCallbackArgs, receipt: TransactionReceipt) {
    const { abi } = getArtifact(contractName);
    const events = parseLogs(abi, receipt.logs);

    if (!findEvent('OwnershipTransferred', events) && !findEvent('Transfer', events)) {
        throw new ExpectedEventNotFound('Transfer or OwnershipTransferred');
    }

    const erc721 = await ERC721.findById(erc721Id);
    await erc721.updateOne({ address: toChecksumAddress(receipt.contractAddress) });

    // Deploy a wallet and make it a minter if none exists for this account and chain
    const wallets = await Wallet.find({
        sub: erc721.sub,
        chainId: erc721.chainId,
        variant: WalletVariant.Safe,
        owners: { $size: 1 },
    });
    if (!wallets.length) {
        const { defaultAccount } = NetworkService.getProvider(erc721.chainId);
        const safe = await SafeService.create({
            sub: erc721.sub,
            chainId: erc721.chainId,
            safeVersion: '1.3.0',
            owners: [toChecksumAddress(defaultAccount)],
        });
        await addMinter(erc721, safe.address);
    }
}

export async function queryDeployTransaction(erc721: ERC721Document): Promise<ERC721Document> {
    if (!erc721.address && erc721.transactions[0]) {
        const tx = await Transaction.findById(erc721.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc721 = await findById(erc721._id);
        }
    }

    return erc721;
}

export async function findById(id: string): Promise<ERC721Document> {
    const erc721 = await ERC721.findById(id);
    if (!erc721) return;
    erc721.logoImgUrl = erc721.logoImgUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${erc721.address}`;
    return erc721;
}

export async function findBySub(sub: string): Promise<ERC721Document[]> {
    const pools = await PoolService.getAllBySub(sub);
    const nftRewards = await RewardNFT.find({ poolId: pools.map((p) => String(p._id)) });
    const erc721Ids = nftRewards.map((c) => c.erc721Id);
    const erc721s = await ERC721.find({ sub });

    return erc721s.concat(await ERC721.find({ _id: erc721Ids }));
}

export async function deleteMetadata(id: string) {
    // Delete QR codes for this bit of metadata
    await QRCodeEntry.deleteMany({ erc721MetadataId: id });

    // Delete metadata
    await ERC721Metadata.findOneAndDelete({ _id: id });
}

export async function mint(
    safe: WalletDocument,
    erc721: ERC721Document,
    wallet: WalletDocument,
    metadata: ERC721MetadataDocument,
): Promise<TransactionDocument> {
    const tokenUri = await IPFSService.getTokenURI(erc721, metadata.id);
    console.log(tokenUri);
    return await TransactionService.sendSafeAsync(
        safe,
        erc721.address,
        erc721.contract.methods.mint(wallet.address, tokenUri),
        {
            type: 'erc721TokenMintCallback',
            args: {
                erc721MetadataId: metadata.id,
            },
        },
    );
}

export async function mintCallback(args: TERC721TokenMintCallbackArgs, receipt: TransactionReceipt) {
    const metadata = await ERC721Metadata.findById(args.erc721MetadataId);
    const erc721 = await ERC721.findById(metadata.erc721Id);
    const tokenUri = await IPFSService.getTokenURI(erc721, metadata.id);

    const logs = parseLogs(erc721.contract.options.jsonInterface, receipt.logs);
    //  Get all the ERC721 mint events Transfer(from: 0x00, to: wallet address, tokenId: exists)
    const events = logs.filter(
        (ev: any) => ev && ev.name === 'Transfer' && ev.args.from === ADDRESS_ZERO && ev.args.tokenId,
    );

    // Add a token document with token ID for every wallet found in the db thats equal
    // to the mint event to param
    for (const event of events) {
        const tokenExists = await ERC721Token.exists({
            recipient: event.args.to,
            tokenId: Number(event.args.tokenId),
            erc721Id: erc721.id,
        });
        if (tokenExists) continue;

        // Add tokent to account wallets
        for (const wallet of await Wallet.find({ address: event.args.to })) {
            await ERC721Token.create({
                sub: wallet.sub,
                walletId: wallet.id,
                chainId: erc721.chainId,
                erc721Id: erc721.id,
                metadataId: metadata.id,
                tokenUri: erc721.baseURL + tokenUri,
                recipient: event.args.to,
                tokenId: Number(event.args.tokenId),
            });
        }
    }
}

export async function queryMintTransaction(erc721Token: ERC721TokenDocument): Promise<ERC721TokenDocument> {
    if (erc721Token.state === ERC721TokenState.Pending && erc721Token.transactions[0]) {
        const tx = await Transaction.findById(erc721Token.transactions[0]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc721Token = await ERC721Token.findById(erc721Token._id);
        }
    }

    return erc721Token;
}

export function parseAttributes(entry: ERC721MetadataDocument) {
    return {
        name: entry.name,
        description: entry.description,
        image: entry.image,
        external_url: entry.externalUrl,
    };
}

async function isMinter(erc721: ERC721Document, address: string) {
    return await erc721.contract.methods.hasRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address).call();
}

async function addMinter(erc721: ERC721Document, address: string) {
    const receipt = await TransactionService.send(
        erc721.address,
        erc721.contract.methods.grantRole(keccak256(toUtf8Bytes('MINTER_ROLE')), address),
        erc721.chainId,
    );

    assertEvent('RoleGranted', parseLogs(erc721.contract.options.jsonInterface, receipt.logs));
}

async function findTokensByRecipient(recipient: string, erc721Id: string): Promise<TERC721Token[]> {
    const result = [];
    for await (const token of ERC721Token.find({ recipient, erc721Id })) {
        const metadata = await ERC721Metadata.findById(token.metadataId);
        result.push({ ...(token.toJSON() as TERC721Token), metadata });
    }
    return result;
}

async function findMetadataByToken(token: TERC721Token) {
    return ERC721Metadata.findById(token.metadataId);
}

async function findTokenById(id: string) {
    return await ERC721Token.findById(id);
}

async function findMetadataById(id: string) {
    return await ERC721Metadata.findById(id);
}

async function findMetadataByNFT(erc721Id: string, page = 1, limit = 10) {
    const paginatedResult = await paginatedResults(ERC721Metadata, page, limit, { erc721Id });
    const results: TERC721Metadata[] = [];
    for (const metadata of paginatedResult.results) {
        const tokens = await ERC721Token.find({ erc721Id, metadataId: metadata._id });
        results.push({ ...metadata.toJSON(), tokens });
    }
    paginatedResult.results = results;
    return paginatedResult;
}

export const getOnChainERC721Token = async (chainId: number, address: string) => {
    const { web3 } = NetworkService.getProvider(chainId);
    const { abi } = getArtifact(contractName);
    const contract = new web3.eth.Contract(abi, address);
    const [name, symbol, totalSupply] = await Promise.all([
        contract.methods.name().call(),
        contract.methods.symbol().call(),
        contract.methods.totalSupply().call(),
    ]);

    return { name, symbol, totalSupply };
};

export async function transferFrom(
    erc721: ERC721Document,
    wallet: WalletDocument,
    to: string,
    erc721Token: ERC721TokenDocument,
): Promise<ERC721TokenDocument> {
    const toWallet = await WalletService.findOne({ address: to });
    const tx = await TransactionService.sendSafeAsync(
        wallet,
        erc721.address,
        erc721.contract.methods.transferFrom(wallet.address, to, erc721Token.tokenId),
        {
            type: 'erc721nTransferFromCallback',
            args: {
                erc721Id: erc721.id,
                erc721TokenId: erc721Token.id,
                walletId: toWallet && toWallet.id,
            },
        },
    );

    return await ERC721Token.findByIdAndUpdate(
        erc721Token.id,
        {
            transactions: [tx.id],
            state: ERC721TokenState.Transferring,
        },
        { new: true },
    );
}

export async function transferFromCallback(args: TERC721TransferFromCallBackArgs, receipt: TransactionReceipt) {
    const { erc721TokenId, walletId } = args;
    const erc721Token = await ERC721Token.findById(erc721TokenId);
    const erc721 = await ERC721.findById(erc721Token.erc721Id);
    const wallet = await Wallet.findById(walletId);

    const events = parseLogs(erc721.contract.options.jsonInterface, receipt.logs);
    const event = assertEvent('Transfer', events);

    await erc721Token.updateOne({
        state: ERC721TokenState.Transferred,
        tokenId: Number(event.args.tokenId),
        recipient: event.args.to,
        sub: wallet && wallet.sub,
        walletId: wallet && wallet.id,
    });
}

export async function queryTransferFromTransaction(erc721Token: ERC721TokenDocument): Promise<ERC721TokenDocument> {
    if (erc721Token.state === ERC721TokenState.Transferring) {
        const tx = await Transaction.findById(erc721Token.transactions[erc721Token.transactions.length - 1]);
        const txResult = await TransactionService.queryTransactionStatusReceipt(tx);
        if (txResult === TransactionState.Mined) {
            erc721Token = await ERC721Token.findById(erc721Token._id);
        }
    }

    return erc721Token;
}

export default {
    deploy,
    deployCallback,
    findById,
    deleteMetadata,
    mint,
    mintCallback,
    queryMintTransaction,
    findBySub,
    findMetadataByNFT,
    findTokensByRecipient,
    addMinter,
    isMinter,
    parseAttributes,
    queryDeployTransaction,
    getOnChainERC721Token,
    transferFrom,
    transferFromCallback,
    queryTransferFromTransaction,
    findMetadataById,
    findTokenById,
    findMetadataByToken,
};
