import dotenv from "dotenv";
dotenv.config();
import { connectDatabase } from "../src/shared/database/connect";
import User from "../src/modules/users/user.model";
import { generateToken } from "../src/shared/utils/auth/tokenUtils";
import bcrypt from "bcrypt";
import { config } from "../src/shared/config";

async function main() {
  await connectDatabase();
  const email = "http.test.manager@gymdesk.local";
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: "HTTP Test Manager",
      email,
      phone: "966509999999",
      password: await bcrypt.hash("Password123!", config.bcrypt.saltRounds),
      roles: ["manager"],
      isVerified: true,
    });
  }
  const token = await generateToken(user._id, "active", "never", "manager");
  console.log(token.replace("Bearer ", ""));
  process.exit(0);
}

main();
