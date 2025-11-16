import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { TextInput, TextArea } from "../../Components/TextField";
import Signature from "../../Components/Signature";
import { AnimatePresence, motion } from "framer-motion";
import SimpleModal from "../../Components/SimpleModal";
import { fetchSession, fetchEmployeeById } from "../../fetch-connections/account-connection";
import Loading from "../loading";
import { fetchCaseData as fetchCaseOriginal } from '../../fetch-connections/case-connection';

// API Import
import {
  fetchFinInterventionData,
  createFinancialForm,
  editFinancialForm,
  fetchAutoFillFinancialData,
  deleteCorrespInterventionForm
} from '../../fetch-connections/financialForm-connection';

import { generateFinancialAssessmentForm } from "../../generate-documents/generate-documents";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function FinancialAssessmentForm() {
  // ===== START :: Setting Data ===== //
  const query = useQuery();
  const action = query.get('action') || "";
  const caseID = query.get('caseID') || "";
  const formID = query.get('formID') || "";

  const [loading, setLoading] = useState(true);
  const [rawCaseData, setRawCaseData] = useState(null);
  const [rawFormData, setRawFormData] = useState(null);

  const [newformID, setnewformID] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [noFormFound, setNoFormFound] = useState(false);
  const [noCaseFound, setNoCaseFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const [data, setData] = useState({
    form_num: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    ch_number: "",
    date: "",
    area_and_subproject: "",
    other_assistance_detail: "",
    problem_presented: "",
    recommendation: "",
  });

  const all_assistance = [
    "Funeral Assistance to the Family Member",
    "Medical Assistance to the Family Member",
    "Food Assistance",
    "IGP Capital",
    "Funeral Assistance to the Sponsored Member",
    "Medical Assistance to the Sponsored Member",
    "Home Improvement/Needs",
    "Other: Please Indicate Below",
  ];

  const [type_of_assistance, setTypeOfAssistance] = useState([]);

  // ===== START :: Create New Form ===== // 
  const viewForm = action !== 'create' ? true : false;

  useEffect(() => {
    setLoadingStage(0);
    const loadSession = async () => {
      const sessionData = await fetchSession();
      const currentUser = sessionData?.user;
      setUser(currentUser);

      if (!currentUser) {
        console.error("No user session found");
        navigate("/unauthorized");
        return;
      }
    };
    loadSession();
  }, []);

  if (!viewForm) {
    useEffect(() => {
      setLoadingStage(1);
      const loadData = async () => {
        setLoading(true);

        const returnData = await fetchAutoFillFinancialData(caseID);
        if (!returnData) {
          setNoCaseFound(true)
          return
        }
        const caseData = returnData.returningData;

        setRawCaseData(caseData);

        setData((prev) => ({
          ...prev,
          form_num: caseData.intervention_number || "",
          first_name: caseData.first_name || "",
          middle_name: caseData.middle_name || "",
          last_name: caseData.last_name || "",
          ch_number: caseData.sm_number || "",
          area_and_subproject: caseData.spu || "",
        }));

        setLoading(false);
      };
      loadData();
      setLoadingStage(2);
      setLoadingComplete(true);
    }, []);
  }

  useEffect(() => {
    setFormNum(data.form_num || "");
    setFirstName(data.first_name || "");
    setMiddleName(data.middle_name || "");
    setLastName(data.last_name || "");
    setCHNumber(data.ch_number || "");
    setAreaAndSubproject(data.area_and_subproject || "");
  }, [data]);

  // ===== END :: Create New Form ===== // 

  // ===== START :: View Form ===== //
  if (viewForm) {
    useEffect(() => {
      const loadFormData = async () => {
        setLoading(true);

        const returnFormData = await fetchFinInterventionData(
          caseID, formID
        );
        if (!returnFormData) {
          setNoFormFound(true)
          return
        }

        const formData = returnFormData.form;
        const caseData = returnFormData.sponsored_member;

        setRawFormData(formData);

        setData((prev) => ({
          ...prev,
          first_name: caseData.first_name || "",
          middle_name: caseData.middle_name || "",
          last_name: caseData.last_name || "",
          ch_number: caseData.sm_number || "",
          area_and_subproject: caseData.spu || "",

          form_num: formData.intervention_number || "",
          date: formData.createdAt || "",
          problem_presented: formData.problem_presented || "",
          recommendation: formData.recommendation || "",
          other_assistance_detail: formData.other_assistance_detail || "",
        }));

        setTypeOfAssistance(formData.type_of_assistance);
        setLoading(false);
      };
      loadFormData();
      setLoadingStage(2);
      setLoadingComplete(true);
    }, []);

    useEffect(() => {
      setFormNum(data.form_num || "");
      setOtherAssistance(data.other_assistance_detail || "");
      setProblemPresented(data.problem_presented || "");
      setRecommendation(data.recommendation || "");
    }, [data]);
  }
  // ===== END :: View Form ===== //

  // ===== END :: Setting Data ===== // 

  // ===== START :: Backend Connection ===== //
  const [errors, setErrors] = useState({});

  const formatListWithAnd = (list) => {
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} and ${list[1]}`;
    return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
  };

  const validateForm = () => {
    const fieldErrors = {};

    if (!type_of_assistance || type_of_assistance.length === 0) {
      fieldErrors.type_of_assistance = "At least one Type of Assistance must be selected.";
    }

    if (
      type_of_assistance?.includes("Other: Please Indicate Below") &&
      (!other_assistance_detail || !other_assistance_detail.trim())
    ) {
      fieldErrors.other_assistance_detail = "Other Assistance Detail is required when 'Other' is selected.";
    }

    if (!problem_presented || !problem_presented.trim()) {
      fieldErrors.problem_presented = "Problem Presented is required.";
    }

    if (!recommendation || !recommendation.trim()) {
      fieldErrors.recommendation = "Recommendation is required.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);

      const fieldNames = Object.values(fieldErrors);
      setModalTitle("Missing / Invalid Fields");
      setModalBody(
        <>
          <p className="font-medium text-gray-700 mb-2">
            Please correct the following errors before submitting:
          </p>
          <p className="body-sm text-gray-700 mb-2">
            (Write N/A if necessary)
          </p>
          <br />
          <div className="flex justify-center">
            <ul className="list-disc list-inside mt-2 text-left">
              {fieldNames.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        </>
      );
      setModalImageCenter(<div className="warning-icon mx-auto" />);
      setModalConfirm(false);
      setShowModal(true);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      setModalOnConfirm(() => () => { });
      setModalOnCancel(() => () => { });
      setModalConfirm(false);
      setIsProcessing(false);
      return false
    };

        // Show confirmation modal
        setModalTitle("Confirm Creation");
        setModalBody("Are you sure you want to save this Financial Assessment Form? This cannot be edited or deleted after creation.");
        setModalImageCenter(<div className="warning-icon mx-auto" />);
        setModalConfirm(true);
        setModalOnConfirm(() => async () => {
            setShowModal(false);
            setIsProcessing(true);

      const created = await handleCreate();
      if (created) {
        setShowSuccessModal(true);
      } else {
        setModalTitle("Error");
        setModalBody("An error occurred while saving. Please try again.");
        setModalImageCenter(<div className="warning-icon mx-auto" />);
        setModalConfirm(false);
        setShowModal(true);
      }

      setIsProcessing(false);
    });
    setModalOnCancel(() => () => {
      setShowModal(false);
    });
    setShowModal(true);
  };

  const handleCreate = async () => {
    const payload = {
      type_of_assistance,
      other_assistance_detail,
      area_and_subproject,
      problem_presented,
      recommendation
    };

    const response = await createFinancialForm(caseID, payload);
    if (response?._id) {
      setnewformID(response._id);
      return true;
    } else {
      return false;
    }
  };

  // < START :: Edit Form > //
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleUpdate = async () => {
    const updatedPayload = {
      type_of_assistance,
      other_assistance_detail,
      area_and_subproject,
      problem_presented,
      recommendation
    };
    await editFinancialForm(formID, updatedPayload);
  };
  // < END :: Edit Form > //

  // < START :: Delete Form > //
  const handleDelete = async () => {
    await deleteCorrespInterventionForm(formID);
  };
  // < END :: Delete Form > //

  // ===== END :: Backend Connection ===== //

  // ===== START :: Use States ===== //
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalBody, setModalBody] = useState("");
  const [modalImageCenter, setModalImageCenter] = useState(null);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalOnConfirm, setModalOnConfirm] = useState(() => () => { });
  const [modalOnCancel, setModalOnCancel] = useState(undefined);

  const [last_name, setLastName] = useState(data?.last_name || "");
  const [middle_name, setMiddleName] = useState(data?.middle_name || "");
  const [first_name, setFirstName] = useState(data?.first_name || "");
  const [ch_number, setCHNumber] = useState(data?.ch_number || "");
  const [form_num, setFormNum] = useState(data?.form_num || "");
  const [area_and_subproject, setAreaAndSubproject] = useState(
    data?.area_and_subproject || "",
  );
  const [other_assistance_detail, setOtherAssistance] = useState(data?.other_assistance_detail || "");
  const [problem_presented, setProblemPresented] = useState(
    data?.problem_presented || "",
  );
  const [recommendation, setRecommendation] = useState(
    data?.recommendation || "",
  );
  const [showConfirm, setShowConfirm] = useState(false);
  // ===== END :: USE STATES ===== //

  // ===== START :: Local Functions ===== //
  const navigate = useNavigate();

  const [savedTime, setSavedTime] = useState(null);
  const timeoutRef = useRef(null);
  const [sectionEdited, setSectionEdited] = useState("");

  const [showErrorOverlay, setShowErrorOverlay] = useState(false);

  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      setShowErrorOverlay(true);
    }
  }, [errors]);

  const handleChange = (section) => (e) => {
    setSectionEdited(section);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setSavedTime(`Saved at ${timeString}`);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setSavedTime(null);
    }, 3000);
  };

  const handleCheckboxChange = (value) => {
    setTypeOfAssistance((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    );
  };
  // ===== END :: Local Functions ===== //

  useEffect(() => {
    const authorizeAccess = async () => {
      if (!user || !data) return;

      const returnData = await fetchCaseOriginal(caseID);
      const assignedSDWId = returnData.assigned_sdw._id;

      if (user?.role === "head") {
        setAuthorized(true);
        return;
      }

      if (user?.role === "sdw") {
        if (assignedSDWId === user._id) {
          setAuthorized(true);
        } else {
          navigate("/unauthorized");
        }
        return;
      }

      if (user?.role === "supervisor") {
        try {
          const res = await fetchEmployeeById(assignedSDWId);
          if (res.ok && res.data.manager === user._id) {
            setAuthorized(true);
            return
          } else {
            navigate("/unauthorized");
          }
        } catch (err) {
          console.error("Supervisor access check failed:", err);
          navigate("/unauthorized");
        }
        return;
      }

      navigate("/unauthorized");
    };

    authorizeAccess();
  }, [data, user]);

  if (!data) return <div>No data found.</div>;

  if (noFormFound) {
    return (
      <main className="flex justify-center w-full p-16">
        <div className="flex w-full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
          <div className="flex w-full justify-between">
            <button
              onClick={() => navigate(`/case/${caseID}`)}
              className="flex items-center gap-5 label-base arrow-group">
              <div className="arrow-left-button"></div>
              Go Back
            </button>
          </div>
          <h3 className="header-md">
            Assessment Form for Special Family Assistance
          </h3>
          <p className="text-3xl red"> No form found. </p>
        </div>
      </main>
    )
  }

  if (noCaseFound) {
    return (
      <main className="flex justify-center w-full p-16">
        <div className="flex w-full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
          <div className="flex w-full justify-between">
            <button
              onClick={() => navigate(`/case/${caseID}`)}
              className="flex items-center gap-5 label-base arrow-group">
              <div className="arrow-left-button"></div>
              Go Back
            </button>
          </div>
          <h3 className="header-md">
            Assessment Form for Special Family Assistance
          </h3>
          <p className="text-3xl red"> No case found. </p>
        </div>
      </main>
    )
  }

  useEffect(() => {
    if (viewForm && form_num) {
      document.title = `Financial Assessment Form #${form_num}`;
    } else if (!viewForm) {
      document.title = `Create Financial Assessment Form`;
    }
  }, [form_num]);

  const loadingColor = loadingStage === 0 ? "red" : loadingStage === 1 ? "blue" : "green";
  if (!loadingComplete || !authorized) return <Loading color={loadingColor} />;

  return (
    <>
      {showModal && (
        <SimpleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={modalTitle}
          bodyText={modalBody}
          imageCenter={modalImageCenter}
          confirm={modalConfirm}
          onConfirm={modalOnConfirm}
          onCancel={modalOnCancel}
        />
      )}

      <main className="flex w-full flex-col items-center justify-center gap-16 rounded-lg border border-[var(--border-color)] p-16">
        <div className="flex w-full justify-between">
          <button
            onClick={() => navigate(`/case/${caseID}`)}
            className="flex items-center gap-5 label-base arrow-group">
            <div className="arrow-left-button"></div>
            Go Back
          </button>
          <h4 className="header-sm self-end">Form #: {form_num}</h4>
        </div>
        <h3 className="header-md">
          Assessment Form for Special Family Assistance
        </h3>

        {/* Type of Assistance */}
        <section className="flex w-full flex-col gap-12">
          <h4 className="header-sm">Type of Assistance</h4>

          <div
            className={`flex justify-center gap-20 px-8 ${
              errors["type_of_assistance"] ? "py-12 border rounded-xl border-red-500" : ""
            }`}
          >
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4 w-full max-w-[40rem]">
              {all_assistance
                .slice(0, windowWidth <= 700 ? 8 : 4)
                .map((item, index, arr) => (
                  <label key={`assistance_left_${index}`} className="body-base flex gap-4">
                    <input
                      type="checkbox"
                      id={`assistance_left_${index}`}
                      value={item}
                      checked={type_of_assistance.includes(item)}
                      onChange={(e) => {
                        handleCheckboxChange(e.target.value);
                        handleChange("Type of Assistance")(e);

                        const isLast = index === arr.length - 1;
                        const isChecked = e.target.checked;
                        if (isLast && !isChecked) setOtherAssistance("");
                      }}
                      disabled={viewForm}
                    />
                    {item}
                  </label>
                ))}

              {/* Textarea in LEFT column ONLY when ≤700px */}
              {windowWidth <= 700 && all_assistance[7] && (
                <>
                  <textarea
                    id="other_assistance_detail"
                    name="other_assistance_detail"
                    value={other_assistance_detail}
                    onChange={(e) => {
                      setOtherAssistance(e.target.value);
                      handleChange("Type of Assistance")(e);
                    }}
                    placeholder="Other Assistance Detail"
                    className={`body-base text-input h-32 w-full ${
                      errors["other_assistance_detail"] ? "text-input-error" : ""
                    }`}
                    disabled={!type_of_assistance.includes(all_assistance[7]) || viewForm}
                  />
                  {errors["other_assistance_detail"] && (
                    <div className="text-red-500 text-sm self-end">
                      {errors["other_assistance_detail"]}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT COLUMN — hidden at ≤700px */}
            {windowWidth > 700 && (
              <div className="flex flex-col gap-4 w-full max-w-[40rem]">
                {all_assistance.slice(4, 8).map((item, index, arr) => (
                  <label key={`assistance_right_${index}`} className="body-base flex gap-4">
                    <input
                      type="checkbox"
                      id={`assistance_right_${index}`}
                      value={item}
                      checked={type_of_assistance.includes(item)}
                      onChange={(e) => {
                        handleCheckboxChange(e.target.value);
                        handleChange("Type of Assistance")(e);

                        const isLast = index === arr.length - 1;
                        const isChecked = e.target.checked;
                        if (isLast && !isChecked) setOtherAssistance("");
                      }}
                      disabled={viewForm}
                    />
                    {item}
                  </label>
                ))}

                {/* Textarea in RIGHT column ONLY when >700px */}
                <textarea
                  id="other_assistance_detail_right"
                  name="other_assistance_detail_right"
                  value={other_assistance_detail}
                  onChange={(e) => {
                    setOtherAssistance(e.target.value);
                    handleChange("Type of Assistance")(e);
                  }}
                  placeholder="Other Assistance Detail"
                  className={`body-base text-input h-32 w-full ${
                    errors["other_assistance_detail"] ? "text-input-error" : ""
                  }`}
                  disabled={!type_of_assistance.includes(all_assistance[7]) || viewForm}
                />
                {errors["other_assistance_detail"] && (
                  <div className="text-red-500 text-sm self-end">
                    {errors["other_assistance_detail"]}
                  </div>
                )}
              </div>
            )}
          </div>

          {errors["type_of_assistance"] && (
            <div className="text-red-500 text-sm self-end">{errors["type_of_assistance"]}</div>
          )}

          {savedTime && sectionEdited === "Type of Assistance" && (
            <p className="text-sm self-end mt-2">{savedTime}</p>
          )}
        </section>

        {/* Identifying Information */}
        <section className="flex w-full flex-col items-center gap-12">
          <h4 className="header-sm w-full">Identifying Information</h4>

          <div className="flex w-full flex-col gap-8 rounded-[0.8rem] border border-[var(--border-color)] p-8">
            <div className="flex border-b border-[var(--border-color)]">
              <h4 className="header-sm">Sponsored Member</h4>
            </div>

            <div
              className={`${
                windowWidth <= 800
                  ? "flex flex-col gap-8"
                  : "inline-flex items-start justify-center gap-16"
              }`}
            >
              <div className="flex flex-col gap-8">
                <TextInput label="Last Name" value={last_name} disabled />
                <TextInput label="First Name" value={first_name} disabled />
                <TextInput label="Middle Name" value={middle_name} disabled />

                {/* Move right-column inputs here when ≤800px */}
                {windowWidth <= 800 && (
                  <>
                    <TextInput label="CH ID #" value={ch_number} disabled />
                    <TextInput label="Area and Sub-Project" value={area_and_subproject} disabled />
                  </>
                )}
              </div>

              {/* Right column visible only when >800px */}
              {windowWidth > 800 && (
                <div className="flex flex-col gap-8">
                  <TextInput label="CH ID #" value={ch_number} disabled />
                  <TextInput label="Area and Sub-Project" value={area_and_subproject} disabled />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Problem Presented */}
        <section className="flex w-full">
          <TextArea
            label="Problem Presented"
            value={problem_presented}
            setValue={setProblemPresented}
            error={errors["problem_presented"]}
            disabled={viewForm}
            placeholder="Problem Presented"
          />
        </section>

        {/* Recommendation */}
        <section className="flex w-full">
          <TextArea
            label="Recommendation"
            value={recommendation}
            setValue={setRecommendation}
            error={errors["recommendation"]}
            disabled={viewForm}
            placeholder="Recommendation"
          />
        </section>

        {/* Signature (optional)
        <div className="flex w-full flex-col gap-16 px-16 pt-24">
          <div className="flex w-full justify-between">
            <Signature label="Prepared by:" signer="Social Development Worker" />
            <Signature label="Noted by:" signer="OIC-Cluster Coordinator" />
          </div>
          <div className="flex w-full justify-between">
            <Signature label="Checked and Reviewed by:" signer="Finance Staff" />
          </div>
        </div>
        */}

        {/* Buttons */}
        <div className="flex w-full justify-center gap-20">
          {viewForm ? (
            <>
              <button
                className="btn-blue font-bold-label w-min"
                onClick={() =>
                  generateFinancialAssessmentForm(formID)
                }
              >
                Download Form
              </button>
            </>
          ) : (
            <>
              <button
                className={`btn-outline font-bold-label ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
                  }`}
                onClick={() => {
                  if (!isProcessing) {
                    navigate(`/case/${caseID}`);
                  }
                }}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn-primary font-bold-label w-min ${isProcessing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
                  }`}
                onClick={async (e) => {
                  e.preventDefault();
                  setIsProcessing(true);
                  const success = await handleSubmit(e);
                  if (success) {
                    setShowSuccessModal(true);
                  }
                  setIsProcessing(false);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? "Creating..." : "Create Intervention"}
              </button>
            </>
          )}

          {/* Confirm Delete Form */}
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="flex flex-col bg-white p-16 rounded-lg shadow-xl w-full max-w-3xl mx-4 gap-8">
                <h2 className="header-md font-semibold mb-4">Delete Form</h2>
                <p className="label-base mb-6">Are you sure you want to delete this form?</p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() =>
                      setShowConfirm(false)
                    }
                    className="btn-outline font-bold-label"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      await handleDelete();
                      setShowConfirm(false);
                      navigate(`/case/${caseID}`);
                    }}
                    className="btn-primary font-bold-label"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Intervention */}
          <AnimatePresence>
            {showSuccessModal && (
              <motion.div
                key="success-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col bg-white p-16 rounded-lg shadow-xl w-full max-w-3xl mx-4 gap-8"
                >
                  <h2 className="header-sm font-semibold mb-4">
                    Financial Assessment #{form_num} Saved
                  </h2>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        navigate(`/case/${caseID}`);
                      }}
                      className="btn-outline font-bold-label"
                    >
                      Go Back to Case
                    </button>

                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        navigate(`/financial-assessment-form/?action=view&caseID=${caseID}&formID=${newformID}`);
                      }}
                      className="btn-primary font-bold-label"
                    >
                      View Form
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
}

export default FinancialAssessmentForm;
