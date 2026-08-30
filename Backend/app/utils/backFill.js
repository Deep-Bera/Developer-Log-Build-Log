import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Log from "../models/logModel.js";
import generateEmbedding from "../helper/embeddingGenerator.js";

const backfill = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to DB");

    // find all logs with empty embeddings..
    const logs = await Log.find({ embedding: { $size: 0 } });
    console.log(`Found ${logs.length} logs to backfill`);

    for (const log of logs) {
      try {
        log.embedding = await generateEmbedding(log.content);
        await log.save();
        console.log(`Embedded log ${log._id}`);

        // small delay to avoid hitting Gemini rate limits..
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.log(`Failed for log ${log._id}:`, err.message);
      }
    }

    console.log("Backfill complete");
    process.exit(0);
  } catch (err) {
    console.log("Backfill failed:", err.message);
    process.exit(1);
  }
};

backfill();
