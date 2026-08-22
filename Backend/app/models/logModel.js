import { Schema, model } from "mongoose";

const logSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entryType: {
      type: String,
      enum: ["Decision", "Blocker", "Win", "Learn"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    rawTelemetry: {
      type: String,
      default: null,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

const Log = model("Log", logSchema);

export default Log;
