import { getBaseUrl } from "@/lib/config/api";

export interface ContactFormData {
  name: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data: {
    contactId: number;
    name: string;
    email: string;
    phoneNumber: string;
    subject: string;
    message: string;
    status: string;
    submittedAt: string;
  };
}

export async function submitContact(
  formData: ContactFormData
): Promise<ContactResponse> {
  const url = `${getBaseUrl()}/api/v1/contact`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit contact form");
  }

  return data;
}

