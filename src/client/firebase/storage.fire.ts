import { ref, uploadBytesResumable, getDownloadURL, StorageError, type StorageReference } from "firebase/storage";
import { storage } from "../../store/firebase-storage.store";
;

export function uploadFile(
  path: string, 
  file: Blob, 
  onChange?: (progress: number) => void,
  onError?: (error: StorageError) => void,
  onFinish?: (ref: StorageReference, getUrl: Promise<string>) => void,
): Promise<{ ref: StorageReference, url: string }> {
  const storageRef = ref(storage(), path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed",
      ({ bytesTransferred, totalBytes }) => {
        onChange && onChange(bytesTransferred * 100 / totalBytes);
      },
      (error) => {
        onError && onError(error);
        reject(error);
      },
      () => {
        onFinish &&
          onFinish(uploadTask.snapshot.ref, getDownloadURL(uploadTask.snapshot.ref));

        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => resolve({ ref: uploadTask.snapshot.ref, url }))
          .catch(reject);
      }
    );
  });


}