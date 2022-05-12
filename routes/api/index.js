const router = require('express').Router();
const departmentRoutes = require('./departmentRoutes');
const roleRoutes = require('./rolesRoutes');

router.use('/api/departments', departmentRoutes);
router.use('/api/roles', roleRoutes);

module.exports = router;
