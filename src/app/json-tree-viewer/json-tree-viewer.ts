import { Component, Input, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeNode, JsonValue } from './tree-node.model';
import { JsonTreeViewerService } from './json-tree-viewer.service';

@Component({
  selector: 'app-json-tree-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './json-tree-viewer.html',
  styleUrl: './json-tree-viewer.scss',
  providers: [JsonTreeViewerService]
})
export class JsonTreeViewer {
  private readonly treeService = inject(JsonTreeViewerService);

  @Input() set data(value: JsonValue) {
    this._data.set(value);
  }

  private _data = signal<JsonValue>({});
  expandedNodes = signal<Set<string>>(new Set());
  hoveredNode = signal<string | null>(null);
  copiedNode = signal<string | null>(null);

  treeNodes = computed(() => {
    return this.treeService.buildTree(this._data(), this.expandedNodes());
  });

  toggleNode(node: TreeNode): void {
    const expanded = new Set(this.expandedNodes());
    if (expanded.has(node.path)) {
      expanded.delete(node.path);
    } else {
      expanded.add(node.path);
    }
    this.expandedNodes.set(expanded);
  }

  setHoveredNode(path: string | null): void {
    this.hoveredNode.set(path);
  }

  async copyValue(node: TreeNode, event: Event): Promise<void> {
    event.stopPropagation();

    let textToCopy: string;
    if (node.type === 'object' || node.type === 'array') {
      const originalData = this.treeService.getValueFromPath(this._data(), node.path);
      textToCopy = JSON.stringify(originalData, null, 2);
    } else {
      textToCopy = node.formattedValue ? node.formattedValue.replace(/^"|"$/g, '') : String(node.value);
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.copiedNode.set(node.path);
      setTimeout(() => {
        if (this.copiedNode() === node.path) {
          this.copiedNode.set(null);
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  expandAll(): void {
    const allPaths = this.treeService.getAllExpandablePaths(this._data());
    this.expandedNodes.set(allPaths);
  }

  collapseAll(): void {
    this.expandedNodes.set(new Set());
  }

  getValueColor(type: TreeNode['type']): string {
    return this.treeService.getValueColor(type);
  }

  getItemCount(count: string | number): string {
    return this.treeService.getItemCountText(typeof count === 'number' ? count : 0);
  }

  getIndentGuides(node: TreeNode): string[] {
    return this.treeService.getIndentGuides(node);
  }

  getTypeLabel(type: TreeNode['type']): string {
    return this.treeService.getTypeLabel(type);
  }

  getTypeBadgeClass(type: TreeNode['type']): string {
    return this.treeService.getTypeBadgeClass(type);
  }

}
