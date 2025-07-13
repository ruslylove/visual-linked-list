import React, { useState, useEffect, useRef } from 'react';
import { NodeType, AnimationStep, ListType } from '../types';

interface LinkedListVisualizerProps {
  nodes: NodeType[];
  head: number | null;
  tail: number | null;
  animation: AnimationStep[];
  currentStepIndex: number | null;
  listType: ListType;
}

interface DisplayNode extends NodeType {
  x: number;
  y: number;
  opacity: number;
  color: string;
  borderColor: string;
  scale: number;
}

const NODE_WIDTH = 80;
const NODE_HEIGHT = 40;
const HORIZONTAL_SPACING = 120;
const VERTICAL_SPACING = 120;
const CANVAS_PADDING = 40;

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({
  nodes: initialNodes,
  head: initialHead,
  tail: initialTail,
  animation,
  currentStepIndex,
  listType
}) => {
  const [displayState, setDisplayState] = useState<{
    nodes: DisplayNode[];
    head: number | null;
    tail: number | null;
    highlightedNextPointer?: { from: number; to: number | null };
    highlightedPrevPointer?: { from: number; to: number | null };
  }>({ nodes: [], head: null, tail: null });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let tempNodes = JSON.parse(JSON.stringify(initialNodes)) as NodeType[];
    let tempHead = initialHead;
    let tempTail = initialTail;

    if (currentStepIndex !== null && currentStepIndex > -1) {
      const stepsToApply = animation.slice(0, currentStepIndex + 1);
      
      stepsToApply.forEach(step => {
        switch (step.type) {
          case 'CREATE':
            if (!tempNodes.some(n => n.id === step.node.id)) {
                tempNodes.push(JSON.parse(JSON.stringify(step.node)));
            }
            break;
          case 'UPDATE_NEXT_POINTER': {
            const node = tempNodes.find(n => n.id === step.from);
            if (node) node.next = step.to;
            break;
          }
           case 'UPDATE_PREV_POINTER': {
            if (listType === 'doubly') {
              const node = tempNodes.find(n => n.id === step.from);
              if (node) node.prev = step.to;
            }
            break;
          }
          case 'SET_HEAD':
            tempHead = step.head;
            break;
          case 'SET_TAIL':
            tempTail = step.tail;
            break;
        }
      });
    }

    const currentStep = currentStepIndex !== null && currentStepIndex > -1 ? animation[currentStepIndex] : null;

    const displayNodes: DisplayNode[] = [];
    const nodePositions: { [key: number]: { x: number; y: number } } = {};
    const containerWidth = containerRef.current?.getBoundingClientRect().width || 800;

    let listCurrentId = tempHead;
    let x = CANVAS_PADDING;
    let y = CANVAS_PADDING + 50;
    while (listCurrentId !== null) {
      const node = tempNodes.find(n => n.id === listCurrentId);
      if (node) {
        if (x + NODE_WIDTH > containerWidth - CANVAS_PADDING) {
          x = CANVAS_PADDING;
          y += VERTICAL_SPACING;
        }
        nodePositions[listCurrentId] = { x, y };
        x += HORIZONTAL_SPACING;
      }
      listCurrentId = node?.next ?? null;
    }

    tempNodes.forEach(node => {
      if (!nodePositions[node.id]) {
        nodePositions[node.id] = { x: CANVAS_PADDING, y: y + VERTICAL_SPACING };
      }
    });
    
    tempNodes.forEach(node => {
      let color = 'bg-blue-500';
      let opacity = 1;
      let scale = 1;
      let borderColor = 'border-transparent';
      
      if (currentStep) {
         switch (currentStep.type) {
            case 'TRAVERSE':
                if(currentStep.nodeId === node.id) {
                    scale = 1.1;
                    borderColor = 'border-yellow-400';
                }
                break;
            case 'HIGHLIGHT_SUCCESS':
                if(currentStep.nodeId === node.id) {
                    color = 'bg-green-500';
                    scale = 1.1;
                    borderColor = 'border-green-300';
                }
                break;
            case 'HIGHLIGHT_FAILURE':
                color = 'bg-red-500';
                break;
            case 'FADE_OUT':
                if(currentStep.nodeId === node.id) opacity = 0;
                break;
            case 'CREATE':
                if(currentStep.node.id === node.id) {
                   scale = 1.1;
                   borderColor = 'border-blue-300';
                }
                break;
         }
      }
      
      const pos = nodePositions[node.id] || { x: 0, y: 0 };
      displayNodes.push({ ...node, ...pos, opacity, color, borderColor, scale });
    });

    let highlightedNextPointer, highlightedPrevPointer;
    if (currentStep) {
      if (currentStep.type === 'HIGHLIGHT_NEXT_POINTER' || currentStep.type === 'UPDATE_NEXT_POINTER') {
        highlightedNextPointer = { from: currentStep.from, to: currentStep.to };
      }
      if (currentStep.type === 'HIGHLIGHT_PREV_POINTER' || currentStep.type === 'UPDATE_PREV_POINTER') {
        highlightedPrevPointer = { from: currentStep.from, to: currentStep.to };
      }
    }

    setDisplayState({
      nodes: displayNodes,
      head: tempHead,
      tail: tempTail,
      highlightedNextPointer,
      highlightedPrevPointer
    });

  }, [initialNodes, initialHead, initialTail, animation, currentStepIndex, listType]);

  const getNodePos = (nodeId: number | null): DisplayNode | undefined => {
    if (nodeId === null) return undefined;
    return displayState.nodes.find(n => n.id === nodeId);
  };
  
  const headPos = getNodePos(displayState.head);
  const tailPos = getNodePos(displayState.tail);

  return (
    <div ref={containerRef} className="relative flex-grow min-h-[300px] md:min-h-[400px] overflow-hidden">
      <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" fill="#9ca3af"><polygon points="0 0, 10 3.5, 0 7" /></marker>
          <marker id="arrowhead-highlight-next" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" fill="#3b82f6"><polygon points="0 0, 10 3.5, 0 7" /></marker>
          <marker id="arrowhead-highlight-prev" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" fill="#fb923c"><polygon points="0 0, 10 3.5, 0 7" /></marker>
        </defs>
        {/* Next Pointers */}
        {displayState.nodes.map(node => {
          const nextNodePos = getNodePos(node.next);
          if (nextNodePos && node.opacity > 0 && nextNodePos.opacity > 0) {
            const isHighlighted = displayState.highlightedNextPointer?.from === node.id;
            return (
              <line
                key={`line-next-${node.id}-${nextNodePos.id}`}
                x1={node.x + NODE_WIDTH} y1={node.y + NODE_HEIGHT / 2}
                x2={nextNodePos.x} y2={nextNodePos.y + NODE_HEIGHT / 2}
                stroke={isHighlighted ? '#3b82f6' : '#9ca3af'}
                strokeWidth="2"
                markerEnd={isHighlighted ? 'url(#arrowhead-highlight-next)' : 'url(#arrowhead)'}
                className="transition-all duration-300"
              />
            );
          }
          return null;
        })}
        {/* Prev Pointers */}
        {listType === 'doubly' && displayState.nodes.map(node => {
          const prevNodePos = getNodePos(node.prev);
          if (prevNodePos && node.opacity > 0 && prevNodePos.opacity > 0) {
            const isHighlighted = displayState.highlightedPrevPointer?.from === node.id;
            const x1 = node.x;
            const y1 = node.y + NODE_HEIGHT / 2;
            const x2 = prevNodePos.x + NODE_WIDTH;
            const y2 = prevNodePos.y + NODE_HEIGHT / 2;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const controlY = y1 + 30;

            return (
              <path
                key={`line-prev-${node.id}-${prevNodePos.id}`}
                d={`M ${x1} ${y1} Q ${midX} ${controlY}, ${x2} ${y2}`}
                stroke={isHighlighted ? '#fb923c' : '#f97316'}
                strokeWidth="2"
                fill="none"
                markerEnd={isHighlighted ? 'url(#arrowhead-highlight-prev)' : 'url(#arrowhead-highlight-prev)'}
                className="transition-all duration-300"
              />
            );
          }
          return null;
        })}
      </svg>
      {displayState.nodes.map(node => (
        <div
          key={node.id}
          className={`absolute flex items-center justify-center rounded-lg shadow-md border-4 text-white font-bold text-lg transition-all duration-300 ease-in-out ${node.color} ${node.borderColor}`}
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
            width: `${NODE_WIDTH}px`,
            height: `${NODE_HEIGHT}px`,
            opacity: node.opacity,
            transform: `scale(${node.scale})`,
            zIndex: 1,
          }}
        >
          {node.value}
        </div>
      ))}
      {headPos && headPos.opacity > 0 && (
        <div className="absolute transition-all duration-300" style={{ left: headPos.x + NODE_WIDTH / 2, top: headPos.y - 30, transform: 'translateX(-50%)', zIndex: 2 }}>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-green-600 rounded-full shadow-lg">HEAD</div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0.5 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-600"></div>
        </div>
      )}
      {tailPos && tailPos.opacity > 0 && (
        <div className="absolute transition-all duration-300" style={{ left: tailPos.x + NODE_WIDTH / 2, top: tailPos.y + NODE_HEIGHT + 8, transform: 'translateX(-50%)', zIndex: 2 }}>
           <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-0.5 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-orange-600"></div>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-orange-600 rounded-full shadow-lg">TAIL</div>
        </div>
      )}
    </div>
  );
};