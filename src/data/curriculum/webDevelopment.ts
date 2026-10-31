import type { SubjectSeed } from './types';

export const webDevelopment: SubjectSeed = {
  id: 'web',
  name: 'Web Development',
  description: 'Build modern websites and web applications with HTML, CSS, JavaScript, React and TypeScript.',
  color: '#4f58c2',
  topics: [
    {
      id: 'web-html',
      name: 'HTML Fundamentals',
      description: 'Document structure, semantic elements, links, images and forms.',
      difficulty: 1,
      importance: 85,
      minutes: 60,
      prerequisites: [],
      explanation:
        'HTML (HyperText Markup Language) describes the structure of a web page. A document has a <head> containing metadata such as the title and linked stylesheets, and a <body> containing everything the user sees. Elements are written as tags, can be nested, and carry attributes such as href, src and alt. Semantic elements like <header>, <nav>, <main>, <article> and <footer> describe the meaning of content, which improves accessibility and search-engine understanding.',
      notes: [
        'Every page starts with <!DOCTYPE html> and a single <html> root element.',
        '<head> holds metadata; <body> holds visible content.',
        'Use semantic tags (<main>, <article>, <nav>) instead of generic <div>s where possible.',
        'Images need meaningful alt text for screen readers.',
        'Forms group inputs; each input should have an associated <label>.',
      ],
      code: {
        language: 'html',
        snippet:
          '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>My Profile</title>\n  </head>\n  <body>\n    <header><h1>Asha Kumar</h1></header>\n    <main>\n      <article>\n        <h2>About me</h2>\n        <p>I am learning <a href="https://developer.mozilla.org">web development</a>.</p>\n        <img src="avatar.png" alt="Portrait of Asha smiling" />\n      </article>\n    </main>\n  </body>\n</html>',
      },
      exercise:
        'Create a personal profile page with a header, a navigation bar containing three links, an article with a heading, a paragraph and an image with descriptive alt text, and a footer. Validate it with the W3C validator if available offline, or check that every tag is closed correctly.',
      questions: [
        ['What does HTML stand for?', ['High Tech Modern Language', 'HyperText Markup Language', 'Hyperlink and Text Management Language', 'Home Tool Markup Language'], 1, 'HTML is the HyperText Markup Language — it marks up the structure of documents linked by hypertext.'],
        ['Which element contains the content that is visible to the user?', ['<head>', '<meta>', '<body>', '<title>'], 2, '<body> holds the visible page content; <head> holds metadata such as <title> and <meta>.'],
        ['Which tag creates a hyperlink to another page?', ['<link>', '<a>', '<href>', '<nav>'], 1, '<a> (anchor) with an href attribute creates a hyperlink. <link> connects external resources such as stylesheets.'],
        ['Which attribute provides alternative text for an image?', ['title', 'src', 'caption', 'alt'], 3, 'The alt attribute describes the image for screen readers and is shown if the image fails to load.'],
        ['Which element represents a self-contained piece of content such as a blog post?', ['<article>', '<div>', '<span>', '<b>'], 0, '<article> is a semantic element for independent, self-contained content. <div> and <span> carry no meaning.'],
      ],
    },
    {
      id: 'web-css',
      name: 'CSS Fundamentals',
      description: 'Selectors, the box model, specificity, Flexbox and responsive units.',
      difficulty: 2,
      importance: 80,
      minutes: 75,
      prerequisites: ['web-html'],
      explanation:
        'CSS (Cascading Style Sheets) controls presentation. Rules consist of a selector and declarations. When several rules target the same element, the cascade resolves conflicts using importance, specificity (ids beat classes, classes beat element selectors) and source order. Every element is a box made of content, padding, border and margin. Flexbox lays items out along a main axis (justify-content) and a cross axis (align-items).',
      notes: [
        'Specificity order: inline styles > #id > .class / [attr] / :pseudo-class > element.',
        'Box model from inside out: content → padding → border → margin.',
        'box-sizing: border-box makes width include padding and border.',
        'Flexbox: justify-content = main axis, align-items = cross axis.',
        'rem is relative to the root font size; em to the parent font size.',
      ],
      code: {
        language: 'css',
        snippet:
          '* { box-sizing: border-box; }\n\n.card {\n  padding: 1rem;\n  border: 1px solid #dde1f7;\n  border-radius: 12px;\n}\n\n.toolbar {\n  display: flex;\n  justify-content: space-between; /* main axis */\n  align-items: center;            /* cross axis */\n  gap: 0.5rem;\n}\n\n@media (max-width: 640px) {\n  .toolbar { flex-direction: column; }\n}',
      },
      exercise:
        'Style the profile page from the HTML exercise: centre the content in a 720px column, turn the navigation into a horizontal Flexbox bar that stacks vertically below 640px, and give the article a card appearance using padding, a border and rounded corners.',
      questions: [
        ['Which property changes the colour of text?', ['font-color', 'text-color', 'color', 'foreground'], 2, 'The color property sets the foreground (text) colour.'],
        ['Which selector has the highest specificity?', ['.card', '#main', 'p', '*'], 1, 'An id selector (#main) is more specific than a class (.card), an element (p) or the universal selector.'],
        ['In the CSS box model, what lies between the border and the content?', ['Margin', 'Outline', 'Padding', 'Gap'], 2, 'Padding is the space inside the border around the content; margin is outside the border.'],
        ['In a flex container, which property aligns items along the main axis?', ['justify-content', 'align-items', 'flex-wrap', 'align-self'], 0, 'justify-content distributes items along the main axis; align-items works on the cross axis.'],
        ['Which unit is relative to the root element’s font size?', ['em', 'px', 'vh', 'rem'], 3, 'rem (root em) is relative to the <html> element’s font size, which keeps sizing consistent.'],
      ],
    },
    {
      id: 'web-js-variables',
      name: 'JavaScript Variables',
      description: 'let, const and var, primitive types, scope and type coercion.',
      difficulty: 2,
      importance: 85,
      minutes: 60,
      prerequisites: [],
      explanation:
        'Variables store values. Modern JavaScript uses const for bindings that are never reassigned and let for bindings that change; both are block-scoped. The older var is function-scoped and hoisted with the value undefined. JavaScript has primitive types (string, number, bigint, boolean, undefined, null, symbol) and objects. The + operator concatenates when either operand is a string, which is a common source of bugs.',
      notes: [
        'Prefer const; use let only when the value must be reassigned; avoid var.',
        'let and const are block-scoped; var is function-scoped.',
        'typeof null === "object" is a historical quirk.',
        'Declared-but-unassigned variables hold undefined.',
        'Use === (strict equality) to avoid implicit type coercion.',
      ],
      code: {
        language: 'javascript',
        snippet:
          'const course = "Web Development"; // never reassigned\nlet completed = 0;                 // will change\ncompleted += 1;\n\nif (true) {\n  let insideBlock = "only here";\n  var leaks = "function scoped";\n}\nconsole.log(typeof leaks);        // "string"\n// console.log(insideBlock);       // ReferenceError\n\nconsole.log("5" + 2);  // "52"  (string concatenation)\nconsole.log("5" - 2);  // 3     (numeric conversion)\nconsole.log(0 == "");  // true  (coercion)\nconsole.log(0 === ""); // false (strict)',
      },
      exercise:
        'Write a script that stores a student name (const), a score that increases three times (let), and prints a sentence combining both. Then predict and verify the output of: "3" * "4", "3" + 4, true + 1, null == undefined and null === undefined.',
      questions: [
        ['Which keyword declares a block-scoped variable that cannot be reassigned?', ['var', 'let', 'const', 'static'], 2, 'const creates a block-scoped binding that cannot be reassigned (object contents can still change).'],
        ['What does typeof null return?', ['"null"', '"undefined"', '"number"', '"object"'], 3, 'typeof null returns "object" — a long-standing quirk kept for backwards compatibility.'],
        ['What is the value of a variable declared with let but not assigned?', ['undefined', 'null', '0', 'It throws a ReferenceError'], 0, 'A declared but unassigned variable holds undefined. Accessing it before its declaration line is what throws.'],
        ['Which declaration is function-scoped and hoisted with the value undefined?', ['let', 'var', 'const', 'class'], 1, 'var declarations are hoisted to the top of their function and initialised with undefined.'],
        ['What is the result of "5" + 2 in JavaScript?', ['7 (a number)', 'NaN', '"52" (a string)', 'A TypeError'], 2, 'If either operand of + is a string, the other is converted to a string and concatenated.'],
      ],
    },
    {
      id: 'web-js-functions',
      name: 'JavaScript Functions',
      description: 'Declarations, arrow functions, parameters, closures and higher-order functions.',
      difficulty: 3,
      importance: 90,
      minutes: 90,
      prerequisites: ['web-js-variables'],
      explanation:
        'Functions package reusable behaviour. Function declarations are fully hoisted, while function expressions and arrow functions are only available after their definition. Functions are first-class values: they can be stored in variables, passed as arguments and returned from other functions, which enables higher-order functions such as map and filter. A closure is formed when an inner function keeps access to variables from the scope in which it was created.',
      notes: [
        'Declarations are hoisted; expressions and arrow functions are not callable before definition.',
        'A function without return gives back undefined.',
        'Arrow functions do not have their own this or arguments.',
        'Closures let functions remember variables from their creation scope.',
        'Higher-order functions take or return other functions.',
      ],
      code: {
        language: 'javascript',
        snippet:
          'function greet(name = "student") {\n  return "Hello, " + name;\n}\n\nconst square = (n) => n * n;\n\n// Closure: counter remembers count between calls\nfunction makeCounter() {\n  let count = 0;\n  return () => {\n    count += 1;\n    return count;\n  };\n}\nconst next = makeCounter();\nnext(); // 1\nnext(); // 2\n\n// Higher-order function\nconst applyTwice = (fn, value) => fn(fn(value));\napplyTwice(square, 3); // 81',
      },
      exercise:
        'Implement makeMultiplier(factor) that returns a function multiplying its argument by factor. Use it to create double and triple, then write applyAll(fns, value) that applies an array of functions in order. Explain in one sentence why makeMultiplier is an example of a closure.',
      questions: [
        ['Which line correctly defines an arrow function that returns the sum of a and b?', ['const add = a, b => a + b;', 'const add = (a, b) => a + b;', 'function => add(a, b) { a + b }', 'const add = (a, b) -> a + b;'], 1, 'Multiple parameters must be wrapped in parentheses, and an expression body is returned implicitly.'],
        ['What is a closure?', ['A function that has finished executing', 'A block that ends with a return statement', 'A function bundled with references to its surrounding lexical scope', 'A method that closes the browser window'], 2, 'A closure is a function together with the variables it captured from the scope where it was defined.'],
        ['What does a function return if it has no return statement?', ['null', 'undefined', '0', 'false'], 1, 'Functions without an explicit return value return undefined.'],
        ['Which kind of function can be called before it appears in the source code?', ['A function declaration', 'An arrow function assigned to const', 'A function expression assigned to let', 'None of them'], 0, 'Function declarations are hoisted together with their body.'],
        ['What is a higher-order function?', ['A function defined at the top of a file', 'A function with more than three parameters', 'A function that runs asynchronously', 'A function that takes or returns another function'], 3, 'Higher-order functions operate on other functions — for example Array.prototype.map takes a callback.'],
      ],
    },
    {
      id: 'web-arrays',
      name: 'Arrays',
      description: 'Creating arrays and transforming them with map, filter, reduce and friends.',
      difficulty: 2,
      importance: 80,
      minutes: 60,
      prerequisites: ['web-js-variables'],
      explanation:
        'Arrays are ordered, zero-indexed lists. Mutating methods such as push, pop, shift and splice change the original array, while map, filter, slice and concat return new arrays. reduce combines all elements into a single value using an accumulator. Preferring non-mutating methods makes code easier to reason about, especially in React where state must not be mutated directly.',
      notes: [
        'push/pop work at the end; unshift/shift at the start.',
        'map transforms each element and returns a new array of the same length.',
        'filter keeps elements whose callback returns true.',
        'reduce(callback, initialValue) folds the array into one value.',
        'includes checks membership; find returns the first match or undefined.',
      ],
      code: {
        language: 'javascript',
        snippet:
          'const scores = [72, 45, 90, 38];\n\nconst curved = scores.map((s) => Math.min(100, s + 5)); // [77, 50, 95, 43]\nconst passed = scores.filter((s) => s >= 50);              // [72, 90]\nconst total = scores.reduce((sum, s) => sum + s, 0);       // 245\nconst average = total / scores.length;                     // 61.25\n\nscores.includes(90);           // true\nscores.find((s) => s < 40);    // 38\n[...scores].sort((a, b) => a - b); // copy, then sort numerically',
      },
      exercise:
        'Given an array of objects { name, score }, produce (1) an array of names of students who scored 60 or more, (2) the average score using reduce, and (3) a new array sorted by score descending without mutating the original.',
      questions: [
        ['What does [1, 2, 3].map(x => x * 2) return?', ['[1, 2, 3, 2]', '[2, 4, 6]', '12', '[1, 4, 9]'], 1, 'map applies the callback to every element and returns a new array with the results.'],
        ['Which method removes and returns the last element of an array?', ['shift()', 'slice(-1)', 'pop()', 'splice(0, 1)'], 2, 'pop() removes the last element. shift() removes the first; slice does not modify the array.'],
        ['What does filter return?', ['A new array of the elements that pass the test', 'The first matching element', 'A boolean', 'The index of the first match'], 0, 'filter returns a new array containing every element for which the callback returned true.'],
        ['What is reduce typically used for?', ['Shrinking the array length to zero', 'Removing duplicates automatically', 'Sorting the array', 'Accumulating all elements into a single value'], 3, 'reduce folds the array into one value, such as a sum or an object, using an accumulator.'],
        ['Which method checks whether an array contains a value?', ['has()', 'contains()', 'includes()', 'exists()'], 2, 'Array.prototype.includes returns true if the value is present.'],
      ],
    },
    {
      id: 'web-objects',
      name: 'Objects',
      description: 'Object literals, property access, destructuring, spread and references.',
      difficulty: 3,
      importance: 80,
      minutes: 60,
      prerequisites: ['web-js-variables'],
      explanation:
        'Objects group related data as key–value pairs. Properties are read with dot notation (user.name) or bracket notation (user[key]) when the key is dynamic. Destructuring extracts properties into variables, and the spread operator copies properties into a new object, with later properties overriding earlier ones. Objects are reference values: two variables can point to the same object, and === compares references, not contents.',
      notes: [
        'Use bracket notation when the property name is stored in a variable.',
        'Object.keys / values / entries return arrays for iteration.',
        'Spread creates a shallow copy; later keys win on conflicts.',
        'Destructuring: const { name, age = 18 } = user;',
        '=== on objects compares identity (same reference), not structure.',
      ],
      code: {
        language: 'javascript',
        snippet:
          'const student = { name: "Ravi", level: "Undergraduate", scores: { html: 80 } };\n\nconst key = "level";\nconsole.log(student[key]);            // "Undergraduate"\n\nconst { name, scores: { html } } = student; // destructuring\nconst updated = { ...student, level: "Postgraduate" }; // copy + override\n\nObject.entries(student.scores).forEach(([topic, score]) => {\n  console.log(topic + ": " + score);\n});\n\nconsole.log(updated === student);     // false — different objects',
      },
      exercise:
        'Model a course as an object with a title, a list of topic objects and an instructor object. Write a function that returns a new course with one topic marked as completed without mutating the original, and verify immutability with ===.',
      questions: [
        ['How do you read a property whose name is stored in the variable k?', ['obj.k', 'obj->k', 'obj[k]', 'obj::k'], 2, 'Bracket notation evaluates the expression inside the brackets; obj.k looks for a property literally named "k".'],
        ['What does Object.keys({ a: 1, b: 2 }) return?', ['["a", "b"]', '[1, 2]', '[["a", 1], ["b", 2]]', '2'], 0, 'Object.keys returns an array of the object’s own enumerable property names.'],
        ['When spreading { ...a, ...b } and both contain the key x, which value is kept?', ['The value from a', 'The value from b', 'An array of both values', 'It throws an error'], 1, 'Properties are copied left to right, so later spreads overwrite earlier ones.'],
        ['What does const { name } = user; do?', ['Deletes name from user', 'Renames user to name', 'Copies the entire object', 'Creates a variable name holding user.name'], 3, 'Object destructuring creates local variables from matching property names.'],
        ['When are two objects equal according to ===?', ['When they have the same keys and values', 'When they reference the same object in memory', 'When they have the same keys', 'When they were created by the same constructor'], 1, 'Strict equality on objects compares references; structurally identical objects are still different.'],
      ],
    },
    {
      id: 'web-dom',
      name: 'DOM Manipulation',
      description: 'Selecting elements, updating content safely and handling events.',
      difficulty: 3,
      importance: 80,
      minutes: 75,
      prerequisites: ['web-html', 'web-js-functions'],
      explanation:
        'The Document Object Model (DOM) is the browser’s tree representation of the page that JavaScript can read and modify. querySelector and querySelectorAll select elements with CSS selectors. textContent sets plain text safely, while innerHTML parses HTML and can introduce cross-site scripting if used with untrusted input. addEventListener attaches handlers; events bubble up through ancestors, enabling event delegation.',
      notes: [
        'querySelector returns the first match; querySelectorAll returns a static NodeList.',
        'Prefer textContent over innerHTML for user-provided text.',
        'event.preventDefault() stops default browser behaviour (e.g. form submission).',
        'event.stopPropagation() stops bubbling to ancestors.',
        'Event delegation: one listener on a parent handles events from many children.',
      ],
      code: {
        language: 'javascript',
        snippet:
          'const form = document.querySelector("#todo-form");\nconst list = document.querySelector("#todo-list");\n\nform.addEventListener("submit", (event) => {\n  event.preventDefault();               // stay on the page\n  const input = form.querySelector("input");\n  const item = document.createElement("li");\n  item.textContent = input.value;       // safe: no HTML parsing\n  list.append(item);\n  input.value = "";\n});\n\n// Event delegation: one listener for all items\nlist.addEventListener("click", (event) => {\n  if (event.target.matches("li")) event.target.classList.toggle("done");\n});',
      },
      exercise:
        'Build a to-do list page: a form adds items to a list, clicking an item toggles a "done" class, and a counter shows how many items remain. Use event delegation rather than one listener per item.',
      questions: [
        ['Which method returns the first element matching a CSS selector?', ['getElementsByClassName()', 'querySelectorAll()', 'getElementById()', 'querySelector()'], 3, 'querySelector returns the first matching element or null.'],
        ['Which property is safest for inserting user-provided text?', ['innerHTML', 'outerHTML', 'textContent', 'insertAdjacentHTML'], 2, 'textContent inserts plain text without parsing HTML, preventing script injection.'],
        ['What does event.preventDefault() do in a form submit handler?', ['Stops the browser’s default submission and page reload', 'Stops the event from bubbling', 'Removes the form from the page', 'Clears all form inputs'], 0, 'preventDefault cancels the browser’s default action; stopPropagation is what stops bubbling.'],
        ['What does element.addEventListener("click", handler) do?', ['Runs handler immediately', 'Registers handler to run whenever the element is clicked', 'Replaces all existing click handlers', 'Simulates a click on the element'], 1, 'addEventListener registers a callback without removing other listeners.'],
        ['What is event delegation?', ['Handling events from many children with one listener on a common ancestor', 'Passing an event to a web worker', 'Creating custom events with new Event()', 'Delaying events with setTimeout'], 0, 'Because events bubble, a single listener on a parent can inspect event.target to handle child events.'],
      ],
    },
    {
      id: 'web-react',
      name: 'React Fundamentals',
      description: 'Components, JSX, props, state and rendering lists.',
      difficulty: 3,
      importance: 90,
      minutes: 120,
      prerequisites: ['web-dom', 'web-objects', 'web-arrays'],
      explanation:
        'React builds user interfaces from components — functions that return JSX describing what should be on screen. Data flows down through props, which are read-only. When state or props change, React re-renders the component and efficiently updates the DOM. When rendering lists, each item needs a stable key so React can match items between renders. Event handlers are passed as functions, for example onClick={handleClick}.',
      notes: [
        'Components are functions that return JSX; names start with a capital letter.',
        'Props flow from parent to child and must not be mutated.',
        'State changes trigger re-renders.',
        'List items need stable, unique key props (not the array index if the order can change).',
        'Pass event handlers as functions: onClick={handleClick}, not onClick={handleClick()}.',
      ],
      code: {
        language: 'tsx',
        snippet:
          'type Topic = { id: string; name: string; done: boolean };\n\nfunction TopicItem({ topic, onToggle }: { topic: Topic; onToggle: (id: string) => void }) {\n  return (\n    <li>\n      <label>\n        <input type="checkbox" checked={topic.done} onChange={() => onToggle(topic.id)} />\n        {topic.name}\n      </label>\n    </li>\n  );\n}\n\nexport function TopicList({ topics, onToggle }: { topics: Topic[]; onToggle: (id: string) => void }) {\n  return <ul>{topics.map((t) => <TopicItem key={t.id} topic={t} onToggle={onToggle} />)}</ul>;\n}',
      },
      exercise:
        'Create a StudentCard component that receives name, level and score props and displays a badge that is green for scores of 60 or more and red otherwise. Render a list of five StudentCard components from an array, using a proper key.',
      questions: [
        ['What is JSX?', ['A CSS preprocessor', 'A syntax extension that compiles to JavaScript function calls', 'A templating language that only runs on the server', 'A new browser API'], 1, 'JSX is compiled (for example to jsx() calls) into plain JavaScript that creates React elements.'],
        ['What are props in React?', ['Mutable local variables', 'Global variables shared by all components', 'Read-only inputs passed from a parent component', 'CSS classes applied to components'], 2, 'Props are inputs from the parent and should be treated as immutable by the child.'],
        ['Why does React need a key prop on list items?', ['To identify which items changed, were added or were removed', 'To encrypt list data', 'To sort the list automatically', 'To make items clickable'], 0, 'Stable keys let React match elements between renders and preserve their state correctly.'],
        ['When does a React component re-render?', ['Every second', 'Only when the page reloads', 'When the browser console is opened', 'When its state or props change'], 3, 'Updating state or receiving new props schedules a re-render.'],
        ['Which is the correct way to attach a click handler in JSX?', ['onclick="handleClick()"', 'onClick={handleClick}', 'on-click={handleClick}', 'click={handleClick()}'], 1, 'React uses camelCase event props and expects a function reference, not a function call.'],
      ],
    },
    {
      id: 'web-hooks',
      name: 'React Hooks',
      description: 'useState, useEffect, useMemo, custom hooks and the rules of hooks.',
      difficulty: 4,
      importance: 85,
      minutes: 120,
      prerequisites: ['web-react'],
      explanation:
        'Hooks let function components use React features. useState stores local state and returns the current value plus a setter. useEffect synchronises a component with external systems; its dependency array controls when it re-runs, and its optional cleanup function runs before the next run and on unmount. useMemo and useCallback cache values and functions between renders. Hooks must be called unconditionally at the top level of components or custom hooks.',
      notes: [
        'const [value, setValue] = useState(initial);',
        'useEffect(fn, []) runs once after the first render; with deps it re-runs when they change.',
        'Return a cleanup function from useEffect to unsubscribe or clear timers.',
        'useMemo caches an expensive computed value; useCallback caches a function.',
        'Never call hooks inside loops, conditions or nested functions.',
      ],
      code: {
        language: 'tsx',
        snippet:
          'import { useEffect, useMemo, useState } from "react";\n\nfunction useStudyTimer() {\n  const [seconds, setSeconds] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setSeconds((s) => s + 1), 1000);\n    return () => clearInterval(id); // cleanup on unmount\n  }, []);\n  return seconds;\n}\n\nexport function ScoreSummary({ scores }: { scores: number[] }) {\n  const seconds = useStudyTimer();\n  const average = useMemo(\n    () => scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length),\n    [scores],\n  );\n  return <p>Average {average.toFixed(1)}% — studying for {seconds}s</p>;\n}',
      },
      exercise:
        'Write a custom hook useLocalStorage(key, initialValue) that behaves like useState but persists the value in localStorage. Use it in a component that remembers a user’s preferred theme across page reloads.',
      questions: [
        ['What does useState return?', ['Only the current state value', 'A promise that resolves to the state', 'An array containing the current state and a setter function', 'An object with get and set methods'], 2, 'useState returns a pair: [state, setState].'],
        ['When does useEffect(fn, []) run?', ['On every render', 'Once after the first render (and cleanup on unmount)', 'Never', 'Before the first render'], 1, 'An empty dependency array means the effect has no dependencies that can change, so it runs once after mounting.'],
        ['Which statement follows the rules of hooks?', ['Hooks can be called inside loops', 'Hooks can be called conditionally', 'Hooks can be called from regular JavaScript functions', 'Hooks must be called at the top level of a component or custom hook'], 3, 'Calling hooks in the same order on every render lets React associate state with the correct hook.'],
        ['What is useMemo used for?', ['Caching an expensive computed value between renders', 'Storing data permanently', 'Fetching data from a server', 'Creating global state'], 0, 'useMemo recomputes its value only when a dependency changes.'],
        ['When does the cleanup function returned from useEffect run?', ['Only when the page closes', 'Immediately after the effect', 'Before the effect re-runs and when the component unmounts', 'Never — it is optional decoration'], 2, 'React runs the cleanup before re-running the effect with new dependencies and when the component unmounts.'],
      ],
    },
    {
      id: 'web-ts',
      name: 'TypeScript Basics',
      description: 'Static types, inference, interfaces, unions and type narrowing.',
      difficulty: 3,
      importance: 75,
      minutes: 90,
      prerequisites: ['web-js-functions', 'web-objects'],
      explanation:
        'TypeScript is a superset of JavaScript that adds static type checking. The compiler infers types from values, and you can describe object shapes with interfaces or type aliases. Union types such as string | number express values that may be one of several types, and narrowing (typeof, in, equality checks) lets the compiler know which member is present. Types are erased at compile time, so TypeScript adds safety without runtime cost.',
      notes: [
        'TypeScript checks types at compile time and emits plain JavaScript.',
        'let count = 5 infers count: number.',
        'interface / type describe object shapes; optional properties use "?".',
        'Unions (A | B) require narrowing before using member-specific features.',
        'Prefer unknown over any: unknown must be narrowed before use.',
      ],
      code: {
        language: 'typescript',
        snippet:
          'interface Student {\n  id: string;\n  name: string;\n  email?: string; // optional\n}\n\ntype Score = number | "absent";\n\nfunction describe(score: Score): string {\n  if (score === "absent") return "Did not attempt";\n  return score >= 60 ? "Pass" : "Retry"; // narrowed to number\n}\n\nfunction parse(input: unknown): Student | null {\n  if (typeof input === "object" && input !== null && "id" in input && "name" in input) {\n    return input as Student;\n  }\n  return null;\n}',
      },
      exercise:
        'Convert a small JavaScript module that manages a list of topics into TypeScript. Define a Topic interface, a TopicStatus union of "todo" | "doing" | "done", and type every function parameter and return value. Introduce a deliberate type error and observe the compiler message.',
      questions: [
        ['What does TypeScript primarily add to JavaScript?', ['A faster runtime engine', 'Static type checking', 'Automatic memory management', 'A built-in UI framework'], 1, 'TypeScript adds a static type system checked at compile time; the output is ordinary JavaScript.'],
        ['What type does TypeScript infer for let x = 5?', ['any', '5', 'unknown', 'number'], 3, 'With let, the literal is widened to its primitive type number (const x = 5 would infer the literal type 5).'],
        ['What is an interface used for?', ['Describing the shape of an object', 'Creating HTML elements', 'Running code in parallel', 'Importing CSS files'], 0, 'Interfaces declare the properties and methods an object must have.'],
        ['What does the type string | number mean?', ['A value that is both a string and a number', 'A string converted to a number', 'A value that may be a string or a number', 'An array of strings and numbers'], 2, 'A union type accepts any one of its member types.'],
        ['How does unknown differ from any?', ['They are identical', 'unknown must be narrowed before use, while any disables type checking', 'any is safer than unknown', 'unknown can only hold numbers'], 1, 'unknown is the type-safe counterpart of any: you must check the type before operating on it.'],
      ],
    },
  ],
};
