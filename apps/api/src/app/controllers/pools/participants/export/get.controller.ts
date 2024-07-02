import { Pool } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import ParticipantService from '@thxnetwork/api/services/ParticipantService';
import CSVService from '@thxnetwork/api/services/CSVService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    if (!pool) throw new NotFoundError('Pool not found');

    // Export all participant data
    const data = await ParticipantService.export(pool);

    // Prepare the response headers for file download
    const fileName = `participants${pool.id}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv');

    // Define columns for CSV
    const columns = Object.keys(data[0]);

    // Write the CSV header
    const csvHeader = CSVService.stringify([], { columns, header: true });
    res.write(csvHeader);

    // Write each row
    for (const row of data) {
        const csvRow = CSVService.stringify([
            [
                row.accountId,
                row.twitterId,
                row.discordId,
                row.googleId,
                row.username,
                row.email,
                row.wallets,
                row.createdAt,
            ],
        ]);
        res.write(csvRow);
    }

    // End the response
    res.end();
};

export { controller, validation };
