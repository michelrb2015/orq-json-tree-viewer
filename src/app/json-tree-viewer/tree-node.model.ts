export type NodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject { [key: string]: JsonValue }
export interface JsonArray extends Array<JsonValue> {}

export interface TreeNode {
  key: string;
  value: string | number;
  formattedValue?: string;
  type: NodeType;
  depth: number;
  path: string;
  isExpanded?: boolean;
  children?: TreeNode[];
  parentIsLast?: boolean[];
}