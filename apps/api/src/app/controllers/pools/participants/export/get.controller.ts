import fs from 'fs';
import path from 'path';
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

    // Write CSV file
    const csv = await CSVService.stringify(data);

    // Prepare the response headers for file download
    const fileName = `participants${pool.id}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'text/csv');

    // Stream the CSV data to the client
    res.send(csv);
};

export { controller, validation };
