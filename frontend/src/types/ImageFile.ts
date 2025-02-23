export interface MediaFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export type ImageFile = MediaFile;
export type AudioFile = MediaFile;
