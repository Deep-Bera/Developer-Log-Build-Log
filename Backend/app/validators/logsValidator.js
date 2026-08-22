export const createLogValidator = {
  entryType: {
    notEmpty: {
      errorMessage: "Entry type is required",
    },
    isIn: {
      options: [["Decision", "Blocker", "Win", "Learn"]],
      errorMessage: "Entry type must be decision, blocker, win, or learn",
    },
  },

  content: {
    notEmpty: {
      errorMessage: "Content is required",
    },
    isLength: {
      options: { min: 10, max: 5000 },
      errorMessage: "Content must be between 10 and 5000 characters",
    },
    trim: true,
  },

  tags: {
    optional: true,
    isArray: {
      errorMessage: "Tags must be an array",
    },
  },

  "tags.*": {
    optional: true,
    isString: {
      errorMessage: "Each tag must be a string",
    },
    notEmpty: {
      errorMessage: "Tags cannot be empty strings",
    },
    trim: true,
  },
};

export const updateLogValidator = {
  entryType: {
    optional: true,
    isIn: {
      options: [["Decision", "Blocker", "Win", "Learn"]],
      errorMessage: "Entry type must be decision, blocker, win, or learn",
    },
  },

  content: {
    optional: true,
    notEmpty: {
      errorMessage: "Content cannot be empty",
    },
    isLength: {
      options: { min: 10, max: 5000 },
      errorMessage: "Content must be between 10 and 5000 characters",
    },
    trim: true,
  },

  tags: {
    optional: true,
    isArray: {
      errorMessage: "Tags must be an array",
    },
  },
  "tags.*": {
    isString: {
      errorMessage: "Each tag must be a string",
    },
    notEmpty: {
      errorMessage: "Tags cannot be empty strings",
    },
    trim: true,
  },
};
