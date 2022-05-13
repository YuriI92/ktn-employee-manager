const router = require('express').Router();
const db = require('../../db/connection');

// get all the employees
router.get('/', (req, res) => {
    const sql = `SELECT employees.id, employees.first_name, employees.last_name,
                roles.title AS job_title, departments.name AS department, roles.salary,
                CONCAT(manager.first_name, " ", manager.last_name) as manager_name
                FROM employees LEFT JOIN roles ON employees.role_id = roles.id
                LEFT JOIN departments ON roles.department_id = departments.id
                LEFT JOIN employees manager ON employees.manager_id = manager.id`;

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
    const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
    const params = [body.first_name, body.last_name, body.role_id, body.manager_id];

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

router.put('/:id', (req, res) => {
    const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
    const params = [req.body.role_id, req.params.id];

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        } else if (!results.affectedRows) {
            res.json({ message: 'Employee not found' });
        } else {
            res.json({
                message: 'success',
                data: results.affectedRows
            }); 
        }
    });
});

module.exports = router;
