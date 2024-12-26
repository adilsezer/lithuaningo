export const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const cleanWord = (word: string): string => {
  return word.replace(/[.,!?;:()"]/g, "");
};
