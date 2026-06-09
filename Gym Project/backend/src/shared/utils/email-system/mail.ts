import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import { config } from "../../config";

// Define the path to the email templates
const viewPath = path.resolve(__dirname, "../../../../email-templates");

// Create the transporter with TypeScript typing
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure === "true",
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: "TLSv1.2",
  },
});

// Configure Handlebars for email templates
transporter.use(
  "compile",
  hbs({
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: viewPath,
      defaultLayout: "",
    },
    viewPath,
    extName: ".handlebars",
  })
);

export default transporter;
