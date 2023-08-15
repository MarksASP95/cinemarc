
import { doc, getDoc } from 'firebase/firestore';
import type { Var_CinemarcVersion } from '../../models/variable.model';
import { firestore } from '../../store/firebase-firestore.store';
import { setVersion } from '../../store/variables.store';

export function initVersion() {
  const versionVarDoc = doc(firestore(), "variables/version");
  getDoc(versionVarDoc)
    .then((snap) => {
      if (!snap.exists) return;
      const versionVar = snap.data() as Var_CinemarcVersion;
      setVersion(versionVar.value);
    });
}