const inquirer = require('inquirer');
const db = require('./db/connection');
const cTable = require('console.table');

let sql = '';
let params = '';

// prompt user for options
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
                'View Employees by Manager',
                'View Employees by Department',
                new inquirer.Separator(),
                'Add Department',
                'Add Role',
                'Add Employee',
                new inquirer.Separator(),
                'Update Employee Role',
                'Update Employee Manager',
                'Delete Department',
                'Delete Role',
                'Delete Employee',
                new inquirer.Separator(),
            ]
        }
    ])
    .then(({ option }) => {
        let choices = [];

        // default sql value is getting employee information
        // columns: id, first_name, last_name, job_title, department, salary, manager_name (manager's full name)
        // tables: employees, roles, departments, manager(referring employees)
        sql = `SELECT employees.id, employees.first_name, employees.last_name,
            roles.title AS job_title, departments.name AS department, roles.salary,
            CONCAT(manager.first_name, " ", manager.last_name) as manager_name
            FROM employees LEFT JOIN roles ON employees.role_id = roles.id
            LEFT JOIN departments ON roles.department_id = departments.id
            LEFT JOIN employees manager ON employees.manager_id = manager.id`;

        // respond to the selected options
        switch(option) {
            case 'View Departments':
                sql = `SELECT * FROM departments`;
                showTable(sql);
                break;
            case 'View Roles':
                // columns: id, title, salary, department
                // tables: roles, departments
                sql = `SELECT roles.id, roles.title, roles.salary, departments.name AS department
                    FROM roles LEFT JOIN departments ON roles.department_id = departments.id`;
                showTable(sql);
                break;
            case 'View Employees':
                // use default sql value
                showTable(sql);
                break;
            case 'View Employees by Manager':
                // add sort order to the default sql value
                sql += ` ORDER BY manager_name`;
                showTable(sql);
                break;
            case 'View Employees by Department':
                // add sort order to the default sql value
                sql += ` ORDER BY department`;
                showTable(sql);
                break;
            case 'Add Department':
                addDept();
                break;
            case 'Add Role':
                addRole(choices);
                break;
            case 'Add Employee':
                addEmployee(choices);                
                break;
            case 'Update Employee Role':
                updateEmployee(choices, 'update_role');
                break;
            case 'Update Employee Manager':
                updateEmployee(choices, 'update_manager');
                break;
            case 'Delete Department':
                deleteDept(choices);
                break;
            case 'Delete Role':
                deleteRole(choices);
            case 'Delete Employee':
                updateEmployee(choices, 'delete');
                break;
        }
    });
}

// get information from the db and show the table of the selected option
const showTable = (sql) => {
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }
        // creates table in the console
        console.table(results);
        // call options again for the next action
        promptOption();
    });
}

// add selected option's info to db
const addInfo = (sql, params, target) => {
    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(`Added ${target} to the database`);
        promptOption();
    });
}

// add department info to departments table
const addDept = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?'
        }
    ])
        .then((answer) => {
            sql = `INSERT INTO departments (name) VALUES (?)`;
            addInfo(sql, answer.department, answer.department);
        });

}

// add role info to roles table
const addRole = (choices) => {
    // get departments info to use as a prompt option for department choices
    sql = `SELECT * FROM departments`;
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }

        // get departments names and store into choices array
        results.forEach(function(index) {
            choices.push(index.name);
        });

        // prompt user for the info to add
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
                // get department_id of the department selected
                const department_id = results.filter(index => index.name === answer.department)[0].id;
                sql = `INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)`;
                params = [answer.title, answer.salary, department_id];
                addInfo(sql, params, answer.title);
            });
    });
}

// add employee info to employees table
const addEmployee = (choices) => {
    // get roles info to use as a prompt option for roles choices
    sql = `SELECT * FROM roles`;
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }

        // get job titles and store into choices array
        results.forEach(function(index) {
            choices.push(index.title);
        });
        
        // get employees info to use as a prompt option for employees choices
        sql = `SELECT employees.id, CONCAT(employees.first_name, " ", employees.last_name) as name FROM employees`;
        let choices2 = [];
        db.query(sql, (err, results2) => {
            if (err) {
                console.log(err);
                return;
            }

            // get employee names and store into choices array
            results2.forEach(function(index) {
                choices2.push(index.name);
            });
            choices2.push('None');

            // prompt user for the info to add
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
                    const role_id = results.filter(index => index.title === answer.role)[0].id;
                    let manager_id = '';
                    // set manager_id to null if 'none' is selected for manager
                    if (answer.manager === 'None') {
                        manager_id = null;
                    } else {
                        manager_id = results2.filter(index => index.name === answer.manager)[0].id;
                    }

                    sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
                    params = [answer.first_name, answer.last_name, role_id, manager_id];
                    const employee = answer.first_name + ' ' + answer.last_name;
                    addInfo(sql, params, employee);
                });
        });
    });
}

// update employee info in employees table
const updateEmployee = (employeeList, updateItem) => {
    // get employees info to use as a prompt option for employees choices
    sql = `SELECT employees.id, CONCAT(employees.first_name, " ", employees.last_name) as name FROM employees`;
    db.query(sql, (err, employees) => {
        if (err) {
            console.log(err);
            return;
        }

        // get employee names and store into choices array
        employees.forEach(function(index) {
            employeeList.push(index.name);
        });

        // if the user selected 'Update Employee Role', 
        if (updateItem === 'role') {
            // get roles info to use as a prompt option for roles choices
            sql = `SELECT * FROM roles`;
            let roleList = [];
            db.query(sql, (err, roles) => {
                if (err) {
                    console.log(err);
                    return;
                }
        
                // get job titles and store into choices array
                roles.forEach(function(index) {
                    roleList.push(index.title);
                });
    
                // prompt user for the info to update
                return inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee',
                        message: "Which employee's role do you want to update?",
                        choices: employeeList
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is the role of the employee?',
                        choices: roleList
                    }
                ])
                .then((answer) => {
                    const role_id = roles.filter(index => index.title === answer.role)[0].id;
                    const employee_id = employees.filter(index => index.name === answer.employee)[0].id;
                    sql = `UPDATE employees SET role_id = ? WHERE id = ?`;
                    params = [role_id, employee_id];

                    db.query(sql, params, (err, results) => {
                        if (err) {
                            console.log(err);
                        } else if (!results.affectedRows) {
                            console.log('Employee not found');
                        } else {
                            console.log(`Updated ${answer.employee} information in the database`);
                        }
                        promptOption();
                    });
                });
            });
        // if the user selected 'Update Employee Manager'
        } else if (updateItem === 'manager') {
            // prompt user for the info to update
            return inquirer.prompt([
                {
                    type: 'list',
                    name: 'employee',
                    message: "Which employee's manager do you want to update?",
                    choices: employeeList
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: "Who is the employee's manager?",
                    choices: employeeList
                }
            ])
            .then((answer) => {
                const employee_id = employees.filter(index => index.name === answer.employee)[0].id;
                const manager_id = employees.filter(index => index.name === answer.manager)[0].id;
                sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;
                params = [manager_id, employee_id];
                
                db.query(sql, params, (err, results) => {
                    if (err) {
                        console.log(err);
                    } else if (!results.affectedRows) {
                        console.log('Employee not found');
                    } else {
                        console.log(`Updated ${answer.employee} information in the database`);
                    }
                    promptOption();
                });
            });
        }
    });
}

// delete a department from db
const deleteDept = (deptList) => {
    // get all the departments
    sql = `SELECT * FROM departments`;
    db.query(sql, (err, departments) => {
        if (err) {
            console.log(err);
            return;
        }

        // get dept names and store into list array
        departments.forEach(function(index) {
            deptList.push(index.name);
        });

        // prompt user for the info to delete the precise one
        return inquirer.prompt([
            {
                type: 'list',
                name: 'dept',
                message: "Which department do you want to delete?",
                choices: deptList
            },
        ])
        .then((answer) => {
            const dept_id = departments.filter(index => index.name === answer.dept)[0].id;
            sql = `DELETE FROM departments WHERE id = ?`;
            params = [dept_id];

            db.query(sql, params, (err, results) => {
                if (err) {
                    console.log(err);
                } else if (!results.affectedRows) {
                    console.log('Department not found');
                } else {
                    console.log(`Deleted ${answer.dept} from the database`);
                }
                promptOption();
            });
        });
    });
}

// delete role form db
const deleteRole = (roleList) => {
    // get roles' id and title
    sql = `SELECT roles.id, roles.title FROM roles`;
    db.query(sql, (err, roles) => {
        if (err) {
            console.log(err);
            return;
        }

        // get role titles and store into list array
        roles.forEach(function(index) {
            roleList.push(index.title);
        });

        // prompt user for the info to delete the precise one
        return inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: "Which role do you want to delete?",
                choices: roleList
            },
        ])
        .then((answer) => {
            const role_id = roles.filter(index => index.title === answer.role)[0].id;
            sql = `DELETE FROM roles WHERE id = ?`;
            params = [role_id];

            db.query(sql, params, (err, results) => {
                if (err) {
                    console.log(err);
                } else if (!results.affectedRows) {
                    console.log('Roles not found');
                } else {
                    console.log(`Deleted ${answer.role} from the database`);
                }
                promptOption();
            });
        });
    });
}

promptOption()
.catch(err => {
    console.log(err);
});
