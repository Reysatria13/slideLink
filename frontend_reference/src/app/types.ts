export interface Slide {
  id: number;
  type: 'title' | 'agenda' | 'flowchart' | 'chart';
  jpContent: { title: string; body: string[]; labels?: string[] };
  enContent: { title: string; body: string[]; labels?: string[] };
}
