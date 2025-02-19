import {
  collection,
  CollectionReference,
  doc,
  query,
  QueryFieldFilterConstraint,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { ValueCallback } from "../../models/general.model";
import type {
  Piece,
  PieceCreate,
  PieceEditable,
  PieceFixedValueFilter,
} from "../../models/piece.model";
import { valueCollectionSnap } from "../firebase/docs.fire";
import { get } from "svelte/store";
import { authUser$ } from "../../auth/auth.store";
import { firestore } from "../../store/firebase-firestore.store";
import { type TagDocument } from "../../models/tag.model";

function getTagsCol(userId: string) {
  console.log("path", `users.${userId}.tags`);
  return collection(
    firestore(),
    `users/${userId}/tags`
  ) as CollectionReference<TagDocument>;
}

const piecesCol = collection(
  firestore(),
  "pieces"
) as CollectionReference<Piece>;

export function getTags(onValue: ValueCallback<TagDocument[]>) {
  const user = get(authUser$);
  if (!user) throw "No current user";

  const constraints: QueryFieldFilterConstraint[] = [
    where("isDeleted", "==", false),
  ];

  const q = query(getTagsCol(user.id), ...constraints);
  return valueCollectionSnap(q, onValue);
}

export function getPieces(
  onValue: ValueCallback<Piece[]>,
  filter: PieceFixedValueFilter = {}
) {
  const user = get(authUser$);
  if (!user) throw "No current user";

  const usedFilter: PieceFixedValueFilter = {
    consumptionStatus: "not-consumed",
    ...filter,
  };

  const constraints: QueryFieldFilterConstraint[] = [
    where("isDeleted", "==", false),
    where("ownerId", "==", user.id),
  ];

  if (usedFilter.consumptionStatus === "consumed")
    constraints.push(where("consumed", "==", true));
  if (usedFilter.consumptionStatus === "not-consumed")
    constraints.push(where("consumed", "==", false));
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
  return updatePiece(id, {
    consumed: value,
    consumedAt: value ? serverTimestamp() : null,
  });
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
    releaseYear: pieceCr.releaseYear,
    tagsIds: pieceCr.tagsIds,
  };

  if (pieceCr.author) piece.author = pieceCr.author;

  return setDoc(pieceDoc, piece).then(() => pieceDoc.id);
}
