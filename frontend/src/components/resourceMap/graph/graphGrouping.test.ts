import { KubeMetadata } from '../../../lib/k8s/KubeMetadata';
import { KubeObject } from '../../../lib/k8s/KubeObject';
import { groupGraph } from './graphGrouping';
import { GraphEdge, KubeObjectNode } from './graphModel';

describe('groupGraph', () => {
  const nodes: KubeObjectNode[] = [
    {
      id: '1',
      type: 'kubeObject',
      data: {
        resource: {
          kind: 'Pod',
          metadata: {
            namespace: 'ns1',
            name: 'pod1',
            labels: { 'app.kubernetes.io/instance': 'instance1' },
          } as any as KubeMetadata,
        } as KubeObject,
      },
    },
    {
      id: '2',
      type: 'kubeObject',
      data: {
        resource: {
          kind: 'Pod',
          metadata: { namespace: 'ns2', name: 'pod2' } as KubeMetadata,
          spec: { nodeName: 'node1' },
        } as any as KubeObject,
      },
    },
    {
      id: '3',
      type: 'kubeObject',
      data: {
        resource: {
          kind: 'Pod',
          metadata: {
            namespace: 'ns1',
            name: 'pod3',
            labels: { 'app.kubernetes.io/instance': 'instance1' },
          } as any as KubeMetadata,
        } as KubeObject,
      },
    },
    {
      id: '4',
      type: 'kubeObject',
      data: {
        resource: {
          kind: 'Pod',
          metadata: { namespace: 'ns2', name: 'pod4' } as KubeMetadata,
        } as KubeObject,
      },
    },
  ];

  const edges: GraphEdge[] = [];

  it('groups nodes by namespace', () => {
    const groupedGraph = groupGraph(nodes, edges, { groupBy: 'namespace' });
    const namespaces = groupedGraph.data.nodes.map(node => node.id);

    // Nodes 1 and 3 are grouped into Namespace-ns1 group
    // Nodes 2 and 4 are grouped into Namespace-ns2 group
    expect(namespaces).toEqual(['Namespace-ns1', 'Namespace-ns2']);
  });

  it('groups nodes by node', () => {
    const groupedGraph = groupGraph(nodes, edges, { groupBy: 'node' });
    const nodeNames = groupedGraph.data.nodes.map(node => node.id);

    // Node 2 is grouped into Node-node1 group
    // Nodes 1, 3 and 4 don't have a node and are not grouped
    expect(nodeNames).toEqual(['Node-node1', '1', '3', '4']);
  });

  it('groups nodes by instance', () => {
    const groupedGraph = groupGraph(nodes, edges, { groupBy: 'instance' });
    const instances = groupedGraph.data.nodes.map(node => node.id);

    // Nodes 1 and 3 have the same instance label and grouped into Instance-instance1 group
    // Nodes 2 and 4 don't have instance label
    expect(instances).toEqual(['Instance-instance1', '2', '4']);
  });

  it('group nodes as connected components when no groupBy is specified', () => {
    const groupedGraph = groupGraph(
      nodes,
      [{ id: 'e2', source: '2', target: '4', type: 'kubeRelation' }],
      {}
    );
    const instances = groupedGraph.data.nodes.map(node => node.id);

    // Nodes 2 and 4 are connected by the egde and so are grouped together
    // group-2 takes has 2 in it because it's the ID of the first node
    expect(instances).toEqual(['group-2', '1', '3']);
  });
});