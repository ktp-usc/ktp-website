/**
 * Creates one coffee chat event for each brother, chair, and leadership account.
 *
 * Preview:
 *   npx tsx scripts/create-coffee-chat-events.ts
 *
 * Write to the database:
 *   npx tsx scripts/create-coffee-chat-events.ts --apply
 *
 * Options:
 *   --requirement "Coffee Chats"   Point requirement name stored on each event
 *   --date 2026-09-23T12:00        Start date shown on the event cards
 *   --audience pledges|all         Who can check in. Default: pledges
 */

import { prisma } from "../lib/prisma";
import {
  ACTIVE_EVENT_ACCOUNT_TYPES,
  generateAttendanceCode,
} from "../lib/events";

const HOST_MARKER = "coffee-chat-host:";

function argValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function displayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

function uniqueAttendanceCode(used: Set<string>) {
  let code = generateAttendanceCode();
  while (used.has(code)) {
    code = generateAttendanceCode();
  }
  used.add(code);
  return code;
}

async function resolveRequirementName(explicit?: string) {
  if (explicit) return explicit;

  const matches = await prisma.pointRequirement.findMany({
    where: { name: { contains: "coffee", mode: "insensitive" } },
    select: { name: true, memberType: true, semester: true },
    orderBy: { name: "asc" },
  });

  const names = [...new Set(matches.map((requirement) => requirement.name))];
  if (names.length === 1) return names[0];

  if (names.length === 0) {
    throw new Error(
      'No point requirement name contains "coffee". Pass --requirement "Coffee Chats".',
    );
  }

  const listed = matches
    .map(
      (requirement) =>
        `  - ${requirement.name} (${requirement.memberType}, ${requirement.semester})`,
    )
    .join("\n");
  throw new Error(
    `Multiple coffee requirements found. Pass --requirement with the exact name:\n${listed}`,
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  const requirementName = await resolveRequirementName(argValue("--requirement"));
  const audience = argValue("--audience") ?? "pledges";
  if (audience !== "pledges" && audience !== "all") {
    throw new Error('--audience must be "pledges" or "all"');
  }

  const dateArg = argValue("--date");
  const startDate = dateArg ? new Date(dateArg) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    throw new Error(`Invalid --date value: ${dateArg}`);
  }

  const matchingRequirement = await prisma.pointRequirement.findFirst({
    where: { name: requirementName },
    select: { id: true },
  });
  if (!matchingRequirement) {
    console.warn(
      `No point requirement is named "${requirementName}". Events will be created, but check-ins will not award points until that requirement exists.`,
    );
  }

  const [accounts, existingEvents, existingCodes] = await Promise.all([
    prisma.accounts.findMany({
      where: { type: { in: [...ACTIVE_EVENT_ACCOUNT_TYPES] } },
      select: { id: true, firstName: true, lastName: true, type: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.event.findMany({
      where: { description: { contains: HOST_MARKER } },
      select: { description: true },
    }),
    prisma.event.findMany({ select: { attendanceCode: true } }),
  ]);

  const hostedAccountIds = new Set(
    existingEvents
      .map((event) => {
        const markerIndex = event.description.indexOf(HOST_MARKER);
        if (markerIndex === -1) return "";
        return event.description.slice(markerIndex + HOST_MARKER.length).trim();
      })
      .filter(Boolean),
  );

  const nameCounts = new Map<string, number>();
  for (const account of accounts) {
    const name = displayName(account.firstName, account.lastName);
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
  }

  const usedCodes = new Set(existingCodes.map((event) => event.attendanceCode));
  const pending = accounts.filter((account) => !hostedAccountIds.has(account.id));
  const skipped = accounts.length - pending.length;

  const rows = pending.map((account) => {
    const name = displayName(account.firstName, account.lastName) || "Member";
    const uniqueName =
      (nameCounts.get(name) ?? 0) > 1 ? `${name} (${account.id.slice(0, 4)})` : name;

    return {
      PointRequirement: requirementName,
      name: `Coffee Chat with ${uniqueName}`,
      description: `Coffee chat hosted by ${name}. ${HOST_MARKER}${account.id}`,
      startDate,
      location: "TBD",
      activesOnly: false,
      pledgesOnly: audience === "pledges",
      attendanceCode: uniqueAttendanceCode(usedCodes),
    };
  });

  console.log(
    `${apply ? "Creating" : "Would create"} ${rows.length} coffee chat event(s) for requirement "${requirementName}".`,
  );
  console.log(`Audience: ${audience === "pledges" ? "PNMs only" : "all members"}`);
  console.log(`Start: ${startDate.toISOString()}`);
  console.log(`Skipping ${skipped} account(s) that already have a coffee chat event.`);
  for (const row of rows) {
    console.log(`  ${row.name}  code ${row.attendanceCode}`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write these events.");
    return;
  }

  if (rows.length === 0) return;

  const result = await prisma.event.createMany({ data: rows });
  console.log(`\nCreated ${result.count} event(s).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit(process.exitCode ?? 0);
  });
