type Attachment = Partial<{
  filename: string;
  content: string;
  path: string;
  contentType: string;
  encoding: string;
  raw: string;
}>;

export type Configuration = Partial<{
  to: string[];
  from: string;
  subject: string;
  cc: string[] | string;
  bcc: string[] | string;
  method: string;
  apiUrl: string;
  body: string;
  email: string[] | string;
  fileName: string;
  file: string;
  publicKey: string;
  privateKey: string;
  html: string;
  attachments: Attachment[];
}>;

export type ActiveNotificationService = {
  service: string;
  serviceType: string;
  configuration?: Configuration;
  host: string;
  port: string;
  encryption: string;
};

export type NotificationServiceDetails = {
  notificationServiceId: number;
  service: string;
  serviceType: string;
  host: string;
  port: string;
  encryption: string;
  configuration: Configuration;
  isActive: boolean;
  status: boolean;
};

export type EmailTransportConfiguration = {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
};

export type EmailBodyDetails = {
  from: string;
  to: string;
  cc: string[];
  bcc: string[];
  subject: string;
  html: string;
  attachments?: Attachment[];
};

export type EmailAddressData = {
  Email: string;
};

export type SentOtp = {
  email: string;
};
