import type { RequestHandler } from './$types';
import resizeImg from "resize-img";
import { initializeFirebase } from '../../../../server/firebase.server';
import * as admin from "firebase-admin";
import { error, json } from '@sveltejs/kit';

export const POST = (async (event) => {
  const { imgUrl, fileName } = await event.request.json();
  try {
    const res = await fetch(imgUrl);
    const blob = await res.blob();
    const arrBuffer = await blob.arrayBuffer();

    const resizedImgBuffer = await resizeImg(Buffer.from(arrBuffer), {
      width: 20,
      height: 30,
    });

    initializeFirebase();
    const storageFile = admin.storage()
      .bucket("cinemarc-edfda.appspot.com")
      .file(`posters_thumbnails/${fileName.replace(/[^a-zA-Z ]/g, "")}_${new Date().getTime()}.jpg`);
    await storageFile.save(resizedImgBuffer);
    await storageFile.makePublic();
    const url = storageFile.publicUrl();
    return json({ url });
  } catch (err: any){
    throw error(500, { message: err.message });
  }
}) satisfies RequestHandler;