import { IOAuthService, serviceMap } from '@thxnetwork/api/services/interfaces/IOAuthService';
import TokenService from '@thxnetwork/api/services/TokenService';
import { NotFoundError, BadRequestError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';

const validation = [];

const baseHTML = (content: string, script?: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Santa Rewards Auth</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        body {
            background: #f8f9fa;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .container {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 16px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }

        .santa-header {
            color: #e74c3c;
            font-size: 1.5rem;
            margin-bottom: 1.5rem;
            font-weight: 600;
        }

        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #f0f0f0;
            border-top-color: #e74c3c;
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .status-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #e74c3c;
        }

        h1 {
            font-size: 1.25rem;
            color: #333;
            margin-bottom: 0.5rem;
        }

        p {
            color: #666;
            line-height: 1.5;
            margin-bottom: 1.5rem;
        }

        button {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }

        button:hover {
            background: #c0392b;
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
    </div>
    ${script ? `<script>${script}</script>` : ''}
</body>
</html>
`;

async function controller(req: Request, res: Response) {
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('Pragma', 'no-cache');

    if (req.query.error) {
        return res.send(
            baseHTML(
                `
            <div class="status-icon">❌</div>
        <h1>Connection Failed</h1>
        <p>Error: Authorization denied</p>
        <button onclick="window.close()">Try Again</button>
        `,
                `
            window.onload = function() {
                if (window.opener) {
                    window.opener.postMessage({ 
                        type: 'oauth-error',
                        error: '${req.query.error}'
                    }, '*');
                    setTimeout(window.close, 300);
                }
            };
        `,
            ),
        );
    }

    const service = serviceMap[req.params.kind] as IOAuthService;
    if (!service) throw new NotFoundError('Service not found');
    if (!req.query.code) throw new BadRequestError('Missing authorization code');

    try {
        const tokenInfo = await service.requestToken(req.query.code as string);
        const state = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString());
        await TokenService.set({ ...tokenInfo, sub: state.uid });

        res.send(
            baseHTML(
                `
            <div class="spinner"></div>
        <p>Checking Santa's list... 🎄</p>
        `,
                `
            function handleAuth() {
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'oauth-success',
                        payload: ${JSON.stringify(tokenInfo)}
                    }, '*');
                    window.opener.focus();
                    window.close();
                }

                setTimeout(() => {
                    if (!window.closed) {
                        document.body.innerHTML = \`
                            <div class="container">
                                <div class="icon">✅</div>
                                <h1>Authorization Successful!</h1>
                                <p>You can safely close this window.</p>
                                <button onclick="window.close()">Close Window</button>
                            </div>
                        \`;
                    }
                }, 1000);
            }
            window.onload = handleAuth;
        `,
            ),
        );
    } catch (error) {
        res.send(
            baseHTML(
                `
            <div class="container">
                <div class="icon error">⚠️</div>
                <h1>Connection Error</h1>
                <p>${error.message}</p>
                <button onclick="window.close()">Close Window</button>
            </div>
        `,
                `
            if (window.opener) {
                window.opener.postMessage({
                    type: 'oauth-error',
                    error: '${error.message}'
                }, '*');
            }
        `,
            ),
        );
    }
}

export default { validation, controller };
