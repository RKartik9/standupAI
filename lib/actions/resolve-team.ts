import { getUserTeams } from "./teams";

export async function resolveActiveTeam(teamIdParam?: string) {
  const userTeams = await getUserTeams();

  if (userTeams.length === 0) return { userTeams, activeTeam: null };

  const activeTeam =
    (teamIdParam
      ? userTeams.find((t) => t.teamId === teamIdParam)
      : null) ?? userTeams[0];

  return { userTeams, activeTeam };
}
