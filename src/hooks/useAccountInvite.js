import { useState } from "react";
import { setActiveGameCode } from "../utils/accountDraftStorage";
import {
  acceptInviteAction,
  denyInviteAction,
} from "../utils/accountInviteActions";

export default function useAccountInvite({
  currentPlayer,
  setStorageTick,
  setJoinCode,
  setIsJoined,
  setJoinedGame,
  setShowTeamSetup,
}) {
  const [pendingInvite, setPendingInvite] = useState(null);
  const [acceptedInviteInfo, setAcceptedInviteInfo] = useState(null);
  const [isAcceptedInvite, setIsAcceptedInvite] = useState(false);

  const handleAcceptInvite = () => {
    const result = acceptInviteAction({
      currentPlayer,
      pendingInvite,
    });

    if (!result.ok) return result;

    setJoinCode(result.code);
    setIsJoined(true);
    setJoinedGame(result.freshGame);
    setShowTeamSetup(true);
    setActiveGameCode(result.code);

    setAcceptedInviteInfo(result.acceptedInviteInfo);
    setIsAcceptedInvite(true);
    setPendingInvite(null);

    setStorageTick((t) => t + 1);
    return { ok: true };
  };

  const handleDenyInvite = () => {
    const result = denyInviteAction({
      currentPlayer,
      pendingInvite,
    });

    if (!result.ok) return result;

    setPendingInvite(null);
    setStorageTick((t) => t + 1);
    return { ok: true };
  };

  return {
    pendingInvite,
    setPendingInvite,
    acceptedInviteInfo,
    setAcceptedInviteInfo,
    isAcceptedInvite,
    setIsAcceptedInvite,
    handleAcceptInvite,
    handleDenyInvite,
  };
}