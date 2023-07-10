import { addDoc, collection, doc, documentId, serverTimestamp, setDoc } from "firebase/firestore";
import type { Piece, PieceCreate } from "../../models/piece.model";
import { firestore } from "../firebase/config.fire";
import { generateId } from "../firebase/docs.fire";

const piecesCol = collection(firestore, "pieces");

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