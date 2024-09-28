import { API_URL, WALLET_URL } from '@thxnetwork/api/config/secrets';
import { Widget } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId(), param('ext').isString().isIn(['js'])];

const controller = async (req: Request, res: Response) => {
    const profile = await Widget.findById(req.params.id);
    if (!profile) throw new NotFoundError('Profile not found.');
    if (!profile.isPublished) return res.end();

    const walletURL = WALLET_URL;
    const iframeSrc = `${WALLET_URL}/${req.params.id}`;
    const cssUrl = `${API_URL}/v1/wallet/css/${req.params.id}.css`;
    const icon = profile.iconImg || '';
    const message = profile.message || '';

    const body = `
        (function() {
            const MESSAGE = '${message}';
            const WALLET_URL = '${walletURL}';
            const ICON_IMG = '${icon}';
            const CSS_URL = '${cssUrl}';
            const iframeSrc = new URL('${iframeSrc}');
            
            function onMessage(event) {
                if (event.origin !== WALLET_URL) return;
                const { message, url } = event.data;
                switch (message) {
                    case 'tws.iframe.login':
                        window.open(url, '_blank');
                        break;
                    case 'tws.iframe.toggle':
                        const iframe = document.getElementById('wallet-widget-iframe');
                        toggle(iframe)
                        break;
                }
            }

            function toggle(iframe) {
                const isMobile = window.innerWidth < 1024;
                if (isMobile) {
                    window.open(iframeSrc, '_blank');
                } else {
                    const {opacity, transform} = iframe.style;
                    iframe.style.opacity = opacity === '1' ? '0' : '1'; 
                    iframe.style.transform = transform === 'scale(1)' ? 'scale(0)' : 'scale(1)';
                }
            }
    
            // Link the stylesheet
            const stylesheet = document.createElement('link');
            stylesheet.rel = 'stylesheet';
            stylesheet.href = CSS_URL; 
            stylesheet.type = 'text/css';
            stylesheet.media = 'all';
            document.head.appendChild(stylesheet);

            // Check if there is a forced app path 
            const parentUrl = new URL(window.location.href)
            const path = parentUrl.searchParams.get('thx_widget_path');

            if (path) {
                iframeSrc.pathname += \`/c/\${path}\`;
            }

            // Add the HTML template
            const template = document.createElement('div');
            template.id = 'wallet-widget-container';
            template.innerHTML = \`
                <div id="wallet-widget-message">\${MESSAGE}</div>
                <div id="wallet-widget-launcher">
                    <svg id="wallet-widget-svg-icon" fill="white" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M461.2 128H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h384c8.8 0 16-7.2 16-16 0-26.5-21.5-48-48-48H64C28.7 32 0 60.7 0 96v320c0 35.4 28.7 64 64 64h397.2c28 0 50.8-21.5 50.8-48V176c0-26.5-22.8-48-50.8-48zM416 336c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/></svg>
                </div>
                <iframe id="wallet-widget-iframe" src="\${iframeSrc.toString()}"></iframe>
            \`;
            document.body.appendChild(template)
             
            // Execute when DOM is ready
            document.addEventListener('DOMContentLoaded', () => {
                const container = document.getElementById('wallet-widget-container');
                const message = document.getElementById('wallet-widget-message');
                const launcher = document.getElementById('wallet-widget-launcher');
                const iframe = document.getElementById('wallet-widget-iframe');
                
                // Add listener for message from iframe
                window.onmessage = onMessage;    

                // Set message content or remove if none
                message.innerHTML = MESSAGE;
                if (!MESSAGE) message.remove();

                // Replace icon for img
                if (ICON_IMG) {
                    const icon = document.createElement('img');
                    icon.src = ICON_IMG;
                    launcher.innerHTML = '';
                    launcher.appendChild(icon);
                }

                // Add click event to launcher
                launcher.addEventListener('click', () => {
                    message.remove();
                    toggle(iframe);
                });

                // Add click event to launcher
                message.addEventListener('click', () => {
                    message.remove();
                })
            });
        })();
    `;

    res.set('Content-Type', 'application/javascript');
    res.send(body);
};

export default { controller, validation };
