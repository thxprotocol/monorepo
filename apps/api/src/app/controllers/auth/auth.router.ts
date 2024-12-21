import express from 'express';

import * as PostAuth from './get.controller';

const router: express.Router = express.Router();
router.post('/', PostAuth.controller);

export default router;
