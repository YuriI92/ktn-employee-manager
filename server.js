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
                'Update Employee Role',
                new inquirer.Separator(),
            ]
        }
    ])
    .then(({ option }) => {
        let choices = [];

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
                break;
            case 'Add Employee':
                choices = [];
                sql = `SELECT * FROM roles`;
                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    results.forEach(function(index) {
                        choices.push(index.title);
                    });
                    
                    sql = `SELECT employees.id, CONCAT(employees.first_name, " ", employees.last_name) as name FROM employees`;
                    let choices2 = [];
                    db.query(sql, (err, results2) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        results2.forEach(function(index) {
                            choices2.push(index.name);
                        });
                        choices2.push('None');

                        return inquirer.prompt([
                            {
                                type: 'input',
                                name: 'first_name',
                                message: "What is the employee's first name?",
                            },
                            {
                                type: 'input',
                                name: 'last_name',
                                message: "What is the employee's last name?",
                            },
                            {
                                type: 'list',
                                name: 'role',
                                message: 'What is the role of the employee?',
                                choices
                            },
                            {
                                type: 'list',
                                name: 'manager',
                                message: "Who is the employee's manager?",
                                choices: choices2
                            }
                        ])
                            .then((answer) => {
                                const rolesArr = results.filter(index => index.title === answer.role);
                                const role_id = rolesArr[0].id;
                                const managerArr = results2.filter(index => index.name === answer.manager);
                                const manager_id = managerArr[0].id;
                                sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
                                params = [answer.first_name, answer.last_name, role_id, manager_id];
                                addInfo(sql, params);
                            });
                    });
                });
                break;
            case 'Update Employee Role':
                choices = [];
                sql = `SELECT * FROM roles`;
                db.query(sql, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    results.forEach(function(index) {
                        choices.push(index.title);
                    });
                    
                    sql = `SELECT employees.id, CONCAT(employees.first_name, " ", employees.last_name) as name FROM employees`;
                    let choices2 = [];
                    db.query(sql, (err, results2) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        results2.forEach(function(index) {
                            choices2.push(index.name);
                        });

                        return inquirer.prompt([
                            {
                                type: 'list',
                                name: 'employee',
                                message: "Which employee's role do you want to update?",
                                choices: choices2
                            },
                            {
                                type: 'list',
                                name: 'role',
                                message: 'What is the role of the employee?',
                                choices
                            }
                        ])
                        .then((answer) => {
                            const rolesArr = results.filter(index => index.title === answer.role);
                            const role_id = rolesArr[0].id;
                            const employeeArr = results2.filter(index => index.name === answer.employee);
                            const employee_id = employeeArr[0].id;
                            sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
                            params = [role_id, employee_id];
                            console.log(params);
                            db.query(sql, params, (err, results) => {
                                if (err) {
                                    console.log(err);
                                } else if (!results.affectedRows) {
                                    console.log('Employee not found');
                                } else {
                                    console.log(`Updated ${params} information in the database`);
                                }
                            });
                        })
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