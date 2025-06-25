import * as yup from 'yup';

// Schema for the nested familyDetails object
const nestedFamilyDetailsSchema = yup.object().shape({
  fatherOccupation: yup.string().optional(),
  motherOccupation: yup.string().optional(),
  siblings: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Sibling name is required'),
      relation: yup.string().required('Relation is required'),
      age: yup.number().nullable().min(0, 'Age cannot be negative').optional(),
    })
  ).optional(), // Can be optional if user has no siblings
});

// Schema for the nested partnerPreferences object
const nestedPartnerPreferencesSchema = yup.object().shape({
  minAge: yup.number().required('Min Age is required').min(18, 'Min age must be 18+'),
  maxAge: yup.number().required('Max Age is required').moreThan(yup.ref('minAge'), 'Max age must be greater than Min age'),
  minHeight: yup.number().required('Min Height is required'),
  maxHeight: yup.number().required('Max Height is required').moreThan(yup.ref('minHeight'), 'Max height must be greater than Min height'),
  preferredMaritalStatuses: yup.array().of(yup.string()).min(1, 'At least one marital status is required').required('Preferred marital statuses are required'),
  // Add other preferred fields if they are part of the nested object (e.g., preferredReligions, preferredCastes)
  preferredReligions: yup.array().of(yup.string()).optional(),
  preferredCastes: yup.array().of(yup.string()).optional(),
  preferredStates: yup.array().of(yup.string()).optional(),
  preferredOccupations: yup.array().of(yup.string()).optional(),
});

export const basicInfoSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  gender: yup.string().required('Gender is required').oneOf(['Male', 'Female']),
  dateOfBirth: yup.date().required('Date of Birth is required').nullable()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'You must be at least 18 years old'),
  height: yup.number().required('Height is required').positive('Height must be positive').min(100, 'Min height 100cm').max(250, 'Max height 250cm'),
  maritalStatus: yup.string().required('Marital Status is required'),
  motherTongue: yup.string().required('Mother Tongue is required'),
  // Added congregation field
  congregation: yup.string().required('Congregation is required'),
  country: yup.string().required('Country is required'),
  state: yup.string().optional(),
  district: yup.string().optional(),
  profilePicFileId: yup.string().nullable().optional(), // Will be set after upload
  // Hidden validation fields for location validation
  countryValid: yup.boolean().oneOf([true], 'Please select a valid country from the dropdown'),
  stateValid: yup.boolean().when('state', {
    is: (state) => state && state.length > 0,
    then: (schema) => schema.oneOf([true], 'Please select a valid state from the dropdown'),
    otherwise: (schema) => schema.optional()
  }),
  districtValid: yup.boolean().when('district', {
    is: (district) => district && district.length > 0,
    then: (schema) => schema.oneOf([true], 'Please select a valid city from the dropdown'),
    otherwise: (schema) => schema.optional()
  }),
});

export const familySchema = yup.object().shape({
  familyDetails: nestedFamilyDetailsSchema, // Nested schema for family details
});

export const aboutSchema = yup.object().shape({
  aboutMe: yup.string().optional('Please tell us something about yourself').max(2000, 'Maximum 2000 characters'),
  education: yup.string().optional(),
  occupation: yup.string().optional(),
  // Updated hobbies validation to handle both string and array formats
  hobbies: yup.mixed().optional().test(
    'hobbies-format',
    'Hobbies must be a valid format',
    function(value) {
      // Allow empty values
      if (!value || value === '') return true;
      
      // Allow arrays (already processed)
      if (Array.isArray(value)) return true;
      
      // Allow strings (will be processed later)
      if (typeof value === 'string') return true;
      
      // Reject other types
      return false;
    }
  ),
});

export const partnerPreferencesSchema = yup.object().shape({
  partnerPreferences: nestedPartnerPreferencesSchema, // Nested schema for partner preferences
});

export const schemas = [
  basicInfoSchema,
  familySchema,
  aboutSchema,
  partnerPreferencesSchema,
];