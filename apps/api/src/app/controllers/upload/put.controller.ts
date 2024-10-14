import ImageService from '@thxnetwork/api/services/ImageService';
import { Request, Response } from 'express';

const controller = async (req: Request, res: Response) => {
    if (!req.file) return res.status(440).send('There no file to process');
    const publicUrl = await ImageService.upload(req.file);
    res.send({ publicUrl });
};

export { controller };
