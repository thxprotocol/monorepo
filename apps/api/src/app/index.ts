import { MONGODB_URI, NODE_ENV, PORT, VERSION } from '@thxnetwork/api/config/secrets';
import { router } from '@thxnetwork/api/controllers/index';
import { corsHandler, errorLogger, errorNormalizer, errorOutput, notFoundHandler } from '@thxnetwork/api/middlewares';
import db from '@thxnetwork/api/util/database';
import axios from 'axios';
import axiosBetterStacktrace from 'axios-better-stacktrace';
import compression from 'compression';
import express, { Express } from 'express';
import 'express-async-errors';
import lusca from 'lusca';
import morganBody from 'morgan-body';
import RouterJWKS from './controllers/jwks/jwks.router';
import morgan from './middlewares/morgan';
import { assetsPath, bodyParserOptions } from './util';

axiosBetterStacktrace(axios);

const app: Express = express();

db.connect(MONGODB_URI);

app.set('trust proxy', true);
app.set('port', PORT);
app.use(corsHandler);
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(express.static(assetsPath));
app.use(express.json(bodyParserOptions));
app.use(morgan);

morganBody(app, {
    logRequestBody: NODE_ENV === 'development',
    logResponseBody: false,
    skip: () => ['test', 'production'].includes(NODE_ENV),
});

app.use(express.urlencoded({ extended: true }));
app.use('/jwks', RouterJWKS);
app.use(`/${VERSION}`, router);
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorNormalizer);
app.use(errorOutput);
app.use(compression);

export default app;
