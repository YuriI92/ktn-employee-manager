const db = require('../db/connection');
const cTable = require('console.table');

const deptData = (departments) => {
    let departmentList = [];
    // get departments info to use as a prompt option for department choices
    sql = `SELECT * FROM departments`;
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return;
        }

        // get departments names and store into choices array
        results.forEach(function(index) {
            departmentList.push(index.name);
        });
        departments = results;
    });
    return departmentList;
}

module.exports = { deptData };
