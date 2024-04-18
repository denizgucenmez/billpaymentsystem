const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const invoices = [
    { subscriberNo: '1234567890', month: '2024-03', amount: 50 },
    { subscriberNo: '0987654321', month: '2024-03', amount: 75 }
];


app.get('/invoices', (req, res) => {
    const subscriberNo = req.query.subscriberNo;
    const month = req.query.month;

    if (!subscriberNo || !month) {
        return res.status(400).json({ success: false, message: 'Subscriber number and month parameters are required.' });
    }

    const invoice = invoices.find(inv => inv.subscriberNo === subscriberNo && inv.month === month);
    if (invoice) {
        res.json({ success: true, invoice });
    } else {
        res.status(404).json({ success: false, message: 'Invoice not found' });
    }
});


app.get('/invoices/details', (req, res) => {
    const subscriberNo = req.query.subscriberNo;
    const month = req.query.month;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (!subscriberNo || !month) {
        return res.status(400).json({ success: false, message: 'Subscriber number and month parameters are required.' });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;

    const filteredInvoices = invoices.filter(inv => inv.subscriberNo === subscriberNo && inv.month === month);
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    if (paginatedInvoices.length > 0) {
        res.json({ success: true, invoices: paginatedInvoices });
    } else {
        res.status(404).json({ success: false, message: 'Invoices not found' });
    }
});


app.get('/invoices/notpaid', (req, res) => {
    const subscriberNo = req.query.subscriberNo;

    if (!subscriberNo) {
        return res.status(400).json({ success: false, message: 'Subscriber number parameter is required.' });
    }

    const unpaidBills = invoices.filter(inv => inv.subscriberNo === subscriberNo && inv.status !== 'PAID');
    if (unpaidBills.length > 0) {
        res.json({ success: true, unpaidBills });
    } else {
        res.status(404).json({ success: false, message: 'Unpaid invoices not found' });
    }
});


app.put('/invoices/pay', (req, res) => {
    const subscriberNo = req.body.subscriberNo;
    const month = req.body.month;
    const amountPaid = req.body.amountPaid;

    if (!subscriberNo || !month || !amountPaid) {
        return res.status(400).json({ success: false, message: 'Subscriber number, month, and amountPaid parameters are required.' });
    }

    const invoiceIndex = invoices.findIndex(inv => inv.subscriberNo === subscriberNo && inv.month === month);
    if (invoiceIndex !== -1) {
        const invoice = invoices[invoiceIndex];
        if (amountPaid >= invoice.amount) {
            invoice.amountPaid = invoice.amount;
            invoice.status = 'PAID';
        } else {
            invoice.amountPaid = amountPaid;
            invoice.status = 'PARTIALLY_PAID';
        }
        res.json({ success: true, message: 'Invoice successfully paid', invoice });
    } else {
        res.status(404).json({ success: false, message: 'Invoice not found' });
    }
});


app.post('/invoices/add', (req, res) => {
    const subscriberNo = req.body.subscriberNo;
    const month = req.body.month;

    if (!subscriberNo || !month) {
        return res.status(400).json({ success: false, message: 'Subscriber number and month parameters are required.' });
    }

    const existingInvoice = invoices.find(inv => inv.subscriberNo === subscriberNo && inv.month === month);
    if (existingInvoice) {
        return res.status(400).json({ success: false, message: 'An invoice for this month already exists.' });
    }


    invoices.push({ subscriberNo, month, total: req.body.total });
    res.json({ success: true, message: 'Invoice successfully added', transactionStatus: 'SUCCESS' });
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});