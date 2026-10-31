import type { SubjectSeed } from './types';

export const dataStructures: SubjectSeed = {
  id: 'ds',
  name: 'Data Structures',
  description: 'Organise data efficiently — complexity analysis, linear structures, hashing, trees, heaps, graphs and sorting.',
  color: '#d97706',
  topics: [
    {
      id: 'ds-complexity',
      name: 'Complexity Analysis',
      description: 'Big-O notation, time and space complexity, best/worst/average cases.',
      difficulty: 3,
      importance: 95,
      minutes: 75,
      prerequisites: ['pf-algorithms'],
      explanation:
        'Complexity analysis describes how an algorithm’s running time or memory grows as the input size n grows. Big-O notation gives an upper bound on growth and ignores constant factors and lower-order terms, so 3n² + 5n + 2 is O(n²). Common classes, from fastest to slowest growth, are O(1), O(log n), O(n), O(n log n), O(n²) and O(2ⁿ). Analysing the worst case gives guarantees, while average-case analysis reflects typical inputs.',
      notes: [
        'Drop constants and lower-order terms: 4n + 10 → O(n).',
        'Order: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).',
        'Nested loops over n usually give O(n²).',
        'Halving the problem each step gives O(log n) (e.g. binary search).',
        'Space complexity counts extra memory, including the recursion stack.',
      ],
      code: {
        language: 'python',
        snippet:
          'def contains(items, target):      # O(n)\n    for x in items:\n        if x == target:\n            return True\n    return False\n\ndef has_duplicate(items):          # O(n^2)\n    for i in range(len(items)):\n        for j in range(i + 1, len(items)):\n            if items[i] == items[j]:\n                return True\n    return False\n\ndef binary_search(sorted_items, target):  # O(log n)\n    lo, hi = 0, len(sorted_items) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if sorted_items[mid] == target: return mid\n        if sorted_items[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1',
      },
      exercise:
        'Determine the Big-O time complexity of five code fragments: a single loop, two sequential loops, two nested loops, a loop that doubles i each iteration, and a recursive function that calls itself twice on n - 1. Then rewrite has_duplicate to run in O(n) using a set.',
      questions: [
        ['What is the Big-O complexity of 3n² + 5n + 2?', ['O(3n²)', 'O(n)', 'O(n²)', 'O(n² + n)'], 2, 'Constants and lower-order terms are dropped, leaving O(n²).'],
        ['Which complexity grows the slowest?', ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'], 0, 'Logarithmic growth is slower than any linear or polynomial growth.'],
        ['What is the time complexity of binary search on a sorted array?', ['O(n)', 'O(n log n)', 'O(1)', 'O(log n)'], 3, 'Each comparison halves the search interval.'],
        ['Two nested loops that each run n times typically have what complexity?', ['O(n)', 'O(n²)', 'O(2n)', 'O(log n)'], 1, 'The inner loop runs n times for each of the n outer iterations.'],
        ['What does Big-O notation describe?', ['The exact running time in seconds', 'The number of lines of code', 'An upper bound on how cost grows with input size', 'The memory address of variables'], 2, 'Big-O characterises asymptotic growth, independent of hardware.'],
      ],
    },
    {
      id: 'ds-arrays',
      name: 'Arrays & Dynamic Arrays',
      description: 'Contiguous storage, indexing, insertion costs and amortised resizing.',
      difficulty: 2,
      importance: 85,
      minutes: 60,
      prerequisites: ['ds-complexity'],
      explanation:
        'An array stores elements in contiguous memory, so any element can be accessed by index in O(1) time. Inserting or deleting in the middle requires shifting later elements, which costs O(n). A dynamic array (such as Python’s list or Java’s ArrayList) grows automatically by allocating a larger block — typically double the size — and copying elements. Although a single resize costs O(n), appends are O(1) amortised.',
      notes: [
        'Index access: O(1). Search in unsorted array: O(n).',
        'Insert/delete in the middle: O(n) due to shifting.',
        'Dynamic arrays double capacity when full.',
        'Append is O(1) amortised.',
        'Contiguous memory gives good cache locality.',
      ],
      code: {
        language: 'python',
        snippet:
          'class DynamicArray:\n    def __init__(self):\n        self.capacity = 1\n        self.size = 0\n        self.data = [None] * self.capacity\n\n    def append(self, value):\n        if self.size == self.capacity:\n            self._resize(2 * self.capacity)   # O(n), but rare\n        self.data[self.size] = value\n        self.size += 1\n\n    def _resize(self, new_capacity):\n        new_data = [None] * new_capacity\n        for i in range(self.size):\n            new_data[i] = self.data[i]\n        self.data, self.capacity = new_data, new_capacity\n\n    def get(self, index):                      # O(1)\n        if not 0 <= index < self.size:\n            raise IndexError(index)\n        return self.data[index]',
      },
      exercise:
        'Extend the DynamicArray class with insert(index, value) and remove(index). Count how many element copies occur while appending 1 to 1,000 items and explain why the average cost per append stays constant.',
      questions: [
        ['What is the time complexity of accessing an array element by index?', ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], 2, 'The address is computed directly from the base address and index.'],
        ['Why is inserting at the beginning of an array O(n)?', ['All existing elements must be shifted', 'The array must be sorted first', 'Arrays cannot store the first element', 'Hashing is required'], 0, 'Every element moves one position to make room.'],
        ['What does "amortised O(1)" mean for dynamic array append?', ['Every append takes exactly one step', 'Appends never trigger a resize', 'Appending is O(log n)', 'Occasional expensive resizes average out to constant time per append'], 3, 'Doubling capacity means the total copying cost over n appends is O(n).'],
        ['What usually happens when a dynamic array is full and a new element is appended?', ['The append fails', 'A larger block is allocated and the elements are copied', 'The oldest element is deleted', 'The array becomes a linked list'], 1, 'Most implementations grow geometrically, e.g. by doubling.'],
        ['Which advantage do arrays have over linked lists?', ['Fast random access and cache locality', 'Constant-time insertion anywhere', 'No fixed memory layout', 'Automatic sorting'], 0, 'Contiguous storage allows O(1) indexing and efficient CPU caching.'],
      ],
    },
    {
      id: 'ds-linkedlists',
      name: 'Linked Lists',
      description: 'Singly and doubly linked lists, insertion, deletion and traversal.',
      difficulty: 3,
      importance: 80,
      minutes: 90,
      prerequisites: ['ds-arrays'],
      explanation:
        'A linked list stores elements in nodes, each holding a value and a reference to the next node (and, in a doubly linked list, the previous one). Nodes need not be contiguous in memory. Inserting or deleting at a known node is O(1) because only references change, but finding the k-th element requires traversal from the head in O(n). Linked lists are the basis of stacks, queues and adjacency lists.',
      notes: [
        'Node = value + next (+ prev for doubly linked).',
        'Access by position: O(n). Insert/delete at a known node: O(1).',
        'Insert at head: O(1). Insert at tail: O(1) with a tail pointer.',
        'Always handle the empty list and single-node cases.',
        'Fast/slow pointers detect cycles and find the middle node.',
      ],
      code: {
        language: 'python',
        snippet:
          'class Node:\n    def __init__(self, value, next=None):\n        self.value = value\n        self.next = next\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n    def push_front(self, value):          # O(1)\n        self.head = Node(value, self.head)\n\n    def remove(self, value):              # O(n) search + O(1) unlink\n        prev, cur = None, self.head\n        while cur and cur.value != value:\n            prev, cur = cur, cur.next\n        if cur is None:\n            return False\n        if prev is None:\n            self.head = cur.next\n        else:\n            prev.next = cur.next\n        return True\n\n    def reverse(self):                    # O(n), in place\n        prev, cur = None, self.head\n        while cur:\n            cur.next, prev, cur = prev, cur, cur.next\n        self.head = prev',
      },
      exercise:
        'Implement append, find and __len__ for the LinkedList class. Then write a function that returns the middle node using fast and slow pointers, and test it on lists of length 0, 1, 2 and 5.',
      questions: [
        ['What does each node of a singly linked list contain?', ['Only a value', 'A value and a reference to the next node', 'A value and an index', 'Two values'], 1, 'Nodes link to their successor; doubly linked nodes also link to their predecessor.'],
        ['What is the time complexity of accessing the k-th element of a linked list?', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'You must follow next references from the head one at a time.'],
        ['What is the cost of inserting a new node at the head?', ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], 0, 'Only the new node’s next and the head reference change.'],
        ['Which technique detects a cycle in a linked list?', ['Binary search', 'Hashing every value into a sorted array', 'Reversing the list twice', 'Fast and slow pointers (Floyd’s algorithm)'], 3, 'If a fast pointer moving two steps meets a slow pointer moving one step, there is a cycle.'],
        ['What extra capability does a doubly linked list provide?', ['O(1) random access', 'Traversal in both directions', 'Automatic sorting', 'Less memory per node'], 1, 'Previous references allow backward traversal and O(1) removal of a known node.'],
      ],
    },
    {
      id: 'ds-stacks',
      name: 'Stacks',
      description: 'LIFO behaviour, push/pop, and applications such as bracket matching.',
      difficulty: 2,
      importance: 80,
      minutes: 45,
      prerequisites: ['ds-arrays'],
      explanation:
        'A stack is a Last-In, First-Out (LIFO) collection: the most recently added element is removed first. Its core operations — push, pop and peek — all run in O(1) time with an array or linked-list implementation. Stacks power function calls (the call stack), undo features, expression evaluation and depth-first search, and they solve problems such as checking whether brackets are balanced.',
      notes: [
        'LIFO: last in, first out.',
        'push, pop, peek and is_empty are O(1).',
        'Popping an empty stack is an underflow error.',
        'Applications: call stack, undo, bracket matching, DFS.',
        'Python list: append() = push, pop() = pop.',
      ],
      code: {
        language: 'python',
        snippet:
          'def is_balanced(expression):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in expression:\n        if ch in "([{":\n            stack.append(ch)           # push\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack\n\nprint(is_balanced("{[a + b] * (c)}"))  # True\nprint(is_balanced("(]"))               # False',
      },
      exercise:
        'Use a stack to evaluate postfix expressions such as "3 4 + 2 *" (result 14). Handle invalid expressions with too few operands. Then explain how an undo feature in a text editor could be built with two stacks.',
      questions: [
        ['Which principle does a stack follow?', ['First In, First Out', 'Last In, First Out', 'Priority order', 'Random order'], 1, 'The last element pushed is the first one popped.'],
        ['What is the time complexity of push and pop?', ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], 2, 'Both operate only on the top of the stack.'],
        ['Which problem is naturally solved with a stack?', ['Checking for balanced brackets', 'Scheduling printer jobs fairly', 'Finding the shortest path in an unweighted graph', 'Hashing passwords'], 0, 'Each closing bracket must match the most recent unmatched opening bracket.'],
        ['After push(1), push(2), push(3), pop(), what is on top?', ['1', '3', 'The stack is empty', '2'], 3, '3 is popped, leaving 2 on top.'],
        ['What is a stack underflow?', ['Pushing onto a full stack', 'Popping from an empty stack', 'Sorting a stack', 'Pushing duplicate values'], 1, 'Underflow occurs when removing from an empty stack; overflow when pushing onto a full fixed-size one.'],
      ],
    },
    {
      id: 'ds-queues',
      name: 'Queues',
      description: 'FIFO behaviour, circular buffers, deques and priority-free scheduling.',
      difficulty: 2,
      importance: 75,
      minutes: 45,
      prerequisites: ['ds-arrays'],
      explanation:
        'A queue is a First-In, First-Out (FIFO) collection: elements are added at the rear (enqueue) and removed from the front (dequeue). Implementing a queue with a plain array makes dequeue O(n), so efficient implementations use a linked list or a circular buffer, giving O(1) for both operations. A deque (double-ended queue) supports insertion and removal at both ends. Queues model waiting lines, buffer data streams and drive breadth-first search.',
      notes: [
        'FIFO: first in, first out.',
        'enqueue at the rear, dequeue from the front — both O(1) when implemented well.',
        'Circular buffer reuses array slots using modulo arithmetic.',
        'Python: collections.deque with append() and popleft().',
        'Applications: scheduling, buffering, BFS.',
      ],
      code: {
        language: 'python',
        snippet:
          'from collections import deque\n\nqueue = deque()\nqueue.append("job-1")      # enqueue\nqueue.append("job-2")\nqueue.append("job-3")\n\nfirst = queue.popleft()     # dequeue -> "job-1", O(1)\nprint(first, list(queue))   # job-1 [\'job-2\', \'job-3\']\n\n# list.pop(0) also works but is O(n): every element shifts left',
      },
      exercise:
        'Implement a fixed-capacity circular queue class with enqueue, dequeue, peek, is_full and is_empty using an array and two indices. Simulate a printer queue where jobs arrive and are processed in order.',
      questions: [
        ['Which principle does a queue follow?', ['First In, First Out', 'Last In, First Out', 'Highest priority first', 'Random access'], 0, 'Elements leave in the same order they arrived.'],
        ['Why is using list.pop(0) for dequeue inefficient in Python?', ['It removes the wrong element', 'It sorts the list', 'It shifts every remaining element, costing O(n)', 'It is not allowed'], 2, 'Removing the first element of an array-backed list requires shifting; deque.popleft() is O(1).'],
        ['What is a circular buffer?', ['A linked list whose last node points to null', 'A fixed-size array whose indices wrap around using modulo arithmetic', 'A sorted array', 'A tree with circular nodes'], 1, 'Front and rear indices wrap to the start, reusing freed slots.'],
        ['Which graph algorithm uses a queue?', ['Depth-first search', 'Binary search', 'Merge sort', 'Breadth-first search'], 3, 'BFS processes vertices level by level in the order they were discovered.'],
        ['What does a deque support?', ['Insertion and removal at both ends', 'Only removal from the middle', 'Automatic priority ordering', 'Key–value lookup'], 0, 'A double-ended queue allows O(1) operations at the front and the back.'],
      ],
    },
    {
      id: 'ds-hashing',
      name: 'Hash Tables',
      description: 'Hash functions, collisions, chaining, open addressing and load factor.',
      difficulty: 3,
      importance: 90,
      minutes: 75,
      prerequisites: ['ds-arrays'],
      explanation:
        'A hash table maps keys to values using a hash function that converts each key into an array index. Lookups, insertions and deletions take O(1) time on average. Two keys hashing to the same index cause a collision, resolved either by chaining (each bucket holds a list) or by open addressing (probing for another free slot). The load factor — entries divided by buckets — is kept low by resizing, otherwise collisions grow and performance degrades towards O(n).',
      notes: [
        'Average O(1) insert, lookup and delete; worst case O(n).',
        'A good hash function spreads keys uniformly.',
        'Collisions: chaining or open addressing (linear/quadratic probing).',
        'Load factor α = n / buckets; resize when α exceeds a threshold.',
        'Python dict and set are hash tables; keys must be hashable (immutable).',
      ],
      code: {
        language: 'python',
        snippet:
          'class HashMap:\n    def __init__(self, buckets=8):\n        self.buckets = [[] for _ in range(buckets)]\n        self.size = 0\n\n    def _index(self, key):\n        return hash(key) % len(self.buckets)\n\n    def put(self, key, value):\n        bucket = self.buckets[self._index(key)]\n        for pair in bucket:\n            if pair[0] == key:\n                pair[1] = value\n                return\n        bucket.append([key, value])          # chaining\n        self.size += 1\n        if self.size / len(self.buckets) > 0.75:\n            self._resize()\n\n    def get(self, key, default=None):\n        for k, v in self.buckets[self._index(key)]:\n            if k == key:\n                return v\n        return default\n\n    def _resize(self):\n        old = [p for b in self.buckets for p in b]\n        self.buckets = [[] for _ in range(2 * len(self.buckets))]\n        self.size = 0\n        for k, v in old:\n            self.put(k, v)',
      },
      exercise:
        'Use a dictionary to count word frequencies in a paragraph and print the five most common words. Then add a delete(key) method to the HashMap class and measure how the average bucket length changes as you insert 1,000 keys.',
      questions: [
        ['What is the average time complexity of lookup in a hash table?', ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'], 1, 'With a good hash function and low load factor, lookups are constant time on average.'],
        ['What is a collision?', ['Two different keys mapping to the same index', 'A key that is too long', 'Deleting a missing key', 'Two identical values'], 0, 'Collisions are unavoidable and must be resolved by chaining or probing.'],
        ['What is separate chaining?', ['Storing all keys in a sorted list', 'Probing the next free slot', 'Storing colliding entries in a list within the same bucket', 'Using two hash functions'], 2, 'Each bucket holds a small list of the entries that hash to it.'],
        ['What happens to performance as the load factor grows very high?', ['It improves', 'It stays exactly the same', 'Keys are deleted automatically', 'Collisions increase and operations slow down'], 3, 'Longer chains or probe sequences push operations towards O(n); resizing prevents this.'],
        ['Why must dictionary keys in Python be immutable?', ['So their hash value never changes while stored', 'Because mutable objects use more memory', 'To allow sorting', 'Immutable keys are encrypted'], 0, 'If a key changed after insertion, its hash would change and it could no longer be found.'],
      ],
    },
    {
      id: 'ds-trees',
      name: 'Trees & BST',
      description: 'Tree terminology, traversals and binary search tree operations.',
      difficulty: 4,
      importance: 90,
      minutes: 120,
      prerequisites: ['ds-linkedlists', 'pf-recursion'],
      explanation:
        'A tree is a hierarchical structure of nodes connected by edges with a single root and no cycles. In a binary tree each node has at most two children. A binary search tree (BST) keeps every key in the left subtree smaller and every key in the right subtree larger than the node’s key, so search, insertion and deletion take O(h), where h is the height. Balanced trees keep h ≈ log n, but inserting sorted data into a plain BST degenerates it into a linked list with h = n. Traversals visit nodes in pre-order, in-order or post-order; in-order traversal of a BST yields sorted keys.',
      notes: [
        'Root, parent, child, leaf, height, depth, subtree.',
        'BST: left < node < right.',
        'Search/insert/delete: O(h); balanced → O(log n); skewed → O(n).',
        'In-order traversal of a BST gives sorted order.',
        'Self-balancing trees: AVL, red–black.',
      ],
      code: {
        language: 'python',
        snippet:
          'class TreeNode:\n    def __init__(self, key):\n        self.key, self.left, self.right = key, None, None\n\ndef insert(root, key):\n    if root is None:\n        return TreeNode(key)\n    if key < root.key:\n        root.left = insert(root.left, key)\n    elif key > root.key:\n        root.right = insert(root.right, key)\n    return root\n\ndef search(root, key):\n    while root and root.key != key:\n        root = root.left if key < root.key else root.right\n    return root is not None\n\ndef in_order(root):\n    return in_order(root.left) + [root.key] + in_order(root.right) if root else []\n\nroot = None\nfor k in [50, 30, 70, 20, 40, 60, 80]:\n    root = insert(root, k)\nprint(in_order(root))   # [20, 30, 40, 50, 60, 70, 80]',
      },
      exercise:
        'Implement height(root), count_leaves(root) and pre_order(root) for the BST. Insert the keys 1 to 7 in ascending order and compare the resulting height with inserting 4, 2, 6, 1, 3, 5, 7. Explain the difference.',
      questions: [
        ['In a binary search tree, where are keys smaller than a node stored?', ['In the right subtree', 'In the left subtree', 'At the root', 'In a separate list'], 1, 'The BST property places smaller keys to the left and larger keys to the right.'],
        ['Which traversal of a BST visits keys in sorted order?', ['Pre-order', 'Post-order', 'Level-order', 'In-order'], 3, 'In-order visits left subtree, node, then right subtree.'],
        ['What is the worst-case search time in an unbalanced BST with n nodes?', ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], 0, 'Inserting sorted keys creates a chain of height n.'],
        ['What is a leaf node?', ['The root node', 'A node with exactly one child', 'A node with no children', 'A node with two children'], 2, 'Leaves are nodes without children.'],
        ['Why do self-balancing trees such as AVL trees exist?', ['To store duplicate keys', 'To keep the height O(log n) so operations stay fast', 'To use less memory than arrays', 'To allow cycles'], 1, 'Rotations keep the tree balanced, guaranteeing logarithmic height.'],
      ],
    },
    {
      id: 'ds-heaps',
      name: 'Heaps & Priority Queues',
      description: 'Binary heaps, heapify, priority queues and heap sort.',
      difficulty: 4,
      importance: 75,
      minutes: 90,
      prerequisites: ['ds-trees'],
      explanation:
        'A binary heap is a complete binary tree that satisfies the heap property: in a min-heap every parent is less than or equal to its children, so the minimum is at the root. Heaps are stored compactly in arrays, where the children of index i are at 2i + 1 and 2i + 2. Inserting and removing the root take O(log n) by sifting elements up or down, and building a heap from n elements takes O(n). Heaps implement priority queues used in scheduling, Dijkstra’s algorithm and heap sort.',
      notes: [
        'Min-heap: parent ≤ children; max-heap: parent ≥ children.',
        'Array layout: children of i at 2i+1 and 2i+2; parent at (i−1)//2.',
        'peek O(1); push and pop O(log n); heapify O(n).',
        'Priority queue = abstract type; heap = common implementation.',
        'Python: heapq module implements a min-heap on lists.',
      ],
      code: {
        language: 'python',
        snippet:
          'import heapq\n\ntasks = []\nheapq.heappush(tasks, (3, "revise joins"))\nheapq.heappush(tasks, (1, "weak topic: recursion"))\nheapq.heappush(tasks, (2, "practice subnetting"))\n\nwhile tasks:\n    priority, name = heapq.heappop(tasks)   # smallest priority first\n    print(priority, name)\n# 1 weak topic: recursion\n# 2 practice subnetting\n# 3 revise joins\n\nscores = [72, 45, 90, 38, 66]\nprint(heapq.nlargest(2, scores))   # [90, 72]',
      },
      exercise:
        'Implement a MinHeap class with push, pop and peek using an array and explicit sift-up/sift-down. Use it to merge three sorted lists into one sorted list and analyse the time complexity.',
      questions: [
        ['In a min-heap, where is the smallest element?', ['At a random leaf', 'At the root', 'At the last index', 'In the middle'], 1, 'The heap property guarantees the minimum is at the root.'],
        ['What is the time complexity of removing the root from a binary heap?', ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], 2, 'The last element replaces the root and sifts down along one path of height log n.'],
        ['In the array representation, where are the children of index i?', ['2i + 1 and 2i + 2', 'i + 1 and i + 2', 'i / 2 and i / 2 + 1', '2i and 3i'], 0, 'With zero-based indexing, the children of i are stored at 2i + 1 and 2i + 2.'],
        ['Which abstract data type is most commonly implemented with a heap?', ['Stack', 'Queue (FIFO)', 'Set', 'Priority queue'], 3, 'Heaps support efficient access to the highest- or lowest-priority element.'],
        ['How long does it take to build a heap from n unsorted elements with bottom-up heapify?', ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'], 1, 'Most nodes are near the bottom and sift down only a short distance, giving O(n) overall.'],
      ],
    },
    {
      id: 'ds-graphs',
      name: 'Graphs',
      description: 'Representations, BFS, DFS, topological sorting and shortest paths.',
      difficulty: 5,
      importance: 85,
      minutes: 120,
      prerequisites: ['ds-queues', 'ds-stacks'],
      explanation:
        'A graph consists of vertices connected by edges, which may be directed or undirected and weighted or unweighted. Graphs are stored as adjacency lists (space O(V + E), good for sparse graphs) or adjacency matrices (O(V²), constant-time edge checks). Breadth-first search explores level by level with a queue and finds shortest paths in unweighted graphs; depth-first search explores as far as possible with a stack or recursion. A topological sort orders the vertices of a directed acyclic graph so that every edge points forward — exactly what a prerequisite-aware learning path requires.',
      notes: [
        'Adjacency list: O(V + E) space; matrix: O(V²).',
        'BFS uses a queue → shortest paths in unweighted graphs.',
        'DFS uses a stack/recursion → cycle detection, components.',
        'Topological sort exists only for DAGs (Kahn’s algorithm or DFS).',
        'Dijkstra finds shortest paths with non-negative weights using a priority queue.',
      ],
      code: {
        language: 'python',
        snippet:
          'from collections import deque\n\nprereqs = {\n    "Variables": [],\n    "Functions": ["Variables"],\n    "Arrays": ["Variables"],\n    "DOM": ["Functions"],\n    "React": ["DOM", "Arrays"],\n}\n\ndef topological_order(graph):\n    indegree = {v: len(p) for v, p in graph.items()}\n    dependents = {v: [] for v in graph}\n    for v, ps in graph.items():\n        for p in ps:\n            dependents[p].append(v)\n    ready = deque(v for v, d in indegree.items() if d == 0)\n    order = []\n    while ready:\n        v = ready.popleft()\n        order.append(v)\n        for w in dependents[v]:\n            indegree[w] -= 1\n            if indegree[w] == 0:\n                ready.append(w)\n    if len(order) != len(graph):\n        raise ValueError("cycle detected")\n    return order\n\nprint(topological_order(prereqs))',
      },
      exercise:
        'Represent a small campus map as a weighted adjacency list. Use BFS to count the minimum number of hops between two buildings, then implement Dijkstra’s algorithm with heapq to find the shortest walking distance. Finally, add an edge that creates a cycle in the prereqs graph and confirm that topological_order detects it.',
      questions: [
        ['Which representation is most space-efficient for a sparse graph?', ['Adjacency matrix', 'Adjacency list', 'Incidence matrix', 'A sorted array of vertices'], 1, 'Adjacency lists use O(V + E) space, while a matrix always uses O(V²).'],
        ['Which algorithm finds the shortest path (fewest edges) in an unweighted graph?', ['Breadth-first search', 'Depth-first search', 'Heap sort', 'Binary search'], 0, 'BFS reaches vertices in order of their distance in edges from the source.'],
        ['A topological sort is possible only for which kind of graph?', ['Any undirected graph', 'A complete graph', 'A weighted graph', 'A directed acyclic graph'], 3, 'If there is a cycle, no linear order can place every vertex after all its predecessors.'],
        ['Which data structure does an iterative depth-first search use?', ['Queue', 'Heap', 'Stack', 'Hash table only'], 2, 'DFS explores the most recently discovered vertex first, which is LIFO behaviour.'],
        ['Dijkstra’s algorithm requires which condition on edge weights?', ['All weights must be equal', 'Weights must be non-negative', 'Weights must be negative', 'Weights must be integers'], 1, 'Negative edges can invalidate already-finalised distances; Bellman–Ford handles them.'],
      ],
    },
    {
      id: 'ds-sorting',
      name: 'Sorting Algorithms',
      description: 'Bubble, insertion, merge and quick sort, stability and complexity.',
      difficulty: 4,
      importance: 90,
      minutes: 120,
      prerequisites: ['ds-complexity', 'pf-recursion'],
      explanation:
        'Sorting arranges elements in order and underpins searching, deduplication and reporting. Simple algorithms such as bubble sort and insertion sort run in O(n²) but work well for tiny or nearly sorted inputs (insertion sort is O(n) when the input is already sorted). Merge sort divides the array, sorts each half recursively and merges them in O(n log n) time with O(n) extra space; it is stable. Quick sort partitions around a pivot and averages O(n log n) but degrades to O(n²) with consistently poor pivots. Comparison sorts cannot beat O(n log n) in the worst case.',
      notes: [
        'Bubble / insertion / selection: O(n²) worst case.',
        'Insertion sort is O(n) on already-sorted input.',
        'Merge sort: O(n log n) always, stable, O(n) extra space.',
        'Quick sort: O(n log n) average, O(n²) worst, in-place.',
        'Stable sort keeps equal elements in their original order.',
      ],
      code: {
        language: 'python',
        snippet:
          'def merge_sort(items):\n    if len(items) <= 1:\n        return items\n    mid = len(items) // 2\n    left, right = merge_sort(items[:mid]), merge_sort(items[mid:])\n    merged, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:        # <= keeps the sort stable\n            merged.append(left[i]); i += 1\n        else:\n            merged.append(right[j]); j += 1\n    return merged + left[i:] + right[j:]\n\ndef insertion_sort(items):\n    a = list(items)\n    for i in range(1, len(a)):\n        key, j = a[i], i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]; j -= 1\n        a[j + 1] = key\n    return a\n\nprint(merge_sort([38, 27, 43, 3, 9, 82, 10]))',
      },
      exercise:
        'Implement quick sort with the last element as pivot. Measure the number of comparisons made by insertion sort, merge sort and quick sort on random, sorted and reverse-sorted lists of 1,000 numbers, and explain the results using Big-O notation.',
      questions: [
        ['What is the worst-case time complexity of merge sort?', ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'], 2, 'Merge sort always splits evenly and merges in linear time per level.'],
        ['When does quick sort degrade to O(n²)?', ['When pivots repeatedly split the array very unevenly', 'When the array has an even length', 'When all numbers are positive', 'Never'], 0, 'Choosing the smallest or largest element as pivot each time gives n levels of partitioning.'],
        ['What does it mean for a sorting algorithm to be stable?', ['It never crashes', 'It always runs in O(n log n)', 'It uses no extra memory', 'Equal elements keep their original relative order'], 3, 'Stability matters when sorting records by one key after sorting by another.'],
        ['On already-sorted input, insertion sort runs in…', ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'], 1, 'Each element is compared once with its predecessor and no shifting is needed.'],
        ['What is the lower bound on worst-case comparisons for any comparison-based sort?', ['O(n)', 'O(log n)', 'Ω(n log n)', 'O(1)'], 2, 'A decision-tree argument shows at least log₂(n!) ≈ n log n comparisons are needed.'],
      ],
    },
  ],
};
