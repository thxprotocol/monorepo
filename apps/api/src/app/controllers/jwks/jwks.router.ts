import express from 'express';
import ListJWKS from './list.controller';

export const router: express.Router = express.Router();

router.get('/', ListJWKS.controller);

export default router;
