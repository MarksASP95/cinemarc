import { addDoc, collection, CollectionReference, doc, documentId, getDoc, onSnapshot, Query, query, serverTimestamp, setDoc, where, type DocumentData } from "firebase/firestore";
import type { ColSnapshotCallback, ValueCallback } from "../../models/general.model";
import type { Piece, PieceCreate } from "../../models/piece.model";
import { firestore } from "../firebase/config.fire";
import { generateId, subscribeTo, valueCollectionSnap } from "../firebase/docs.fire";

const piecesCol = collection(firestore, "pieces") as CollectionReference<Piece>;

export function getPieces(onValue: ValueCallback<Piece[]>) {
  // TODO: agregar where ownerId
  const q = query(piecesCol)
  return valueCollectionSnap(q, onValue);
}

export function createPiece(pieceCr: PieceCreate): Promise<any> {
  const pieceDoc = doc(piecesCol);
  const piece: Piece = {
    consumed: false,
    deletedAt: null,
    description: pieceCr.description,
    id: pieceDoc.id,
    createdAt: serverTimestamp(),
    imageUrl: pieceCr.imageUrl,
    isDeleted: false,
    name: pieceCr.name,
    source: pieceCr.source,
    type: pieceCr.type,
  };
  return setDoc(pieceDoc, piece);
}