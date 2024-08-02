import { Account } from '@thxnetwork/api/models';
import { Invoice } from '@thxnetwork/api/models/Invoice';
import InvoiceService from '@thxnetwork/api/services/InvoiceService';
import { startOfMonth, endOfMonth, addHours, subMonths } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import { ObjectId } from 'mongodb';

export default async function main() {
    const startDate = subMonths(new Date(), 1);
    const invoicePeriodstartDate = startOfMonth(startDate);
    const invoicePeriodEndDate = endOfMonth(startDate);

    // Account for UTC + 2 timezone offset
    // const offset = 2;

    // await InvoiceService.upsertInvoices(
    //     addHours(invoicePeriodstartDate, offset),
    //     addHours(invoicePeriodEndDate, offset),
    // );

    // Build CSV for this months invoices and filter out mapCount = 0
    const invoices = await Invoice.find({
        mapCount: { $gt: 0 },
    });
    const subs = invoices.map((invoice) => new ObjectId(invoice.sub));
    const accounts = await Account.find({ _id: { $in: subs } });

    const data = [
        [
            'periodStartDate',
            'periodEndDate',
            'sub',
            'username',
            'email',
            'organisation',
            'role',
            'createdAt',
            'plan',
            'mapCount',
            'mapLimit',
            'additionalUnitCount',
            'costPerUnit',
            'costSubscription',
            'costTotal',
        ],
        ...(await Promise.all(
            invoices.map(async (invoice) => {
                const account = accounts.find((account) => account.id === invoice.sub);
                if (!account) return [];
                return [
                    invoice.periodStartDate,
                    invoice.periodEndDate,
                    invoice.sub,
                    account.username,
                    account.email,
                    account.organisation,
                    account.role,
                    account.createdAt,
                    invoice.plan,
                    invoice.mapCount,
                    invoice.mapLimit,
                    invoice.additionalUnitCount,
                    invoice.costPerUnit,
                    invoice.costSubscription,
                    invoice.costTotal,
                ];
            }),
        )),
    ];

    // Convert array to CSV string
    const csvContent = data.map((row) => row.join(',')).join('\n');

    // Define the file path
    const filePath = path.join('/Users/peterpolman/Desktop', 'output.csv');

    // Write CSV string to file
    fs.writeFileSync(filePath, csvContent);

    console.log('CSV file written successfully at', filePath);
}
