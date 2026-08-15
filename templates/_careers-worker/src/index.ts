export interface Env {
  RESEND_API_KEY: string;
}

const ALLOWED_ORIGINS = new Set(["__CORS_ORIGIN__"]);
const TEAM_EMAIL = "__TEAM_EMAIL__";
const FROM_ADDRESS = "KairosGeist <__TEAM_EMAIL__>";
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB per file
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

function corsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "__CORS_ORIGIN__";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function fileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.at(-1) ?? "").toLowerCase() : "";
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

interface ResendAttachment {
  filename: string;
  content: string;
}

interface ResendEmailPayload {
  from: string;
  to: string;
  reply_to?: string;
  subject: string;
  text: string;
  attachments?: ResendAttachment[];
}

async function sendResendEmail(apiKey: string, payload: ResendEmailPayload): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error (${response.status}): ${text}`);
  }
}

function validateFile(
  file: File | string | null,
  label: string,
  required: boolean,
): File | null | { error: string } {
  if (!(file instanceof File) || file.size === 0) {
    if (required) {
      return { error: `${label} is required` };
    }
    return null;
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: `${label} is too large (max 8MB)` };
  }
  const ext = fileExtension(file.name);
  const mimeOk = !file.type || ALLOWED_MIME_TYPES.has(file.type);
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  if (!mimeOk || !extOk) {
    return { error: `${label} must be a PDF or Word document (.pdf, .doc, .docx)` };
  }
  return file;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/apply") {
      return jsonResponse({ ok: false, error: "Not found" }, 404, origin);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405, origin);
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid form submission" }, 400, origin);
    }

    const name = formData.get("name");
    const email = formData.get("email");
    const position = formData.get("position");

    if (typeof name !== "string" || !name.trim()) {
      return jsonResponse({ ok: false, error: "Name is required" }, 400, origin);
    }
    if (typeof email !== "string" || !isValidEmail(email)) {
      return jsonResponse({ ok: false, error: "A valid email is required" }, 400, origin);
    }
    if (typeof position !== "string" || !position.trim()) {
      return jsonResponse({ ok: false, error: "Position is required" }, 400, origin);
    }

    const cvResult = validateFile(formData.get("cv"), "CV", true);
    if (cvResult === null || "error" in cvResult) {
      const error = cvResult === null ? "CV is required" : cvResult.error;
      return jsonResponse({ ok: false, error }, 400, origin);
    }
    const coverLetterResult = validateFile(formData.get("coverLetter"), "Cover letter", false);
    if (coverLetterResult !== null && "error" in coverLetterResult) {
      return jsonResponse({ ok: false, error: coverLetterResult.error }, 400, origin);
    }

    const cv = cvResult;
    const coverLetter = coverLetterResult;

    let cvBase64: string;
    let coverLetterBase64: string | null;
    try {
      [cvBase64, coverLetterBase64] = await Promise.all([
        fileToBase64(cv),
        coverLetter ? fileToBase64(coverLetter) : Promise.resolve(null),
      ]);
    } catch (err) {
      console.error("Failed to encode uploaded files", err);
      return jsonResponse({ ok: false, error: "Failed to process uploaded files" }, 400, origin);
    }

    const safeName = name.trim().slice(0, 200);
    const safePosition = position.trim().slice(0, 200);

    const attachments: ResendAttachment[] = [{ filename: cv.name || "cv", content: cvBase64 }];
    if (coverLetter && coverLetterBase64) {
      attachments.push({ filename: coverLetter.name || "cover-letter", content: coverLetterBase64 });
    }

    const teamEmail: ResendEmailPayload = {
      from: FROM_ADDRESS,
      to: TEAM_EMAIL,
      reply_to: email,
      subject: `New application: ${safePosition} — ${safeName}`,
      text: `New job application received.\n\nPosition: ${safePosition}\nName: ${safeName}\nEmail: ${email}\n\nCV${coverLetter ? " and cover letter" : ""} attached.`,
      attachments,
    };

    const confirmationEmail: ResendEmailPayload = {
      from: FROM_ADDRESS,
      to: email,
      subject: `Your application for ${safePosition} — KairosGeist`,
      text: `Hi ${safeName},\n\nThanks for applying to KairosGeist for the ${safePosition} role. We've received your CV${coverLetter ? " and cover letter" : ""} and will let you know the outcome either way, once we've had a chance to review it.\n\n— The KairosGeist team`,
    };

    const [teamResult, confirmResult] = await Promise.allSettled([
      sendResendEmail(env.RESEND_API_KEY, teamEmail),
      sendResendEmail(env.RESEND_API_KEY, confirmationEmail),
    ]);

    if (teamResult.status === "rejected") {
      console.error("Failed to send application to team inbox", teamResult.reason);
      return jsonResponse(
        { ok: false, error: "Failed to send your application. Please try again or email us directly." },
        502,
        origin,
      );
    }

    if (confirmResult.status === "rejected") {
      console.error("Failed to send applicant confirmation email", confirmResult.reason);
    }

    return jsonResponse({ ok: true }, 200, origin);
  },
} satisfies ExportedHandler<Env>;
