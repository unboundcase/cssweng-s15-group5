const apiUrl = import.meta.env.VITE_API_URL || '/api';

export const fetchActiveCasesCount = async (spuId = "") => {
    try {
        let url = `${apiUrl}/dashboard/active-cases-count`;
        if (spuId) {
            // Add query param for spuId
            url += `?spuId=${encodeURIComponent(spuId)}`;
        }
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch active cases count');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching active cases count:", error);
        throw error;
    }
};

export const fetchClosedCasesCount = async (spuId = "") => {
    try {
        let url = `${apiUrl}/dashboard/closed-cases-count`;
        if (spuId) {
            url += `?spuId=${encodeURIComponent(spuId)}`;
        }
        const response = await fetch(url, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch closed cases count');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching closed cases count:", error);
        throw error;
    }
};

export const fetchInterventionCorrespondenceCount = async (spuId = "", days = 0) => {
    try {
        let url = `${apiUrl}/dashboard/intervention-correspondence-count`;
        const params = [];
        if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
        if (days && Number(days) > 0) params.push(`days=${days}`);
        if (params.length) url += `?${params.join("&")}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch intervention correspondence count');
        return await response.json();
    } catch (error) {
        console.error("Error fetching intervention correspondence count:", error);
        throw error;
    }
};

export const fetchInterventionCounselingCount = async (spuId = "", days = 0) => {
    try {
        let url = `${apiUrl}/dashboard/intervention-counseling-count`;
        const params = [];
        if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
        if (days && Number(days) > 0) params.push(`days=${days}`);
        if (params.length) url += `?${params.join("&")}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch intervention counseling count');
        return await response.json();
    } catch (error) {
        console.error("Error fetching intervention counseling count:", error);
        throw error;
    }
};

export const fetchInterventionFinancialCount = async (spuId = "", days = 0) => {
    try {
        let url = `${apiUrl}/dashboard/intervention-financial-count`;
        const params = [];
        if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
        if (days && Number(days) > 0) params.push(`days=${days}`);
        if (params.length) url += `?${params.join("&")}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch intervention financial count');
        return await response.json();
    } catch (error) {
        console.error("Error fetching intervention financial count:", error);
        throw error;
    }
};

export const fetchInterventionHomeVisitCount = async (spuId = "", days = 0) => {
    try {
        let url = `${apiUrl}/dashboard/intervention-home-visit-count`;
        const params = [];
        if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
        if (days && Number(days) > 0) params.push(`days=${days}`);
        if (params.length) url += `?${params.join("&")}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch intervention home visit count');
        return await response.json();
    } catch (error) {
        console.error("Error fetching intervention home visit count:", error);
        throw error;
    }
};

export const fetchActiveCasesPerSpu = async () => {
    try {
        const response = await fetch(`${apiUrl}/dashboard/active-cases-per-spu`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch active cases per SPU');
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching active cases per SPU:", error);
        throw error;
    }
};

//case demographic
// Gender Distribution
export const fetchGenderDistribution = async () => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/gender-distribution`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch gender distribution');
    return await response.json();
  } catch (error) {
    console.error("Error fetching gender distribution:", error);
    throw error;
  }
};

// Average Age of Clients
export const fetchAverageAge = async () => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/average-age`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch average age');
    return await response.json();
  } catch (error) {
    console.error("Error fetching average age:", error);
    throw error;
  }
};

// Average Family Size (by last name)
export const fetchAverageFamilySize = async () => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/average-family-size`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch average family size');
    return await response.json();
  } catch (error) {
    console.error("Error fetching average family size:", error);
    throw error;
  }
};

// Average Family Income (earners only)
export const fetchAverageFamilyIncome = async () => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/average-family-income`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch average family income');
    return await response.json();
  } catch (error) {
    console.error("Error fetching average family income:", error);
    throw error;
  }
};

// Average Number of Interventions per Case
export const fetchAverageInterventionsPerCase = async () => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/average-interventions`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch average interventions per case');
    return await response.json();
  } catch (error) {
    console.error("Error fetching average interventions per case:", error);
    throw error;
  }
};

// Average Case Duration (in days)
export const fetchAverageCaseDuration = async () => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/average-case-duration`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch average case duration');
    return await response.json();
  } catch (error) {
    console.error("Error fetching average case duration:", error);
    throw error;
  }
};

export const fetchPeriodCases = async (spuId = "", days = 0) => {
    try {
        // console.log("Fetching period cases with spuId:", spuId, "and days:", days);
        let url = `${apiUrl}/dashboard/period-cases`;
        const params = [];
        // Only add params if they are not empty/zero
        if (spuId && spuId !== "") params.push(`spuId=${encodeURIComponent(spuId)}`);
        if (days && Number(days) > 0) params.push(`days=${days}`);
        if (params.length) url += `?${params.join("&")}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch period cases');
        return await response.json();
    } catch (error) {
        console.error("Error fetching period cases:", error);
        throw error;
    }
};

export const fetchProgressReportCount = async (spuId = "", days = 0) => {
    try {
        let url = `${apiUrl}/dashboard/progress-report-count`;
        const params = [];
        if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
        if (days && Number(days) > 0) params.push(`days=${days}`);
        if (params.length) url += `?${params.join("&")}`;
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch progress report count');
        return await response.json();
    } catch (error) {
        console.error("Error fetching progress report count:", error);
        throw error;
    }
};

export const fetchFamilyDetails = async (caseIds = []) => {
  try {
    const response = await fetch(`${apiUrl}/dashboard/family-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ caseIds })
    });
    if (!response.ok) throw new Error('Failed to fetch family details');
    return await response.json();
  } catch (error) {
    console.error("Error fetching family details:", error);
    throw error;
  }
};

export const fetchWorkerToCaseRatio = async (spuId = "") => {
  try {
    let url = `${apiUrl}/dashboard/workertocaseratio`;
    if (spuId) {
      url += `?spuId=${encodeURIComponent(spuId)}`;
    }
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch worker to case ratio');
    return await response.json();
  } catch (error) {
    console.error("Error fetching worker to case ratio:", error);
    throw error;
  }
};

export const fetchWorkerToSupervisorRatio = async (spuId = "") => {
  try {
    let url = `${apiUrl}/dashboard/workertosupervisorratio`;
    if (spuId) {
      url += `?spuId=${encodeURIComponent(spuId)}`;
    }
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch worker to supervisor ratio');
    return await response.json();
  } catch (error) {
    console.error("Error fetching worker to supervisor ratio:", error);
    throw error;
  }
};

export const fetchEmployeeCountsByRole = async (spuId = "", days = 0) => {
  try {
    let url = `${apiUrl}/dashboard/employeecountsbyrole`;
    const params = [];
    if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
    if (days && Number(days) > 0) params.push(`days=${days}`);
    if (params.length) url += `?${params.join("&")}`;
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch employee counts by role');
    return await response.json();
  } catch (error) {
    console.error("Error fetching employee counts by role:", error);
    throw error;
  }
};

export const fetchCasesOverTime = async (spuId = "", days = 7) => {
  try {
    let url = `${apiUrl}/dashboard/cases-over-time`;
    const params = [];
    if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
    if (params.length) url += `?${params.join("&")}`;

    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch cases over time');

    const data = await response.json();

    // ✅ Filter to most recent N days (keep last N elements)
    if (Array.isArray(data) && days > 0) {
      return data.slice(-days);
    }

    return data;
  } catch (error) {
    console.error("Error fetching cases over time:", error);
    throw error;
  }
};

export const fetchWorkersOverTime = async (spuId = "", days = 7) => {
  try {
    let url = `${apiUrl}/dashboard/workers-over-time`;
    const params = [];
    if (spuId) params.push(`spuId=${encodeURIComponent(spuId)}`);
    if (params.length) url += `?${params.join("&")}`;

    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch workers over time');

    const data = await response.json();

    // ✅ Filter to most recent N days (keep last N elements)
    if (Array.isArray(data) && days > 0) {
      return data.slice(-days);
    }

    return data;
  } catch (error) {
    console.error("Error fetching workers over time:", error);
    throw error;
  }
};
