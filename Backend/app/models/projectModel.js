import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stack: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["in-progress", "complete"],
      default: "in-progress",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    logCount: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Project = model("Project", projectSchema);

export default Project;
