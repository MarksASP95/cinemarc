
import { doc, getDoc } from 'firebase/firestore';
import type { Var_CinemarcVersion } from '../../models/variable.model';
import { firestore } from '../../store/firebase-firestore.store';
import { cinemarcVersion$, setVersion } from '../../store/variables.store';
import { valueDocSnap } from '../firebase/docs.fire';
import type { DocumentReference } from 'firebase/firestore';
import { get } from 'svelte/store';
import { modalStore } from '@skeletonlabs/skeleton';

export function initVersion() {
  const versionVarDoc = doc(firestore(), "variables/version");
  const isLocal = location.host.includes("localhost");
  valueDocSnap(versionVarDoc as DocumentReference<Var_CinemarcVersion>, (versionVar) => {
    if (!versionVar) return;

    const localVersion = get(cinemarcVersion$);
    if (!localVersion) {
      return setVersion(versionVar.value);
    }

    if (localVersion.value !== versionVar.value && !isLocal) {
      modalStore.clear();
      modalStore.trigger({
        type: 'confirm',
        body: "Refresh the app so you can enjoy the new things we have for you!",
        title: "There's a new version of Cinemarc 🚀",
        response: (shouldRefresh) => shouldRefresh && location.reload(),
        buttonTextConfirm: "Let's go! 🔥",
        buttonTextCancel: "No thanks 🤨",
        modalClasses: "confirm-modal-no-cancel",
      })
      return;
    }
  });
}