-- departments table values
INSERT INTO departments (name)
VALUES
    ('Sales & Marketing'),
    ('Research & Development'),
    ('Human Resources');
    -- ('Finance'),
    -- ('Production'),
    -- ('Purchasing')

-- roles table values
INSERT INTO roles (title, salary, department_id)
VALUES
    ('Digital Marketing', '56259', 1),
    ('Sales Manager', '68233', 1),
    ('Project Engineer', '87500', 2),
    ('System Engineer', '85281', 2);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ('Yuri', 'Ichikawa', 1, NULL),
    ('Leona', 'Lewis', 2, NULL),
    ('Chris', 'Castillo', 4, NULL),
    ('Joshua', 'Simpson', 3, NULL),
    ('Jin', 'Kang', 4, NULL);
