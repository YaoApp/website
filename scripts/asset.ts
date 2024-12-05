import { Exception, FS, UploadFile, UploadFileResponse } from "@yao/runtime";

/**
 * The public directory for the uploaded files
 */
export const PublicUploadRoot = "/public/assets/upload";

/**
 * Upload an image file to the public directory
 */
function UploadImageToPublic(file: UploadFile): UploadFileResponse {
  const root = `${PublicUploadRoot}/images`;
  const fs = new FS("app");
  const tmpfile = file.tempFile;
  const ext = fs.ExtName(file.name);

  // Check the file name jpg, jpeg, png, svg, gif, webp
  if (!/^(jpg|jpeg|png|svg|gif|webp)$/i.test(ext)) {
    throw new Exception(
      "File format not supported, please select an image file",
      400
    );
  }
  const filename = `${Tempdir()}/${Name()}.${ext}`;
  const target = `${root}/${filename}`;
  fs.Move(tmpfile, target);
  return `/images/${filename}`;
}

/**
 * Generate a random directory name
 * @returns
 */
export function Name(): string {
  const random = Math.floor(Math.random() * 100000) + 1;
  return `${new Date().getTime()}${random}`;
}

/**
 * Generate a temporary directory name
 * @returns
 */
export function Tempdir(): string {
  const today: Date = new Date();
  const year: number = today.getFullYear();
  const month: number = today.getMonth() + 1;
  const day: number = today.getDate();

  // Format the date to YYYYMMDD
  const formattedDate: string = `${year}${month
    .toString()
    .padStart(2, "0")}${day.toString().padStart(2, "0")}`;
  return formattedDate;
}
