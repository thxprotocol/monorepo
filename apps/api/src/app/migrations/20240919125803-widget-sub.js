module.exports = {
    async up(db, client) {
        const widgetColl = db.collection('widget');
        const poolColl = db.collection('pool');
        const brandColl = db.collection('brand');
        const widgets = await widgetColl.find({}).toArray();
        const pools = await poolColl.find({}).toArray();
        const brands = await brandColl.find({}).toArray();
        const operations = widgets
            .map((w) => {
                try {
                    const pool = pools.find((p) => String(p._id) == w.poolId);
                    const brand = brands.find((b) => b.poolId == w.poolId);
                    if (!pool) throw new Error('Pool not found');

                    return {
                        updateOne: {
                            filter: { _id: w._id },
                            update: {
                                $set: {
                                    sub: pool.sub,
                                    slug: pool.settings.slug,
                                    name: pool.settings.title,
                                    description: pool.settings.description,
                                    logoImgURL: brand && brand.logoImgUrl,
                                    backgroundImgURL: brand && brand.backgroundImgUrl,
                                },
                            },
                        },
                    };
                } catch (error) {
                    console.error('Operation Error', error);
                }
            })
            .filter((o) => !!o);

        await widgetColl.bulkWrite(operations);
    },
    async down(db, client) {
        //
    },
};
