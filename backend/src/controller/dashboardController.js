const Employee = require('../model/employee');
const Sponsored_Member = require('../model/sponsored_member');
const Case_Closure = require('../model/case_closure');
const Intervention_Correspondence = require('../model/intervention_correspondence');
const Intervention_Counseling = require('../model/intervention_counseling');
const Intervention_Financial = require('../model/intervention_financial');
const Intervention_Homevisit = require('../model/intervention_homevisit');
const Spu = require('../model/spu');
const Progress_Report = require('../model/progress_report');

const mongoose = require('mongoose');

//case demographic
const Family_Member = require('../model/family_member');
const Family_Relationship = require('../model/family_relationship');

/**
 *   DASHBOARD CONTROLLER
 *        > handles viewing of dashboard
 */

// ================================================== //

/**
 *   Renders the home page
 *        > handles filters 
 *        > must depend on the signed in user
 *             > ADMIN: can see all client
 *             > SUPERVISOR: --
 *             > SDW: --
 */
const renderHomePage = async (req, res) => {
     // code here
}

const getActiveCasesCount = async (req, res) => {
    try {
        const filter = { is_active: true };
        if (req.query.spuId) {
            filter.spu = req.query.spuId;
        }
        const activeCasesCount = await Sponsored_Member.countDocuments(filter);
        res.status(200).json({ activeCases: activeCasesCount });
    } catch (error) {
        console.error("Error fetching active cases count:", error);
        res.status(500).json({ message: "Error fetching active cases count", error: error.message });
    }
};

const getClosedCasesCount = async (req, res) => {
    try {
        const filter = { is_active: false };
        if (req.query.spuId) {
            filter.spu = req.query.spuId;
        }
        const closedCasesCount = await Sponsored_Member.countDocuments(filter);
        res.status(200).json({ closedCases: closedCasesCount });
    } catch (error) {
        console.error("Error fetching closed cases count:", error);
        res.status(500).json({ message: "Error fetching closed cases count", error: error.message });
    }
};

const getInterventionCorrespondenceCount = async (req, res) => {
    try {
        const rawDays = req.query.days;
        const spuId = req.query.spuId || '';
        const now = new Date();
        const daysNum = rawDays === undefined ? 0 : Number(rawDays);
        const hasWindow = Number.isFinite(daysNum) && daysNum > 0;

        const filter = {};
        if (spuId) {
            if (!mongoose.Types.ObjectId.isValid(spuId)) {
                return res.status(400).json({ message: 'Invalid spuId' });
            }
            filter.spu = new mongoose.Types.ObjectId(spuId);
        }
        if (hasWindow) {
            const cutoff = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: cutoff, $lte: now };
        }

        const count = await Intervention_Correspondence.countDocuments(filter);
        res.status(200).json({ interventionCorrespondenceCount: count });
    } catch (error) {
        console.error("Error fetching intervention correspondence count:", error);
        res.status(500).json({ message: "Error fetching intervention correspondence count", error: error.message });
    }
};

const getInterventionCounselingCount = async (req, res) => {
    try {
        const rawDays = req.query.days;
        const spuId = req.query.spuId || '';
        const now = new Date();
        const daysNum = rawDays === undefined ? 0 : Number(rawDays);
        const hasWindow = Number.isFinite(daysNum) && daysNum > 0;

        const filter = {};
        if (spuId) {
            if (!mongoose.Types.ObjectId.isValid(spuId)) {
                return res.status(400).json({ message: 'Invalid spuId' });
            }
            filter.spu = new mongoose.Types.ObjectId(spuId);
        }
        if (hasWindow) {
            const cutoff = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: cutoff, $lte: now };
        }

        const count = await Intervention_Counseling.countDocuments(filter);
        res.status(200).json({ interventionCounselingCount: count });
    } catch (error) {
        console.error("Error fetching intervention counseling count:", error);
        res.status(500).json({ message: "Error fetching intervention counseling count", error: error.message });
    }
};

const getInterventionFinancialCount = async (req, res) => {
    try {
        const rawDays = req.query.days;
        const spuId = req.query.spuId || '';
        const now = new Date();
        const daysNum = rawDays === undefined ? 0 : Number(rawDays);
        const hasWindow = Number.isFinite(daysNum) && daysNum > 0;

        const filter = {};
        if (spuId) {
            if (!mongoose.Types.ObjectId.isValid(spuId)) {
                return res.status(400).json({ message: 'Invalid spuId' });
            }
            filter.spu = new mongoose.Types.ObjectId(spuId);
        }
        if (hasWindow) {
            const cutoff = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: cutoff, $lte: now };
        }

        const count = await Intervention_Financial.countDocuments(filter);
        res.status(200).json({ interventionFinancialCount: count });
    } catch (error) {
        console.error("Error fetching intervention financial count:", error);
        res.status(500).json({ message: "Error fetching intervention financial count", error: error.message });
    }
};

const getInterventionHomeVisitCount = async (req, res) => {
    try {
        const rawDays = req.query.days;
        const spuId = req.query.spuId || '';

        // console.log("Received request for Intervention Home Visit Count with spuId:", spuId, "and days:", rawDays);

        // Use UTC "now" for consistent filtering
        const now = new Date();
        const daysNum = rawDays === undefined ? 0 : Number(rawDays);
        const hasWindow = Number.isFinite(daysNum) && daysNum > 0;

        const filter = {};
        if (spuId) {
            if (!mongoose.Types.ObjectId.isValid(spuId)) {
                return res.status(400).json({ message: 'Invalid spuId' });
            }
            filter.spu = new mongoose.Types.ObjectId(spuId);
        }
        if (hasWindow) {
            // Use UTC for cutoff and now
            const cutoff = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: cutoff, $lte: now };
        }

        // Debug: log filter and now
        // console.log("HomeVisit filter:", filter, "now:", now.toISOString());

        const count = await Intervention_Homevisit.countDocuments(filter);
        res.status(200).json({ interventionHomeVisitCount: count });
    } catch (error) {
        console.error("Error fetching intervention home visit count:", error);
        res.status(500).json({ message: "Error fetching intervention home visit count", error: error.message });
    }
};

const getActiveCasesPerSpu = async (req, res) => {
    try {
        const spus = await Spu.find({ is_active: true });
        const activeCasesPerSpu = await Promise.all(
            spus.map(async (spu) => {
                const count = await Sponsored_Member.countDocuments({ spu: spu._id, is_active: true });
                return { spu_name: spu.spu_name, count };
            })
        );
        res.status(200).json(activeCasesPerSpu);
    } catch (error) {
        console.error("Error fetching active cases per SPU:", error);
        res.status(500).json({ message: "Error fetching active cases per SPU", error: error.message });
    }
};

function normalizeRatio(a, b) {
  if (a === 0 && b === 0) return { worker: 0, case: 0, ratio: "0 : 0" };
  if (a === 0) return { worker: 0, case: b, ratio: "0 : 1" };
  if (b === 0) return { worker: a, case: 0, ratio: "1 : 0" };

  if (a <= b) {
    const val = Number((b / a).toFixed(2));
    return { worker: 1, case: val, ratio: `1 : ${val}` };
  }
  const val = Number((a / b).toFixed(2));
  return { worker: val, case: 1, ratio: `${val} : 1` };
}

// --- Worker to Case Ratio ---
const getWorkerToCaseRatio = async (req, res) => {
  try {
    const { spuId } = req.query;

    const empFilter = { role: "sdw" };
    const caseFilter = { is_active: true };

    if (spuId && mongoose.Types.ObjectId.isValid(spuId)) {
      const oid = new mongoose.Types.ObjectId(spuId);
      empFilter.spu = oid;
      caseFilter.spu = oid;
    }

    const [workerCount, caseCount] = await Promise.all([
      Employee.countDocuments(empFilter),
      Sponsored_Member.countDocuments(caseFilter),
    ]);

    // Avoid divide-by-zero
    const workerRatio = workerCount > 0 ? 1 : 0;
    const caseRatio = workerCount > 0 ? Number((caseCount / workerCount).toFixed(2)) : 0;

    return res.status(200).json({
      workerRatio,
      caseRatio,
      workers: workerCount,
      cases: caseCount,
      scopedToSpu: !!spuId,
    });
  } catch (error) {
    console.error("Error fetching worker to case ratio:", error);
    res.status(500).json({ message: "Error fetching worker to case ratio", error: error.message });
  }
};


// --- Worker to Supervisor Ratio ---
const getWorkerToSupervisorRatio = async (req, res) => {
  try {
    const { spuId } = req.query;

    const workerFilter = { role: "sdw" };
    const supervisorFilter = { role: "supervisor" };

    if (spuId && mongoose.Types.ObjectId.isValid(spuId)) {
      const oid = new mongoose.Types.ObjectId(spuId);
      workerFilter.spu = oid;
      supervisorFilter.spu = oid;
    }

    const [workerCount, supervisorCount] = await Promise.all([
      Employee.countDocuments(workerFilter),
      Employee.countDocuments(supervisorFilter),
    ]);

    const workerRatio = 1;
    const supervisorRatio = supervisorCount > 0 ? Number((workerCount / supervisorCount).toFixed(2)) : 0;

    return res.status(200).json({
      workerRatio,
      supervisorRatio,
      workers: workerCount,
      supervisors: supervisorCount,
      scopedToSpu: !!spuId,
    });
  } catch (error) {
    console.error("Error fetching worker to supervisor ratio:", error);
    res.status(500).json({ message: "Error fetching worker to supervisor ratio", error: error.message });
  }
};

const getEmployeeCountsByRole = async (req, res) => {
  try {
    const { spuId, days } = req.query;
    const filter = {};

    // Filter by SPU if provided
    if (spuId && mongoose.Types.ObjectId.isValid(spuId)) {
      filter.spu_id = new mongoose.Types.ObjectId(spuId);
    }

    // Filter by recent hires if `days` is provided
    let cutoff = null;
    if (days && Number(days) > 0) {
      const now = new Date();
      cutoff = new Date(now.getTime() - Number(days) * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: cutoff, $lte: new Date() };
    }

    // Only count sdw, supervisor, head roles
    const allowedRoles = ["sdw", "supervisor", "head"];

    const roleCounts = await Employee.aggregate([
      { $match: { ...filter, role: { $in: allowedRoles } } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation results into object
    const formattedCounts = roleCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Map backend role keys → readable names
    const roleDistribution = {
      "Social Development Workers": formattedCounts.sdw || 0,
      Supervisors: formattedCounts.supervisor || 0,
      Heads: formattedCounts.head || 0,
    };

    // Count how many new employees in the given period (if days provided)
    const newEmployees = days && Number(days) > 0
      ? await Employee.countDocuments({ ...filter, role: { $in: allowedRoles } })
      : 0;

    return res.status(200).json({
      workerMetrics: {
        newEmployees,
        roleDistribution,
      },
      scopedToSpu: !!spuId,
      days: Number(days) || 0,
      from: cutoff ? cutoff.toISOString() : null,
      to: cutoff ? new Date().toISOString() : null,
    });
  } catch (error) {
    console.error("Error fetching employee counts by role:", error);
    res.status(500).json({
      message: "Error fetching employee counts by role",
      error: error.message,
    });
  }
};

//case demographic routes
// 1. Gender Distribution
const getGenderDistribution = async (req, res) => {
  try {
    const maleCount = await Sponsored_Member.countDocuments({ sex: 'Male', is_active: true });
    const femaleCount = await Sponsored_Member.countDocuments({ sex: 'Female', is_active: true });
    res.status(200).json({ male: maleCount, female: femaleCount });
  } catch (error) {
    console.error("Error fetching gender distribution:", error);
    res.status(500).json({ message: "Error fetching gender data", error: error.message });
  }
};

// 2. Average Age of Clients
const getAverageAge = async (req, res) => {
  try {
    const clients = await Sponsored_Member.find({ is_active: true }, 'dob');
    if (clients.length === 0) {
      return res.status(200).json({ averageAge: 0 });
    }

    const now = new Date();
    const totalAge = clients.reduce((sum, client) => {
      const dob = new Date(client.dob);
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      return sum + age;
    }, 0);

    const averageAge = totalAge / clients.length;
    res.status(200).json({ averageAge: parseFloat(averageAge.toFixed(1)) });
  } catch (error) {
    console.error("Error fetching average age:", error);
    res.status(500).json({ message: "Error calculating average age", error: error.message });
  }
};

// 3. Average Number of Family Members per Case
const getAverageFamilySizeByLastName = async (req, res) => {
  try {
    const result = await Family_Member.aggregate([
      {
        $group: {
          _id: '$last_name',        
          count: { $sum: 1 }        
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: '$count' } 
        }
      }
    ]);

    const average = result.length > 0 ? result[0].average : 0;
    res.status(200).json({ averageFamilySize: parseFloat(average.toFixed(1)) || 0 });
  } catch (error) {
    console.error('Error calculating average family size by last name:', error);
    res.status(500).json({ message: 'Failed to compute average family size' });
  }
};

// 4. Average Family Income (only earners: income > 0)
const getAverageFamilyIncome = async (req, res) => {
  try {
    // Accept caseIds from query or body (comma-separated or array)
    let caseIds = [];
    if (req.body.caseIds && Array.isArray(req.body.caseIds)) {
      caseIds = req.body.caseIds;
    } else if (req.query.caseIds) {
      caseIds = Array.isArray(req.query.caseIds)
        ? req.query.caseIds
        : String(req.query.caseIds).split(',').map(id => id.trim());
    }

    // If no caseIds provided, fallback to all active cases
    if (caseIds.length === 0) {
      const cases = await Sponsored_Member.find({ is_active: true }, '_id');
      caseIds = cases.map(c => c._id);
    }

    if (caseIds.length === 0) {
      return res.status(200).json({ averageFamilyIncome: 0 });
    }

    // Convert to ObjectId if needed
    caseIds = caseIds.map(id => mongoose.Types.ObjectId(id));

    const result = await Family_Member.aggregate([
      { $match: { sponsored_member_id: { $in: caseIds }, income: { $gt: 0 } } },
      { $group: { _id: "$sponsored_member_id", totalIncome: { $sum: "$income" } } }
    ]);

    if (result.length === 0) {
      return res.status(200).json({ averageFamilyIncome: 0 });
    }

    const totalIncome = result.reduce((sum, fam) => sum + fam.totalIncome, 0);
    const averageIncome = totalIncome / caseIds.length;
    res.status(200).json({ averageFamilyIncome: parseFloat(averageIncome.toFixed(2)) });
  } catch (error) {
    console.error("Error fetching average family income:", error);
    res.status(500).json({ message: "Error calculating family income", error: error.message });
  }
};

// 5. Average Number of Interventions per Case
const getAverageInterventionsPerCase = async (req, res) => {
  try {
    const cases = await Sponsored_Member.find({ is_active: true }, 'interventions');
    if (cases.length === 0) {
      return res.status(200).json({ averageInterventions: 0 });
    }

    const totalInterventions = cases.reduce((sum, c) => sum + (c.interventions?.length || 0), 0);
    const average = totalInterventions / cases.length;
    res.status(200).json({ averageInterventions: parseFloat(average.toFixed(1)) });
  } catch (error) {
    console.error("Error fetching average interventions:", error);
    res.status(500).json({ message: "Error calculating interventions per case", error: error.message });
  }
};

// 6. Average Case Time Length in days (need updated model from branch creationdate)
const getAverageCaseDuration = async (req, res) => {
  try {
    const activeCases = await Sponsored_Member.find({ is_active: true }, 'createdAt');
    const closedCases = await Case_Closure.find({}).populate({
      path: 'case_id',
      select: 'createdAt',
      model: 'Sponsored Member'
    });

    const durations = [];

    activeCases.forEach(c => {
      const durationMs = Date.now() - new Date(c.createdAt).getTime();
      durations.push(durationMs / (1000 * 60 * 60 * 24)); 
    });

    closedCases.forEach(cc => {
      if (cc.case_id && cc.createdAt) {
        const start = new Date(cc.case_id.createdAt);
        const end = new Date(cc.createdAt);
        if (start && end && end > start) {
          const durationMs = end - start;
          durations.push(durationMs / (1000 * 60 * 60 * 24)); 
        }
      }
    });

    if (durations.length === 0) {
      return res.status(200).json({ averageCaseDurationDays: 0 });
    }

    const avgDays = durations.reduce((a, b) => a + b, 0) / durations.length;
    res.status(200).json({ averageCaseDurationDays: parseFloat(avgDays.toFixed(1)) });
  } catch (error) {
    console.error("Error fetching average case duration:", error);
    res.status(500).json({ message: "Error calculating case duration", error: error.message });
  }
};

const getPeriodCases = async (req, res) => {
  try {
    const rawDays = req.query.days;
    const spuId   = req.query.spuId || '';

    const now = new Date();                         // what the server thinks "now" is
    const daysNum = rawDays === undefined ? 0 : Number(rawDays);
    const hasWindow = Number.isFinite(daysNum) && daysNum > 0;

    const filter = { is_active: true };             // active only
    if (spuId) {
      if (!mongoose.Types.ObjectId.isValid(spuId)) {
        return res.status(400).json({ message: 'Invalid spuId' });
      }
      filter.spu = new mongoose.Types.ObjectId(spuId);
    }

    if (hasWindow) {
      const cutoff = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: cutoff, $lte: now };
    }

    const cases = await Sponsored_Member.find(filter).lean();

    return res.status(200).json({
      cases,
      meta: {
        matched: cases.length,
        received: { spuId, rawDays, daysNum, hasWindow },
        serverClock: now.toISOString(),
        appliedFilter: filter,
        // show 3 example createdAt’s to eyeball
        sampleCreatedAt: cases.slice(0,3).map(c => c.createdAt),
      },
    });
  } catch (error) {
    console.error('Error fetching period cases:', error);
    res.status(500).json({ message: 'Error fetching period cases', error: error.message });
  }
};

const getProgressReportCount = async (req, res) => {
    try {
        const rawDays = req.query.days;
        const spuId = req.query.spuId || '';

        // console.log("Received request for Progress Report Count with spuId:", spuId, "and days:", rawDays);

        const now = new Date();
        const daysNum = rawDays === undefined ? 0 : Number(rawDays);
        const hasWindow = Number.isFinite(daysNum) && daysNum > 0;

        const filter = {};
        // If you want to filter by SPU, you need to join Sponsored_Member (not direct in Progress_Report)
        // If Progress_Report has a reference to Sponsored_Member, e.g. progress_report.sponsored_member_id
        if (spuId) {
            if (!mongoose.Types.ObjectId.isValid(spuId)) {
                return res.status(400).json({ message: 'Invalid spuId' });
            }
            filter.sponsored_member_id = new mongoose.Types.ObjectId(spuId);
        }
        if (hasWindow) {
            const cutoff = new Date(now.getTime() - daysNum * 24 * 60 * 60 * 1000);
            filter.createdAt = { $gte: cutoff, $lte: now };
        }

        // console.log("ProgressReport filter:", filter, "now:", now.toISOString());

        const count = await Progress_Report.countDocuments(filter);
        res.status(200).json({ progressReportCount: count });
    } catch (error) {
        console.error("Error fetching progress report count:", error);
        res.status(500).json({ message: "Error fetching progress report count", error: error.message });
    }
};

const getFamilyDetails = async (req, res) => {
  try {
    // 1) Parse caseIds from body or query
    let caseIds = [];
    if (Array.isArray(req.body?.caseIds)) caseIds = req.body.caseIds;
    else if (req.query.caseIds) {
      caseIds = Array.isArray(req.query.caseIds)
        ? req.query.caseIds
        : String(req.query.caseIds).split(',').map(s => s.trim());
    }

    if (caseIds.length === 0) {
      return res.status(200).json({ averageFamilyIncome: 0, averageFamilyMembers: 0 });
    }

    // 2) Normalize to ObjectId
    const caseObjectIds = caseIds
      .map(id => {
        try { return new mongoose.Types.ObjectId(id); } catch { return null; }
      })
      .filter(Boolean);

    if (caseObjectIds.length === 0) {
      return res.status(200).json({ averageFamilyIncome: 0, averageFamilyMembers: 0 });
    }

    // 3) Aggregate via Family Relationship → Family Member
    //    NOTE: collection name for model "Family Member" in $lookup is the lowercased/pluralized one.
    //    With the given model name, Mongoose will use "family members".
    const groups = await Family_Relationship.aggregate([
      { $match: { sponsor_id: { $in: caseObjectIds } } },
      {
        $lookup: {
          from: 'family members',      // <- matches your model name "Family Member"
          localField: 'family_id',
          foreignField: '_id',
          as: 'member'
        }
      },
      { $unwind: '$member' },
      {
        $group: {
          _id: '$sponsor_id',
          membersCount: { $sum: 1 },
          totalIncome: {
            $sum: {
              $cond: [{ $gt: ['$member.income', 0] }, '$member.income', 0]
            }
          }
        }
      }
    ]);

    // 4) Post-process to include cases with 0 relationships
    const membersByCase = new Map(groups.map(g => [String(g._id), g.membersCount]));
    const incomeByCase  = new Map(groups.map(g => [String(g._id), g.totalIncome]));

    let totalMembers = 0;
    let incomeCasesCount = 0;  // number of cases where totalIncome > 0
    let totalIncomeAllIncomeCases = 0;

    for (const id of caseObjectIds) {
      const key = String(id);
      const members = membersByCase.get(key) || 0;
      totalMembers += members;

      const inc = incomeByCase.get(key) || 0;
      if (inc > 0) {
        incomeCasesCount += 1;
        totalIncomeAllIncomeCases += inc;
      }
    }

    const averageFamilyMembers =
      caseObjectIds.length > 0 ? Number((totalMembers / caseObjectIds.length).toFixed(2)) : 0;

    const averageFamilyIncome =
      incomeCasesCount > 0 ? Number((totalIncomeAllIncomeCases / incomeCasesCount).toFixed(2)) : 0;

    return res.status(200).json({
      averageFamilyMembers,
      averageFamilyIncome
    });
  } catch (error) {
    console.error('Error fetching family details:', error);
    return res.status(500).json({ message: 'Error calculating family details', error: error.message });
  }
};

function fillMissingDates(startDate, endDate, data) {
  const filled = [];
  const countsByDate = Object.fromEntries(data.map(d => [d._id.date, d.count]));

  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    filled.push({
      date: dateStr,
      count: countsByDate[dateStr] || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}


const clampToMostRecentWindow = async (Model, baseFilter, days) => {
  const now = new Date();

  // Earliest available date (so we don’t start before the dataset exists)
  const first = await Model.find(baseFilter).sort({ createdAt: 1 }).limit(1).lean();
  const earliest = first.length ? new Date(first[0].createdAt) : now;

  // Requested start (if days > 0), otherwise earliest
  const requestedStart = (Number.isFinite(days) && days > 0)
    ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    : earliest;

  // Final start = max(earliest, requestedStart)
  const start = requestedStart > earliest ? requestedStart : earliest;

  return { start, end: now };
};


const getCasesOverTime = async (req, res) => {
  try {
    const { spuId, days } = req.query;
    const daysNum = Number(days ?? 0);

    const baseFilter = { is_active: true };
    if (spuId && mongoose.Types.ObjectId.isValid(spuId)) {
      baseFilter.spu = new mongoose.Types.ObjectId(spuId);
    }

    // Get the most recent X days by finding the latest createdAt and subtracting daysNum
    let start, end;
    end = new Date();
    if (daysNum > 0) {
      // Find the latest createdAt in the filtered set
      const latestEntry = await Sponsored_Member.find(baseFilter).sort({ createdAt: -1 }).limit(1).lean();
      const latestDate = latestEntry.length ? new Date(latestEntry[0].createdAt) : end;
      start = new Date(latestDate.getTime() - daysNum * 24 * 60 * 60 * 1000);
      end = latestDate;
    } else {
      // Use earliest entry if no days param
      const firstEntry = await Sponsored_Member.find(baseFilter).sort({ createdAt: 1 }).limit(1).lean();
      start = firstEntry.length ? new Date(firstEntry[0].createdAt) : end;
    }

    const rangeFilter = { ...baseFilter, createdAt: { $gte: start, $lte: end } };

    const raw = await Sponsored_Member.aggregate([
      { $match: rangeFilter },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const filled = fillMissingDates(start, end, raw);
    res.status(200).json(filled);
  } catch (err) {
    console.error("Error fetching cases over time:", err);
    res.status(500).json({ message: "Error fetching cases over time", error: err.message });
  }
};

const getWorkersOverTime = async (req, res) => {
  try {
    const { spuId, days } = req.query;
    const daysNum = Number(days ?? 0);

    const baseFilter = {};
    if (spuId && mongoose.Types.ObjectId.isValid(spuId)) {
      baseFilter.spu = new mongoose.Types.ObjectId(spuId);
    }

    let start, end;
    end = new Date();
    if (daysNum > 0) {
      const latestEntry = await Employee.find(baseFilter).sort({ createdAt: -1 }).limit(1).lean();
      const latestDate = latestEntry.length ? new Date(latestEntry[0].createdAt) : end;
      start = new Date(latestDate.getTime() - daysNum * 24 * 60 * 60 * 1000);
      end = latestDate;
    } else {
      const firstEntry = await Employee.find(baseFilter).sort({ createdAt: 1 }).limit(1).lean();
      start = firstEntry.length ? new Date(firstEntry[0].createdAt) : end;
    }

    const rangeFilter = { ...baseFilter, createdAt: { $gte: start, $lte: end } };

    const raw = await Employee.aggregate([
      { $match: rangeFilter },
      {
        $group: {
          _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    const filled = fillMissingDates(start, end, raw);
    res.status(200).json(filled);
  } catch (err) {
    console.error("Error fetching workers over time:", err);
    res.status(500).json({ message: "Error fetching workers over time", error: err.message });
  }
};



module.exports = {
    renderHomePage,
    getActiveCasesCount,
    getClosedCasesCount,
    getInterventionCorrespondenceCount,
    getInterventionCounselingCount,
    getInterventionFinancialCount,
    getInterventionHomeVisitCount,
    getActiveCasesPerSpu,
    getWorkerToCaseRatio,
    getWorkerToSupervisorRatio,
    getEmployeeCountsByRole,
    getAverageInterventionsPerCase,
    //case demographics
    getGenderDistribution,
    getAverageAge,
    getAverageFamilySizeByLastName,
    getAverageFamilyIncome,
    getAverageInterventionsPerCase,
    getAverageCaseDuration,
    getPeriodCases,
    getProgressReportCount,
    getFamilyDetails,
    getCasesOverTime,
    getWorkersOverTime
};
