import {
    ERC1155MetadataDocument,
    ERC1155TokenDocument,
    ERC721MetadataDocument,
    ERC721TokenDocument,
    RewardNFT,
    RewardNFTDocument,
    RewardNFTPayment,
    WalletDocument,
} from '@thxnetwork/api/models';
import { NFTVariant, WalletVariant } from '@thxnetwork/common/enums';
import { IRewardService } from './interfaces/IRewardService';
import ERC721Service from './ERC721Service';
import ERC1155Service from './ERC1155Service';
import PoolService from './PoolService';
import SafeService from './SafeService';

export default class RewardNFTService implements IRewardService {
    models = {
        reward: RewardNFT,
        payment: RewardNFTPayment,
    };
    services = {
        [NFTVariant.ERC721]: ERC721Service,
        [NFTVariant.ERC1155]: ERC1155Service,
    };

    async decorate({ reward, account }: { reward: TRewardNFT; account?: TAccount }) {
        const nft = await this.findNFT(reward);
        const token = reward.tokenId && (await this.findTokenById(nft, reward.tokenId));
        const metadataId = token ? token.metadataId : reward.metadataId ? reward.metadataId : null;
        const metadata = metadataId ? await this.findMetadataById(nft, metadataId) : null;
        const expiry = reward.expiryDate && {
            date: reward.expiryDate,
            now: new Date(),
        };
        return { ...reward.toJSON(), chainId: nft.chainId, nft, metadata, token, expiry };
    }

    async decoratePayment(payment: TRewardPayment): Promise<TRewardPayment> {
        return payment.toJSON();
    }

    async getValidationResult({ reward, wallet }: { reward: TRewardNFT; wallet?: WalletDocument; account?: TAccount }) {
        const nft = await this.findNFT(reward);
        if (!nft) return { result: false, reason: 'NFT contract is no longer available' };

        const pool = await PoolService.getById(reward.poolId);
        const safe = await SafeService.findOneByPool(pool, nft.chainId);
        if (!safe) return { result: false, reason: 'Campaign Safe is no longer available for this network' };

        // This will require a transfer
        if (reward.tokenId) {
            // Check if Safe is the owner
            const { contract } = nft;
            const token = await this.findTokenById(nft, reward.tokenId);
            if (!token) return { result: false, reason: 'Token not found' };

            if (nft.variant === NFTVariant.ERC721) {
                const owner = await contract.methods.ownerOf(token.tokenId).call();
                if (owner.toLowerCase() !== safe.address.toLowerCase()) {
                    return { result: false, reason: 'Token is no longer owned by campaign Safe.' };
                }
            }
        }

        // This will require a mint
        if (reward.metadataId) {
            const isMinter = await this.services[nft.variant].isMinter(nft, safe.address);
            if (!isMinter) return { result: false, reason: 'Campaign Safe is not a minter of the NFT contract.' };
        }

        // Check if wallet exists
        if (!wallet) {
            return { result: false, reason: 'Your wallet is not found. Please try again.' };
        }

        // Check receiving wallet for chain compatibility
        if (wallet.variant === WalletVariant.Safe && wallet.chainId !== nft.chainId) {
            return { result: false, reason: 'Your wallet is not on the same chain as the NFT contract.' };
        }

        return { result: true, reason: '' };
    }

    async create(data: Partial<TRewardNFT>) {
        // If erc721Id or erc1155Id, check if campaign safe is minter
        if (data.metadataId) {
            const nft = await this.findNFT(data);
            const pool = await PoolService.getById(data.poolId);
            const safe = await SafeService.findOneByPool(pool, nft.chainId);
            if (!safe) throw new Error('No campaign wallet found for this network');

            await this.addMinter(data, safe.address);
        }

        return await this.models.reward.create(data);
    }

    update(reward: TRewardNFT, updates: Partial<TRewardNFT>) {
        return this.models.reward.findByIdAndUpdate(reward._id, updates, { new: true });
    }

    async remove(reward: RewardNFTDocument) {
        await this.models.reward.findOneAndDelete(reward._id);
    }

    async createPayment({ reward, wallet }: { reward: RewardNFTDocument; wallet?: WalletDocument }) {
        const nft = await this.findNFT(reward);
        if (!nft) throw new Error('NFT not found');

        const pool = await PoolService.getById(reward.poolId);
        const safe = await SafeService.findOneByPool(pool, nft.chainId);
        if (!safe) return { result: false, reason: 'Campaign Safe is no longer available for this network' };

        // Get token and metadata for either ERC721 or ERC1155 based contracts
        // and mint if metadataId is present or transfer if tokenId is present
        const erc1155Amount = reward.erc1155Amount && String(reward.erc1155Amount);
        let token: ERC721TokenDocument | ERC1155TokenDocument,
            metadata: ERC721MetadataDocument | ERC1155MetadataDocument;
        // Mint a token if metadataId is present
        if (reward.metadataId) {
            metadata = await this.findMetadataById(nft, reward.metadataId);
            // Mint the token to wallet address
            token = await this.services[nft.variant].mint(safe, nft, wallet, metadata, erc1155Amount);
        }

        // Transfer a token if tokenId is present
        if (reward.tokenId) {
            token = await this.findTokenById(nft, reward.tokenId);
            metadata = await this.findMetadataByToken(nft, token);

            // Transfer the token from safe to wallet address
            token = await this.services[nft.variant].transferFrom(nft, safe, wallet.address, token, erc1155Amount);
        }

        // Register the payment
        await RewardNFTPayment.create({
            rewardId: reward._id,
            sub: wallet.sub,
            walletId: wallet._id,
            poolId: reward.poolId,
            amount: reward.pointPrice,
        });
    }

    findById(id: string) {
        return this.models.reward.findById(id);
    }

    findMetadataByToken(nft: TERC721 | TERC1155, token: TERC721Token | TERC1155Token) {
        return this.services[nft.variant].findMetadataByToken(token);
    }

    findTokenById(nft: TERC721 | TERC1155, tokenId: string) {
        return this.services[nft.variant].findTokenById(tokenId);
    }

    findMetadataById(nft: TERC721 | TERC1155, metadataId: string) {
        return this.services[nft.variant].findMetadataById(metadataId);
    }

    findNFT({ erc721Id, erc1155Id }: { erc721Id?: string; erc1155Id?: string }) {
        if (erc721Id) {
            return ERC721Service.findById(erc721Id);
        }

        if (erc1155Id) {
            return ERC1155Service.findById(erc1155Id);
        }
    }

    private async addMinter({ erc721Id, erc1155Id }: { erc721Id?: string; erc1155Id?: string }, address: string) {
        const nft = await this.findNFT({ erc721Id, erc1155Id });
        const isMinter = await this.services[nft.variant].isMinter(nft, address);
        if (!isMinter) await this.services[nft.variant].addMinter(nft, address);
    }
}
