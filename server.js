const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');
let sql = '';
let params = '';

const showTable = (sql) => {
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }
        console.table(results);
        promptOption();
    });
}

const addInfo = (sql, params) => {
    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Added ${params} to the database`);
        promptOption();
    });
}

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
        }
    ])
    .then(({ option }) => {
        switch(option) {
            case 'View Departments':
                sql = `SELECT * FROM departments`;
                showTable(sql);
                break;
            case 'View Roles':
                sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                    FROM roles LEFT JOIN departments ON roles.department_id = departments.id`;
                showTable(sql);
                break;
            case 'View Employees':
                sql = `SELECT employees.id, employees.first_name, employees.last_name,
                    roles.title AS job_title, departments.name AS department, roles.salary,
                    CONCAT(manager.first_name, " ", manager.last_name) as manager_name
                    FROM employees LEFT JOIN roles ON employees.role_id = roles.id
                    LEFT JOIN departments ON roles.department_id = departments.id
                    LEFT JOIN employees manager ON employees.manager_id = manager.id`;
                showTable(sql);
                break;
            case 'Add Department':
                return inquirer.prompt([
                    {
                        type: 'input',
                        name: 'department',
                        message: 'What is the name of the department?'
                    }
                ])
                    .then((answer) => {
                        sql = `INSERT INTO departments (name) VALUES (?)`;
                        addInfo(sql, answer.department);
                    });
            case 'Add Role':
                sql = `SELECT * FROM departments`;
                let choices = [];
                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    results.forEach(function(index) {
                        choices.push(index.name);
                    });

                    return inquirer.prompt([
                        {
                            type: 'input',
                            name: 'title',
                            message: 'What is the name of the role?',
                        },
                        {
                            type: 'input',
                            name: 'salary',
                            message: 'What is the salary of the role?',
                        },
                        {
                            type: 'list',
                            name: 'department',
                            message: 'Which department does the role belong to?',
                            choices
                        }
                    ])
                        .then((answer) => {
                            const arr = results.filter(index => index.name === answer.department);
                            const department_id = arr[0].id;
                            sql = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`;
                            params = [answer.title, answer.salary, department_id];
                            addInfo(sql, params);
                        });
                }); 
        }
    });
}

promptOption()
    .catch(err => {
        console.log(err);
    });


module.exports = { promptOption };