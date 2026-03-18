import { useCallback } from "react";
import { readGames } from "../utils/gameStorage";
import { normalizeEmail } from "../utils/accountTeamActions";

export default function useAccountNoticeScans({ currentPlayer, joinedGame }) {
  const scanHostNotice = useCallback(() => {
    if (!currentPlayer?.id || !joinedGame?.code) return null;

    const games = readGames();
    const game = games.find((g) => g.code === joinedGame.code);
    if (!game) return null;

    for (const t of game.teams || []) {
      if (t.leaderPlayerId !== currentPlayer.id) continue;

      const inv = (t.invites || []).find(
        (x) => (x.status === "left" || x.status === "denied") && !x.hostNoticeSeen
      );

      if (inv) {
        return {
          title: "Team Update",
          message: inv.hostNoticeMessage || `${inv.email} left the team.`,
          gameCode: game.code,
          teamId: t.id,
          email: inv.email,
        };
      }
    }

    return null;
  }, [currentPlayer?.id, joinedGame?.code]);

  const scanPendingInvite = useCallback(() => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();
    let found = null;

    for (const g of games) {
      for (let i = 0; i < (g.teams || []).length; i++) {
        const t = g.teams[i];
        if (t.isDeleted) continue;

        const inv = (t.invites || []).find(
          (x) => normalizeEmail(x.email) === email && x.status === "pending"
        );

        if (inv) {
          const adminDisplay =
            (g?.ownerAdminUsername || "").trim() ||
            (g?.ownerAdminName || "").trim() ||
            (g?.adminUsername || "").trim() ||
            (g?.adminName || "").trim() ||
            (g?.createdByUsername || "").trim() ||
            (g?.createdByName || "").trim() ||
            "-";

          found = {
            gameCode: g.code,
            gameName: g.name,
            teamId: t.id,
            teamName: t.name,
            teamNumber: i + 1,
            hostName: t.leaderName || "Host",
            hostEmail: t.leaderEmail || "",
            role: inv.role || "",
            invitedAt: inv.invitedAt,
            adminDisplay,
          };
          break;
        }
      }
      if (found) break;
    }

    return found;
  }, [currentPlayer?.email]);

  const scanSystemNotice = useCallback(() => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();

    for (const g of games) {
      const list = g.systemNotices || [];
      const n = list.find(
        (x) => normalizeEmail(x.toEmail) === email && x.seen === false
      );

      if (n) {
        return {
          id: n.id,
          title:
            n.type === "team_deleted"
              ? "Team Deleted"
              : n.type === "member_removed"
                ? "Removed from Team"
                : "System Notice",
          message: n.message || "",
          gameCode: g.code,
          createdAt: n.createdAt,
          toEmail: email,
        };
      }
    }

    return null;
  }, [currentPlayer?.email]);

  const scanRoleChangeNotice = useCallback(() => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();

    for (const g of games) {
      for (const t of g.teams || []) {
        const inv = (t.invites || []).find(
          (x) =>
            normalizeEmail(x.email) === email &&
            x.status === "accepted" &&
            x.noticeType === "role_changed" &&
            x.noticeSeen === false
        );

        if (inv) {
          return {
            title: "Your role was changed.",
            oldRole: inv.oldRole || "-",
            newRole: inv.newRole || "-",
            at: inv.roleChangedAt,
            byName: inv.roleChangedByName || "Host",
            byRole: inv.roleChangedByRole || "CEO",
            gameCode: g.code,
            teamId: t.id,
            email,
          };
        }
      }
    }

    return null;
  }, [currentPlayer?.email]);

  const scanTeamUpdateNotice = useCallback(() => {
    const email = normalizeEmail(currentPlayer?.email);
    if (!email) return null;

    const games = readGames();

    for (const g of games) {
      for (const t of g.teams || []) {
        const inv = (t.invites || []).find(
          (x) =>
            normalizeEmail(x.email) === email &&
            x.status === "accepted" &&
            ["member_removed", "member_left"].includes(x.teamUpdateType) &&
            x.teamUpdateSeen === false
        );

        if (inv) {
          return {
            title: "Team Update",
            message: inv.teamUpdateMessage || "Your team was updated.",
            at: inv.teamUpdateAt,
            gameCode: g.code,
            teamId: t.id,
            email,
          };
        }
      }
    }

    return null;
  }, [currentPlayer?.email]);

  return {
    scanHostNotice,
    scanPendingInvite,
    scanSystemNotice,
    scanRoleChangeNotice,
    scanTeamUpdateNotice,
  };
}