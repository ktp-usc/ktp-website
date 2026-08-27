import { applications } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { statusPillClasses, statusLabel } from "../lib/application";

function formatDate(dateLike: string | Date | null | undefined): string {
  if (!dateLike) return "—";
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
type applicationCardProps = {
  application: applications;
};
export function Application({ application }: applicationCardProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push(
          application.status === "BID_OFFERED"
            ? `/portal/bid-letter?applicationId=${application.id}`
            : `/portal/application/${application.id}`,
        );
      }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg dark:bg-gray-900 dark:border-gray-600 dark:hover:border-gray-400 transition-all cursor-pointer border border-gray-200 overflow-hidden group"
      role="button"
      tabIndex={0}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                {application.semester + " Application"}
              </h4>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${statusPillClasses(application.status)}`}
              >
                {statusLabel(application.status)}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
              {application.submittedAt
                ? `Submitted on ${formatDate(application.submittedAt)}`
                : `Last saved on ${formatDate(application?.lastModified ?? application?.createdAt)}`}
            </p>
          </div>

          <div className="flex gap-6 text-left">
            <div>
              <p className="text-xs text-gray-500 dark:text-white transition-colors duration-300">
                Major
              </p>
              <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                {application?.major ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white transition-colors duration-300">
                Year
              </p>
              <p className="text-sm mt-2 font-medium text-gray-900 dark:text-gray-300 transition-colors duration-300">
                {application?.classification ?? "—"}
              </p>
            </div>
          </div>

          <ChevronRight />
        </div>
      </div>
    </div>
  );
}
