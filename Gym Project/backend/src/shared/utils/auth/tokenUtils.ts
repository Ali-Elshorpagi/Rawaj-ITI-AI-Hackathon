import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../../config";
import Token from "../../models/Token";

export async function generateToken(
  id: unknown,
  status = "active",
  expiresIn = "never",
  role?: string
) {
  const payload: { id: unknown; iat: number; role?: string } = {
    id: id,
    iat: Date.now(),
  };
  if (role) {
    payload.role = role;
  }

  const options: {
    expiresIn?: string;
  } = {};
  if (expiresIn !== "never") {
    options.expiresIn = expiresIn;
  }

  const signedToken = jwt.sign(payload, config.jwt.secret, options);

  await Token.create({
    user: id,
    token: "Bearer " + signedToken,
    status,
  });
  return "Bearer " + signedToken;
}

export async function validateToken(token: string) {
  const tokenDoc = await Token.findOne({ token: "Bearer " + token });
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

export async function deleteToken(token: string) {
  await Token.deleteOne({ token: "Bearer " + token });
  return true;
}
