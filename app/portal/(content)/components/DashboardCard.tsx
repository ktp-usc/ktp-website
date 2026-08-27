"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const cardShell =
  "bg-white rounded-lg shadow-sm hover:shadow-md transition-all px-3.5 py-3 text-left border border-gray-200 group dark:bg-gray-900 dark:border-gray-700 duration-300 cursor-pointer";

export function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{children}</div>
  );
}

export function DashboardCard({
  href,
  title,
  description,
  icon,
  iconClassName = "text-blue-600 bg-blue-100 group-hover:bg-blue-200",
  hoverBorderClassName = "hover:border-blue-300",
}: {
  href: string;
  title: string;
  description?: string;
  icon: ReactNode;
  iconClassName?: string;
  hoverBorderClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(cardShell, hoverBorderClassName)}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-md dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors shrink-0",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {title}
          </h4>
          {description ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {description}
            </p>
          ) : null}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
      </div>
    </Link>
  );
}

export type DashboardGroupItem = {
  href: string;
  title: string;
  icon: ReactNode;
};

export function DashboardGroup({
  title,
  description,
  icon,
  items,
  iconClassName = "text-blue-600 bg-blue-100 group-hover:bg-blue-200",
  hoverBorderClassName = "hover:border-blue-300",
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  items: DashboardGroupItem[];
  iconClassName?: string;
  hoverBorderClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(cardShell, hoverBorderClassName, "w-full")}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-md dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors shrink-0",
                iconClassName,
              )}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                {title}
              </h4>
              {description ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {description}
                </p>
              ) : null}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56"
      >
        {items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
