export function toPlainText(leadership: string) {
  //     PRESIDENT
  //   VICE_PRESIDENT
  //   VP_FINANCE
  //   VP_PROFDEV
  //   VP_ENGAGEMENT
  //   VP_OUTREACH
  //   VP_MARKETING
  //   VP_TECHDEV
  //   SECRETARY
  //   CHAIR_INFRASTRUCTURE
  //   CHAIR_CONFERENCES

  switch (leadership) {
    case "PRESIDENT":
      return "President";
    case "VICE_PRESIDENT":
      return "Vice President";
    case "VP_FINANCE":
      return "Director of Finance";
    case "VP_PROFDEV":
      return "Director of Proffesional Development";
    case "VP_ENGAGEMENT":
      return "Director of Engagement";
    case "VP_OUTREACH":
      return "Director of Outreach";
    case "VP_MARKETING":
      return "Director of Marketing";
    case "VP_TECHDEV":
      return "Director of Technical Development";
    case "SECRETARY":
      return "Executive Secretary";
    case "CHAIR_INFRASTRUCTURE":
      return "Infrastructure Chair";
    case "CHAIR_CONFERENCES":
      return "Conference Chair";
    default:
      return "Leader";
  }
}
