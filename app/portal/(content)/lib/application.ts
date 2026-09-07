export function statusLabel(status: string): string {
  if (status === "NOT_STARTED") return "Not Started";
  if (status === "IN_PROGRESS") return "In Progress";

  switch (status) {
    case "UNDER_REVIEW":
      return "Under Review";
    case "INTERVIEW":
      return "Interview";
    case "WAITLIST":
      return "Waitlist";
    case "BID_OFFERED":
      return "Bid Offered";
    case "BID_DECLINED":
      return "Bid Declined";
    case "BID_ACCEPTED":
      return "Bid Accepted";
    case "CLOSED":
      return "Closed";
    default:
      return String(status);
  }
}

export function statusPillClasses(status: string): string {
  if (status === "NOT_STARTED")
    return "bg-gray-100 text-gray-800 border-gray-200";
  if (status === "IN_PROGRESS")
    return "bg-yellow-100 text-yellow-800 border-yellow-200";

  switch (status) {
    case "BID_ACCEPTED":
      return "bg-green-100 text-green-800 border-green-200";
    case "BID_OFFERED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "INTERVIEW":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "WAITLIST":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "BID_DECLINED":
      return "bg-red-100 text-red-800 border-red-200";
    case "CLOSED":
      return "bg-gray-200 text-gray-900 border-gray-300";
    case "UNDER_REVIEW":
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}
