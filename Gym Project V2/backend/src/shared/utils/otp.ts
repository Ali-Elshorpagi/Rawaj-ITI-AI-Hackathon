import otpGenerator from "otp-generator";

export const generateOtp = () => {
  return otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });
};
