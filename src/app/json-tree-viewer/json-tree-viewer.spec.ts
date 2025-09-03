import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonTreeViewer } from './json-tree-viewer';
import { JsonTreeViewerService } from './json-tree-viewer.service';
import { TreeNode } from './tree-node.model';

describe('JsonTreeViewer', () => {
  let component: JsonTreeViewer;
  let fixture: ComponentFixture<JsonTreeViewer>;
  let mockClipboard: any;

  beforeEach(async () => {
    mockClipboard = {
      writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve())
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
      configurable: true
    });

    await TestBed.configureTestingModule({
      imports: [JsonTreeViewer],
      providers: [JsonTreeViewerService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonTreeViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input data', () => {
    it('should accept and set data through input', () => {
      const testData = { name: 'John', age: 30 };
      component.data = testData;
      fixture.detectChanges();
      
      expect(component['_data']()).toEqual(testData);
    });

    it('should update tree nodes when data changes', () => {
      const testData = { test: 'value' };
      component.data = testData;
      fixture.detectChanges();
      
      const nodes = component.treeNodes();
      expect(nodes.length).toBeGreaterThan(0);
      expect(nodes[0].type).toBe('object');
    });
  });

  describe('toggleNode', () => {
    it('should expand collapsed node', () => {
      const node: TreeNode = {
        key: 'test',
        value: 0,
        type: 'object',
        depth: 1,
        path: 'root.test'
      };

      component.toggleNode(node);
      expect(component.expandedNodes().has('root.test')).toBe(true);
    });

    it('should collapse expanded node', () => {
      const node: TreeNode = {
        key: 'test',
        value: 0,
        type: 'object',
        depth: 1,
        path: 'root.test'
      };

      component.expandedNodes.set(new Set(['root.test']));
      component.toggleNode(node);
      expect(component.expandedNodes().has('root.test')).toBe(false);
    });

    it('should not affect other expanded nodes', () => {
      const node: TreeNode = {
        key: 'test',
        value: 0,
        type: 'object',
        depth: 1,
        path: 'root.test'
      };

      component.expandedNodes.set(new Set(['root.other']));
      component.toggleNode(node);
      
      const expanded = component.expandedNodes();
      expect(expanded.has('root.test')).toBe(true);
      expect(expanded.has('root.other')).toBe(true);
    });
  });

  describe('setHoveredNode', () => {
    it('should set hovered node path', () => {
      component.setHoveredNode('root.test');
      expect(component.hoveredNode()).toBe('root.test');
    });

    it('should clear hovered node with null', () => {
      component.setHoveredNode('root.test');
      component.setHoveredNode(null);
      expect(component.hoveredNode()).toBeNull();
    });
  });

  describe('copyValue', () => {
    it('should copy formatted value for primitive nodes', async () => {
      const node: TreeNode = {
        key: 'name',
        value: 0,
        formattedValue: '"John"',
        type: 'string',
        depth: 1,
        path: 'root.name'
      };

      const event = new Event('click');
      await component.copyValue(node, event);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('John');
      expect(component.copiedNode()).toBe('root.name');
    });

    it('should copy JSON for object nodes', async () => {
      const testData = { user: { name: 'John' } };
      component.data = testData;
      
      const node: TreeNode = {
        key: 'user',
        value: 1,
        type: 'object',
        depth: 1,
        path: 'root.user'
      };

      const event = new Event('click');
      await component.copyValue(node, event);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify({ name: 'John' }, null, 2)
      );
    });

    it('should copy JSON for array nodes', async () => {
      const testData = { items: [1, 2, 3] };
      component.data = testData;
      
      const node: TreeNode = {
        key: 'items',
        value: 3,
        type: 'array',
        depth: 1,
        path: 'root.items'
      };

      const event = new Event('click');
      await component.copyValue(node, event);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        JSON.stringify([1, 2, 3], null, 2)
      );
    });

    it('should handle clipboard error gracefully', async () => {
      mockClipboard.writeText.and.returnValue(Promise.reject('Error'));
      spyOn(console, 'error');

      const node: TreeNode = {
        key: 'test',
        value: 0,
        formattedValue: '"value"',
        type: 'string',
        depth: 1,
        path: 'root.test'
      };

      const event = new Event('click');
      await component.copyValue(node, event);

      expect(console.error).toHaveBeenCalledWith('Failed to copy:', 'Error');
    });

    it('should clear copied node after timeout', async () => {
      jasmine.clock().install();

      const node: TreeNode = {
        key: 'test',
        value: 0,
        formattedValue: '"value"',
        type: 'string',
        depth: 1,
        path: 'root.test'
      };

      const event = new Event('click');
      await component.copyValue(node, event);

      expect(component.copiedNode()).toBe('root.test');

      jasmine.clock().tick(2100);
      expect(component.copiedNode()).toBeNull();

      jasmine.clock().uninstall();
    });

    it('should stop event propagation', async () => {
      const node: TreeNode = {
        key: 'test',
        value: 0,
        formattedValue: '"value"',
        type: 'string',
        depth: 1,
        path: 'root.test'
      };

      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      
      await component.copyValue(node, event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('expandAll', () => {
    it('should expand all expandable nodes', () => {
      const testData = {
        user: {
          profile: { name: 'John' },
          settings: { theme: 'dark' }
        },
        items: [1, 2]
      };
      component.data = testData;
      component.expandAll();

      const expanded = component.expandedNodes();
      expect(expanded.has('root')).toBe(true);
      expect(expanded.has('root.user')).toBe(true);
      expect(expanded.has('root.user.profile')).toBe(true);
      expect(expanded.has('root.user.settings')).toBe(true);
      expect(expanded.has('root.items')).toBe(true);
    });

    it('should handle empty data', () => {
      component.data = {};
      component.expandAll();
      
      const expanded = component.expandedNodes();
      expect(expanded.has('root')).toBe(true);
    });
  });

  describe('collapseAll', () => {
    it('should clear all expanded nodes', () => {
      component.expandedNodes.set(new Set(['root', 'root.user', 'root.items']));
      component.collapseAll();

      expect(component.expandedNodes().size).toBe(0);
    });
  });

  describe('Style methods', () => {
    beforeEach(() => {
      spyOn(component['treeService'], 'getValueColor').and.returnValue('text-green-600');
      spyOn(component['treeService'], 'getItemCountText').and.returnValue('5 items');
      spyOn(component['treeService'], 'getTypeLabel').and.returnValue('{ }');
      spyOn(component['treeService'], 'getTypeBadgeClass').and.returnValue('inline-flex items-center bg-amber-50');
    });

    it('should delegate getValueColor to service', () => {
      const result = component.getValueColor('string');
      expect(component['treeService'].getValueColor).toHaveBeenCalledWith('string');
      expect(result).toBe('text-green-600');
    });

    it('should delegate getItemCount to service', () => {
      const result = component.getItemCount(5);
      expect(component['treeService'].getItemCountText).toHaveBeenCalledWith(5);
      expect(result).toBe('5 items');
    });

    it('should handle string value in getItemCount', () => {
      component.getItemCount('not a number' as any);
      expect(component['treeService'].getItemCountText).toHaveBeenCalledWith(0);
    });


    it('should delegate getTypeLabel to service', () => {
      const result = component.getTypeLabel('object');
      expect(component['treeService'].getTypeLabel).toHaveBeenCalledWith('object');
      expect(result).toBe('{ }');
    });

    it('should delegate getTypeBadgeClass to service', () => {
      const result = component.getTypeBadgeClass('object');
      expect(component['treeService'].getTypeBadgeClass).toHaveBeenCalledWith('object');
      expect(result).toBe('inline-flex items-center bg-amber-50');
    });
  });

  describe('Computed treeNodes', () => {
    it('should update when data changes', () => {
      component.data = { a: 1 };
      fixture.detectChanges();
      
      let nodes = component.treeNodes();
      expect(nodes.length).toBe(1);

      component.data = { a: 1, b: 2 };
      fixture.detectChanges();
      
      nodes = component.treeNodes();
      expect(nodes.length).toBe(1);
    });

    it('should update when expandedNodes change', () => {
      const testData = { user: { name: 'John' } };
      component.data = testData;
      fixture.detectChanges();
      
      let nodes = component.treeNodes();
      const initialLength = nodes.length;

      component.expandedNodes.set(new Set(['root']));
      fixture.detectChanges();
      
      nodes = component.treeNodes();
      expect(nodes.length).toBeGreaterThan(initialLength);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle circular reference detection', () => {
      const data: any = { name: 'test' };
      data.self = data;
      
      expect(() => {
        component.data = data;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should render deeply nested structures', () => {
      const deepData = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: 'deep value'
              }
            }
          }
        }
      };

      component.data = deepData;
      component.expandAll();
      fixture.detectChanges();
      
      const nodes = component.treeNodes();
      const deepNode = nodes.find(n => n.path === 'root.level1.level2.level3.level4.level5');
      expect(deepNode).toBeDefined();
      expect(deepNode?.formattedValue).toBe('"deep value"');
    });

    it('should handle mixed data types', () => {
      const mixedData = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 'two', false, null],
        nested: {
          object: { key: 'value' }
        }
      };

      component.data = mixedData;
      component.expandAll();
      fixture.detectChanges();
      
      const nodes = component.treeNodes();
      expect(nodes.length).toBeGreaterThan(6);
    });

    it('should handle unicode and special characters', () => {
      const specialData = {
        emoji: '🚀',
        chinese: '你好',
        special: 'line\nbreak',
        quotes: 'He said "hello"'
      };

      component.data = specialData;
      component.expandedNodes.set(new Set(['root']));
      fixture.detectChanges();
      
      const nodes = component.treeNodes();
      expect(nodes.find(n => n.key === 'emoji')?.formattedValue).toBe('"🚀"');
      expect(nodes.find(n => n.key === 'chinese')?.formattedValue).toBe('"你好"');
    });

    it('should preserve numerical precision', () => {
      const numberData = {
        integer: 42,
        float: 3.14159,
        scientific: 1e-10,
        large: 9007199254740991
      };

      component.data = numberData;
      component.expandedNodes.set(new Set(['root']));
      fixture.detectChanges();
      
      const nodes = component.treeNodes();
      const floatNode = nodes.find(n => n.key === 'float');
      expect(floatNode?.value).toBe(3.14159);
      expect(floatNode?.formattedValue).toBe('3.14159');
    });
  });

  describe('Performance', () => {
    it('should handle large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `item${i}` }));
      const startTime = performance.now();
      
      component.data = { items: largeArray };
      component.expandAll();
      fixture.detectChanges();
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle large objects efficiently', () => {
      const largeObject: any = {};
      for (let i = 0; i < 1000; i++) {
        largeObject[`key${i}`] = `value${i}`;
      }
      
      const startTime = performance.now();
      
      component.data = largeObject;
      component.expandAll();
      fixture.detectChanges();
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});