// ======== Local Variables ======== // 
// Default Case
const defaultCaseData = {
     first_name: '',
     middle_name: '',
     last_name: '',

     dob: '',
     pob: '',
     sex: '',
     religion: '',

     civil_status: '',
     edu_attainment: '',
     occupation: '',
     present_address: '',
     contact_no: '',

     relationship_to_client: '',

     sm_number: '',
     sub_id: '0',
     sdw_id: '0',
     spu_id: 'MNL',
};
// Saved ID locally so no need to pass evertyime
var localID
const apiUrl = import.meta.env.VITE_API_URL || '/api';
// ======== API calls ======== // 
/**
 * Creates a new Sponsored Member case
 * @param {object} newCaseData - the case fields to send
 * @returns {Promise<{ ok: boolean, data: object }>}
 */
export const createNewCase = async (newCaseData) => {
  try {
    const response = await fetch(`${apiUrl}/cases/case-create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCaseData),
    });

    const data = await response.json();
    return { ok: response.ok, data };

  } catch (error) {
    console.error('Error creating new case:', error);
    return { ok: false, data: { message: 'Network error' } };
  }
};

/**
 *   Fetches case data
 * 
 *   @param {*} caseID Case ID to fetch
 *   @returns Case data object 
 */
export const fetchCaseData = async (caseID) => {
     try {
          const response = await fetch(`${apiUrl}/cases/${caseID}`,{
            method: 'GET',
            credentials: 'include',
        });
          if (!response.ok) throw new Error('Failed to fetch case data');

          const rawData = await response.json();
          localID = rawData._id

          // Format DoB
          const formattedDob = rawData.dob
               ? new Date(rawData.dob).toISOString().split('T')[0]
               : '';

          return {
               ...defaultCaseData,
               ...rawData,
               dob: formattedDob,
               // sdw_id: rawData.assigned_sdw?._id || rawData.assigned_sdw || '',
          };
     } catch (err) {
          console.error('Error fetching case data:', err);
          return defaultCaseData;
     }
};


export const fetchCaseBySMNumber = async (smNumber) => {
//   console.log('[fetchCaseBySMNumber] Checking SM Number:', smNumber);

  try {
    const response = await fetch(`${apiUrl}/cases/case-by-sm-number/${smNumber}`,{
            method: 'GET',
            credentials: 'include',
        });

    if (!response.ok) {
      throw new Error(`Case-Connection Error: ${response.status}`);
    }

    const result = await response.json();
//     console.log('[fetchCaseBySMNumber] Result:', result);

    return result; 
  } catch (error) {
    console.error('[fetchCaseBySMNumber] Error:', error);
    return { found: false, message: error.message || 'Error fetching case by CH Number' };
  }
};


/**
 *   Edits chosen data
 * 
 *   @returns updated case data
 */
export const updateCoreCaseData = async (updatedData, caseID) => {
     // console.log("UPDATED DATA:", updatedData);

     try {
          const targetID = caseID || localID;
          const preparedData = {
               sm_number: Number(updatedData.sm_number),
               last_name: updatedData.last_name,
               first_name: updatedData.first_name,
               middle_name: updatedData.middle_name || '',
               spu: updatedData.spu,
               assigned_sdw: updatedData.assigned_sdw,
               is_active: updatedData.is_active ?? true,
               classifications: updatedData.classifications
          };

          // console.log("PREPARED DATA", preparedData);

          if (typeof preparedData.sdw_id === 'number' || preparedData.sdw_id) {
               preparedData.assigned_sdw = preparedData.sdw_id; // Always use a valid ObjectId
               delete preparedData.sdw_id;
          }

          if (preparedData.spu_id) {
               preparedData.spu = preparedData.spu_id;
               delete preparedData.spu_id;
          }

          if (preparedData.sm_number === undefined || preparedData.sm_number === null || preparedData.sm_number === '') {
               throw new Error('sm_number must be a numeric value.');
          }

          if (typeof preparedData.sm_number === 'string') {
               preparedData.sm_number = preparedData.sm_number.trim();
               if (preparedData.sm_number === '') {
                    throw new Error('sm_number must be a numeric value.');
               }
               preparedData.sm_number = Number(preparedData.sm_number);
          }

          if (
               typeof preparedData.sm_number !== 'number' ||
               !Number.isInteger(preparedData.sm_number) ||
               isNaN(preparedData.sm_number)
          ) {
               throw new Error('sm_number must be a whole numeric value.');
          }



          if (!preparedData.middle_name) {
               preparedData.middle_name = '';
          }


          if (preparedData.is_active === undefined) {
               preparedData.is_active = true;
          }


          // if (preparedData.classifications) {
          //      delete preparedData.classifications;
          // }

          // console.log("Sending data:", preparedData);

          const response = await fetch(`${apiUrl}/cases/edit/core/${targetID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(preparedData),
          });

          if (!response.ok) {
               const errorData = await response.json();
               console.error("Validation errors:", errorData);
               throw new Error(`Failed to update case: ${errorData.message}`);
          }

          return await response.json();
     } catch (error) {
          console.error('Error updating case:', error);
          throw error;
     }
};
/**
 *   Edits chosen data
 * 
 *   @returns updated case data
 */
export const updateIdentifyingCaseData = async (updatedData, caseID) => {
     try {
          const targetID = caseID || localID;

          const preparedData = {
               dob: updatedData.dob,
               sex: updatedData.sex,
               civil_status: updatedData.civil_status,
               edu_attainment: updatedData.edu_attainment || "",
               occupation: updatedData.occupation || "",
               pob: updatedData.pob || "",
               religion: updatedData.religion || "",
               contact_no: updatedData.contact_no || "",
               present_address: updatedData.present_address || "",
               relationship_to_client: updatedData.relationship_to_client || "",
          };

          //console.log("Sending data:", preparedData);

          const response = await fetch(`${apiUrl}/cases/edit/identifyingdata/${targetID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(preparedData),
          });

          if (!response.ok) {
               const errorData = await response.json();
               console.error("Validation errors:", errorData);
               throw new Error(`Failed to update case: ${errorData.message}`);
          }

          return await response.json();
     } catch (error) {
          console.error('Error updating case:', error);
          throw error;
     }
};

export const fetchSDWs = async () => {
     try {
          const response = await fetch(`${apiUrl}/cases/getsdw`,{
            method: 'GET',
            credentials: 'include',
        });
          if (!response.ok) throw new Error('Failed to fetch SDWs');
          const data = await response.json();
          // Map to expected format

          return data.map(sdw => ({
               // sdw_id: sdw.sdw_id,
               id: sdw._id,
               username: `${sdw.first_name} ${sdw.last_name}`,
               spu_id: sdw.spu_id || '',
               role: sdw.role,
               manager: sdw.manager,
               is_active: sdw.is_active
          }));

     } catch (err) {
          console.error('Error fetching SDWs:', err);
          return [];
     }
};
/**
 *   Fetches all family members
 * 
 *   @returns All family members object
 */
export const fetchFamilyMembers = async (caseID) => {
     try {
          const response = await fetch(`${apiUrl}/cases/get-family-compositon/${caseID}`,{
            method: 'GET',
            credentials: 'include',
        })

          if (!response.ok) {
               throw new Error(`API error: ${response.status}`)
          }

          const familyMembers = await response.json()
          return familyMembers
     } catch (err) {
          console.error('Error fetching family members:', err)
     }
}

/**
 *   Edits a chosen family member
 * 
 *   @param {*} famID Object ID of the chosen family member
 *   @param {*} updatedData Object containing the updated data
 * 
 *   @returns The updated Family Member object 
 */
export const updateFamilyMember = async (caseID, famID, updatedData) => {
     try {
          const response = await fetch(`${apiUrl}/cases/edit-family-composition/${caseID}/${famID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(updatedData),
          });

          if (!response.ok) {
               throw new Error('Failed to update family member');
          }

          const updated = await response.json();

          return updated;
     } catch (error) {
          console.error('Error updating family member:', error);
          throw error;
     }
};

/**
 *   Adds a family member
 * 
 *   @param {*} updatedData Object containing the updated data
 *   @returns New Family Member object 
 */
export const addFamilyMember = async (caseID, updatedData) => {
     try {
          const response = await fetch(`${apiUrl}/cases/add-family-member/${caseID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(updatedData),
          });

          if (!response.ok) {
               throw new Error('Failed to update family member');
          }

          return await response.json();
     } catch (error) {
          if (errorMsg == "Empty field found.")
               return errorMsg

          console.error('Error adding family member:', error);
          throw error;
     }
}

/**
 *   Deletes a chosen family member
 * 
 *   @param {*} famID Object ID of the family member
 *   @returns The updated list of family members 
 */
export const deleteFamilyMember = async (caseID, famID) => {
     try {
          const response = await fetch(`${apiUrl}/cases/delete-family-member/${caseID}/${famID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
          });

          if (!response.ok) {
               throw new Error('Failed to delete family member');
          }

          return await response.json();
     } catch (error) {
          console.error('Error deleting family member:', error);
          throw error;
     }
}

/**
 *   Edits all fields under problems and findings
 * 
 *   @param {*} caseID Case to edit
 *   @param {*} updatedData Object containing updated fields
 * 
 *   @returns Updated fields
 */

// GOT MODIFIED
// export const editProblemsFindings = async (caseID, updatedData) => {
//      try {
//           const response = await fetch(`${apiUrl}/cases/update-problems-findings/${caseID}`, {
//                method: 'PUT',
//                headers: {
//                     'Content-Type': 'application/json',
//                },
//                body: JSON.stringify(updatedData),
//           });

//           if (!response.ok) {
//                throw new Error('Failed to update problems and findings');
//           }

//           const updated = await response.json();
//           const returnData = {
//                problemPresented: updated.case.problem_presented,
//                historyProblem: updated.case.history_problem,
//                observationFindings: updated.case.observation_findings
//           }
//           return returnData
//      } catch (error) {
//           console.error('Error updating problems and findings:', error);
//           throw error;
//      }
// }

export const editProblemsFindings = async (caseID, updatedData) => {
     try {
          const targetID = caseID || localID;

          const preparedData = {
               problem_presented: updatedData.problem_presented || "",
               history_problem: updatedData.history_problem || "",
               observation_findings: updatedData.observation_findings || "",
          };

          // console.log("Sending preparedData:", preparedData);

          const response = await fetch(`${apiUrl}/cases/update-problems-findings/${targetID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(preparedData),
          });

          if (!response.ok) {
               const errorData = await response.json();
               console.error("Validation errors:", errorData);
               throw new Error(`Failed to update problems and findings: ${errorData.message}`);
          }

          return await response.json();
     } catch (error) {
          console.error('Error updating problems and findings:', error);
          throw error;
     }
};



/**
 *   Edits assessment
 * 
 *   @param {*} caseID Case to edit
 *   @param {*} updatedData Object containing updated fields
 * 
 *   @returns Updated fields
 */
export const editAssessment = async (caseID, updatedData) => {
     try {
          const response = await fetch(`${apiUrl}/cases/update-assessment/${caseID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(updatedData),
          });

          if (!response.ok) {
               throw new Error('Failed to update problems and findings');
          }

          const updated = await response.json();
          const returnData = {
               caseAssessment: updated.case.assessment,
          }
          return returnData
     } catch (error) {
          console.error('Error updating problems and findings:', error);
          throw error;
     }
}

/**
 *   Edits assessment
 * 
 *   @param {*} caseID Case to edit
 *   @param {*} updatedData Object containing updated fields
 * 
 *   @returns Updated fields
 */
export const editEvalReco = async (caseID, updatedData) => {
     try {
          const response = await fetch(`${apiUrl}/cases/update-evaluation-recommendation/${caseID}`, {
               method: 'PUT',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials:'include',
               body: JSON.stringify(updatedData),
          });

          if (!response.ok) {
               throw new Error('Failed to update problems and findings');
          }

          const updated = await response.json();
          const returnData = {
               caseEvalutation: updated.case.evaluation,
               caseRecommendation: updated.case.recommendation
          }
          return returnData
     } catch (error) {
          console.error('Error updating problems and findings:', error);
          throw error;
     }
}


/**
 * Fetches all sponsored member cases.
 * @returns {Promise<Array<{id: string, name: string, ch_number: string, assigned_sdw_name: string|null}>>}
 *   Returns an array of objects with:
 *     - id: string (case ObjectId)
 *     - name: string (full name of the sponsored member)
 *     - ch_number: string (case number)
 *     - assigned_sdw_name: string|null (full name of assigned SDW, or null if none)
 */
export const fetchAllCases = async () => {
     try {
          const response = await fetch(`${apiUrl}/cases`,{
            method: 'GET',
            credentials: 'include',
        });
          if (!response.ok) throw new Error('API error');
          return await response.json();
     } catch (err) {
          console.error('Error fetching all cases:', err);
          return [];
     }
};


/**
 *   Creates a new sponsored member case
 * 
 *   @param {Object} newCaseData Object containing all required case data fields
 *                               including personal information, identifying data,
 *                               and classifications
 * 
 *   @returns {Promise<Object>} The newly created case data with generated ID
 *                              and success message from the server
 * 
 *   @throws {Error} If case creation fails due to validation errors,
 *                   network issues, or server errors
 */
export const addNewCase = async(newCaseData) => {
     try{
          const response = await fetch(`${apiUrl}/cases/case-create`,{
               method: 'POST',
               headers: {
                    'Content-Type': 'application/json',
               },
               credentials: 'include',
               body: JSON.stringify(newCaseData),
          });
          if(!response.ok) throw new Error('Failed to create new case');
          return await response.json();
     }catch(error){
          console.error('Error Creating case: ', error);
          throw error;
     }
};
/**
 * @route   GET ${apiUrl}/cases/case-by-sdw/:sdwID
 * @desc    Fetches all cases assigned to a specific Social Development Worker
 * 
 * @param {string} sdwID - MongoDB ObjectId of the Social Development Worker
 * 
 * @returns {Promise<Array>} Array of simplified case objects with:
 *    - id: Case ObjectId
 *    - name: Full name of sponsored member
 *    - sm_number: Sponsored member number
 *    - spu: Service providing unit code
 *    - is_active: Boolean indicating if the case is active
 *    - assigned_sdw: ObjectId of the assigned social development worker
 *    - assigned_sdw_name: Full name of the assigned social development worker
 * 
 * @throws {Error} If API request fails or network error occurs
 */
export const fetchCasebySDW = async(sdwID) => {
     try{
          const response = await fetch(`${apiUrl}/cases/case-by-sdw/${sdwID}`,{
            method: 'GET',
            credentials: 'include',
        });
          if(!response.ok) throw new Error('Failed to fetch sdw cases');
          return await response.json();
     }catch(error){
          console.error('Error Fetching cases: ', error);
          throw error;
     }
};

/**
 * Deletes multiple clients by their IDs
 * @param {Array<string>} clientIDs Array of client ObjectIds
 * @returns {Promise<{ok: boolean, deletedCount: number}>}
 */
export const deleteClients = async (clientIDs) => {
  try {
    const response = await fetch(`${apiUrl}/cases/delete-multiple`, {
      method: 'PUT', // or DELETE if the backend in charge prefers
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ids: clientIDs }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete clients');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting clients:', error);
    throw error;
  }
};
