import { THXClient } from '@thxnetwork/sdk';
import { WIDGET_URL, CLIENT_ID, CLIENT_SECRET } from '../config/secrets';

const settings = JSON.parse(sessionStorage.getItem('thx:widget:settings') as string);
console.log(settings);
