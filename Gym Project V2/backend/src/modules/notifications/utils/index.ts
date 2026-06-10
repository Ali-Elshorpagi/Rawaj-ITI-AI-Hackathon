import { beamsClient } from "./pusher";

// 1️⃣ Get Token for User
export const getTokenForUser = async (userId: string) => {
  try {
    const token = await beamsClient.generateToken(userId);
    return token;
  } catch (error) {
    console.error("❌ Error generating token:", error);
    throw new Error("Failed to generate token.");
  }
};

// 3️⃣ Send Notification to Specific Users
export const sendNotificationToUsers = async (
  userIds: string[],
  titles: { [lang: string]: string },
  messages: { [lang: string]: string },
  data: any = {}
) => {
  try {
    await beamsClient.publishToUsers(userIds, {
      apns: {
        aps: {
          alert: { title: titles.en, body: messages.en },
        },
        data: {
          title_ar: titles.ar,
          body_ar: messages.ar,
          ...data,
        },
      },
      fcm: {
        notification: { title: titles.en, body: messages.en },
        data: {
          title_ar: titles.ar,
          body_ar: messages.ar,
          ...data,
        },
      },
    });
    console.log(`✅ Notification sent to users: ${userIds.join(", ")}`);
  } catch (error) {
    console.error("❌ Error sending notification to users:", error);
    throw new Error("Failed to send notification.");
  }
};

// 4️⃣ Send Notification to Interests
export const sendNotificationToInterest = async (
  interest: "users" | "vendors" | "customers",
  titles: { [lang: string]: string },
  messages: { [lang: string]: string },
  data: any = {}
) => {
  try {
    await beamsClient.publishToInterests([interest], {
      apns: {
        aps: {
          alert: { title: titles.en, body: messages.en },
        },
        data: {
          title_ar: titles.ar,
          body_ar: messages.ar,
          ...data,
        },
      },
      fcm: {
        notification: { title: titles.en, body: messages.en },
        data: {
          title_ar: titles.ar,
          body_ar: messages.ar,
          ...data,
        },
      },
    });
    console.log(`✅ Notification sent to interest: ${interest}`);
  } catch (error) {
    console.error("❌ Error sending notification to interest:", error);
    throw new Error("Failed to send notification.");
  }
};
