import { Widget } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId(), param('ext').isString().isIn(['css'])];

const controller = async (req: Request, res: Response) => {
    const profile = await Widget.findById(req.params.id);
    if (!profile) throw new NotFoundError('Profile not found.');

    const {
        elements: { launcherBg, launcherIcon },
    } = JSON.parse(profile.theme);
    const bgColor = launcherBg.color || '';
    const color = launcherIcon.color || '';

    const body = `
        #wallet-widget-container {
            position: fixed;
            bottom: 0;
            right: 0;
            z-index: 9999999;
        }

        #wallet-widget-message {
            display: block;
            background-color: #FFFFFF;
            color: #000000;
            position: fixed;
            bottom: 90px;
            right: 1rem;
            max-width: 220px;
            border-radius: 5px;
            border: 0;
            font-size: 11px;
            padding: 10px;
        }
            
        #wallet-widget-message:before {
            content: '\u00D7';
            position: absolute;
            top: 0;
            right: 0;
            width: 15px;
            height: 15px;
            border-radius: 50%;
            color: gray;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        #wallet-widget-launcher {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: ${bgColor};
            color: ${color};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #wallet-widget-launcher svg {
            width: 20px;
            height: 20px;
        }

        #wallet-widget-launcher img {
            width: 30px;
            height: 30px;
        }

        #wallet-widget-iframe {
            position: fixed;
            bottom: 90px;
            right: 1rem;
            z-index: 9999999;
            width: 320px;
            height: 520px;
            border: 0;
            border-radius: 5px;
            box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px;
            backgroundColor: white;
            transform: scale(0);
            transform-origin = bottom right;
            transition .2s opacity ease, .1s transform ease;
        }
    `;

    res.set('Content-Type', 'text/css');
    res.send(body);
};

export default { controller, validation };
