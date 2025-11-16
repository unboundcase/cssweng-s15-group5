// frontend/src/pages/statistics/components/CustomIcons.jsx
import React from 'react';

import activeCasesIcon from '../../../assets/icons/active-cases.png';
import casesClosedIcon from '../../../assets/icons/cases-closed.png';
import newCasesAddedIcon from '../../../assets/icons/new-cases-added.png';
import newInterventionsIcon from '../../../assets/icons/new-interventions.png';
import avgCaseDurationIcon from '../../../assets/icons/avg-case-duration.png';
import avgInterventionsReportsIcon from '../../../assets/icons/avg-interventions-reports.png';

// Each component now accepts a 'className' prop and applies it to the <img> tag.
// The default inline style is removed.
export const ActiveCasesIcon = ({ className }) => <img src={activeCasesIcon} alt="Active Cases" className={className} />;
export const CasesClosedIcon = ({ className }) => <img src={casesClosedIcon} alt="Cases Closed" className={className} />;
export const NewCasesAddedIcon = ({ className }) => <img src={newCasesAddedIcon} alt="New Cases Added" className={className} />;
export const NewInterventionsIcon = ({ className }) => <img src={newInterventionsIcon} alt="New Interventions" className={className} />;
export const AvgCaseDurationIcon = ({ className }) => <img src={avgCaseDurationIcon} alt="Avg Case Duration" className={className} />;
export const AvgInterventionsReportsIcon = ({ className }) => <img src={avgInterventionsReportsIcon} alt="Avg Interventions & Reports" className={className} />;