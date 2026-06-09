import transporter from "./mail";
import nodemailer from "nodemailer";

// Extended interface for mail options
interface ExtendedMailOptions extends nodemailer.SendMailOptions {
  template?: string;
  context?: Record<string, unknown>;
}

interface MailBody {
  subject: string;
  text: string;
  template: string;
}

export class MailerService {
  /**
   * Sends an email using the configured transporter
   * @param email - Recipient's email address
   * @param body - Mail body containing subject, text, and template
   * @param contentMsg - Dynamic content to include in the email template
   * @param userName - Name of the recipient
   */
  async sendMail(
    email: string,
    body: MailBody,
    contentMsg: string,
    userName: string
  ): Promise<void> {
    try {
      const mailOptions: ExtendedMailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: body.subject,
        text: body.text,
        template: body.template,
        context: {
          userName,
          contentMsg,
        },
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("Message sent to user:", info.messageId);
    } catch (error) {
      console.error("Error in mailer:", error);
      throw error; // Optionally rethrow or handle the error
    }
  }
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const body: MailBody = {
      subject: "OTP for account verification",
      text: `Your OTP for account verification is ${otp}`,
      template: "otp",
    };

    await this.sendMail(email, body, otp, "User");
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    const body: MailBody = {
      subject: "Welcome to our platform",
      text: `Welcome to our platform, ${userName}`,
      template: "welcome",
    };

    await this.sendMail(email, body, "Welcome to our platform", userName);
  }
}
