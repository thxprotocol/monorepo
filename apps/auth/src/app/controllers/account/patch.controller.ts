import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { NotFoundError } from '../../util/errors';
import { body, param } from 'express-validator';

const validation = [
    param('sub').isMongoId(),
    body('email')
        .optional()
        .isEmail()
        .customSanitizer((email) => email && email.toLowerCase()),
];

const controller = async (req: Request, res: Response) => {
    let account = await AccountService.get(req.params.sub);
    if (!account) throw new NotFoundError('Account not found.');

    account = await AccountService.update(account, req.body);

    res.json(account);
};

export default { controller, validation };
