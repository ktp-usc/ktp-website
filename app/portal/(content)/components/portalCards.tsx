import {
  Award,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  FileText,
  ListChecks,
  ListPlus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

import { DashboardCard, DashboardGroup } from "./DashboardCard";

const iconClass = "w-4 h-4";

export function ApplicantsCard() {
  return (
    <DashboardCard
      href="/portal/exec/applications"
      title="View Current Applicants"
      description="Review and manage applications."
      icon={<FileText className={iconClass} />}
    />
  );
}

export function RosterCard() {
  return (
    <DashboardCard
      href="/portal/exec/modify-roster"
      title="Modify Chapter Roster"
      description="Update member information."
      icon={<Users className={iconClass} />}
      iconClassName="text-purple-600 bg-purple-100 group-hover:bg-purple-200"
    />
  );
}

export function RunVotingCard() {
  return (
    <DashboardCard
      href="/portal/exec/voting"
      title="Run Chapter Voting"
      description="Create questions and view results."
      icon={<ClipboardList className={iconClass} />}
      iconClassName="text-green-600 bg-green-100 group-hover:bg-green-200"
    />
  );
}

export function VoteCard() {
  return (
    <DashboardCard
      href="/portal/voting"
      title="Vote"
      description="Vote on active questions."
      icon={<TrendingUp className={iconClass} />}
      iconClassName="text-green-600 bg-green-100 group-hover:bg-green-200"
    />
  );
}

export function CareerCenterCard() {
  return (
    <DashboardCard
      href="/portal/career-center"
      title="Career Center"
      description="Company reviews and resources."
      icon={<Briefcase className={iconClass} />}
      iconClassName="text-yellow-600 bg-yellow-100 group-hover:bg-yellow-200"
    />
  );
}

export function ActivePointsCard() {
  return (
    <DashboardCard
      href="/portal/active-points"
      title="Active Points"
      description="Track active requirements."
      icon={<BadgeCheck className={iconClass} />}
      iconClassName="text-teal-700 bg-teal-100 group-hover:bg-teal-200"
      hoverBorderClassName="hover:border-teal-300"
    />
  );
}

export function PledgePointsCard() {
  return (
    <DashboardCard
      href="/portal/pledge-points"
      title="Pledge Points"
      description="Track pledge requirements."
      icon={<Award className={iconClass} />}
      iconClassName="text-teal-700 bg-teal-100 group-hover:bg-teal-200"
      hoverBorderClassName="hover:border-teal-300"
    />
  );
}

export function MemberProgressCard() {
  return (
    <DashboardCard
      href="/portal/exec/member-progress"
      title="Member Progress"
      description="Track chapter requirement completion."
      icon={<ListChecks className={iconClass} />}
      iconClassName="text-green-700 bg-green-100 group-hover:bg-green-200"
    />
  );
}

export function RequirementsCard() {
  return (
    <DashboardCard
      href="/portal/exec/requirements"
      title="Requirements"
      description="Create requirements for the chapter."
      icon={<ListPlus className={iconClass} />}
      iconClassName="text-green-700 bg-green-100 group-hover:bg-green-200"
    />
  );
}

export function EventsCard() {
  return (
    <DashboardCard
      href="/portal/exec/events"
      title="Events"
      description="Create events for the chapter."
      icon={<CalendarPlus className={iconClass} />}
      iconClassName="text-green-700 bg-green-100 group-hover:bg-green-200"
    />
  );
}

export function RusheesCard() {
  return (
    <DashboardCard
      href="/portal/rushees"
      title="Rushees"
      description="Leave impressions on applicants."
      icon={<Users className={iconClass} />}
    />
  );
}

export function ChapterCalendarCard() {
  return (
    <DashboardCard
      href="/portal/calendar"
      title="Chapter Calendar"
      description="Chapter events and meetings."
      icon={<CalendarDays className={iconClass} />}
      iconClassName="text-indigo-600 bg-indigo-100 group-hover:bg-indigo-200"
    />
  );
}

export function RosterManagementGroup() {
  return (
    <DashboardGroup
      title="Roster Management"
      description="Applicants, roster, and rushees."
      icon={<Users className={iconClass} />}
      iconClassName="text-purple-600 bg-purple-100 group-hover:bg-purple-200"
      hoverBorderClassName="hover:border-purple-300"
      items={[
        {
          href: "/portal/exec/applications",
          title: "View Current Applicants",
          icon: <FileText className={iconClass} />,
        },
        {
          href: "/portal/exec/modify-roster",
          title: "Modify Chapter Roster",
          icon: <Users className={iconClass} />,
        },
        {
          href: "/portal/rushees",
          title: "Rushees",
          icon: <UserPlus className={iconClass} />,
        },
      ]}
    />
  );
}

export function VoteGroup() {
  return (
    <DashboardGroup
      title="Vote"
      description="Run voting and cast ballots."
      icon={<ClipboardList className={iconClass} />}
      iconClassName="text-green-600 bg-green-100 group-hover:bg-green-200"
      hoverBorderClassName="hover:border-green-300"
      items={[
        {
          href: "/portal/exec/voting",
          title: "Run Chapter Voting",
          icon: <ClipboardList className={iconClass} />,
        },
        {
          href: "/portal/voting",
          title: "Vote",
          icon: <TrendingUp className={iconClass} />,
        },
      ]}
    />
  );
}

export function EngagementGroup() {
  return (
    <DashboardGroup
      title="Engagement"
      description="Progress, requirements, events, and calendar."
      icon={<CalendarDays className={iconClass} />}
      iconClassName="text-indigo-600 bg-indigo-100 group-hover:bg-indigo-200"
      hoverBorderClassName="hover:border-indigo-300"
      items={[
        {
          href: "/portal/exec/member-progress",
          title: "Member Progress",
          icon: <ListChecks className={iconClass} />,
        },
        {
          href: "/portal/exec/requirements",
          title: "Requirements",
          icon: <ListPlus className={iconClass} />,
        },
        {
          href: "/portal/exec/events",
          title: "Events",
          icon: <CalendarPlus className={iconClass} />,
        },
        {
          href: "/portal/calendar",
          title: "Chapter Calendar",
          icon: <CalendarDays className={iconClass} />,
        },
      ]}
    />
  );
}
