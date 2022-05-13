const router = require('express').Router();
const departmentRoutes = require('./departmentRoutes');
const roleRoutes = require('./rolesRoutes');
const employeeRoutes = require('./employeeRoutes');

router.use('/api/departments', departmentRoutes);
router.use('/api/roles', roleRoutes);
router.use('/api/employees', employeeRoutes);

module.exports = router;
