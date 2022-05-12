const router = require('express').Router();
const db = require('../../db/connection');

// get departments
router.get('/', (req, res) => {
    const sql = `SELECT * FROM departments`;

    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: results
        });
    });
});

// add a department
router.post('/', ({ body }, res) => {
    const sql = `INSERT INTO departments (name) VALUES (?)`;
    const params = [body.name];

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        }); 
    });
});

module.exports = router;
