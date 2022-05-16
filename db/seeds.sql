-- THESE ARE SAMPLES. YOU CAN REGISTER DEPARTMENTS, ROLES, AND EMPLOYEES BY UPDATING THE FOLLOWING CODES.

-- departments table values
INSERT INTO departments (name)
VALUES
    ('Sales & Marketing'),
    ('Research & Development'),
    ('Human Resources');
    
-- roles table values
INSERT INTO roles (title, salary, department_id)
VALUES
    ('Digital Marketing', '56259', 1),
    ('Sales Manager', '68233', 1),
    ('Project Engineer', '87500', 2);

-- employee table values (CAN BE USED AFTER ROLES/MANAGERS ARE REGISTERED OR SET NULL FOR THEIR COLUMNS)
-- INSERT INTO employees (first_name, last_name, role_id, manager_id)
-- VALUES
--     ('Yuri', 'Ichikawa', NULL, NULL),
--     ('Leona', 'Lewis', NULL, NULL),
--     ('Chris', 'Castillo', NULL, NULL);
