export const MAX_APPLICATIONS_PER_USER = 3;
export const APPLICATION_LIMIT_REACHED = "application_limit_reached";
export const APPLICATION_FOR_SEMESTER_EXISTS =
  "application_for_semester_exists";

export function splitListField(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type AccountTransferFields = {
  majors: string[];
  minors: string[];
  resumeBlobURL?: string;
  headshotBlobURL?: string;
  phoneNum?: string;
};

/** Map application (and submit-payload) fields onto the matching account columns. */
export function accountTransferFromApplication(input: {
  major?: string | null;
  minor?: string | null;
  resumeUrl?: string | null;
  headshotBlobURL?: string | null;
  phoneNum?: string | null;
}): AccountTransferFields {
  const data: AccountTransferFields = {
    majors: splitListField(input.major),
    minors: splitListField(input.minor),
  };

  const resumeUrl =
    typeof input.resumeUrl === "string" ? input.resumeUrl.trim() : "";
  if (resumeUrl) data.resumeBlobURL = resumeUrl;

  const headshotBlobURL =
    typeof input.headshotBlobURL === "string"
      ? input.headshotBlobURL.trim()
      : "";
  if (headshotBlobURL) data.headshotBlobURL = headshotBlobURL;

  const phoneNum =
    typeof input.phoneNum === "string" ? input.phoneNum.trim() : "";
  if (phoneNum) data.phoneNum = phoneNum;

  return data;
}
