import { addDoc, collection, CollectionReference, doc, documentId, getDoc, onSnapshot, Query, query, QueryFieldFilterConstraint, serverTimestamp, setDoc, updateDoc, where, type DocumentData } from "firebase/firestore";
import type { ColSnapshotCallback, ValueCallback } from "../../models/general.model";
import type { Piece, PieceCreate, PieceEditable, PieceFixedValueFilter } from "../../models/piece.model";
import { generateId, subscribeTo, valueCollectionSnap } from "../firebase/docs.fire";
import { get } from 'svelte/store';
import { authUser$ } from "../../auth/auth.store";
import { firestore } from "../../store/firebase-firestore.store";

const piecesCol = collection(firestore(), "pieces") as CollectionReference<Piece>;

export function getPieces(onValue: ValueCallback<Piece[]>, filter: PieceFixedValueFilter = {}) {
  const user = get(authUser$);
  if (!user) throw "No current user";

  const usedFilter: PieceFixedValueFilter = {
    consumed: false,
    isDeleted: false,
    ...filter,
  };
  
  const constraints: QueryFieldFilterConstraint[] = [
    where("ownerId", "==", user.id),
  ];

  if (usedFilter.consumed !== undefined) 
    constraints.push(where("consumed", "==", usedFilter.consumed));
  if (usedFilter.isDeleted !== undefined)
    constraints.push(where("isDeleted", "==", usedFilter.isDeleted));
  if (usedFilter.source !== undefined)
    constraints.push(where("source", "==", usedFilter.source));
  if (usedFilter.type !== undefined)
    constraints.push(where("type", "==", usedFilter.type));

  const q = query(piecesCol, ...constraints);
  return valueCollectionSnap(q, onValue);
}

export function deletePiece(id: string): Promise<any> {
  return updatePiece(id, { isDeleted: true, deletedAt: serverTimestamp() });
}

export function setConsumedValue(id: string, value: boolean): Promise<any> {
  return updatePiece(id, { consumed: value, consumedAt: value ? serverTimestamp() : null });
}

export function updatePiece(id: string, data: PieceEditable): Promise<any> {
  const pieceDoc = doc(piecesCol, id);
  return updateDoc(pieceDoc, data);
}

export function createPiece(pieceCr: PieceCreate): Promise<string> {
  const currentUser = get(authUser$);
  if (!currentUser) throw "Unauthenticated";

  const { id: ownerId } = currentUser;

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
    releaseDate: pieceCr.releaseDate,
    smallImgUrl: null, 
    ownerId,
    tmdbId: pieceCr.tmdbId,
    consumedAt: null,
  };

  if (pieceCr.author) piece.author = pieceCr.author;
  
  return setDoc(pieceDoc, piece)
    .then(() => pieceDoc.id);
}