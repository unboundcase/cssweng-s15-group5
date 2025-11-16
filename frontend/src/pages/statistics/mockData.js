// frontend/src/pages/statistics/mockData.js
export const mockStatistics = {
  spu: "SPU North",
  dateRange: "Last 30 days",
  activeCases: 2840,
  casesClosed: 1256,
  newCases: 136,
  avgCaseDuration: 109,
  newInterventions: 301,
  avgInterventionsPerCase: 2840,

  interventionTypes: [
    { type: "Type 1 LONG NAME", count: 28 },
    { type: "Type 2", count: 23 },
    { type: "Type 3", count: 15 },
    { type: "Type 4", count: 8 },
    { type: "Type 5", count: 6 },
  ],

  caseDistribution: {
    total: 1247,
    bySPU: {
      North: 312,
      South: 268,
      East: 243,
      West: 204,
      Central: 220,
    },
  },

  genderDistribution: {
    total: 312,
    male: 187,
    female: 115,
    others: 10,
  },

  demographics: {
    avgAge: 31,
    familyMembers: 4,
    income: 17850,
    interventions: 3.4,
    durationMonths: 7.8,
    progressReports: 5.2,
  },

  workerMetrics: {
    workerToCaseRatio: "1 : 26",
    workerToSupervisorRatio: "4 : 1",
    newEmployees: 4,
    roleDistribution: {
      "Social Workers": 12,
      Supervisors: 3,
      "Case Managers": 8,
      "Support Staff": 5,
      Admin: 2,
    },
  },

  casesOverTime: [
    { date: "2024-01-01", value: 10 },
    { date: "2024-01-02", value: 12 },
    { date: "2024-01-03", value: 14 },
    { date: "2024-01-04", value: 16 },
    { date: "2024-01-05", value: 18 },
    { date: "2024-01-06", value: 21 },
    { date: "2024-01-07", value: 22 },
    { date: "2024-01-08", value: 24 },
    { date: "2024-01-09", value: 25 },
  ],
  employeesOverTime: [
    { date: "2024-01-01", value: 5 },
    { date: "2024-01-02", value: 6 },
    { date: "2024-01-03", value: 7 },
    { date: "2024-01-04", value: 7 },
    { date: "2024-01-05", value: 8 },
    { date: "2024-01-06", value: 9 },
    { date: "2024-01-07", value: 10 },
    { date: "2024-01-08", value: 11 },
    { date: "2024-01-09", value: 12 },
  ],
  interventionDistribution: [
    { type: "Type A", value: 32, color: "#0891b2" },
    { type: "Type B", value: 28, color: "#4ade80" },
    { type: "Type C", value: 15, color: "#f87171" },
    { type: "Type D", value: 8,  color: "#fffb00ff" },
  ],
};
