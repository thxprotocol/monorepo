import { IOAuthService, serviceMap } from '@thxnetwork/api/services/interfaces/IOAuthService';
import TokenService from '@thxnetwork/api/services/TokenService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';

const validation = [];

async function controller(req: Request, res: Response) {
    const service = serviceMap[req.params.kind] as IOAuthService;
    if (!service) throw new NotFoundError(`Service not found for ${req.params.kind}`);

    const tokenInfo = await service.requestToken(req.query.code as string);
    const state = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString());
    const sub = state.uid;

    await TokenService.set({ ...tokenInfo, sub });

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Login Redirect | THX Network </title>
        </head>
        <body style="background-color: #777">
            <script>
                alert('Success!');
                // window.close()
            </script>
        </body>
        </html>
    `);
}

export default { validation, controller };
