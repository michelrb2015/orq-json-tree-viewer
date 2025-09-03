import { TestBed } from '@angular/core/testing';
import { JsonTreeViewerService } from './json-tree-viewer.service';

describe('JsonTreeViewerService', () => {
  let service: JsonTreeViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JsonTreeViewerService]
    });
    service = TestBed.inject(JsonTreeViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildTree', () => {
    it('should return empty array for null data', () => {
      const result = service.buildTree(null, new Set());
      expect(result).toEqual([]);
    });

    it('should build tree for simple object', () => {
      const data = { name: 'John', age: 30 };
      const result = service.buildTree(data, new Set());
      
      expect(result.length).toBe(1);
      expect(result[0].key).toBe('root');
      expect(result[0].type).toBe('object');
      expect(result[0].value).toBe(2);
    });

    it('should build tree for array', () => {
      const data = [1, 2, 3];
      const result = service.buildTree(data, new Set());
      
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('array');
      expect(result[0].value).toBe(3);
    });

    it('should expand nodes when in expandedNodes set', () => {
      const data = { user: { name: 'John' } };
      const expandedNodes = new Set(['root']);
      const result = service.buildTree(data, expandedNodes);
      
      expect(result.length).toBe(2);
      expect(result[1].key).toBe('user');
    });

    it('should handle nested structures', () => {
      const data = {
        users: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      };
      const expandedNodes = new Set(['root', 'root.users']);
      const result = service.buildTree(data, expandedNodes);
      
      expect(result.length).toBe(4); // root, users, first object (0), second object (1)
      expect(result[1].key).toBe('users');
      expect(result[2].key).toBe('0');
      expect(result[3].key).toBe('1');
    });

    it('should handle all primitive types', () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null
      };
      const expandedNodes = new Set(['root']);
      const result = service.buildTree(data, expandedNodes);
      
      const types = result.slice(1).map(node => node.type);
      expect(types).toEqual(['string', 'number', 'boolean', 'null']);
    });
  });

  describe('getAllExpandablePaths', () => {
    it('should return empty set for primitives', () => {
      expect(service.getAllExpandablePaths('string')).toEqual(new Set());
      expect(service.getAllExpandablePaths(42)).toEqual(new Set());
      expect(service.getAllExpandablePaths(true)).toEqual(new Set());
      expect(service.getAllExpandablePaths(null)).toEqual(new Set());
    });

    it('should collect all object paths', () => {
      const data = {
        user: {
          profile: {
            name: 'John'
          }
        }
      };
      const paths = service.getAllExpandablePaths(data);
      
      expect(paths.has('root')).toBe(true);
      expect(paths.has('root.user')).toBe(true);
      expect(paths.has('root.user.profile')).toBe(true);
      expect(paths.size).toBe(3);
    });

    it('should collect all array paths', () => {
      const data = {
        items: [
          { id: 1 },
          { id: 2 }
        ]
      };
      const paths = service.getAllExpandablePaths(data);
      
      expect(paths.has('root')).toBe(true);
      expect(paths.has('root.items')).toBe(true);
      expect(paths.has('root.items.0')).toBe(true);
      expect(paths.has('root.items.1')).toBe(true);
    });
  });

  describe('getValueFromPath', () => {
    const data = {
      user: {
        name: 'John',
        hobbies: ['reading', 'coding']
      }
    };

    it('should get root value', () => {
      const result = service.getValueFromPath(data, 'root');
      expect(result).toEqual(data);
    });

    it('should get nested object value', () => {
      const result = service.getValueFromPath(data, 'root.user.name');
      expect(result).toBe('John');
    });

    it('should get array element', () => {
      const result = service.getValueFromPath(data, 'root.user.hobbies.0');
      expect(result).toBe('reading');
    });

    it('should return undefined for invalid path', () => {
      const result = service.getValueFromPath(data, 'root.invalid.path');
      expect(result).toBeUndefined();
    });
  });

  describe('getValueColor', () => {
    it('should return correct colors for each type', () => {
      expect(service.getValueColor('string')).toBe('text-green-600');
      expect(service.getValueColor('number')).toBe('text-blue-600');
      expect(service.getValueColor('boolean')).toBe('text-purple-600');
      expect(service.getValueColor('null')).toBe('text-gray-500');
      expect(service.getValueColor('object')).toBe('text-gray-700');
      expect(service.getValueColor('array')).toBe('text-gray-700');
    });
  });

  describe('getTypeLabel', () => {
    it('should return correct labels for each type', () => {
      expect(service.getTypeLabel('object')).toBe('{ }');
      expect(service.getTypeLabel('array')).toBe('[ ]');
      expect(service.getTypeLabel('string')).toBe('str');
      expect(service.getTypeLabel('number')).toBe('num');
      expect(service.getTypeLabel('boolean')).toBe('bool');
      expect(service.getTypeLabel('null')).toBe('null');
    });
  });

  describe('getTypeBadgeClass', () => {
    it('should return correct badge classes for each type', () => {
      const objectClass = service.getTypeBadgeClass('object');
      expect(objectClass).toContain('bg-amber-50');
      expect(objectClass).toContain('text-amber-700');

      const arrayClass = service.getTypeBadgeClass('array');
      expect(arrayClass).toContain('bg-indigo-50');
      expect(arrayClass).toContain('text-indigo-700');

      const stringClass = service.getTypeBadgeClass('string');
      expect(stringClass).toContain('bg-emerald-50');
      expect(stringClass).toContain('text-emerald-700');
    });
  });

  describe('getItemCountText', () => {
    it('should return singular for 1 item', () => {
      expect(service.getItemCountText(1)).toBe('1 item');
    });

    it('should return plural for multiple items', () => {
      expect(service.getItemCountText(0)).toBe('0 items');
      expect(service.getItemCountText(5)).toBe('5 items');
    });

    it('should return empty string for non-numbers', () => {
      expect(service.getItemCountText(NaN)).toBe('');
    });
  });

  describe('getIndentGuides', () => {
    it('should return empty array for root node', () => {
      const node = { depth: 0, parentIsLast: [] } as any;
      expect(service.getIndentGuides(node)).toEqual([]);
    });

    it('should return guides based on depth', () => {
      const node = { depth: 3, parentIsLast: [false, false, true] } as any;
      const guides = service.getIndentGuides(node);
      
      expect(guides.length).toBe(3);
      expect(guides[0]).toBe('border-l');
      expect(guides[1]).toBe('border-l');
      expect(guides[2]).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const result = service.buildTree({}, new Set());
      expect(result[0].value).toBe(0);
    });

    it('should handle empty arrays', () => {
      const result = service.buildTree([], new Set());
      expect(result[0].value).toBe(0);
    });

    it('should handle deeply nested structures', () => {
      const deepData = { a: { b: { c: { d: { e: 'value' } } } } };
      const paths = service.getAllExpandablePaths(deepData);
      
      expect(paths.has('root.a.b.c.d')).toBe(true);
    });

    it('should format string values with quotes', () => {
      const data = { text: 'hello' };
      const expandedNodes = new Set(['root']);
      const result = service.buildTree(data, expandedNodes);
      
      expect(result[1].formattedValue).toBe('"hello"');
    });

    it('should handle special characters in strings', () => {
      const data = { text: 'hello"world' };
      const expandedNodes = new Set(['root']);
      const result = service.buildTree(data, expandedNodes);
      
      expect(result[1].formattedValue).toBe('"hello"world"');
    });
  });
});