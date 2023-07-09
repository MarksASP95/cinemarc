import { error } from '@sveltejs/kit';
import { getPieces } from '../server/controllers/piece.controller';
import { toSerializable } from '../server/utils.server';

/** @type {import('./$types').PageServerLoad} */
export async function load() {

}