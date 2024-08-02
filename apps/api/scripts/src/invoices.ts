import InvoiceService from '@thxnetwork/api/services/InvoiceService';
import { startOfMonth, endOfMonth, addHours, subMonths, addMonths } from 'date-fns';

export default async function main() {
    const startDate = subMonths(new Date(), 2);
    const endDate = addMonths(startDate, 1);
    const invoicePeriodstartDate = startOfMonth(startDate);
    const invoicePeriodEndDate = endOfMonth(endDate);

    // Account for UTC + 2 timezone offset
    const offset = 2;

    await InvoiceService.upsertInvoices(
        addHours(invoicePeriodstartDate, offset),
        addHours(invoicePeriodEndDate, offset),
    );

    // Build CSV for this months invoices and filter out mapCount = 0
    // TODO: Implement CSV generation
}
