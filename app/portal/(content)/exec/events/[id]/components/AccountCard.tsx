import { accounts } from "@prisma/client";
type accountCardProps = {
  account: accounts;
};

export function AccountCard({ account }: accountCardProps) {
  return (
    <div className="grid grid-cols-[1fr_2fr_1fr_1fr_2fr]">
      <p className="font-semibold text-slate-800">{account.firstName}</p>
      <p className="font-semibold text-slate-800">Email</p>
      <p className="font-semibold text-slate-800">Status</p>
      <p className="font-semibold text-slate-800">Actions</p>
    </div>
  );
}
