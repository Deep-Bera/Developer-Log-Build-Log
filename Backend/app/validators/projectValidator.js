export const createProjectValidator = {
  name: {
    exists: {
      errorMessage: "Project name should be provided",
    },
    notEmpty: {
      errorMessage: "Project name cannot be empty",
    },
    isLength: {
      options: {
        min: 2,
        max: 100,
      },
      errorMessage: "Project name must be between 2 and 100 characters",
    },
    trim: true,
  },
  stack: {
    optional: true,
    isArray: {
      errorMessage: "Stack must be an array",
    },
  },
  "stack.*": {
    isString: {
      errorMessage: "Each stack item must be a string",
    },
    notEmpty: {
      errorMessage: "Stack item cannot be empty",
    },
    trim: true,
  },
  startDate: {
    optional: true,
    isISO8601: {
      errorMessage: "Start date must be a valid date",
    },
  },
};

export const updateProjectValidator = {
  name: {
    optional: true,
    notEmpty: {
      errorMessage: "Project name cannot be empty",
    },
    isLength: {
      options: {
        min: 2,
        max: 100,
      },
      errorMessage: "Project name must be between 2 and 100 characters",
    },
    trim: true,
  },
  status: {
    optional: true,
    isIn: {
      options: [["in-progress", "complete"]],
      errorMessage: "Status must be either in-progress or complete",
    },
  },
  isPublic: {
    optional: true,
    isBoolean: {
      errorMessage: "isPublic must be a boolean",
    },
  },
};
