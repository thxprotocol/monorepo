import { AUTH_URL } from '@thxnetwork/api/config/secrets';
import { Brand, Pool, QRCodeEntry, RewardNFT, Widget } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    let widget = await Widget.findOne({ poolId: req.params.id });
    if (!widget) widget = await Widget.findById(req.params.id);
    if (!widget) throw new NotFoundError('Widget not found');

    const pool = await Pool.findById(req.params.id);
    if (!pool) return res.json(widget);

    const brand = await Brand.findOne({ poolId: req.params.id });
    const nftRewards = await RewardNFT.find({ poolId: req.params.id }).distinct('_id');
    const qrCodeEntries = await QRCodeEntry.find({ rewardId: { $in: nftRewards } });

    res.json({
        isQRCodeCampaign: !!qrCodeEntries.length,
        title: pool.settings.title,
        description: pool.settings.description,
        leaderboardInWeeks: pool.settings.leaderboardInWeeks,
        logoUrl: brand ? brand.logoImgUrl : AUTH_URL + '/img/logo-padding.png',
        backgroundUrl: brand ? brand.backgroundImgUrl : '',
        theme: widget.theme,
        domain: widget.domain,
        chainId: pool.chainId,
        poolId: pool.id,
        slug: pool.settings.slug || pool.id,
    });
};

export { controller, validation };
