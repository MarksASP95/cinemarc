import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { TMDB_API_TOKEN } from "$env/static/private";
import type { TMDBMovieSearchOutput, TMDBTVSearchOutput } from '../../../../models/tmdb.model';

export const POST = (async (event) => {
    const { searchText, type } = await event.request.json();

    const url = `https://api.themoviedb.org/3/search/${type}?query=${encodeURI(searchText)}&include_adult=false&language=en-US&page=1`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_TOKEN}`
      }
    };

    const res = await fetch(url, options);
    const data: TMDBMovieSearchOutput | TMDBTVSearchOutput = await res.json();

    return json({ data });
}) satisfies RequestHandler;