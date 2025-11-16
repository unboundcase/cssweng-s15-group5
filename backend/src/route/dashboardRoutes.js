const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/active-cases-count', dashboardController.getActiveCasesCount);
router.get('/closed-cases-count', dashboardController.getClosedCasesCount);
router.get('/intervention-correspondence-count', dashboardController.getInterventionCorrespondenceCount);
router.get('/intervention-counseling-count', dashboardController.getInterventionCounselingCount);
router.get('/intervention-financial-count', dashboardController.getInterventionFinancialCount);
router.get('/intervention-home-visit-count', dashboardController.getInterventionHomeVisitCount);
router.get('/active-cases-per-spu', dashboardController.getActiveCasesPerSpu);
router.get('/workertocaseratio', dashboardController.getWorkerToCaseRatio);
router.get('/workertosupervisorratio', dashboardController.getWorkerToSupervisorRatio);
router.get('/employeecountsbyrole', dashboardController.getEmployeeCountsByRole);
router.get('/averageinterventionspercase', dashboardController.getAverageInterventionsPerCase);
router.get('/period-cases', dashboardController.getPeriodCases);
router.get('/progress-report-count', dashboardController.getProgressReportCount);
router.get('/cases-over-time', dashboardController.getCasesOverTime);
router.get('/workers-over-time', dashboardController.getWorkersOverTime);

//case demographic routes
router.get('/gender-distribution', dashboardController.getGenderDistribution);
router.get('/average-age', dashboardController.getAverageAge);
router.post('/family-details', dashboardController.getFamilyDetails);
router.get('/average-interventions', dashboardController.getAverageInterventionsPerCase);
router.get('/average-case-duration', dashboardController.getAverageCaseDuration);

module.exports = router;