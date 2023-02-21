function uuidv4() {
  // @ts-ignore: Unreachable code error
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function truncateString(str: string, num: number) {
  if (str.length > num) {
    return str.substring(0, num) + "...";
  } else {
    return str;
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}
export { uuidv4, truncateString, copyToClipboard };
