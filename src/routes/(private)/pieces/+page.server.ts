import { error } from '@sveltejs/kit';
import { getWelcomePagePieces } from '../../../server/controllers/piece.controller';
import { toSerializable } from '../../../server/utils.server';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    return {};
}