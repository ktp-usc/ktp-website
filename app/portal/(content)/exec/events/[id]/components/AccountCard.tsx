import { accounts, event } from "@prisma/client";
type accountCardProps = {
  account: accounts;
  attended: boolean;
  updateEvent: (arg0: string[]) => void;
  currentEvent: event;
};

export function AccountCard({
  account,
  attended,
  updateEvent,
  currentEvent,
}: accountCardProps) {
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr_2fr] items-center border-t p-2 border-slate-200">
      <p className="font-semibold text-slate-800">
        {account.firstName + " " + account.lastName}
      </p>
      <p className="font-semibold text-slate-800">{account.schoolEmail}</p>
      <p className="font-semibold text-slate-800">
        {attended ? "Present" : "Absent"}
      </p>
      <div className="flex gap-4">
        <button
          disabled={attended}
          className="pl-4 pr-4 pt-2 pb-2 no-raise cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
        disabled:bg-black/20 border bg-green-200 border-emerald-900 text-emerald-900 rounded-full"
          onClick={() => {
            currentEvent.attendance.push(account.id);
            console.log("currentEvent", currentEvent);
            updateEvent(currentEvent.attendance);
            attended = false;
          }}
        >
          Present
        </button>
        <button
          disabled={!attended}
          className="pl-4 pr-4 no-raise pt-2 pb-2 border cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
        disabled:bg-black/20 bg-orange-200 border-amber-900 text-amber-900 rounded-full"
          onClick={() => {
            currentEvent.attendance = currentEvent.attendance.filter(
              (id) => id !== account.id,
            );
            console.log("currentEvent", currentEvent);
            updateEvent(currentEvent.attendance);
            attended = false;
          }}
        >
          Absent
        </button>
      </div>
    </div>
  );
}
