import React, { useState, useCallback, useEffect } from 'react';
import { Controls } from './components/Controls';
import { LinkedListVisualizer } from './components/LinkedListVisualizer';
import { Explanation } from './components/Explanation';
import { getExplanationForOperation } from './services/geminiService';
import { javaCodeSnippets } from './services/javaCode';
import { OperationType, AnimationStep, NodeType, ListType } from './types';

const INITIAL_NODES_SINGLY: NodeType[] = [
  { id: 1, value: 12, next: 2 },
  { id: 2, value: 99, next: 3 },
  { id: 3, value: 37, next: null },
];

const INITIAL_NODES_DOUBLY: NodeType[] = [
  { id: 1, value: 12, next: 2, prev: null },
  { id: 2, value: 99, next: 3, prev: 1 },
  { id: 3, value: 37, next: null, prev: 2 },
];

export const App: React.FC = () => {
  const [listType, setListType] = useState<ListType>('singly');
  const [nodes, setNodes] = useState<NodeType[]>(INITIAL_NODES_SINGLY);
  const [head, setHead] = useState<number | null>(1);
  const [tail, setTail] = useState<number | null>(3);
  
  const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  const [explanation, setExplanation] = useState<string>('');
  const [isFetchingExplanation, setIsFetchingExplanation] = useState<boolean>(false);
  const [idCounter, setIdCounter] = useState<number>(4);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [highlightedCodeLine, setHighlightedCodeLine] = useState<number | null>(null);

  const isAnimating = currentStepIndex !== null;

  const resetList = (type: ListType) => {
    setListType(type);
    if (type === 'singly') {
      setNodes(INITIAL_NODES_SINGLY);
      setHead(1);
      setTail(3);
    } else {
      setNodes(INITIAL_NODES_DOUBLY);
      setHead(1);
      setTail(3);
    }
    setAnimationSteps([]);
    setCurrentStepIndex(null);
    setCurrentCode('');
    setHighlightedCodeLine(null);
    setExplanation('');
    setIdCounter(4);
  }

  const handleListTypeChange = (type: ListType) => {
    if (type !== listType) {
      resetList(type);
    }
  };

  useEffect(() => {
    if (isAnimating && currentStepIndex >= 0 && currentStepIndex < animationSteps.length) {
      const step = animationSteps[currentStepIndex];
      if (step?.codeLine) {
        setHighlightedCodeLine(step.codeLine);
      }
    } else {
      setHighlightedCodeLine(null);
    }
  }, [currentStepIndex, animationSteps, isAnimating]);

  const generateNodeId = () => {
    const newId = idCounter;
    setIdCounter(prev => prev + 1);
    return newId;
  };

  const fetchExplanation = async (operation: OperationType, type: ListType, details: Record<string, any>) => {
    setIsFetchingExplanation(true);
    setExplanation('');
    try {
      const response = await getExplanationForOperation(operation, type, details);
      setExplanation(response);
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      setExplanation("Sorry, I couldn't fetch an explanation for this operation.");
    } finally {
      setIsFetchingExplanation(false);
    }
  };

  const handleOperation = useCallback((type: OperationType, value: number) => {
    if (isAnimating) return;
    
    setCurrentCode(javaCodeSnippets[listType][type]);
    
    const steps: AnimationStep[] = [];
    const opDetails: Record<string, any> = { value };

    // Prefetch explanation before starting animation
    const detailsForFetch = { ...opDetails };
    if (type === OperationType.REMOVE_FIRST && head !== null) {
      detailsForFetch.removedValue = nodes.find(n => n.id === head)?.value;
    }
    if (type === OperationType.REMOVE_LAST && tail !== null) {
        detailsForFetch.removedValue = nodes.find(n => n.id === tail)?.value;
    }
    fetchExplanation(type, listType, detailsForFetch);

    switch (type) {
      case OperationType.ADD_FIRST: {
        const wasEmpty = head === null;
        const newNodeId = generateNodeId();
        
        if (listType === 'singly') {
          const newNode: NodeType = { id: newNodeId, value, next: head };
          steps.push({ type: 'CREATE', node: newNode, codeLine: 5 });
          steps.push({ type: 'SET_HEAD', head: newNodeId, codeLine: 6 });
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 7 }); // if check
          if (wasEmpty) {
              steps.push({ type: 'SET_TAIL', tail: newNodeId, codeLine: 8 });
          }
        } else { // doubly
          const newNode: NodeType = { id: newNodeId, value, next: head, prev: null };
          steps.push({ type: 'CREATE', node: newNode, codeLine: 3 });
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 4 }); // if (head != null)
          if(head !== null) {
            steps.push({ type: 'HIGHLIGHT_PREV_POINTER', from: head, to: newNodeId, codeLine: 5 });
            steps.push({ type: 'UPDATE_PREV_POINTER', from: head, to: newNodeId, codeLine: 5 });
          }
          steps.push({ type: 'SET_HEAD', head: newNodeId, codeLine: 7 });
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 8 }); // if (tail == null)
          if (wasEmpty) {
            steps.push({ type: 'SET_TAIL', tail: newNodeId, codeLine: 9 });
          }
        }
        break;
      }
      case OperationType.ADD_LAST: {
        const wasEmpty = head === null;
        const newNodeId = generateNodeId();

        if (listType === 'singly') {
          const newNode: NodeType = { id: newNodeId, value, next: null };
          steps.push({ type: 'CREATE', node: newNode, codeLine: 5 });
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 6 }); // if check
          if (wasEmpty) {
              steps.push({ type: 'SET_HEAD', head: newNodeId, codeLine: 7 });
          } else {
              steps.push({ type: 'HIGHLIGHT_NEXT_POINTER', from: tail!, to: newNodeId, codeLine: 9 });
              steps.push({ type: 'UPDATE_NEXT_POINTER', from: tail!, to: newNodeId, codeLine: 9 });
          }
          steps.push({ type: 'SET_TAIL', tail: newNodeId, codeLine: 11 });
        } else { // doubly
           const newNode: NodeType = { id: newNodeId, value, next: null, prev: tail };
           steps.push({ type: 'CREATE', node: newNode, codeLine: 3 });
           steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 4 }); // if (tail != null)
           if (tail !== null) {
              steps.push({ type: 'HIGHLIGHT_NEXT_POINTER', from: tail, to: newNodeId, codeLine: 5 });
              steps.push({ type: 'UPDATE_NEXT_POINTER', from: tail, to: newNodeId, codeLine: 5 });
           }
           steps.push({ type: 'SET_TAIL', tail: newNodeId, codeLine: 7 });
           steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 8 }); // if (head == null)
           if (wasEmpty) {
              steps.push({ type: 'SET_HEAD', head: newNodeId, codeLine: 9 });
           }
        }
        break;
      }
      case OperationType.REMOVE_FIRST: {
        if (head === null) break;
        const oldHeadNode = nodes.find(n => n.id === head)!;
        
        if (listType === 'singly') {
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 5 }); // if check
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 6 }); // answer = head.value
          steps.push({ type: 'SET_HEAD', head: oldHeadNode.next, codeLine: 7 });
          steps.push({ type: 'FADE_OUT', nodeId: oldHeadNode.id, codeLine: 7 });
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 8 }); // second if check
          if (oldHeadNode.next === null) { // list became empty
              steps.push({ type: 'SET_TAIL', tail: null, codeLine: 9 });
          }
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 11 }); // return
        } else { // doubly
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 3 }); // if check
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 5 }); // answer = head.value
          steps.push({ type: 'SET_HEAD', head: oldHeadNode.next, codeLine: 6 });
          steps.push({ type: 'FADE_OUT', nodeId: oldHeadNode.id, codeLine: 6 });
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 8 }); // if (head == null)
          if(oldHeadNode.next === null) {
             steps.push({ type: 'SET_TAIL', tail: null, codeLine: 9 });
          } else {
             steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 10 }); // else
             steps.push({ type: 'HIGHLIGHT_PREV_POINTER', from: oldHeadNode.next, to: null, codeLine: 11 });
             steps.push({ type: 'UPDATE_PREV_POINTER', from: oldHeadNode.next, to: null, codeLine: 11 });
          }
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 13 }); // return
        }
        break;
      }
       case OperationType.REMOVE_LAST: {
        if (tail === null || head === null) break;

        if (listType === 'singly') {
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 5 }); // if check
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 7 }); // answer = tail.value
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 9 }); // if (head == tail)
          if (head === tail) {
              steps.push({ type: 'FADE_OUT', nodeId: head, codeLine: 10 });
              steps.push({ type: 'SET_HEAD', head: null, codeLine: 10 });
              steps.push({ type: 'SET_TAIL', tail: null, codeLine: 10 });
          } else {
              steps.push({ type: 'TRAVERSE', nodeId: head, codeLine: 12 }); // current = head
              let currId: number | null = head;
              let preTailNodeId: number | undefined;

              while(currId !== null) {
                  const currNode = nodes.find(n => n.id === currId)!;
                  steps.push({ type: 'TRAVERSE', nodeId: currId, codeLine: 13 }); // while check
                  if (currNode.next === tail) {
                      preTailNodeId = currNode.id;
                      break;
                  }
                  currId = currNode.next;
                  if(currId !== null) {
                      steps.push({ type: 'TRAVERSE', nodeId: currId, codeLine: 14 });
                  }
              }
              if (preTailNodeId !== undefined) {
                  steps.push({ type: 'SET_TAIL', tail: preTailNodeId, codeLine: 16 });
                  steps.push({ type: 'FADE_OUT', nodeId: tail, codeLine: 17 });
                  steps.push({ type: 'UPDATE_NEXT_POINTER', from: preTailNodeId, to: null, codeLine: 17 });
              }
          }
          steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 19 }); // return statement
        } else { // doubly
            const oldTailNode = nodes.find(n => n.id === tail)!;
            steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 3 }); // if check
            steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 5 }); // answer = tail.value
            steps.push({ type: 'SET_TAIL', tail: oldTailNode.prev, codeLine: 6 });
            steps.push({ type: 'FADE_OUT', nodeId: oldTailNode.id, codeLine: 6 });
            steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 8 }); // if (tail == null)
            if(oldTailNode.prev === null) {
              steps.push({ type: 'SET_HEAD', head: null, codeLine: 9 });
            } else {
              steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 10 }); // else
              steps.push({ type: 'HIGHLIGHT_NEXT_POINTER', from: oldTailNode.prev, to: null, codeLine: 11 });
              steps.push({ type: 'UPDATE_NEXT_POINTER', from: oldTailNode.prev, to: null, codeLine: 11 });
            }
            steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 13 }); // return
        }
        break;
      }
      case OperationType.SEARCH: {
        opDetails.found = false;
        let currId: number | null = head;
        steps.push({ type: 'TRAVERSE', nodeId: currId!, codeLine: 4 }); // current = head
        while(currId !== null) {
            const currNode = nodes.find(n => n.id === currId)!;
            steps.push({ type: 'TRAVERSE', nodeId: currNode.id, codeLine: 5 }); // while check
            steps.push({ type: 'TRAVERSE', nodeId: currNode.id, codeLine: 6 }); // if check
            if (currNode.value === value) {
                steps.push({ type: 'HIGHLIGHT_SUCCESS', nodeId: currNode.id, codeLine: 7 });
                opDetails.found = true;
                break;
            }
            currId = currNode.next;
            if(currId) {
                steps.push({ type: 'TRAVERSE', nodeId: currId, codeLine: 9 });
            } else {
                 steps.push({ type: 'TRAVERSE', nodeId: 0, codeLine: 5 });
            }
        }
        if (!opDetails.found) {
          steps.push({ type: 'HIGHLIGHT_FAILURE', nodeId: null, codeLine: 11 });
        }
        break;
      }
    }
    
    setAnimationSteps(steps);
    setCurrentStepIndex(-1);
  }, [isAnimating, nodes, head, tail, idCounter, listType]);

  const handleFinishAnimation = () => {
    let tempNodes = [...nodes];
    let tempHead = head;
    let tempTail = tail;

    animationSteps.forEach(step => {
      switch (step.type) {
        case 'CREATE':
          if (!tempNodes.some(n => n.id === step.node.id)) {
            tempNodes.push(step.node);
          }
          break;
        case 'FADE_OUT':
          tempNodes = tempNodes.filter(n => n.id !== step.nodeId);
          break;
        case 'UPDATE_NEXT_POINTER': {
          const nodeIndex = tempNodes.findIndex(n => n.id === step.from);
          if (nodeIndex > -1) tempNodes[nodeIndex].next = step.to;
          break;
        }
        case 'UPDATE_PREV_POINTER': {
           const nodeIndex = tempNodes.findIndex(n => n.id === step.from);
          if (nodeIndex > -1) tempNodes[nodeIndex].prev = step.to;
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
    
    setNodes(tempNodes);
    setHead(tempHead);
    setTail(tempTail);

    setAnimationSteps([]);
    setCurrentStepIndex(null);
    setCurrentCode('');
    setHighlightedCodeLine(null);
  };

  const handleNextStep = () => {
    if (isAnimating && currentStepIndex < animationSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (isAnimating && currentStepIndex > -1) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-gray-100">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Visual Linked List
        </h1>
        <p className="text-gray-500 mt-2">An interactive way to learn data structures.</p>
        <div className="mt-4 text-sm text-gray-600 border-t pt-4 border-gray-200 max-w-2xl mx-auto">
          <p className="font-semibold">010153523 Algorithms and Data Structures</p>
          <p>Department of Electrical and Computer Engineering (ECE), King Mongkut's University of Technology North Bangkok (KMUTNB)</p>
        </div>
      </header>

      <main className="flex-grow flex flex-col xl:flex-row gap-8">
        <div className="xl:w-3/4 bg-white/80 rounded-2xl shadow-lg p-4 border border-gray-200 backdrop-blur-md flex flex-col">
          <Controls 
            onOperate={handleOperation} 
            isAnimating={isAnimating} 
            listSize={nodes.length}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onFinish={handleFinishAnimation}
            currentStep={currentStepIndex}
            totalSteps={animationSteps.length}
            listType={listType}
            onListTypeChange={handleListTypeChange}
          />
          <LinkedListVisualizer 
            nodes={nodes} 
            head={head} 
            tail={tail} 
            animation={animationSteps} 
            currentStepIndex={currentStepIndex}
            listType={listType}
          />
        </div>
        <div className="xl:w-1/4">
          <Explanation 
            text={explanation} 
            isLoading={isFetchingExplanation}
            code={currentCode}
            highlightedLine={highlightedCodeLine}
           />
        </div>
      </main>
      
      <footer className="text-center mt-8 text-sm text-gray-500">
        <p>
          View on <a href="https://github.com/YOUR_USERNAME/YOUR_REPOSITORY" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</a>
        </p>
      </footer>
    </div>
  );
};