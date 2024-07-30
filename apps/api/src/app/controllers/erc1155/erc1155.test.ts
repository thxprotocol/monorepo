import request from 'supertest';
import app from '@thxnetwork/api/';
import Mock from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/common/enums';
import { isAddress } from 'web3-utils';
import { createImage } from '@thxnetwork/api/util/jest/images';

const user = request.agent(app);

describe('ERC1155', () => {
    const chainId = ChainId.Hardhat,
        name = 'Planets of the Galaxy',
        description = 'Collection full of rarities.';
    let erc1155ID: string;

    beforeAll(() => Mock.beforeAll());
    afterAll(() => Mock.afterAll());

    describe('POST /erc1155', () => {
        it('should create and return contract details', async () => {
            const logoImg = createImage();
            await user
                .post('/v1/erc1155')
                .set('Authorization', Mock.accounts[0].authHeader)
                .attach('file', logoImg, { filename: 'logoImg.jpg', contentType: 'image/jpg' })
                .field({
                    chainId,
                    name,
                    description,
                })
                .expect(({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.chainId).toBe(chainId);
                    expect(body.name).toBe(name);
                    expect(body.description).toBe(description);
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.logoImgUrl).toBeDefined();
                    erc1155ID = body._id;
                })
                .expect(201);
        });
    });

    describe('GET /erc1155/:id', () => {
        it('should return contract details', (done) => {
            user.get('/v1/erc1155/' + erc1155ID)
                .set('Authorization', Mock.accounts[0].authHeader)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.chainId).toBe(chainId);
                    expect(body.name).toBe(name);
                    expect(body.description).toBe(description);
                    expect(isAddress(body.address)).toBe(true);
                    expect(body.logoImgUrl).toBeDefined();
                })
                .expect(200, done);
        });
        it('should 400 for invalid ID', (done) => {
            user.get('/v1/erc1155/' + 'invalid_id')
                .set('Authorization', Mock.accounts[0].authHeader)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.errors[0].msg).toContain('Invalid value');
                })
                .expect(400, done);
        });
        it('should 404 if not known', (done) => {
            user.get('/v1/erc1155/' + '62397f69760ac5f9ab4454df')
                .set('Authorization', Mock.accounts[0].authHeader)
                .send()
                .expect(({ body }: request.Response) => {
                    expect(body.error.message).toContain('Not Found');
                })
                .expect(404, done);
        });
        describe('PATCH /erc1155/:id', () => {
            it('should update a created token', (done) => {
                user.patch('/v1/erc1155/' + erc1155ID)
                    .set('Authorization', Mock.accounts[0].authHeader)
                    .send()
                    .expect(({ body }: request.Response) => {
                        expect(body).toBeDefined();
                    })
                    .expect(200, done);
            });
        });
    });
});
