import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);

  const users = await mongoose.connection.db!.collection('users').find().toArray();
  console.log("USERS:");
  users.forEach(u => console.log(`${u._id} | ${u.email} | ${u.name}`));

  const messages = await mongoose.connection.db!.collection('messages').find().toArray();
  console.log("\nMESSAGES:");
  messages.forEach(m => console.log(`${m._id} | ${m.chatId} | ${m.senderId} -> ${m.receiverId} : ${m.messageText}`));

  process.exit(0);
}

run().catch(console.error);
