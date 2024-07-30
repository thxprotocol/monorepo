// import nock from 'nock';
// import { supabase } from '@thxnetwork/api/proxies/AccountProxy';
// import { AccountVariant } from '@thxnetwork/common/enums';
// import { User } from '@supabase/supabase-js';

// export function mockUrl(method: string, baseUrl: string, path: string, status: number, callback: any = {}) {
//     const n = nock(baseUrl).persist() as any;
//     return n[method](path).reply(status, callback);
// }

// export function mockStart() {
//     mockClear();
//     jest.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
//         data: {
//             user: {
//                 app_metadata: { provider: 'google' },
//                 user_metadata: { variant: AccountVariant.EmailPassword },
//             } as unknown as User,
//         },
//         error: null,
//     });

//     jest.spyOn(supabase.auth.admin, 'updateUserById').mockResolvedValueOnce({
//         data: {
//             user: {
//                 app_metadata: { provider: 'google' },
//                 user_metadata: { variant: AccountVariant.EmailPassword },
//             } as unknown as User,
//         },
//         error: null,
//     });
// }

// export function mockClear() {
//     return nock.cleanAll();
// }
