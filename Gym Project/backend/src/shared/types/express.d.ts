import "express";
import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    returnNull: false; // Always return a fallback instead of null
  }
}

declare global {
  namespace Express {
    interface Response {
      sendSuccess(message: string, data?: unknown, statusCode?: number): void;
    }
    interface Request {
      user: {
        id: string;
        providerId?: string;
        memberId?: string;
        email: string;
        name: string;
        type: string;
        role?: string;
      };
      t: i18next.TFunction; // Add t function to the Request type
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
      filter?: string;
      language: string;
    }
  }
}
