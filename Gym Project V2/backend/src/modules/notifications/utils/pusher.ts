import PushNotifications from "@pusher/push-notifications-server";
import { config } from "../../../shared/config";

export const beamsClient = new PushNotifications({
  instanceId: config.pusher.instanceId, // Add to your .env
  secretKey: config.pusher.secretKey, // Add to your .env
});
