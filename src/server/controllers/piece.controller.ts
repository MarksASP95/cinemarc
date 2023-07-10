import admin from "firebase-admin";
import type { Paged } from "../../models/general.model";
import type { Piece, PieceCreate, PieceEditable } from "../../models/piece.model";
import { initializeFirebase } from "../firebase.server";
import { paginateQuery, snapData, toSerializableArray } from "../utils.server";

initializeFirebase();

const WELCOME_PAGE_PIECES_PAGE_SIZE = 10;

export function getWelcomePagePieces(): Promise<Piece[]> {
  const query = admin.firestore()
    .collection("pieces")
    .where("isDeleted", "==", false);

  return query.get().then((snap) => {
    return toSerializableArray(snapData(snap));
  });
}

export function createPiece(pieceCr: PieceCreate): Promise<any> {

  const pieceDoc = admin.firestore().collection("pieces").doc();

  const piece: Piece = {
    consumed: false,
    deletedAt: null,
    description: pieceCr.description,
    id: pieceDoc.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    imageUrl: null,
    isDeleted: false,
    name: pieceCr.name,
    source: pieceCr.source,
    type: pieceCr.type,
  };

  return pieceDoc.set(piece);
}

export function deletePiece(pieceId: string): Promise<any> {
  return updatePiece(pieceId, {
    isDeleted: true,
    deletedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

function updatePiece(pieceId: string, updateData: PieceEditable): Promise<any> {
  const pieceDoc = admin.firestore().collection("pieces").doc(pieceId);
  return pieceDoc.update(updateData);
}