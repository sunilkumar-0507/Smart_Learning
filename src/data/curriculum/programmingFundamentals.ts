import type { SubjectSeed } from './types';

export const programmingFundamentals: SubjectSeed = {
  id: 'pf',
  name: 'Programming Fundamentals',
  description: 'Core programming concepts — data, control flow, functions, recursion and object-oriented design — illustrated in Python.',
  color: '#7c6be8',
  topics: [
    {
      id: 'pf-algorithms',
      name: 'Algorithms & Problem Solving',
      description: 'Breaking problems into steps, pseudocode, flowcharts and tracing.',
      difficulty: 1,
      importance: 85,
      minutes: 60,
      prerequisites: [],
      explanation:
        'An algorithm is a finite, well-defined sequence of steps that solves a problem. Good problem solving starts by understanding the input and expected output, breaking the problem into smaller sub-problems (decomposition) and expressing the solution as pseudocode or a flowchart before writing code. Tracing an algorithm by hand with sample inputs is the quickest way to find logical errors.',
      notes: [
        'An algorithm must be finite, unambiguous and produce an output.',
        'Decomposition: split a large problem into smaller, solvable parts.',
        'Pseudocode describes logic without language syntax.',
        'Flowcharts: ovals = start/end, rectangles = processes, diamonds = decisions.',
        'Dry-run (trace) with sample inputs, including edge cases.',
      ],
      code: {
        language: 'text',
        snippet:
          'ALGORITHM FindLargest(numbers)\n  IF numbers is empty THEN RETURN "no data"\n  largest <- numbers[0]\n  FOR each n IN numbers DO\n    IF n > largest THEN largest <- n\n  END FOR\n  RETURN largest\nEND\n\nTrace with [4, 9, 2]:\n  largest = 4 -> 9 (9 > 4) -> 9 (2 < 9)  => 9',
      },
      exercise:
        'Write pseudocode and draw a flowchart for an algorithm that decides whether a year is a leap year (divisible by 4, except centuries, unless divisible by 400). Trace it for 1900, 2000 and 2024.',
      questions: [
        ['Which property must every algorithm have?', ['It must use recursion', 'It must terminate after a finite number of steps', 'It must be written in Python', 'It must use at least one loop'], 1, 'Finiteness is a defining property of an algorithm — it must eventually stop.'],
        ['In a flowchart, which shape represents a decision?', ['Rectangle', 'Oval', 'Parallelogram', 'Diamond'], 3, 'Diamonds represent yes/no decisions; rectangles are processes and ovals are terminals.'],
        ['What is decomposition?', ['Breaking a problem into smaller sub-problems', 'Deleting unused code', 'Converting code into machine language', 'Measuring the speed of a program'], 0, 'Decomposition makes complex problems manageable by solving smaller parts independently.'],
        ['What is pseudocode?', ['Code that contains bugs', 'A compiled binary file', 'An informal, language-independent description of an algorithm', 'A programming language for robots'], 2, 'Pseudocode expresses logic in structured plain language without strict syntax.'],
        ['Why should you trace an algorithm by hand?', ['To make it run faster', 'To verify its logic with sample inputs and find errors', 'To reduce memory usage', 'To convert it to a flowchart automatically'], 1, 'Dry runs reveal logical mistakes, especially with edge cases such as empty or extreme inputs.'],
      ],
    },
    {
      id: 'pf-datatypes',
      name: 'Variables & Data Types',
      description: 'Integers, floats, strings, booleans, type conversion and naming.',
      difficulty: 1,
      importance: 85,
      minutes: 45,
      prerequisites: [],
      explanation:
        'A variable is a named reference to a value stored in memory. Each value has a data type that determines which operations are valid: integers (int) and floating-point numbers (float) for arithmetic, strings (str) for text and booleans (bool) for truth values. Python is dynamically typed, so a variable’s type is determined by the value it currently refers to. Explicit conversion functions such as int() and str() change a value’s type.',
      notes: [
        'Python core types: int, float, str, bool, None.',
        'type(x) reveals the type of a value.',
        'Convert explicitly: int("42"), float("3.5"), str(10).',
        'Variable names: letters, digits and underscores, cannot start with a digit.',
        'Floating-point numbers are approximations: 0.1 + 0.2 != 0.3 exactly.',
      ],
      code: {
        language: 'python',
        snippet:
          'name = "Meera"          # str\nage = 19                # int\naverage = 72.5          # float\nis_enrolled = True      # bool\n\nprint(type(age))        # <class \'int\'>\n\nscore_text = "85"\nscore = int(score_text) + 5   # 90\nprint("Score: " + str(score))\n\nprint(0.1 + 0.2)        # 0.30000000000000004',
      },
      exercise:
        'Write a program that reads a name and two marks as text input, converts the marks to numbers, and prints the name with the average mark rounded to one decimal place. What happens if a mark is entered as "eighty"? Handle that case with a clear message.',
      questions: [
        ['Which data type is used to store the value 3.75?', ['int', 'str', 'float', 'bool'], 2, 'Numbers with a fractional part are stored as floating-point values.'],
        ['What does int("42") + 1 evaluate to in Python?', ['43', '"421"', '"43"', 'An error'], 0, 'int("42") converts the string to the integer 42, then 1 is added.'],
        ['Which of these is a valid variable name?', ['2nd_score', 'total-marks', 'class', 'total_marks'], 3, 'Names cannot start with a digit, cannot contain hyphens and cannot be reserved keywords such as class.'],
        ['What type is the value True?', ['str', 'bool', 'int', 'None'], 1, 'True and False are the two boolean values.'],
        ['Why does 0.1 + 0.2 not print exactly 0.3?', ['Python has a bug in addition', 'Floats are stored as binary approximations', 'The numbers are converted to strings', 'Python rounds all results down'], 1, 'Many decimal fractions cannot be represented exactly in binary floating point.'],
      ],
    },
    {
      id: 'pf-operators',
      name: 'Operators & Expressions',
      description: 'Arithmetic, comparison, logical operators and precedence.',
      difficulty: 1,
      importance: 70,
      minutes: 45,
      prerequisites: ['pf-datatypes'],
      explanation:
        'Operators combine values into expressions. Arithmetic operators include +, -, *, /, // (floor division), % (remainder) and ** (power). Comparison operators (==, !=, <, >, <=, >=) produce booleans, and logical operators (and, or, not) combine them. Operator precedence decides evaluation order: ** binds tighter than * and /, which bind tighter than + and -. Parentheses make intent explicit.',
      notes: [
        '/ always returns a float; // returns the floor of the division.',
        '% gives the remainder: 17 % 5 == 2.',
        'Precedence: ** > unary - > * / // % > + - > comparisons > not > and > or.',
        'and / or short-circuit: the right side may not be evaluated.',
        '= assigns; == compares.',
      ],
      code: {
        language: 'python',
        snippet:
          'print(17 / 5)    # 3.4\nprint(17 // 5)   # 3\nprint(17 % 5)    # 2\nprint(2 ** 3)    # 8\n\nprint(2 + 3 * 4)     # 14, not 20\nprint((2 + 3) * 4)   # 20\n\nscore = 72\nattendance = 0.9\neligible = score >= 60 and attendance >= 0.75\nprint(eligible)      # True\n\nis_even = (score % 2 == 0)',
      },
      exercise:
        'Write expressions that (1) convert a total number of minutes into hours and remaining minutes using // and %, (2) check whether a number lies between 10 and 20 inclusive, and (3) evaluate 3 + 4 * 2 ** 2 by hand before running it.',
      questions: [
        ['What is the value of 17 % 5?', ['3', '3.4', '2', '5'], 2, '% returns the remainder: 17 = 3 × 5 + 2.'],
        ['What does 2 + 3 * 4 evaluate to?', ['20', '14', '24', '9'], 1, 'Multiplication has higher precedence than addition: 2 + 12 = 14.'],
        ['In Python, what is 7 // 2?', ['3', '3.5', '4', '1'], 0, '// is floor division, discarding the fractional part for positive numbers.'],
        ['Which expression is True when x is 15?', ['x < 10 or x > 20', 'not (x > 10)', 'x == 10', 'x >= 10 and x <= 20'], 3, '15 is at least 10 and at most 20, so the conjunction is True.'],
        ['What is the difference between = and ==?', ['There is no difference', '= assigns a value; == compares two values', '== assigns a value; = compares two values', 'Both compare values, but == is faster'], 1, 'A single = binds a name to a value; == tests equality.'],
      ],
    },
    {
      id: 'pf-conditionals',
      name: 'Conditional Statements',
      description: 'if, elif and else, nested conditions and boolean logic in decisions.',
      difficulty: 2,
      importance: 85,
      minutes: 45,
      prerequisites: ['pf-operators'],
      explanation:
        'Conditional statements let a program choose between paths. An if block runs when its condition is true; elif adds further checks that are tried in order, and else catches everything else. Only the first matching branch executes, so conditions should be ordered from most specific to most general. Indentation defines which statements belong to each branch in Python.',
      notes: [
        'Only the first true branch of an if/elif/else chain runs.',
        'Order range checks carefully (e.g. highest grade first).',
        'Empty strings, 0, None and empty collections are falsy.',
        'Avoid deep nesting; combine conditions with and / or where clear.',
        'Indentation defines the body of each branch.',
      ],
      code: {
        language: 'python',
        snippet:
          'def grade(score):\n    if score >= 80:\n        return "Excellent"\n    elif score >= 60:\n        return "Good"\n    elif score >= 40:\n        return "Developing"\n    else:\n        return "Needs Improvement"\n\nprint(grade(72))   # Good\nprint(grade(35))   # Needs Improvement',
      },
      exercise:
        'Write a function ticket_price(age, is_student) that returns 0 for children under 5, 50 for students or people over 60, and 100 otherwise. Test every branch, including the boundary ages 5 and 60.',
      questions: [
        ['In an if / elif / else chain, how many branches can run?', ['All branches whose conditions are true', 'At most one', 'Exactly two', 'It depends on indentation'], 1, 'Python evaluates the conditions in order and runs only the first branch that matches.'],
        ['With the checks "if score >= 40" placed before "elif score >= 80", what happens for score 90?', ['The >= 40 branch runs', 'The >= 80 branch runs', 'Both branches run', 'Neither branch runs'], 0, 'The first true condition wins, so broader checks placed first shadow more specific ones.'],
        ['Which value is falsy in Python?', ['"0"', '[0]', '0', '"False"'], 2, 'The integer 0 is falsy; non-empty strings and lists are truthy even if they contain "0" or 0.'],
        ['What does else attach to?', ['The nearest loop only', 'Any function in the file', 'The previous print statement', 'The if/elif chain it follows'], 3, 'else runs when none of the preceding if/elif conditions in the same chain are true.'],
        ['Which code checks that x is between 1 and 10 inclusive?', ['if 1 <= x <= 10:', 'if x > 1 or x < 10:', 'if x = 1 to 10:', 'if 1 < x < 10:'], 0, 'Python supports chained comparisons; <= includes the boundaries.'],
      ],
    },
    {
      id: 'pf-loops',
      name: 'Loops',
      description: 'for and while loops, range, break, continue and accumulators.',
      difficulty: 2,
      importance: 90,
      minutes: 60,
      prerequisites: ['pf-conditionals'],
      explanation:
        'Loops repeat a block of code. A for loop iterates over a sequence such as a list or range(); a while loop repeats while a condition stays true and must update something to avoid running forever. break exits the loop immediately and continue skips to the next iteration. Common patterns include accumulators (running totals), counters and searching for the first matching element.',
      notes: [
        'range(start, stop, step) excludes stop: range(1, 5) → 1, 2, 3, 4.',
        'while loops need a condition that eventually becomes false.',
        'break leaves the loop; continue skips the rest of the current iteration.',
        'Accumulator pattern: total = 0, then total += value inside the loop.',
        'Off-by-one errors are the most common loop bug — check boundaries.',
      ],
      code: {
        language: 'python',
        snippet:
          'scores = [72, 45, 90, 38, 66]\n\ntotal = 0\nfor s in scores:\n    total += s\nprint(total / len(scores))  # 62.2\n\nfor i in range(1, 6):\n    if i == 3:\n        continue           # skip 3\n    print(i)               # 1 2 4 5\n\nattempts = 0\nwhile attempts < 3:\n    attempts += 1\nprint(attempts)            # 3',
      },
      exercise:
        'Print the multiplication table for a number n from 1 to 10. Then write a loop that finds the first score below 40 in a list and prints its position, stopping early with break. Finally, count how many scores are at least 60.',
      questions: [
        ['Which numbers does range(1, 5) produce?', ['1, 2, 3, 4, 5', '0, 1, 2, 3, 4', '1, 2, 3, 4', '1, 5'], 2, 'range excludes its stop value.'],
        ['What does break do inside a loop?', ['Skips to the next iteration', 'Exits the loop immediately', 'Restarts the loop', 'Pauses the program'], 1, 'break terminates the innermost loop; continue moves to the next iteration.'],
        ['What is the risk of a while loop whose condition never becomes false?', ['An infinite loop', 'A syntax error', 'The loop runs once', 'Nothing — Python stops it automatically'], 0, 'If nothing inside the loop changes the condition, it repeats forever.'],
        ['What does the following print? total = 0; for i in range(4): total += i; print(total)', ['10', '4', '3', '6'], 3, 'range(4) yields 0, 1, 2, 3 whose sum is 6.'],
        ['When is a for loop usually preferred over a while loop?', ['When iterating over a known sequence of items', 'When the number of iterations is unknown', 'When you need an infinite loop', 'Never — they are interchangeable in all cases'], 0, 'for is the natural choice when iterating through a collection or a fixed range.'],
      ],
    },
    {
      id: 'pf-functions',
      name: 'Functions & Scope',
      description: 'Defining functions, parameters, return values and local/global scope.',
      difficulty: 3,
      importance: 90,
      minutes: 75,
      prerequisites: ['pf-loops'],
      explanation:
        'Functions group statements under a name so they can be reused and tested. Parameters receive arguments; default values make parameters optional. return sends a value back to the caller and ends the function — without it, Python returns None. Variables assigned inside a function are local to it; reading a global is allowed, but assigning to one requires the global keyword, which is usually a sign the design should pass values explicitly instead.',
      notes: [
        'def name(params): defines a function; return sends back a result.',
        'A function without return gives None.',
        'Default parameters: def greet(name="student").',
        'Local variables exist only while the function runs.',
        'Pure functions (no side effects) are easiest to test.',
      ],
      code: {
        language: 'python',
        snippet:
          'def average(values, round_to=1):\n    if not values:\n        return None\n    return round(sum(values) / len(values), round_to)\n\nprint(average([70, 85, 90]))      # 81.7\nprint(average([], 2))            # None\n\ncount = 0\ndef increment():\n    local_value = 1               # local to increment\n    return count + local_value    # reading a global is fine\n\nprint(increment())                # 1',
      },
      exercise:
        'Write a function letter_grade(score, thresholds=(40, 60, 80)) that returns a grade label, and a function summarise(scores) that returns a dictionary with the average, highest and lowest score. Write three test calls for each function, including an empty list.',
      questions: [
        ['What does a Python function return if it has no return statement?', ['0', 'An empty string', 'None', 'False'], 2, 'Functions without an explicit return value return None.'],
        ['What is a parameter?', ['A variable in the function definition that receives an argument', 'A value printed by the function', 'The name of the function', 'A global variable'], 0, 'Parameters are placeholders in the definition; arguments are the actual values passed in a call.'],
        ['Where can a variable assigned inside a function be used?', ['Anywhere in the program', 'Only in other functions', 'Only after the function ends', 'Only inside that function'], 3, 'Assignment inside a function creates a local variable scoped to that call.'],
        ['What does the default value in def f(x, y=2) mean?', ['y must always be 2', 'y is 2 when the caller does not provide it', 'x defaults to 2', 'The function returns 2 by default'], 1, 'Default parameters supply a value when the corresponding argument is omitted.'],
        ['Why are pure functions easier to test?', ['They run faster', 'They always return None', 'Their output depends only on their inputs and they have no side effects', 'They cannot contain loops'], 2, 'With no hidden state or side effects, the same inputs always produce the same output.'],
      ],
    },
    {
      id: 'pf-recursion',
      name: 'Recursion',
      description: 'Base cases, recursive cases, the call stack and recursive problem solving.',
      difficulty: 4,
      importance: 75,
      minutes: 90,
      prerequisites: ['pf-functions'],
      explanation:
        'A recursive function solves a problem by calling itself on a smaller version of the same problem. Every recursive function needs a base case that returns without recursing, and a recursive case that moves towards the base case. Each call is placed on the call stack; too many nested calls cause a stack overflow (RecursionError in Python). Recursion is natural for tree structures and divide-and-conquer algorithms, while some problems are more efficient iteratively or with memoisation.',
      notes: [
        'Base case: stops the recursion. Recursive case: reduces the problem.',
        'Missing or unreachable base case → infinite recursion → RecursionError.',
        'Each call has its own local variables on the call stack.',
        'Naive recursive Fibonacci is exponential; memoisation makes it linear.',
        'Recursion suits trees, nested data and divide-and-conquer.',
      ],
      code: {
        language: 'python',
        snippet:
          'def factorial(n):\n    if n <= 1:          # base case\n        return 1\n    return n * factorial(n - 1)   # recursive case\n\nfrom functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(factorial(5))  # 120\nprint(fib(40))       # 102334155 (fast thanks to memoisation)',
      },
      exercise:
        'Write recursive functions for (1) the sum of digits of a positive integer, (2) reversing a string, and (3) counting all items in a nested list such as [1, [2, [3, 4]], 5]. For each, identify the base case and explain why the recursion terminates.',
      questions: [
        ['What is the purpose of a base case?', ['To make the function run faster', 'To stop the recursion', 'To call the function again', 'To store results in a cache'], 1, 'The base case returns directly, ensuring the chain of calls eventually ends.'],
        ['What happens if a recursive function never reaches its base case?', ['It returns None', 'It runs in constant time', 'It exceeds the maximum recursion depth (stack overflow)', 'Python converts it to a loop'], 2, 'Each call uses stack space; unbounded recursion exhausts it.'],
        ['What does factorial(4) return with factorial(n) = n * factorial(n - 1) and factorial(1) = 1?', ['24', '10', '16', '4'], 0, '4 × 3 × 2 × 1 = 24.'],
        ['Why is naive recursive Fibonacci slow?', ['Python cannot add large numbers', 'It uses too little memory', 'Recursion is always slower than loops', 'It recomputes the same subproblems many times'], 3, 'fib(n) calls fib(n-1) and fib(n-2), which overlap heavily — memoisation removes the repetition.'],
        ['Which data structure does the runtime use to keep track of active recursive calls?', ['A queue', 'The call stack', 'A hash table', 'A heap'], 1, 'Each function call pushes a frame on the call stack, popped when it returns.'],
      ],
    },
    {
      id: 'pf-strings',
      name: 'Strings',
      description: 'Indexing, slicing, string methods, formatting and immutability.',
      difficulty: 2,
      importance: 70,
      minutes: 60,
      prerequisites: ['pf-loops'],
      explanation:
        'Strings are immutable sequences of characters. Individual characters are accessed by zero-based index, with negative indices counting from the end. Slicing s[start:stop:step] creates a new string. Methods such as lower(), strip(), split() and replace() return new strings rather than modifying the original. f-strings provide readable formatting with embedded expressions.',
      notes: [
        'Indexing starts at 0; s[-1] is the last character.',
        's[a:b] includes a and excludes b; s[::-1] reverses.',
        'Strings are immutable — methods return new strings.',
        'split() breaks into a list; " ".join(list) combines.',
        'f"{name} scored {score:.1f}%" formats values inline.',
      ],
      code: {
        language: 'python',
        snippet:
          'title = "  Data Structures  "\nclean = title.strip()          # "Data Structures"\nprint(clean.lower())           # "data structures"\nprint(clean[0], clean[-1])     # D s\nprint(clean[0:4])              # "Data"\nprint(clean[::-1])             # "serutcurtS ataD"\n\nwords = clean.split()          # ["Data", "Structures"]\nprint("-".join(words))         # "Data-Structures"\n\nname, score = "Ivan", 87.456\nprint(f"{name} scored {score:.1f}%")  # Ivan scored 87.5%',
      },
      exercise:
        'Write functions that (1) check whether a word is a palindrome ignoring case, (2) count the vowels in a sentence, and (3) convert "hello world from python" to title case without using title().',
      questions: [
        ['What is "Python"[1]?', ['"P"', '"n"', '"y"', '"t"'], 2, 'Indexing is zero-based, so index 1 is the second character.'],
        ['What does "Python"[-1] return?', ['"n"', '"P"', 'An IndexError', '"o"'], 0, 'Negative indices count from the end; -1 is the last character.'],
        ['What does "learning"[0:5] return?', ['"learni"', '"earn"', '"learn"', '"ning"'], 2, 'The slice includes index 0 and stops before index 5.'],
        ['What does s.upper() do to the string s?', ['Changes s in place', 'Raises an error because strings are immutable', 'Deletes lowercase letters', 'Returns a new uppercase string, leaving s unchanged'], 3, 'Strings are immutable, so methods return new strings.'],
        ['What does "a,b,c".split(",") return?', ['["a", "b", "c"]', '"abc"', '["a,b,c"]', '("a", "b", "c")'], 0, 'split divides the string at each separator and returns a list.'],
      ],
    },
    {
      id: 'pf-errors',
      name: 'Error Handling',
      description: 'Exceptions, try / except / finally, raising errors and validation.',
      difficulty: 3,
      importance: 65,
      minutes: 60,
      prerequisites: ['pf-functions'],
      explanation:
        'Exceptions signal that something went wrong at runtime, such as dividing by zero or converting invalid text to a number. A try block contains code that might fail; except blocks handle specific exception types; else runs when no exception occurred and finally always runs, which is useful for cleanup. Functions can raise exceptions to reject invalid input. Catch specific exceptions rather than using a bare except, so genuine bugs are not hidden.',
      notes: [
        'Syntax errors are found before running; exceptions occur during execution.',
        'Catch specific exceptions: except ValueError:.',
        'finally always runs — use it for cleanup.',
        'raise ValueError("message") signals invalid input.',
        'Avoid bare except: it hides bugs and even KeyboardInterrupt.',
      ],
      code: {
        language: 'python',
        snippet:
          'def parse_score(text):\n    try:\n        score = float(text)\n    except ValueError:\n        raise ValueError(f"\'{text}\' is not a number")\n    if not 0 <= score <= 100:\n        raise ValueError("Score must be between 0 and 100")\n    return score\n\nfor raw in ["85", "abc", "120"]:\n    try:\n        print(parse_score(raw))\n    except ValueError as err:\n        print("Invalid:", err)\n    finally:\n        print("checked", raw)',
      },
      exercise:
        'Write a safe_divide(a, b) function that returns None and prints a friendly message when b is zero, and a read_marks(lines) function that skips invalid entries while counting how many were rejected.',
      questions: [
        ['Which block always executes, whether or not an exception occurred?', ['except', 'else', 'finally', 'try'], 2, 'finally runs in every case, making it ideal for releasing resources.'],
        ['Which exception does int("abc") raise?', ['TypeError', 'ValueError', 'KeyError', 'ZeroDivisionError'], 1, 'The argument has the right type (str) but an inappropriate value, so ValueError is raised.'],
        ['Why should you avoid a bare except: clause?', ['It catches every exception, hiding real bugs', 'It is a syntax error', 'It only catches KeyError', 'It makes the program faster'], 0, 'Catching everything can mask programming errors and even interrupt signals.'],
        ['How do you signal invalid input from your own function?', ['return False always', 'print an error and continue', 'Use the error keyword', 'raise an exception such as ValueError'], 3, 'Raising an exception forces the caller to deal with the problem explicitly.'],
        ['When does the else block of a try statement run?', ['When an exception is raised', 'Only if the try block raised no exception', 'Always', 'Before the try block'], 1, 'else runs after try succeeds without exceptions, before finally.'],
      ],
    },
    {
      id: 'pf-oop',
      name: 'Object-Oriented Programming',
      description: 'Classes, objects, encapsulation, inheritance and polymorphism.',
      difficulty: 4,
      importance: 85,
      minutes: 120,
      prerequisites: ['pf-functions'],
      explanation:
        'Object-oriented programming models software as objects that combine data (attributes) and behaviour (methods). A class is a blueprint; an object is an instance created from it. Encapsulation hides internal details behind a clear interface. Inheritance lets a subclass reuse and extend a parent class, and polymorphism lets different classes be used through a common interface — for example, calling area() on any shape.',
      notes: [
        'Class = blueprint; object = instance.',
        '__init__ initialises a new object; self refers to the instance.',
        'Encapsulation: expose methods, keep internal state private by convention (_name).',
        'Inheritance: class Square(Shape) reuses Shape behaviour.',
        'Polymorphism: same method name, class-specific behaviour.',
      ],
      code: {
        language: 'python',
        snippet:
          'class Shape:\n    def area(self):\n        raise NotImplementedError\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    def area(self):\n        return self.width * self.height\n\nclass Circle(Shape):\n    def __init__(self, radius):\n        self.radius = radius\n    def area(self):\n        return 3.14159 * self.radius ** 2\n\nfor shape in [Rectangle(2, 3), Circle(1)]:\n    print(type(shape).__name__, round(shape.area(), 2))  # polymorphism',
      },
      exercise:
        'Design a Student class with name and a private list of scores, methods add_score(score) (validating 0–100) and average(). Create a GraduateStudent subclass that adds a thesis title and overrides __str__. Demonstrate polymorphism by printing a mixed list of students.',
      questions: [
        ['What is the relationship between a class and an object?', ['They are the same thing', 'An object is a blueprint; a class is an instance', 'A class is a blueprint; an object is an instance of it', 'A class is a function that returns numbers'], 2, 'Classes define structure and behaviour; objects are concrete instances.'],
        ['What does self refer to in a Python method?', ['The instance on which the method was called', 'The class itself', 'The parent class', 'A global variable'], 0, 'self is the conventional name for the instance passed automatically to instance methods.'],
        ['What is inheritance?', ['Copying code between files', 'A subclass reusing and extending the behaviour of a parent class', 'Hiding data inside an object', 'Running methods in parallel'], 1, 'Inheritance creates an "is-a" relationship, e.g. a Circle is a Shape.'],
        ['What is polymorphism?', ['A class with many attributes', 'Using one variable for many values', 'Converting objects to strings', 'Different classes responding to the same method call in their own way'], 3, 'Polymorphism lets code call area() on any Shape without knowing the concrete class.'],
        ['Which principle hides an object’s internal details behind a public interface?', ['Encapsulation', 'Inheritance', 'Recursion', 'Iteration'], 0, 'Encapsulation protects internal state and exposes behaviour through methods.'],
      ],
    },
  ],
};
