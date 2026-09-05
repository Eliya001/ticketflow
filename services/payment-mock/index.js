const express = require('express');

const app = express();
app.use(express.json());

app.post('/charge', (req, res) => {
    const { bookingId, amount } = req.body;

    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
        return res.status(402).json({
            status: 'failed',
            reason: 'Card declined'
        });
    }

    res.json({
        status: 'success',
        bookingId,
        amount,
        transactionId: `txn_${Date.now()}`
    });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
    console.log(`Payment-mock service running on port ${PORT}`);
});
