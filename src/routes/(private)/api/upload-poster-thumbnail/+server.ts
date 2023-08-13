import type { RequestHandler } from './$types';
import resizeImg from "resize-img";
import { initializeFirebase } from '../../../../server/firebase.server';
import admin from "firebase-admin";
import { error, json } from '@sveltejs/kit';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import type { Piece } from '../../../../models/piece.model';

// should be trigger
export const POST = (async (event) => {
  const authHeader = event.request.headers.get("Authorization");
  if (!authHeader) throw error(401, "Unauthenticated");

  initializeFirebase();
  const jwt = authHeader.split(" ")[1];

  let decodedToken: DecodedIdToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(jwt);
  } catch (err) {
    throw error(401, "Bad token");
  }
  
  const { imgUrl, fileName, pieceId } = await event.request.json();

  const pieceDoc = admin.firestore().collection("pieces").doc(pieceId);
  const pieceSnap = await pieceDoc.get();
  
  if (!pieceSnap.exists) throw error(412, "Pieces doesn not exist");

  const { ownerId: pieceOwnerId, smallImgUrl } = pieceSnap.data() as Piece;
  if (decodedToken.uid !== pieceOwnerId) {
    throw error(401, "Pieces does not belong to caller");
  }

  if (!!smallImgUrl) throw error(412, "Piece already has small image");

  try {
    const res = await fetch(imgUrl);
    const blob = await res.blob();
    const arrBuffer = await blob.arrayBuffer();

    const resizedImgBuffer = await resizeImg(Buffer.from(arrBuffer), {
      width: 20,
      height: 30,
    });
    const storageFile = admin.storage()
      .bucket("cinemarc-edfda.appspot.com")
      .file(`posters_thumbnails/${fileName.replace(/[^a-zA-Z ]/g, "")}_${new Date().getTime()}.jpg`);
    await storageFile.save(resizedImgBuffer);
    await storageFile.makePublic();
    const url = storageFile.publicUrl();
    
    pieceDoc
      .update({
        smallImgUrl: url,
      });

    return json({ url, pieceId });
  } catch (err: any){
    throw error(500, { message: err.message });
  }
}) satisfies RequestHandler;