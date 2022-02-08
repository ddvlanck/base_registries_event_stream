export interface IFragmentMetadata {
  time: Date;
  previousFragment: {
    value?: string;
    present: boolean;
  };
  nextFragment: {
    value?: string;
    present: boolean;
  };
  index: number;
}
