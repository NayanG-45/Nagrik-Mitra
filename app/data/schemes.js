export const schemesData = [
  {
    id: "post-matric-scholarship-up",
    title: "Post-Matric Scholarship Scheme (Uttar Pradesh)",
    category: "scholarship",
    provider: "Social Welfare Department, UP",
    criteria: {
      role: "student",
      location: "Lucknow",
      incomeMax: 200000
    },
    requiredDocs: ["Basic Profile", "Income Certificate", "Caste Certificate"],
    payAttentionPoints: [
      "Income certificate must be issued after April 1st of the current financial year to be valid.",
      "Your bank account must be actively linked to your mobile number via NPCI mapping for Direct Benefit Transfer (DBT)."
    ],
    procedureSteps: [
      "Verify that your profile details match your high school marksheet exactly.",
      "Link your active Income Certificate in the Nagrik Mitra Document Vault.",
      "Submit the application on the official state portal and download the institutional verification copy."
    ],
    applicationUrl: "https://scholarship.up.gov.in/"
  },
  {
    id: "pm-kisan-nidhi",
    title: "PM-Kisan Samman Nidhi",
    category: "subsidy",
    provider: "Ministry of Agriculture",
    criteria: {
      role: "farmer",
      location: "India",
      incomeMax: null
    },
    requiredDocs: ["Basic Profile", "Land Record (Bhulekh)"],
    payAttentionPoints: [
      "Institutional landholders and income-tax payers are strictly excluded from benefit allocations.",
      "Land records must reflect the current applicant's name explicitly."
    ],
    procedureSteps: [
      "Verify rural land registry records map perfectly to your identity profile.",
      "Submit biometric registration at the nearest common service center portal."
    ],
    applicationUrl: "https://pmkisan.gov.in/"
  },
  {
    id: "digital-incentive-female",
    title: "Mukhya Mantri Kanya Sumangala Yojana",
    category: "female",
    provider: "Women and Child Development, UP",
    criteria: {
      role: "student",
      location: "Lucknow",
      incomeMax: 300000,
      gender: "female"
    },
    requiredDocs: ["Basic Profile", "Domicile Certificate", "Family Affidavit"],
    payAttentionPoints: [
      "Scheme benefits are limited to a maximum of two daughters per family unit.",
      "The applicant's family must reside permanently within the state borders."
    ],
    procedureSteps: [
      "Upload verified state domicile certificate to confirm residency status.",
      "Complete the family composition declaration affidavit form."
    ],
    applicationUrl: "https://mksy.up.gov.in/"
  }
];
