/**
 * Migration Script: Convert old 1:1 messages (senderId/receiverId) to
 * the new Conversation-based model (conversationId).
 *
 * Usage: npx tsx src/scripts/migrate-to-conversations.ts
 *
 * This script:
 * 1. Reads all existing messages with senderId + receiverId fields
 * 2. Groups them by unique DM pairs
 * 3. Creates a Conversation document for each pair
 * 4. Updates each message to set conversationId and unset receiverId + read
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chatbridge";

async function migrate() {
  console.log("Connecting to database...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected.");

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("No database connection");
  }

  const messagesCollection = db.collection("messages");
  const conversationsCollection = db.collection("conversations");

  // Step 1: Find all unique sender/receiver pairs
  console.log("Finding unique DM pairs...");
  const pairs = await messagesCollection
    .aggregate([
      {
        $match: {
          receiverId: { $exists: true },
          conversationId: { $exists: false },
        },
      },
      {
        $group: {
          _id: {
            pair: {
              $cond: [
                { $lt: ["$senderId", "$receiverId"] },
                { a: "$senderId", b: "$receiverId" },
                { a: "$receiverId", b: "$senderId" },
              ],
            },
          },
        },
      },
    ])
    .toArray();

  console.log(`Found ${pairs.length} unique DM pairs.`);

  let migratedMessages = 0;

  for (const pair of pairs) {
    const { a, b } = pair._id.pair;

    // Step 2: Create a Conversation for this pair
    const existingConv = await conversationsCollection.findOne({
      type: "dm",
      members: { $all: [a, b], $size: 2 },
    });

    let conversationId;
    if (existingConv) {
      conversationId = existingConv._id;
      console.log(`  Reusing existing conversation ${conversationId} for pair ${a} <> ${b}`);
    } else {
      // Find the latest message for lastMessage
      const lastMsg = await messagesCollection.findOne(
        {
          $or: [
            { senderId: a, receiverId: b },
            { senderId: b, receiverId: a },
          ],
        },
        { sort: { createdAt: -1 } }
      );

      const result = await conversationsCollection.insertOne({
        type: "dm",
        name: null,
        avatar: null,
        admin: null,
        members: [a, b],
        lastMessage: lastMsg?._id || null,
        createdAt: new Date(),
        updatedAt: lastMsg?.createdAt || new Date(),
      });
      conversationId = result.insertedId;
      console.log(`  Created conversation ${conversationId} for pair ${a} <> ${b}`);
    }

    // Step 3: Update all messages for this pair
    const updateResult = await messagesCollection.updateMany(
      {
        $or: [
          { senderId: a, receiverId: b },
          { senderId: b, receiverId: a },
        ],
        conversationId: { $exists: false },
      },
      {
        $set: { conversationId },
        $unset: { receiverId: "", read: "" },
      }
    );

    migratedMessages += updateResult.modifiedCount;
    console.log(`  Migrated ${updateResult.modifiedCount} messages.`);
  }

  console.log(`\nMigration complete! ${migratedMessages} messages migrated across ${pairs.length} conversations.`);

  await mongoose.disconnect();
  console.log("Disconnected.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
