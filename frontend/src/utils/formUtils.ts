import { ImageFile } from "@src/types";

export const createFormDataFromFile = (file: ImageFile): FormData => {
  const formData = new FormData();
  formData.append("file", {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as any);
  return formData;
};
