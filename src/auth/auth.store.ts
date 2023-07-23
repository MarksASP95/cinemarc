import { writable } from "svelte/store";
import type { CinemarcUser } from "../models/user.model";

export const authUser$ = writable<CinemarcUser | null | undefined>(undefined);
export const jwtToken$ = writable<string | null | undefined>(undefined);