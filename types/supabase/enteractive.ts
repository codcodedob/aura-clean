export type EnteractiveItem = {
    id: string;
    name: string;
    project_scope: number;
    link: string;
  };
  
  export interface EnteractivePyramidProps {
    data: EnteractiveItem[];
    width: number;
    height: number;
  }
  