import { get, writable } from 'svelte/store';
import type { Var_CinemarcVersion } from "../models/variable.model";

export const cinemarcVersion$ = writable<Var_CinemarcVersion | undefined>();

export function setVersion(value: string) {
  cinemarcVersion$.set({ value });
}
export function getVersion(): string | undefined {
  const versionVar = get(cinemarcVersion$);
  if (!versionVar) return undefined;

  return versionVar.value;
}