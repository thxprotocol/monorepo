import { Request, Response } from 'express';
import { body } from 'express-validator';
import { Widget } from '@thxnetwork/api/models';
import { ForbiddenError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    body('isPublished').optional().isBoolean(),
    body('iconImg').optional().isString(),
    body('align').optional().isString(),
    body('theme').optional().isString(),
    body('cssSelector').optional().isString(),
    body('domain').optional().isURL({ require_tld: false }),
    body('message').optional().isString().isLength({ max: 280 }).trim().escape(),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const update: Omit<TWidget, '_id' | 'sub' | 'cssSelector' | 'uuid' | 'poolId' | 'active'> = {
        name: req.body.name,
        description: req.body.description,
        slug: req.body.slug,
        domain: req.body.domain,
        isPublished: req.body.isPublished,
        logoImgURL: req.body.logoImgURL,
        backgroundImgURL: req.body.backgroundImgURL,
        iconImg: req.body.iconImg,
        color: req.body.color,
        bgColor: req.body.bgColor,
        align: req.body.align,
        theme: req.body.theme,
        //
        message: req.body.message,
    };

    if (poolId) {
        const isSubjectAllowed = await PoolService.isSubjectAllowed(req.auth.sub, poolId);
        if (!isSubjectAllowed) throw new SubjectUnauthorizedError();

        const widget = await Widget.findOneAndUpdate({ uuid: req.params.uuid }, update, { new: true });
        res.json(widget);
    } else {
        const widget = await Widget.findByIdAndUpdate(req.params.uuid, update, { new: true });
        if (widget.sub !== req.auth.sub) throw new ForbiddenError();

        res.json(widget);
    }
};

export { controller, validation };
