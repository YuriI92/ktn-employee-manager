const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
let sql = '';

const promptOption = () => {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Please select an option from the following menu.',
            choices: [
                'View Departments',
                'View Roles',
                'View Employees',
                new inquirer.Separator(),
                'Add Department',
                'Add Role',
                'Add Employee',
                new inquirer.Separator(),
                'Update Employee Role'
            ]
        },
        // {
        //     type: 'input',
        //     name: 'department',
        //     message: 'What is the name of the department?',
        //     when: ({ option }) => {
        //         if (option === 'Add Department') {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     }
        // },
        // {
        //     type: 'input',
        //     name: 'role',
        //     message: 'What is the name of the role?',
        //     when: ({ option }) => {
        //         if (option === 'Add Roll') {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     }
        // },
        // {
        //     type: 'input',
        //     name: 'salary',
        //     message: 'What is the salary of the role?',
        //     when: ({ option }) => {
        //         if (option === 'Add Roll') {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     }
        // },
        // {
        //     type: 'input',
        //     name: 'roleDept',
        //     message: 'What is the salary of the role?',
        //     when: ({ option }) => {
        //         if (option === 'Add Roll') {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     }
        // }
    ])
}

promptOption()
    .then(({ option }) => {
        switch(option) {
            case 'View Departments':
                sql = `SELECT * FROM departments`;
                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.table(results);
                });
                break;
            case 'View Roles':
                sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                        FROM roles LEFT JOIN departments ON roles.department_id = departments.id`;

                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.table(results);
                });
                break;
            case 'View Employees':
                const sql = `SELECT employees.id, employees.first_name, employees.last_name,
                            roles.title AS job_title, departments.name AS department, roles.salary,
                            CONCAT(manager.first_name, " ", manager.last_name) as manager_name
                            FROM employees LEFT JOIN roles ON employees.role_id = roles.id
                            LEFT JOIN departments ON roles.department_id = departments.id
                            LEFT JOIN employees manager ON employees.manager_id = manager.id`;

                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.table(results);
                });
                break;
        }
    })
    .catch(err => {
        console.log(err);
    });
