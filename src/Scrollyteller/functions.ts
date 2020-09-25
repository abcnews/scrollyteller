export const uglyTwitterHack = (selector: string) => {
  [].slice
    .call(document.querySelectorAll(`${selector} .twitter-tweet-rendered`))
    .forEach((card: HTMLElement) => {
      card.style.setProperty('width', '100%');
    });
};

export const cn = (candidates: (undefined | null | false | string)[]) =>
  candidates
    .filter((x: undefined | null | false | string): boolean => !!x)
    .join(' ');
