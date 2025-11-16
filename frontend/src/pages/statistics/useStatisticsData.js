import { useState, useEffect } from 'react';
import { mockStatistics } from './mockData';

import {
  fetchActiveCasesCount,
  fetchClosedCasesCount,
  fetchPeriodCases,
  fetchInterventionCorrespondenceCount,
  fetchInterventionCounselingCount,
  fetchInterventionFinancialCount,
  fetchInterventionHomeVisitCount,
  fetchProgressReportCount,
  fetchFamilyDetails,
  fetchWorkerToCaseRatio,
  fetchWorkerToSupervisorRatio,
  fetchEmployeeCountsByRole,
  fetchCasesOverTime,
  fetchWorkersOverTime
} from '../../fetch-connections/dashboard-connection';

const USE_MOCK_DATA = true;

export function useStatisticsData({ timePeriod = 0, spuId = "", projectLocations = [], enabled = true } = {}) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodData, setPeriodData] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(0); // progress counter

  // Hardcoded total number of fetches/steps (only those already in use)
  const TOTAL_LOADING_STEPS = 29;

  // Helper to increment loadingStatus
  const incrementLoadingStatus = () => setLoadingStatus(prev => prev + 1);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setLoadingStatus(0);

    async function fetchData() {
      try {
        let rawData;
        if (USE_MOCK_DATA) {
          await new Promise(resolve => setTimeout(resolve, 300));
          rawData = mockStatistics;
          incrementLoadingStatus();
        } else {
          rawData = {};
        }

        const activeCasesResult = await fetchActiveCasesCount(spuId, { signal: controller.signal });
        incrementLoadingStatus();
        rawData.activeCases = Number(activeCasesResult?.activeCases ?? 0);

        const closedCasesResult = await fetchClosedCasesCount(spuId, { signal: controller.signal });
        incrementLoadingStatus();
        rawData.casesClosed = Number(closedCasesResult?.closedCases ?? 0);

        const periodCasesResult = await fetchPeriodCases(spuId, timePeriod, { signal: controller.signal });
        incrementLoadingStatus();

        const progressReportResult = await fetchProgressReportCount(spuId, timePeriod);
        incrementLoadingStatus();
        rawData.progressReportCount = Number(progressReportResult?.progressReportCount ?? 0);

        await fetchInterventionCorrespondenceCount(spuId, timePeriod); incrementLoadingStatus();
        await fetchInterventionCounselingCount(spuId, timePeriod); incrementLoadingStatus();
        await fetchInterventionFinancialCount(spuId, timePeriod); incrementLoadingStatus();
        await fetchInterventionHomeVisitCount(spuId, timePeriod); incrementLoadingStatus();

        await fetchFamilyDetails([]); incrementLoadingStatus();

        await fetchWorkerToCaseRatio(); incrementLoadingStatus();
        await fetchWorkerToSupervisorRatio(); incrementLoadingStatus();

        await fetchEmployeeCountsByRole(spuId, timePeriod); incrementLoadingStatus();

        await fetchCasesOverTime(spuId, timePeriod); incrementLoadingStatus();
        await fetchWorkersOverTime(spuId, timePeriod); incrementLoadingStatus();

        // Only call transformRawData and increment once
        const transformedData = await transformRawData(rawData, spuId, periodCasesResult, projectLocations, timePeriod);
        incrementLoadingStatus();

        setData(transformedData);
        setPeriodData(periodCasesResult);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [spuId, timePeriod, projectLocations, enabled]);

  return { data, loading, error, loadingStatus, totalLoadingSteps: TOTAL_LOADING_STEPS };
}

function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + char
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash);
}

// HSL → HEX (0–360, 0–100, 0–100)
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = x => Math.round(255 * x).toString(16).padStart(2, '0');

  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Pick a Tailwind bg class from a **fixed palette** (safe for JIT)
// IMPORTANT: Safelist these classes in tailwind.config.js
const TAILWIND_BG_PALETTE = [
  'bg-cyan-500', 'bg-orange-500', 'bg-amber-400', 'bg-green-500', 'bg-gray-500',
  'bg-pink-500', 'bg-violet-500', 'bg-indigo-500', 'bg-rose-500', 'bg-emerald-500',
  'bg-lime-500', 'bg-teal-500', 'bg-sky-500', 'bg-yellow-500', 'bg-blue-500',
  'bg-red-500', 'bg-slate-500', 'bg-fuchsia-500', 'bg-stone-500'
];

function seededColorFor(name) {
  const h = hashString(name);
  // Nice vivid range; tweak s/l to taste
  const hue = h % 360;
  const sat = 70;   // 60–75 keeps colors lively
  const light = 50; // ~50 keeps enough contrast on white

  const hex = hslToHex(hue, sat, light);
  const tw = TAILWIND_BG_PALETTE[h % TAILWIND_BG_PALETTE.length];

  return { hex, tw };
}

function getCountBySpu(periodData = [], projectLocations = []) {
  const casesArray = Array.isArray(periodData?.cases)
    ? periodData.cases
    : Array.isArray(periodData)
      ? periodData
      : [];

  // Map SPU _id → name
  const spuIdToName = new Map(
    projectLocations.map(spu => [String(spu._id), spu.spu_name])
  );

  // Initialize all SPUs with 0 counts
  const bySPU = {};
  for (const spu of projectLocations) {
    bySPU[spu.spu_name] = 0;
  }

  // Count number of cases per SPU
  for (const c of casesArray) {
    if (!c.spu) continue;
    const name = spuIdToName.get(String(c.spu)) || "Unknown SPU";
    if (!bySPU[name]) bySPU[name] = 0;
    bySPU[name] += 1;
  }

  // Compute total, default to 0 if empty
  const total = Object.values(bySPU).reduce((sum, val) => sum + val, 0) || 0;

  // Ensure all values are numbers (default to 0)
  Object.keys(bySPU).forEach(key => {
    if (typeof bySPU[key] !== "number" || isNaN(bySPU[key])) bySPU[key] = 0;
  });

  return {
    total,
    bySPU,
  };
}

function getCountGender(periodData = []) {
  const casesArray = Array.isArray(periodData?.cases)
    ? periodData.cases
    : Array.isArray(periodData)
      ? periodData
      : [];

  // Initialize counts
  const counts = {
    male: 0,
    female: 0,
    others: 0,
  };

  // Count each case by gender
  for (const c of casesArray) {
    const sex = String(c.sex || "").trim().toLowerCase();

    if (sex === "male") counts.male += 1;
    else if (sex === "female") counts.female += 1;
    else counts.others += 1;
  }

  // Compute total, default to 0 if empty
  const total = (counts.male + counts.female + counts.others) || 0;

  // Ensure all values are numbers (default to 0)
  Object.keys(counts).forEach(key => {
    if (typeof counts[key] !== "number" || isNaN(counts[key])) counts[key] = 0;
  });

  return {
    total,
    ...counts,
  };
}

async function getCountByIntervention(spuId, timePeriod) {
  // Fetch all intervention counts in parallel
  const [
    correspondence,
    counseling,
    financial,
    homeVisit
  ] = await Promise.all([
    fetchInterventionCorrespondenceCount(spuId, timePeriod),
    fetchInterventionCounselingCount(spuId, timePeriod),
    fetchInterventionFinancialCount(spuId, timePeriod),
    fetchInterventionHomeVisitCount(spuId, timePeriod)
  ]);

  return [
    { type: "Correspondence", count: correspondence?.interventionCorrespondenceCount ?? 0 },
    { type: "Counseling", count: counseling?.interventionCounselingCount ?? 0 },
    { type: "Financial Assistance", count: financial?.interventionFinancialCount ?? 0 },
    { type: "Home Visitation", count: homeVisit?.interventionHomeVisitCount ?? 0 }
  ];
}

async function transformRawData(rawData, spuId, periodData, projectLocations, timePeriod) {
  const interventionColors = ["bg-teal-500", "bg-green-500", "bg-red-500", "bg-yellow-500"];

  const spuDistributionColors = Object.fromEntries((projectLocations || []).map(pl => [pl.spu_name, seededColorFor(pl.spu_name)]));
  const countBySpu = getCountBySpu(periodData, projectLocations);

  const genderData = getCountGender(periodData);
  const genderDistributionColors = {
    'Male': { hex: '#3B82F6', tw: 'bg-blue-500' },
    'Female': { hex: '#ff3fc2ff', tw: 'bg-pink-500' },
  };

  const spuLabels = Object.keys(countBySpu.bySPU);
  const totalSPUCases = countBySpu.total;

  const interventionTypes = await getCountByIntervention(spuId, timePeriod);
  // console.log(interventionTypes);

  // Calculate average interventions & reports per case for the period
  const casesArray = Array.isArray(periodData?.cases)
    ? periodData.cases
    : Array.isArray(periodData)
      ? periodData
      : [];

  const caseCount = casesArray.length || 1; // avoid division by zero
  const avgInterventionsReports = ((interventionTypes.reduce((sum, item) => sum + (item.count || 0), 0) + rawData.progressReportCount) / caseCount).toFixed(1);

  // --- Demographics calculation ---
  // Average age
  let totalAge = 0;
  let ageCount = 0;
  let today = new Date();
  for (const c of casesArray) {
    if (c.dob) {
      let dob = new Date(c.dob);
      let age = today.getFullYear() - dob.getFullYear();
      let m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      totalAge += age;
      ageCount++;
    }
  }
  const avgAge = ageCount > 0 ? Math.round(totalAge / ageCount) : 0;

  // --- Fetch family details from backend ---
  const caseIds = casesArray.map(c => c._id);
  let avgFamilyMembers = 0;
  let avgIncome = 0;
  try {
    const familyData = await fetchFamilyDetails(caseIds);
    avgFamilyMembers = familyData.averageFamilyMembers || 0;
    avgIncome = familyData.averageFamilyIncome || 0;
  } catch (e) {
    avgFamilyMembers = 0;
    avgIncome = 0;
  }

  // Arbitrary case duration for now
  const avgCaseDurationMonths = 12;

  const employeeMetricsResult = await fetchEmployeeCountsByRole(spuId, timePeriod);
  const newEmployees = employeeMetricsResult?.workerMetrics?.newEmployees || 0;
  const roleDist = employeeMetricsResult?.workerMetrics?.roleDistribution || {};
  const roleColors = {
    "Social Development Workers": "bg-teal-500",
    Supervisors: "bg-yellow-500",
    Heads: "bg-red-500",
  };

  const chartData = Object.entries(roleDist).map(([label, value]) => ({
    label,
    value,
    color: roleColors[label] || "bg-gray-400",
  }));

  const totalEmployees = Object.values(roleDist).reduce((a, b) => a + b, 0);


  return {
    spuStatisticsCards: [
      { title: "Active Cases", value: rawData.activeCases.toLocaleString(), subtext: spuId ? "Within this SPU" : "Across all SPUs" },
      { title: "Cases Closed", value: rawData.casesClosed.toLocaleString(), subtext: spuId ? "Within this SPU" : "Across all SPUs" },
      { title: "New Cases Added", value: (periodData?.meta?.matched ?? periodData?.cases?.length ?? 0).toLocaleString(), subtext: "This period" },
      { title: "New Interventions", value: interventionTypes.reduce((sum, item) => sum + (item.count || 0), 0).toLocaleString(), subtext: "This period" },
      { title: "New Progress Reports", value: rawData.progressReportCount.toLocaleString(), subtext: "This period" },
      { title: "Average Interventions & Reports", value: avgInterventionsReports, subtext: "Per Case" },
    ],
    interventionsByTypeData: {
      title: "Interventions by Type",
      types: interventionTypes.map((item, index) => ({
        name: item.type,
        value: item.count,
        color: interventionColors[index % interventionColors.length],
      })),
    },

    caseDistributionData: {
      title: "Active Cases Distribution by SPU",
      subtitle: "Current distribution across SPUs",
      totalCases: totalSPUCases.toLocaleString(),
      chartData: {
        labels: spuLabels,
        datasets: [{
          data: Object.values(countBySpu.bySPU),
          backgroundColor: spuLabels.map(label => spuDistributionColors[label]?.hex || '#CCCCCC'),
          borderColor: '#FFFFFF',
          borderWidth: 4,
        }]
      },
      legendData: spuLabels.map(label => ({
        label: `${label}`,
        value: countBySpu.bySPU[label],
        percentage: totalSPUCases > 0
          ? ((countBySpu.bySPU[label] / totalSPUCases) * 100).toFixed(0)
          : "0",
        color: spuDistributionColors[label]?.tw || 'bg-gray-400',
      }))
    },
    genderDistributionData: {
      title: "Gender Distribution",
      totalCases: genderData.total.toLocaleString(),
      chartData: {
        labels: ['Male', 'Female', 'Others'],
        datasets: [{
          data: [genderData.male, genderData.female, genderData.others],
          backgroundColor: [genderDistributionColors.Male.hex, genderDistributionColors.Female.hex],
          borderColor: '#FFFFFF',
          borderWidth: 4,
        }]
      },
      legendData: [
        {
          label: 'Male',
          value: genderData.male,
          percentage: genderData.total > 0
            ? ((genderData.male / genderData.total) * 100).toFixed(0)
            : "0",
          color: genderDistributionColors.Male.tw
        },
        {
          label: 'Female',
          value: genderData.female,
          percentage: genderData.total > 0
            ? ((genderData.female / genderData.total) * 100).toFixed(0)
            : "0",
          color: genderDistributionColors.Female.tw
        }
      ]
    },
    keyDemographicsData: [
      { title: "Average Age", subtitle: "of clients", value: `${avgAge} years` },
      { title: "Family Members", subtitle: "average per case", value: `${avgFamilyMembers} members` },
      { title: "Family Income", subtitle: "excluding non-earners", value: `₱${Number(avgIncome).toLocaleString()}` },
    ],
    ratioData: {
      workerToCase: await fetchWorkerToCaseRatio(spuId),
      workerToSupervisor: await fetchWorkerToSupervisorRatio(spuId),
    },
    workerDistributionData: {
      title: "Employee Distribution by Roles",
      subtitle: "Current distribution across all departments",
      chartData,
      totalEmployees,
      newEmployees,
    },
    caseOverTime: await fetchCasesOverTime(spuId, timePeriod),
    workerOverTime: await fetchWorkersOverTime(spuId, timePeriod),
    periodData
  };
}
//