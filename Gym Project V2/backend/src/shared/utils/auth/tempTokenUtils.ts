import jwt from "jsonwebtoken";
import { config } from "../../config";
import TempToken from "../../models/TempToken";

export async function generateTempToken(
  id: unknown,
  email: string,
  expiresIn = "15m"
) {
  const payload = {
    id: id,
  };

  const options: {
    expiresIn?: string;
  } = {
    expiresIn,
  };

  const signedToken = jwt.sign(payload, config.jwt.secret, options);

  await TempToken.create({
    email,
    token: signedToken,
  });
  return signedToken;
}

export async function validateTempToken(token: string) {
  const tokenDoc = await TempToken.findOne({ token });
  if (!tokenDoc) {
    return null;
  }
  let data: { id: string } | null = { id: "" };
  jwt.verify(token, config.jwt.secret, (error, user) => {
    if (error) {
      data = null;
      return;
    }
    data = user as { id: string };
  });

  return data;
}

export async function deleteTempToken(token: string) {
  await TempToken.deleteOne({ token });
  return true;
}
