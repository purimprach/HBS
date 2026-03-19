import { readGames, writeGames, findGameByCode } from "./gameStorage";
import { normalizeEmail } from "./accountTeamActions";

export function acceptInviteAction({
    currentPlayer,
    pendingInvite,
}) {
    if (!pendingInvite || !currentPlayer?.id) {
        return { ok: false };
    }

const email = normalizeEmail(currentPlayer.email);
const games = readGames();
const gameIdx = games.findIndex((g) => g.code === pendingInvite.gameCode);
if (gameIdx === -1) {
    return { ok: false };
}

const game = games[gameIdx];
const team = game.teams?.find((t) => t.id === pendingInvite.teamId);
if (!team || team.isDeleted) {
    return { ok: false };
}

const inv = team.invites?.find((x) => normalizeEmail(x.email) === email);
if (inv) {
    inv.status = "accepted";
    inv.acceptedAt = new Date().toISOString();
}

let p = (game.players || []).find((pp) => pp.playerId === currentPlayer.id);
if (!p) {
    game.players = game.players || [];
    game.players.push({
        playerId: currentPlayer.id,
        name: currentPlayer.name,
        email: currentPlayer.email,
        teamId: team.id,
        ready: false,
        joinedAt: new Date().toISOString(),
    });
} else {
    p.teamId = team.id;
}

games[gameIdx] = game;
writeGames(games);

const code = (pendingInvite.gameCode || "").trim().toUpperCase();
const freshGame = findGameByCode(code);

return {
    ok: true,
    code,
    freshGame,
    acceptedInviteInfo: pendingInvite,
};
}

export function denyInviteAction({
    currentPlayer,
    pendingInvite,
}) {
    if (!pendingInvite || !currentPlayer?.email) {
        return { ok: false };
    }

    const email = normalizeEmail(currentPlayer.email);
    const games = readGames();

    const gameIdx = games.findIndex((g) => g.code === pendingInvite.gameCode);
    if (gameIdx === -1) {
        return { ok: false };
    }

    const game = games[gameIdx];
    const team = (game.teams || []).find((t) => t.id === pendingInvite.teamId);
    if (!team) {
        return { ok: false };
    }

    const inv = (team.invites || []).find(
        (x) => normalizeEmail(x.email) === email
    );
    if (inv) {
        inv.status = "denied";
        inv.deniedAt = new Date().toISOString();
        inv.hostNoticeSeen = false;
        inv.hostNoticeMessage = `${email} denied the invitation.`;
    }

    games[gameIdx] = game;
    writeGames(games);

    return { ok: true };
}

export function leaveTeamAndNotifyHostAction({
    currentPlayer,
    joinedGame,
    acceptedInviteInfo,
}) {
    const email = normalizeEmail(currentPlayer?.email);
    const pid = currentPlayer?.id;
    if (!email || !pid) {
        return { ok: false };
    }

    const gameCode = (joinedGame?.code || acceptedInviteInfo?.gameCode || "")
        .trim()
        .toUpperCase();
    if (!gameCode) {
        return { ok: false };
    }

    const games = readGames();
    const gameIdx = games.findIndex(
        (g) => (g.code || "").trim().toUpperCase() === gameCode
    );
    if (gameIdx === -1) {
        return { ok: false };
    }

    const game = games[gameIdx];
    game.players = game.players || [];
    game.teams = game.teams || [];

    const me = game.players.find((p) => p.playerId === pid) || null;

    let myTeamId = me?.teamId || null;

    if (!myTeamId) {
        const teamFromInvite = (game.teams || []).find((t) =>
            (t.invites || []).some(
                (inv) => normalizeEmail(inv.email) === email && inv.status === "accepted"
            )
        );
        if (teamFromInvite) myTeamId = teamFromInvite.id;
    }

    if (!myTeamId && acceptedInviteInfo?.teamId) {
        myTeamId = acceptedInviteInfo.teamId;
    }

    if (!myTeamId) {
        return {
            ok: false,
            alertMsg: "Cannot leave: your team was not found. Please re-login.",
        };
    }

    const team = game.teams.find((t) => t.id === myTeamId);

    if (!team || team.isDeleted) {
        if (me) me.teamId = null;
        games[gameIdx] = game;
        writeGames(games);

        return {
            ok: true,
            teamGone: true,
            alertMsg: "Team no longer exists. You have been removed.",
        };
    }

    if (team.leaderPlayerId === pid) {
        return {
            ok: false,
            alertMsg: "Host cannot leave. Please use Delete Team.",
        };
    }

    const teamNm = team.name || "your team";
    const gameNm = game.name || "Hotel Business Simulator";

    if (!me) {
        game.players.push({
            playerId: pid,
            name: currentPlayer?.name || "Player",
            email: currentPlayer?.email || "",
            teamId: null,
            ready: false,
            joinedAt: new Date().toISOString(),
        });
    } else {
        me.teamId = null;
    }

    team.members = (team.members || []).filter((id) => id !== pid);
    if (team.roles) delete team.roles[pid];

    const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === email);
    if (inv) {
        inv.status = "left";
        inv.leftAt = new Date().toISOString();
        inv.leftByEmail = email;

        inv.hostNoticeSeen = false;
        inv.hostNoticeMessage = `${email} left the team "${teamNm}" in game "${gameNm}".`;
    }

    (team.invites || []).forEach((x) => {
        const xEmail = normalizeEmail(x.email);
        if (!xEmail) return;
        if (x.status === "accepted" && xEmail !== email) {
            x.teamUpdateType = "member_left";
            x.teamUpdateSeen = false;
            x.teamUpdateAt = new Date().toISOString();
            x.teamUpdateMessage = `Player: ${email} has left the team "${teamNm}".`;
        }
    });

    games[gameIdx] = game;
    writeGames(games);

    return { ok: true };
}

export function removeAcceptedMemberAction({
    index,
    teamMembers,
    currentPlayer,
    joinedGame,
    teamName,
    teamRoles,
    getHostTeamFromStorage,
}) {
    const removedEmail = teamMembers[index]?.email;
    const email = normalizeEmail(removedEmail);
    if (!email) {
        return { ok: false };
    }

    const { games, gameIdx, game, team } = getHostTeamFromStorage();
    if (gameIdx === -1 || !game || !team) {
        return { ok: false };
    }

    const inv = (team.invites || []).find((x) => normalizeEmail(x.email) === email);
    if (!inv || inv.status !== "accepted") {
        return {
            ok: false,
            alertMsg: "Remove ทำได้เฉพาะคนที่ Accepted แล้วเท่านั้น",
        };
    }

    const foundPlayer = (game.players || []).find((p) => normalizeEmail(p.email) === email);
    if (foundPlayer) {
        team.members = (team.members || []).filter((id) => id !== foundPlayer.playerId);
        if (team.roles) delete team.roles[foundPlayer.playerId];
        foundPlayer.teamId = null;
    }

    const hostName = currentPlayer?.name || "Host";
    const hostRole = teamRoles?.you || "CEO";
    const teamNm = team?.name || teamName?.trim() || "Hotel Team";
    const gameNm = game?.name || joinedGame?.name || "Hotel Business Simulator";
    const gameCode = game?.code || joinedGame?.code || "";

    delete inv.noticeType;
    delete inv.oldRole;
    delete inv.newRole;
    delete inv.roleChangedAt;
    delete inv.roleChangedByName;
    delete inv.roleChangedByRole;

    inv.removedNoticeSeen = false;
    inv.status = "removed";
    inv.removedAt = new Date().toISOString();
    inv.removedByName = hostName;
    inv.removedByRole = hostRole;
    inv.teamName = teamNm;

    inv.removedMessage =
        `${hostName} (${hostRole}) has removed you from the team "${teamNm}"\n` +
        `in the game "${gameNm}" (Code: ${gameCode}).`;

    game.systemNotices = game.systemNotices || [];
    game.systemNotices.push({
        id: `member_removed_${team.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: "member_removed",
        toEmail: email,
        seen: false,
        createdAt: new Date().toISOString(),
        message: inv.removedMessage || `You were removed from team "${teamNm}".`,
    });

    (team.invites || []).forEach((x) => {
        const xEmail = normalizeEmail(x.email);
        if (!xEmail) return;

        if (x.status === "accepted" && xEmail !== normalizeEmail(removedEmail)) {
            x.teamUpdateType = "member_removed";
            x.teamUpdateSeen = false;
            x.teamUpdateAt = new Date().toISOString();

            const hostNm = currentPlayer?.name || "Host";
            const teamNm2 = team?.name || teamName?.trim() || "Hotel Team";
            x.teamUpdateMessage =
                `CEO: ${hostNm} has removed ${normalizeEmail(removedEmail)} from the team "${teamNm2}".`;
        }
    });

    games[gameIdx] = game;
    writeGames(games);

    return {
        ok: true,
        removedIndex: index,
    };
}

export function changeMemberRoleAction({
    currentMemberKey,
    newRole,
    teamMembers,
    teamRoles,
    joinedGame,
    draftTeamId,
    currentPlayer,
    getInviteStatusFromStorage,
    updateInviteRoleInStorage,
    pushRoleChangeNoticeToStorage,
}) {
    if (currentMemberKey === "you") {
        return { ok: false };
    }

    if (newRole === "CEO") {
        return { ok: false };
    }

    const memberA = teamMembers.find((m) => m.key === currentMemberKey);
    const emailA = memberA?.email || "";
    const statusA = getInviteStatusFromStorage(emailA);

    if (statusA === "pending") {
        return {
            ok: false,
            alertMsg: "You cannot change role while the player is Waiting.",
        };
    }

    const prevRoles = teamRoles || {};
    const oldRoleA = prevRoles[currentMemberKey] || "";

    const memberBKey = Object.keys(prevRoles).find(
        (k) => k !== "you" && k !== currentMemberKey && prevRoles[k] === newRole
    );

    const next = { ...prevRoles };
    next[currentMemberKey] = newRole;

    if (memberBKey) {
        next[memberBKey] = oldRoleA;
    }

    const gameCode = joinedGame?.code || "";
    const teamId = draftTeamId || "";

    const applyStorageRoleForInvited = (email, oldRole, newRoleX) => {
        if (!email || !newRoleX) return;

        const realStatus = getInviteStatusFromStorage(email);

        updateInviteRoleInStorage({
            gameCode,
            teamId,
            memberEmail: email,
            newRole: newRoleX,
        });

        if (realStatus === "accepted" && oldRole && oldRole !== newRoleX) {
            pushRoleChangeNoticeToStorage({
                joinedGame,
                currentPlayer,
                draftTeamId: teamId,
                memberEmail: email,
                oldRole,
                newRole: newRoleX,
            });
        }
    };

    applyStorageRoleForInvited(emailA, oldRoleA, newRole);

    if (memberBKey) {
        const memberB = teamMembers.find((m) => m.key === memberBKey);
        const emailB = memberB?.email || "";
        const oldRoleB = prevRoles[memberBKey] || "";
        const newRoleB = oldRoleA;

        if (newRoleB) {
            applyStorageRoleForInvited(emailB, oldRoleB, newRoleB);
        }
    }

    return {
        ok: true,
        nextRoles: next,
    };
}

