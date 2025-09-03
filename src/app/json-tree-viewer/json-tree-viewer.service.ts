import { Injectable } from '@angular/core';
import { TreeNode, NodeType, JsonValue, JsonObject, JsonArray } from './tree-node.model';

@Injectable({
  providedIn: 'root'
})
export class JsonTreeViewerService {
  
  buildTree(data: JsonValue, expandedNodes: Set<string>): TreeNode[] {
    if (!data) return [];
    const nodes = this.createNodes('root', data, 0, '', [], expandedNodes);
    return this.flattenTree(nodes);
  }

  getAllExpandablePaths(data: JsonValue): Set<string> {
    const paths = new Set<string>();
    this.collectPaths('root', data, '', paths);
    return paths;
  }

  getValueFromPath(data: JsonValue, path: string): JsonValue | undefined {
    const keys = path.split('.').slice(1);
    return keys.reduce<JsonValue | undefined>((acc, key) => {
      if (acc && typeof acc === 'object' && acc !== null) {
        if (Array.isArray(acc)) {
          return acc[parseInt(key)];
        } else {
          return (acc as JsonObject)[key];
        }
      }
      return undefined;
    }, data);
  }

  getValueColor(type: NodeType): string {
    const colorMap: Record<NodeType, string> = {
      'string': 'text-green-600',
      'number': 'text-blue-600',
      'boolean': 'text-purple-600',
      'null': 'text-gray-500',
      'object': 'text-gray-700',
      'array': 'text-gray-700'
    };
    return colorMap[type];
  }

  getTypeLabel(type: NodeType): string {
    const labelMap: Record<NodeType, string> = {
      'object': '{}',
      'array': '[]',
      'string': '',
      'number': '',
      'boolean': '',
      'null': ''
    };
    return labelMap[type];
  }

  getTypeBadgeClass(type: NodeType): string {
    const baseClass = 'inline-flex items-center text-xs font-medium';
    
    const typeClasses: Record<NodeType, string> = {
      'object': `${baseClass} text-amber-600`,
      'array': `${baseClass} text-indigo-600`,
      'string': `${baseClass} text-emerald-600`,
      'number': `${baseClass} text-blue-600`,
      'boolean': `${baseClass} text-purple-600`,
      'null': `${baseClass} text-gray-500`
    };
    
    return typeClasses[type];
  }

  getItemCountText(count: number): string {
    if (typeof count !== 'number' || isNaN(count)) return '';
    return count === 1 ? '1 item' : `${count} items`;
  }

  getIndentGuides(node: TreeNode): string[] {
    const guides: string[] = [];
    // Don't show any guides - return empty strings for spacing
    for (let i = 0; i < node.depth; i++) {
      guides.push('');
    }
    return guides;
  }

  private createNodes(
    key: string,
    value: JsonValue,
    depth: number,
    parentPath: string,
    parentIsLast: boolean[],
    expandedNodes: Set<string>
  ): TreeNode[] {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const type = this.getType(value);

    if (type === 'object' || type === 'array') {
      return this.createContainerNode(key, value as JsonObject | JsonArray, type, depth, path, parentIsLast, expandedNodes);
    }

    const formattedValue = this.formatValue(value, type);
    return [{
      key,
      value: typeof value === 'number' ? value : (typeof value === 'string' ? value.length : 0),
      formattedValue,
      type,
      depth,
      path,
      parentIsLast: [...parentIsLast]
    }];
  }

  private createContainerNode(
    key: string,
    value: JsonObject | JsonArray,
    type: NodeType,
    depth: number,
    path: string,
    parentIsLast: boolean[],
    expandedNodes: Set<string>
  ): TreeNode[] {
    const count: number = Array.isArray(value) ? value.length : Object.keys(value).length;
    const node: TreeNode = {
      key,
      value: count,
      type,
      depth,
      path,
      isExpanded: expandedNodes.has(path),
      parentIsLast: [...parentIsLast]
    };

    if (expandedNodes.has(path)) {
      const entries: Array<[string, JsonValue]> = type === 'array'
        ? (value as JsonArray).map((v, i) => [i.toString(), v])
        : Object.entries(value as JsonObject);

      node.children = entries.flatMap(([k, v], index) => {
        const isLast = index === entries.length - 1;
        return this.createNodes(k, v, depth + 1, path, [...parentIsLast, isLast], expandedNodes);
      });
    }

    return [node];
  }

  private collectPaths(key: string, value: JsonValue, parentPath: string, paths: Set<string>): void {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const type = this.getType(value);

    if (type === 'object' || type === 'array') {
      paths.add(path);
      const entries: Array<[string, JsonValue]> = type === 'array'
        ? (value as JsonArray).map((v, i) => [i.toString(), v])
        : Object.entries(value as JsonObject);
      entries.forEach(([k, v]) => this.collectPaths(k, v, path, paths));
    }
  }

  private flattenTree(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];
    
    const flatten = (nodeList: TreeNode[]) => {
      for (const node of nodeList) {
        result.push(node);
        if (node.children && node.isExpanded) {
          flatten(node.children);
        }
      }
    };

    flatten(nodes);
    return result;
  }

  private getType(value: JsonValue): NodeType {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    const type = typeof value;
    if (type === 'object') return 'object';
    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    return 'null';
  }

  private formatValue(value: JsonValue, type: NodeType): string {
    if (type === 'string') return `"${value}"`;
    if (type === 'null') return 'null';
    return String(value);
  }
}