import { get } from "svelte/store";
import { jwtToken$ } from "../../auth/auth.store";

export function generatePosterSmallImg(
  imgUrl: string,
  fileName: string,
  pieceId: string,
) {
  return fetch("/api/upload-poster-thumbnail", {
    method: "POST",
    body: JSON.stringify({
      imgUrl,
      fileName,
      pieceId,
    }),
    headers: {
      "Authorization": `Bearer ${get(jwtToken$) || ""}`,
    }
  });
}