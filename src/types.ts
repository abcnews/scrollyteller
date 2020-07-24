export type ACTOConfigValue = boolean | number | string | boolean[] | number[] | string[];

export type ACTOConfig = {
  [key: string]: ACTOConfigValue;
};

export type Panel = {
  id: number;
  config: ACTOConfig;
  nodes: Node[];
};

export type Scrollyteller = {
  mountNode: Element;
  panels: Panel[];
};
