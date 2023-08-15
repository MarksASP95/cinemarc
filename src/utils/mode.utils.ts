import { getModeUserPrefers, setModeCurrent, setModeUserPrefers } from "@skeletonlabs/skeleton";

export function initMode() {
  const userPrefers = getModeUserPrefers();
  if (userPrefers === undefined) {
    setModeCurrent(false);
    setModeUserPrefers(false);
  } else {
    setModeCurrent(userPrefers);
  }
}