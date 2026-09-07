export type RusheeCommenterAccount = {
  id: string;
  firstName: string;
  lastName: string;
};

export function rusheeCommenterIdentity(
  account: RusheeCommenterAccount,
  userId: string,
) {
  const name = [account.firstName, account.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const commenter = name || account.id || userId;
  const aliases = [...new Set([commenter, account.id, userId].filter(Boolean))];
  return { commenter, aliases };
}
