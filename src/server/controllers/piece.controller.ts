import admin from "firebase-admin";
import type { Piece, PieceCreate, PieceEditable } from "../../models/piece.model";
import { initializeFirebase } from "../firebase.server";

initializeFirebase();

export function getPieces(): Promise<Piece[]> {
  return admin.firestore().collection("pieces").where("isDeleted", "==", false).get()
    .then((snap) => {
      return snap.docs.map((doc) => doc.data() as Piece);
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