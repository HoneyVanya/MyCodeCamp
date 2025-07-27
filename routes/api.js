const express = require('express');
const router = express.Router();

router.get('/:date?', (req, res) => {
    const dateParam = req.params.date;

    let date;

    if (!dateParam) {
        date = new Date();
    } else {
        const isUnix = /^\d+$/.test(dateParam);
        if (isUnix) {
            date = new Date(Number(dateParam))
        } else {
            date = new Date(dateParam)
        }
    };
    if (date.toString() === 'Invalid Date') return res.json({error: 'Invalid Date'});

    res.json({
        unix: date.getTime(),
        utc: date.toUTCString()
    });
});

module.exports = router