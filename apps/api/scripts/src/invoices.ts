import InvoiceService from '@thxnetwork/api/services/InvoiceService';
import { startOfMonth, endOfMonth, addHours, subMonths } from 'date-fns';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI_AUTH_PROD);

export default async function main() {
    await client.connect();

    const db = client.db('auth-prod');
    const accounts = await db.collection('accounts').find({}).toArray();
    const currentDate = subMonths(new Date(), 2);
    const invoicePeriodstartDate = startOfMonth(currentDate);
    const invoicePeriodEndDate = endOfMonth(currentDate);

    // Account for UTC + 2 timezone offset
    const offset = 2;

    await InvoiceService.upsertInvoices(
        addHours(invoicePeriodstartDate, offset),
        addHours(invoicePeriodEndDate, offset),
        accounts as unknown as TAccount[],
    );

    // Build CSV for this months invoices and filter out mapCount = 0
    // TODO: Implement CSV generation
}
