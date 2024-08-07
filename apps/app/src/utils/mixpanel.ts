import Mixpanel from '@thxnetwork/common/mixpanel';
import { MODE } from '../config/secrets';

export const track = (event: string, params: any[]) => {
    if (MODE === 'development') return;
    return Mixpanel.track(event, params);
};
