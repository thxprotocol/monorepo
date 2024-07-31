import { Request } from 'express';

export const bodyParserOptions = {
    verify(req: Request, res, buf, encoding: BufferEncoding) {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    },
};
