export const DEV_AUTH_BYPASS_USER_ID = "00000000-0000-0000-0000-000000000001";

export function isDevAuthBypassEnabled() {
    return process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_BYPASS === "1";
}

export function getDevAuthBypassUser() {
    return {
        id: DEV_AUTH_BYPASS_USER_ID,
        name: "Local Exec",
        email: "local.exec@example.com"
    };
}

export function getDevAuthBypassAccount() {
    return {
        id: DEV_AUTH_BYPASS_USER_ID,
        firstName: "Local",
        lastName: "Exec",
        majors: ["Tech"],
        minors: [],
        type: "LEADERSHIP",
        schoolEmail: "local.exec@example.com",
        personalEmail: "local.exec@example.com",
        gradSemester: null,
        headshotBlobURL: null,
        resumeBlobURL: null,
        leaderType: "PRESIDENT",
        phoneNum: null,
        isNew: false,
        gradYear: null,
        pledgeClass: "local",
        hometown: "Local",
        linkedin: null,
        github: null,
        applications: null
    };
}
