import { OperationType, ListType } from '../types';

type CodeSnippets = {
  [key in ListType]: Record<OperationType, string>;
};

export const javaCodeSnippets: CodeSnippets = {
  singly: {
    [OperationType.ADD_FIRST]: `// Adds an element to the front of the list.
public void addFirst(int value) {
  // Assumes 'head' and 'tail' are instance variables

  Node newNode = new Node(value, head);
  head = newNode;
  if (tail == null) { // list was empty
    tail = head;
  }
}`,
    [OperationType.ADD_LAST]: `// Adds an element to the end of the list.
public void addLast(int value) {
  // Assumes 'head' and 'tail' are instance variables
  
  Node newNode = new Node(value, null);
  if (head == null) { // list is empty
    head = newNode;
  } else {
    tail.next = newNode;
  }
  tail = newNode;
}`,
    [OperationType.REMOVE_FIRST]: `// Removes and returns the first element.
public int removeFirst() {
  // Assumes 'head' and 'tail' are instance variables

  if (head == null) { return -1; } // Or throw exception
  int answer = head.value;
  head = head.next;
  if (head == null) { // list is now empty
    tail = null;
  }
  return answer;
}`,
    [OperationType.REMOVE_LAST]: `// Removes and returns the last element.
public int removeLast() {
  // Assumes 'head' and 'tail' are instance variables

  if (head == null) { return -1; } // Or throw exception

  int answer = tail.value;

  if (head == tail) { // only one node in the list
    head = null; tail = null;
  } else {
    Node current = head;
    while (current.next != tail) {
      current = current.next;
    }
    tail = current;
    tail.next = null;
  }
  return answer;
}`,
    [OperationType.SEARCH]: `// Searches for an element in the list.
public boolean search(int value) {
  // Assumes 'head' is the start of the list
  Node current = head;
  while (current != null) {
    if (current.value == value) {
      return true; // Found!
    }
    current = current.next;
  }
  return false; // Not found
}`,
  },
  doubly: {
    [OperationType.ADD_FIRST]: `// Adds an element to the front of the list.
public void addFirst(int value) {
  Node newNode = new Node(value, null, head);
  if (head != null) {
    head.prev = newNode;
  }
  head = newNode;
  if (tail == null) { // list was empty
    tail = head;
  }
}`,
    [OperationType.ADD_LAST]: `// Adds an element to the end of the list.
public void addLast(int value) {
  Node newNode = new Node(value, tail, null);
  if (tail != null) {
    tail.next = newNode;
  }
  tail = newNode;
  if (head == null) { // list was empty
    head = tail;
  }
}`,
    [OperationType.REMOVE_FIRST]: `// Removes and returns the first element.
public int removeFirst() {
  if (head == null) { return -1; } // Or throw exception
  
  int answer = head.value;
  head = head.next; // new head can be null
  
  if (head == null) {
    tail = null; // list is now empty
  } else {
    head.prev = null;
  }
  return answer;
}`,
    [OperationType.REMOVE_LAST]: `// Removes and returns the last element.
public int removeLast() {
  if (tail == null) { return -1; } // Or throw exception

  int answer = tail.value;
  tail = tail.prev; // new tail can be null

  if (tail == null) {
    head = null; // list is now empty
  } else {
    tail.next = null;
  }
  return answer;
}`,
    [OperationType.SEARCH]: `// Searches for an element in the list.
public boolean search(int value) {
  // Assumes 'head' is the start of the list
  Node current = head;
  while (current != null) {
    if (current.value == value) {
      return true; // Found!
    }
    current = current.next;
  }
  return false; // Not found
}`,
  },
};
