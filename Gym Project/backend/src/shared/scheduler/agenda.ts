import Agenda from "agenda";
import { config } from "../config";

const agenda = new Agenda({
  db: {
    address: config.database.uri,
    collection: "agendaJobs",
  },
  processEvery: "60 seconds",
  defaultLockLifetime: 10000,
});

agenda.on("error", (err) => {
  console.error("❌ Agenda connection error:", err);
});

export default agenda;
