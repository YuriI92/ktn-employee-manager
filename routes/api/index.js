const router = require('express').Router();
const departmentRoutes = require('./departmentRoutes');

router.use('/api/departments', departmentRoutes);

module.exports = router;
