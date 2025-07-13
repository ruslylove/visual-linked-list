export type ListType = 'singly' | 'doubly';

export interface NodeType {
  id: number;
  value: number;
  next: number | null;
  prev?: number | null;
}

export enum OperationType {
  ADD_FIRST = 'ADD_FIRST',
  ADD_LAST = 'ADD_LAST',
  REMOVE_FIRST = 'REMOVE_FIRST',
  REMOVE_LAST = 'REMOVE_LAST',
  SEARCH = 'SEARCH',
}

export type AnimationStep =
  | { type: 'CREATE'; node: NodeType; codeLine?: number }
  | { type: 'FADE_OUT'; nodeId: number; codeLine?: number }
  | { type: 'TRAVERSE'; nodeId: number; codeLine?: number }
  | { type: 'UPDATE_NEXT_POINTER'; from: number; to: number | null; codeLine?: number }
  | { type: 'UPDATE_PREV_POINTER'; from: number; to: number | null; codeLine?: number }
  | { type: 'HIGHLIGHT_NEXT_POINTER'; from: number; to: number | null; codeLine?: number }
  | { type: 'HIGHLIGHT_PREV_POINTER'; from: number; to: number | null; codeLine?: number }
  | { type: 'HIGHLIGHT_SUCCESS'; nodeId: number; codeLine?: number }
  | { type: 'HIGHLIGHT_FAILURE'; nodeId: number | null; codeLine?: number }
  | { type: 'SET_HEAD'; head: number | null; codeLine?: number }
  | { type: 'SET_TAIL'; tail: number | null; codeLine?: number };