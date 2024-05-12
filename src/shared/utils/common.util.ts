export const capitalEachWord = (text: string) => {
  const words = text.split(' ');

  for (let i = 0; i < words.length; i++) {
    // get the first letter of the word and capitalize it
    const firstLetter = words[i].charAt(0).toUpperCase();
    words[i] = firstLetter + words[i].slice(1);
  }

  return words.join(' ');
};
