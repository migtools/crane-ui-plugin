import {
  ComponentFactory,
  DagreLayout,
  GraphComponent,
  LayoutFactory,
  ModelKind,
  Graph,
} from '@patternfly/react-topology';
import BuilderFinallyNode from './BuilderFinallyNode';
import BuilderNode from './BuilderNode';
import { NodeType, PipelineLayout } from './const';
import FinallyNode from './FinallyNode';
import InvalidTaskListNode from './InvalidTaskListNode';
import LoadingNode from './LoadingNode';
import SpacerNode from './SpacerNode';
import TaskEdge from './TaskEdge';
import TaskListNode from './TaskListNode';
import TaskNode from './TaskNode';
import { getLayoutData } from './utils';

export const componentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (kind) {
    case ModelKind.graph:
      return GraphComponent as ReturnType<ComponentFactory>;
    case ModelKind.edge:
      return TaskEdge as ReturnType<ComponentFactory>;
    case ModelKind.node:
      switch (type) {
        case NodeType.TASK_NODE:
          return TaskNode as ReturnType<ComponentFactory>;
        case NodeType.SPACER_NODE:
          return SpacerNode as ReturnType<ComponentFactory>;
        case NodeType.TASK_LIST_NODE:
          return TaskListNode as ReturnType<ComponentFactory>;
        case NodeType.INVALID_TASK_LIST_NODE:
          return InvalidTaskListNode as ReturnType<ComponentFactory>;
        case NodeType.BUILDER_NODE:
          return BuilderNode as ReturnType<ComponentFactory>;
        case NodeType.FINALLY_NODE:
          return FinallyNode as ReturnType<ComponentFactory>;
        case NodeType.BUILDER_FINALLY_NODE:
          return BuilderFinallyNode as ReturnType<ComponentFactory>;
        case NodeType.LOADING_NODE:
          return LoadingNode as ReturnType<ComponentFactory>;
        default:
          return undefined;
      }
    default:
      return undefined;
  }
};

export const layoutFactory: LayoutFactory = (type: string, graph: Graph) => {
  switch (type) {
    case PipelineLayout.DAGRE_BUILDER:
    case PipelineLayout.DAGRE_VIEWER:
    case PipelineLayout.DAGRE_VIEWER_SPACED:
    case PipelineLayout.DAGRE_BUILDER_SPACED:
      return new DagreLayout(graph, {
        // Hack to get around undesirable defaults
        // TODO: fix this, it's not ideal but it works for now
        linkDistance: 0,
        nodeDistance: 0,
        groupDistance: 0,
        collideDistance: 0,
        simulationSpeed: 0,
        chargeStrength: 0,
        allowDrag: false,
        layoutOnDrag: false,
        ...getLayoutData(type),
      });
    default:
      return undefined;
  }
};
