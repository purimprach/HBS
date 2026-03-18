import { useState } from "react";
import {
  changeMemberRoleAction,
  removeAcceptedMemberAction,
} from "../utils/accountInviteActions";

export default function useAccountTeam({
  joinedGame,
  draftTeamId,
  currentPlayer,
  teamName,
  getHostTeamFromStorage,
  getInviteStatusFromStorage,
  updateInviteRoleInStorage,
  pushRoleChangeNoticeToStorage,
}) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamRoles, setTeamRoles] = useState({ you: "CEO" });

  const handleRoleChange = (currentMemberKey, newRole) => {
    const result = changeMemberRoleAction({
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
    });

    if (!result.ok) return result;

    setTeamRoles(result.nextRoles);
    return { ok: true };
  };

  const handleRemoveAcceptedMember = (index) => {
    const result = removeAcceptedMemberAction({
      index,
      teamMembers,
      currentPlayer,
      joinedGame,
      teamName,
      teamRoles,
      getHostTeamFromStorage,
    });

    if (!result.ok) return result;

    setTeamMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, status: "typing" } : m))
    );

    return { ok: true };
  };

  return {
    teamMembers,
    setTeamMembers,
    teamRoles,
    setTeamRoles,
    handleRoleChange,
    handleRemoveAcceptedMember,
  };
}