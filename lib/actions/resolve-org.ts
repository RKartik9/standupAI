import { getUserOrganizations } from "./organizations";

export type ActiveOrg = Awaited<
  ReturnType<typeof getUserOrganizations>
>[number];

export async function resolveActiveOrg(orgIdParam?: string) {
  const userOrgs = await getUserOrganizations();

  if (userOrgs.length === 0) {
    return { userOrgs, activeOrg: null as ActiveOrg | null };
  }

  const activeOrg =
    (orgIdParam
      ? userOrgs.find((o) => o.organizationId === orgIdParam)
      : null) ?? userOrgs[0];

  return { userOrgs, activeOrg };
}
