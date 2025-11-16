const mongoose = require('mongoose');

const SponsoredMemberSchema = new mongoose.Schema({
    sm_number: {
        type: Number,
        required: true,
    },
    spu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Spu',
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    middle_name: {
        type: String,
        default: null,
        required: false,
    },
    sex: {
        type: String,
        enum:['Male','Female'],
        required: true
    },
    present_address:{
        type: String,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    pob: {
        type: String,
        required: true
    },
    civil_status: {
        type: String,
        enum: ['Single','Married','Divorced','Widowed','Separated'],//just add more if you want
        required: true
    },
    edu_attainment: {
        type: String,
        required: false
    },
    religion: {
        type: String,
        required: false
    },
    occupation: {
        type: String,
        required: false
    },
    contact_no: {
        type: String,
        required: false
    },
    relationship_to_client: {
        type: String,
        required: false
    },
    problem_presented: {
        type: String,
        required: false
    },
    observation_findings: {
        type: String,
        required: false
    },
    recommendation: {
        type: String,
        required: false
    },
    interventions: [{
        intervention: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'interventions.interventionType',
            required: true,
        },
        interventionType: { // Reference to the type of intervention schema
            type: String,
            enum: [
                'Intervention Correspondence',
                'Intervention Counseling',
                'Intervention Financial Assessment',
                'Intervention Home Visit'
            ],
            required: true
        },
        intervention_number: {
            type: Number,
            required: false
        },
    }],
    progress_reports: [{
        progress_report: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Progress Report',
            required: false
        },
        report_number: {
            type: Number
        },
    }],
    history_problem: {
        type: String,
        required: false
    },
    assessment: {
        type: String,
        required: false
    },
    evaluation: {
        type: String,
        required: false
    },
    assigned_sdw: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
        required: true
    },
    is_active: {
        type: Boolean,
        required: true
    },
    classifications: {
        type: String,
        required: false
    },
    }, {
    timestamps: true
});

// Automatically assign intervention numbers before saving
SponsoredMemberSchema.pre('save', function(next) {
    if (this.isModified('interventions')) {
        // For new interventions that don't have a number yet
        this.interventions.forEach((intervention, index) => {
            if (!intervention.intervention_number) {
                intervention.intervention_number = index + 1;
            }
        });
    }
    next();
});

const Sponsored_Member = mongoose.model('Sponsored Member', SponsoredMemberSchema);
module.exports = Sponsored_Member;