import { API_URL, IPFS_BASE_URL, VERSION } from '@thxnetwork/api/config/secrets';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import ImageService from '@thxnetwork/api/services/ImageService';
import { AccountPlanType, NFTVariant } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { body, check, query } from 'express-validator';

const validation = [
    body('name').exists().isString(),
    body('symbol').exists().isString(),
    body('description').exists().isString(),
    body('chainId').exists().isNumeric(),
    check('file')
        .optional()
        .custom((value, { req }) => {
            return ['jpg', 'jpeg', 'gif', 'png'].includes(req.file.mimetype);
        }),
    query('forceSync').optional().isBoolean(),
];

const controller = async (req: Request, res: Response) => {
    const logoImgUrl = req.file && (await ImageService.upload(req.file));
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : false;
    const account = await AccountProxy.findById(req.auth.sub);
    const baseURL = account.plan === AccountPlanType.Premium ? IPFS_BASE_URL : `${API_URL}/${VERSION}/metadata/`;
    const erc721 = await ERC721Service.deploy(
        {
            variant: NFTVariant.ERC721,
            sub: req.auth.sub,
            chainId: req.body.chainId,
            name: req.body.name,
            symbol: req.body.symbol,
            description: req.body.description,
            baseURL,
            logoImgUrl,
        },
        forceSync,
    );
    const { wallets, minters } = await ERC721Service.getMinters(erc721, req.auth.sub);

    res.status(201).json({ ...erc721.toJSON(), wallets, minters });
};

export { controller, validation };
