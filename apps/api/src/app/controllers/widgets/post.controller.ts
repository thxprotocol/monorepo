import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/models';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/common/constants';

const controller = async (req: Request, res: Response) => {
    const widgets = await Widget.find({ sub: req.auth.sub });
    if (widgets.length > 5) throw new Error("You can't have more than 5 widgets.");

    const widget = await Widget.create({
        sub: req.auth.sub,
        align: 'right',
        message: 'Hi there!👋 Click me to see your collectibles...',
        theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
    });

    res.json(widget);
};

export { controller };
