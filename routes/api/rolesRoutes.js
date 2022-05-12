const router = require('express').Router();
const db = require('../../db/connection');

// get all the roles
router.get('/', (req, res) => {
    const sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                FROM roles LEFT JOIN departments ON roles.department_id = departments.id`;

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

// add a role
router.post('/', ({ body }, res) => {
    const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`;
    const params = [body.title, body.salary, body.department_id];

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
