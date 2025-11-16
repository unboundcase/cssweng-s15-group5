import React from "react";
import { useState } from "react";

import {
    updateFamilyMember,
    addFamilyMember,
    deleteFamilyMember,
} from "../fetch-connections/case-connection";

/**
 *   Formats the currency
 *
 *   @param {*} value : Value to be formatted (assumed Number)
 *   @returns : The formatted string
 *
 *   [NOTE]: Applied this in income display; changed the income input to of type number
 */
function currency_Formatter(value) {
    if (typeof value !== "number") return "₱0.00";
    return value.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

const FamilyCard = ({
    clientId,
    member,
    index,
    selectedFamily,
    setSelectedFamily,
    editingFamilyValue,
    setEditingFamilyValue,
    familyMembers,
    setFamilyMembers,
    // handleDeleteFamilyMember, setFamilyToDelete,
    handleDeleteFamilyMember,
    setShowModal,
    setModalTitle,
    setModalBody,
    setModalImageCenter,
    setModalConfirm,
    setModalOnConfirm,
    editable,
    terminated,
    activeMember = true
}) => {
    const isEditing = selectedFamily === index;
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    const handleInputChange = (field, value) => {
        setEditingFamilyValue({ ...editingFamilyValue, [field]: value });
    };

    const handleNumberInputChange = (key, value) => {
        let cleaned = value.replace(/[^\d.]/g, "");
        const parts = cleaned.split(".");
        if (parts.length > 2) {
            cleaned = parts.shift() + "." + parts.join("");
        }
        handleInputChange(key, cleaned);
    };

    const handleAgeInputChange = (key, value) => {
        let cleaned = value.replace(/[^\d]/g, "");
        if (cleaned.length > 1) {
            cleaned = cleaned.replace(/^0+/, "");
        }
        handleInputChange(key, cleaned);
    };

    const handleSave = async () => {
        const requiredFields = [
            { key: "first", label: "First Name" },
            { key: "last", label: "Last Name" },
            { key: "income", label: "Income" },
            { key: "occupation", label: "Occupation" },
            { key: "education", label: "Educational Attainment" },
            { key: "relationship", label: "Relationship to Client" },
            { key: "civilStatus", label: "Civil Status" },
            { key: "status", label: "Living Status" },
        ];

        function formatListWithAnd(arr) {
            if (arr.length === 0) return "";
            if (arr.length === 1) return arr[0];
            if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
            const last = arr[arr.length - 1];
            return `${arr.slice(0, -1).join(", ")}, and ${last}`;
        }

        const missing = [];

        requiredFields.forEach((field) => {
            if (
                !editingFamilyValue[field.key] ||
                editingFamilyValue[field.key].toString().trim() === ""
            ) {
                missing.push(field.label);
            }
        });

        if (editingFamilyValue.age !== undefined) {
            const ageValue = parseInt(editingFamilyValue.age, 10);
            if (isNaN(ageValue)) {
                missing.push("Age must be a number");
            } else if (ageValue < 0) {
                missing.push("Age cannot be negative");
            }
        }

        if (editingFamilyValue.income !== undefined) {
            const incomeStr = editingFamilyValue.income.toString().trim();
            const validNumber = /^\d+(\.\d+)?$/.test(incomeStr);

            if (!validNumber && incomeStr != "") {
                missing.push(
                    "Income must be a valid number with no spaces or extra characters",
                );
            } else if (parseFloat(incomeStr) < 0) {
                missing.push("Income cannot be negative");
            }
        }

        if (missing.length > 0) {
            // console.log(missing)
            setModalTitle("Invalid Fields");
            setModalBody(
                `The following fields are missing or invalid: ${formatListWithAnd(missing)}`,
            );
            setModalImageCenter(<div className="warning-icon mx-auto"></div>);
            setModalConfirm(false);
            setShowModal(true);
            return;
        }

        try {
            const famID = member.id;
            const updatedData = {
                ...editingFamilyValue,
                income: parseFloat(editingFamilyValue.income),
            };
            let updatedFromServer;

            if (member.newlyCreated) {
                updatedFromServer = await addFamilyMember(
                    clientId,
                    updatedData,
                );
            } else {
                const famID = member.id;
                updatedFromServer = await updateFamilyMember(
                    clientId,
                    famID,
                    updatedData,
                );
            }
            const updatedList = [...familyMembers];
            updatedList[index] = {
                ...updatedFromServer,
                newlyCreated: false,
            };

            setFamilyMembers(updatedList);
            setSelectedFamily(null);

            setModalTitle("Success!");
            setModalBody("Family member was successfully updated.");
            setModalImageCenter(<div className="success-icon mx-auto"></div>);
            setModalConfirm(false);
            setShowModal(true);
        } catch (error) {
            console.error("❌ Failed to update family member:", error);
            setModalTitle("Update Error");
            setModalBody(error.message || "Could not update family member.");
            setModalImageCenter(<div className="error-icon mx-auto"></div>);
            setModalConfirm(false);
            setShowModal(true);
        }
    };

    return (
        <div
            className="drop-shadow-card outline-gray flex flex-col gap-5 rounded-xl px-[2rem] py-[3rem]"
            style={{
                // At <= 900px: lock card to 35rem so two-row grid feels balanced
                // Above 900px: keep your original 45rem minimum to preserve layout
                width: windowWidth <= 900 ? "35rem" : "auto",
                minWidth: windowWidth <= 900 ? "35rem" : "45rem",
            }}
        >
            <div className="flex items-center justify-between gap-4">
                {isEditing ? (
                    <h3 className="header-sub">Editing Member</h3>
                ) : (
                    <h3 className="header-sub">
                        {member.last || "-"}, {member.first || "-"} {member.middle || ""}
                    </h3>
                )}

                {activeMember && editable == "sdw" && !terminated && (
                    <button
                        className={
                            isEditing
                                ? "icon-button-setup x-button"
                                : "icon-button-setup dots-button"
                        }
                        onClick={() => {
                            if (isEditing) {
                                setSelectedFamily(null);
                            } else {
                                setEditingFamilyValue({ ...member });
                                setSelectedFamily(index);
                            }
                        }}
                        data-cy={`edit-family-${index}`}
                    ></button>
                )}
            </div>

            <div className="font-label grid grid-cols-[max-content_1fr] items-center gap-5 text-sm">
                {[
                    { label: "First Name", key: "first", type: "text", required: true },
                    { label: "Middle Name", key: "middle", type: "text" },
                    { label: "Last Name", key: "last", type: "text", required: true },
                    { label: "Age", key: "age", type: "number", required: true },
                    { label: "Income", key: "income", type: "number", required: true },
                    {
                        label: "Civil Status",
                        key: "civilStatus",
                        type: "civil-select",
                        required: true,
                    },
                    { label: "Occupation", key: "occupation", type: "text", required: true },
                    {
                        label: "Educational Attainment",
                        key: "education",
                        type: "text",
                        required: true,
                    },
                    {
                        label: "Relationship to Client",
                        key: "relationship",
                        type: "text",
                        required: true,
                    },
                    { label: "Living Status", key: "status", type: "select", required: true },
                ].map(({ label, key, type, required }) => (
                    <React.Fragment key={key}>
                        <div className="font-bold-label">
                            {required && isEditing && <span className="text-red-500">*</span>} {label}
                        </div>
                        {isEditing ? (
                            type === "select" ? (
                                <select
                                    className="text-input"
                                    value={editingFamilyValue[key] || ""}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Living">Living</option>
                                    <option value="Deceased">Deceased</option>
                                </select>
                            ) : type === "civil-select" ? (
                                <select
                                    className="text-input"
                                    value={editingFamilyValue[key] || ""}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    data-cy={`family-select-${key}-${index}`}
                                >
                                    <option value="">Select Civil Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Separated">Separated</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            ) : type === "number" && key === "income" ? (
                                <input
                                    type="number"
                                    placeholder={label}
                                    className="text-input"
                                    value={editingFamilyValue[key] || ""}
                                    onChange={(e) => handleNumberInputChange(key, e.target.value)}
                                    data-cy={`family-input-${key}-${index}`}
                                />
                            ) : type === "number" && key === "age" ? (
                                <input
                                    type="number"
                                    placeholder={label}
                                    className="text-input"
                                    value={editingFamilyValue[key] || ""}
                                    onChange={(e) => handleAgeInputChange(key, e.target.value)}
                                    data-cy={`family-input-${key}-${index}`}
                                />
                            ) : (
                                <input
                                    type={type}
                                    placeholder={label}
                                    className="text-input"
                                    value={editingFamilyValue[key] || ""}
                                    onChange={(e) => handleInputChange(key, e.target.value)}
                                    data-cy={`family-input-${key}-${index}`}
                                />
                            )
                        ) : (
                            <span data-cy={`disp-family-${key}-${index}`}>
                                {(() => {
                                    const value = member[key];
                                    if (key === "age" || key === "income") {
                                        return `: ${!value ? "0" : value || "-"}`;
                                    } else {
                                        return `: ${value || "-"}`;
                                    }
                                })()}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {isEditing && (
                <div className="flex items-center justify-between">
                    <button
                        className="icon-button-setup trash-button mt-5"
                        onClick={() => {
                            if (member.newlyCreated) {
                                const updatedList = [...familyMembers];
                                updatedList.splice(index, 1);
                                setFamilyMembers(updatedList);
                                setSelectedFamily(null);
                                return;
                            }

                            const idToDelete = member.id;

                            setModalTitle("Delete Family Member");
                            setModalBody("Are you sure you want to delete this family member?");
                            setModalImageCenter(<div className="warning-icon mx-auto"></div>);
                            setModalConfirm(true);

                            setModalOnConfirm(() => async () => {
                                try {
                                    await deleteFamilyMember(clientId, member.id);
                                    handleDeleteFamilyMember(member.id);
                                    setShowModal(false);
                                } catch (err) {
                                    console.error("Failed to delete family member:", err);
                                }
                            });

                            setShowModal(true);
                        }}
                        data-cy={`delete-family-${index}`}
                    ></button>
                    <button
                        className="btn-transparent-rounded"
                        onClick={handleSave}
                        data-cy={`save-family-${index}`}
                    >
                        {member.newlyCreated ? "Save Member" : "Save Changes"}
                    </button>
                </div>
            )}
        </div>

    );
};

export default FamilyCard;

{/* <span data-cy={`disp-family-${key}-${index}`}>
                                {key === "status" || key === "civilStatus"
                                    ? `: ${member[key] ? member[key][0].toUpperCase() + member[key].slice(1) : "-"}`
                                    : key === "age"
                                      ? `: ${member[key] === 0 ? 0 : member[key] || "-"}`
                                      : `: ${member[key] || "-"}`}
                            </span> */}