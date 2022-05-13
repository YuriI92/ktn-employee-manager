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
