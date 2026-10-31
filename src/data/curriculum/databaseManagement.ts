import type { SubjectSeed } from './types';

export const databaseManagement: SubjectSeed = {
  id: 'db',
  name: 'Database Management',
  description: 'Design, query and maintain relational databases — from ER modelling to SQL, normalisation, indexing and transactions.',
  color: '#0e9f6e',
  topics: [
    {
      id: 'db-concepts',
      name: 'Database Concepts',
      description: 'Data vs information, DBMS roles, schemas and data independence.',
      difficulty: 1,
      importance: 80,
      minutes: 45,
      prerequisites: [],
      explanation:
        'A database is an organised collection of related data, and a Database Management System (DBMS) is the software that stores, retrieves and protects it. Compared with flat files, a DBMS reduces redundancy, enforces integrity constraints, supports concurrent users and provides recovery after failures. The schema describes the structure of the data, while an instance is the data stored at a given moment. Data independence means applications are insulated from changes in how data is stored.',
      notes: [
        'DBMS = software that manages databases (e.g. PostgreSQL, MySQL, SQLite).',
        'Advantages over files: less redundancy, integrity, concurrency, security, recovery.',
        'Schema = structure; instance = current contents.',
        'Three-schema architecture: external, conceptual, internal levels.',
        'Physical data independence: storage changes do not affect the logical schema.',
      ],
      code: {
        language: 'sql',
        snippet:
          '-- A schema describes structure ...\nCREATE TABLE student (\n  student_id   INTEGER PRIMARY KEY,\n  full_name    VARCHAR(100) NOT NULL,\n  email        VARCHAR(120) UNIQUE\n);\n\n-- ... an instance is the data at a point in time\nINSERT INTO student VALUES (1, \'Asha Kumar\', \'asha@example.edu\');\nINSERT INTO student VALUES (2, \'Ravi Singh\', \'ravi@example.edu\');',
      },
      exercise:
        'List five problems a college would face if it stored student, course and fee records in separate spreadsheets. For each problem, name the DBMS feature that solves it.',
      questions: [
        ['What is a DBMS?', ['A programming language for web pages', 'Software that stores, manages and controls access to databases', 'A type of spreadsheet', 'A hardware storage device'], 1, 'A Database Management System provides storage, querying, integrity, security and recovery.'],
        ['What is the difference between a schema and an instance?', ['A schema is the structure; an instance is the data stored at a moment', 'They are the same', 'An instance defines the tables; a schema holds the rows', 'A schema is a backup of an instance'], 0, 'The schema changes rarely; the instance changes with every insert, update and delete.'],
        ['Which is an advantage of a DBMS over flat files?', ['Data must be duplicated in every file', 'Only one user can access data at a time', 'It controls redundancy and enforces integrity', 'It does not need any storage'], 2, 'Centralised management reduces duplication and enforces constraints consistently.'],
        ['What does physical data independence mean?', ['Each user has a physical copy of the data', 'Data is stored without a schema', 'The database works without hardware', 'Changes to storage structures do not require changes to the logical schema'], 3, 'Applications are insulated from how and where the data is physically stored.'],
        ['Which of these is a relational DBMS?', ['PostgreSQL', 'Microsoft Word', 'Photoshop', 'Git'], 0, 'PostgreSQL is a relational database management system.'],
      ],
    },
    {
      id: 'db-er',
      name: 'ER Modelling',
      description: 'Entities, attributes, relationships, cardinality and ER diagrams.',
      difficulty: 2,
      importance: 75,
      minutes: 75,
      prerequisites: ['db-concepts'],
      explanation:
        'Entity–Relationship (ER) modelling is a conceptual design technique. Entities are things of interest (Student, Course), attributes describe them (name, credits) and relationships connect them (Student enrols in Course). Cardinality states how many instances participate: one-to-one, one-to-many or many-to-many. Many-to-many relationships become separate tables, often called junction or associative tables, when converted to a relational schema.',
      notes: [
        'Entity = rectangle, attribute = oval, relationship = diamond (Chen notation).',
        'A key attribute uniquely identifies an entity instance.',
        'Cardinality: 1:1, 1:N, M:N.',
        'M:N relationships map to a junction table with two foreign keys.',
        'Weak entities depend on an owner entity for identification.',
      ],
      code: {
        language: 'sql',
        snippet:
          '-- Student (M) --- enrols --- (N) Course  =>  junction table\nCREATE TABLE course (\n  course_id  INTEGER PRIMARY KEY,\n  title      VARCHAR(100) NOT NULL,\n  credits    INTEGER CHECK (credits > 0)\n);\n\nCREATE TABLE enrolment (\n  student_id INTEGER REFERENCES student(student_id),\n  course_id  INTEGER REFERENCES course(course_id),\n  enrolled_on DATE,\n  PRIMARY KEY (student_id, course_id)\n);',
      },
      exercise:
        'Draw an ER diagram for a library: members borrow books, each book has one publisher, and authors can write many books while books can have many authors. Mark every cardinality and convert the diagram into table definitions.',
      questions: [
        ['In an ER diagram (Chen notation), what does a diamond represent?', ['An entity', 'An attribute', 'A relationship', 'A primary key'], 2, 'Diamonds represent relationships; rectangles are entities and ovals are attributes.'],
        ['A student can enrol in many courses and a course has many students. What is the cardinality?', ['One-to-one', 'Many-to-many', 'One-to-many', 'None'], 1, 'Both sides can have many related instances, so the relationship is M:N.'],
        ['How is a many-to-many relationship usually implemented in a relational database?', ['With a junction table holding foreign keys to both tables', 'By storing a comma-separated list in one column', 'By merging both tables', 'It cannot be implemented'], 0, 'A junction table such as enrolment(student_id, course_id) represents each pairing as a row.'],
        ['What is a key attribute?', ['An attribute that is always numeric', 'The first attribute in a table', 'An attribute that can be NULL', 'An attribute that uniquely identifies each entity instance'], 3, 'Key attributes (e.g. student_id) distinguish entity instances.'],
        ['What is a weak entity?', ['An entity with few attributes', 'An entity that cannot be identified without its owner entity', 'An entity that is rarely queried', 'An entity without relationships'], 1, 'A weak entity (e.g. a room within a building) needs its owner’s key to be uniquely identified.'],
      ],
    },
    {
      id: 'db-relational',
      name: 'Relational Model',
      description: 'Relations, tuples, keys, foreign keys and integrity constraints.',
      difficulty: 2,
      importance: 85,
      minutes: 60,
      prerequisites: ['db-concepts'],
      explanation:
        'The relational model stores data in relations (tables) made of tuples (rows) and attributes (columns). A primary key uniquely identifies each tuple and cannot be NULL. A foreign key references the primary key of another relation, linking tables and enforcing referential integrity: you cannot reference a row that does not exist. Candidate keys are minimal sets of attributes that could serve as the primary key.',
      notes: [
        'Relation = table, tuple = row, attribute = column, domain = allowed values.',
        'Primary key: unique and NOT NULL.',
        'Foreign key: references a primary key, enforcing referential integrity.',
        'Candidate key: any minimal unique identifier; one is chosen as primary.',
        'Entity integrity: no part of a primary key may be NULL.',
      ],
      code: {
        language: 'sql',
        snippet:
          'CREATE TABLE department (\n  dept_id   INTEGER PRIMARY KEY,\n  name      VARCHAR(60) NOT NULL UNIQUE\n);\n\nCREATE TABLE lecturer (\n  lecturer_id INTEGER PRIMARY KEY,\n  name        VARCHAR(100) NOT NULL,\n  dept_id     INTEGER NOT NULL REFERENCES department(dept_id)\n);\n\n-- Fails: department 99 does not exist (referential integrity)\nINSERT INTO lecturer VALUES (10, \'Dr. Rao\', 99);',
      },
      exercise:
        'For tables Student(roll_no, email, name), Course(code, title) and Result(roll_no, code, marks), identify all candidate keys, choose primary keys, and define the foreign keys. Explain what should happen when a course that has results is deleted.',
      questions: [
        ['In the relational model, what is a tuple?', ['A column', 'A row of a table', 'A table', 'A database'], 1, 'A tuple is a single row; attributes are columns.'],
        ['Which property must a primary key have?', ['It must be text', 'It may contain duplicates', 'It must be unique and not NULL', 'It must reference another table'], 2, 'Primary keys uniquely identify rows and cannot be NULL (entity integrity).'],
        ['What does a foreign key enforce?', ['Referential integrity between tables', 'Faster sorting', 'Encryption of the column', 'Automatic numbering'], 0, 'A foreign key value must match an existing primary key value (or be NULL if allowed).'],
        ['What is a candidate key?', ['Any column containing numbers', 'A foreign key in another table', 'A key that is always composite', 'A minimal set of attributes that uniquely identifies a row'], 3, 'Each candidate key could serve as the primary key; one is chosen.'],
        ['Inserting a lecturer with dept_id 99 when department 99 does not exist will…', ['Succeed and create department 99', 'Fail because of a foreign key violation', 'Insert NULL instead', 'Delete the lecturer table'], 1, 'Referential integrity prevents references to non-existent rows.'],
      ],
    },
    {
      id: 'db-sql',
      name: 'SQL Basics',
      description: 'CREATE, INSERT, SELECT, UPDATE and DELETE statements.',
      difficulty: 2,
      importance: 95,
      minutes: 75,
      prerequisites: ['db-relational'],
      explanation:
        'SQL (Structured Query Language) is the standard language for relational databases. Data Definition Language (DDL) statements such as CREATE and ALTER define structure; Data Manipulation Language (DML) statements such as INSERT, SELECT, UPDATE and DELETE work with data. SELECT chooses columns, FROM names the table and WHERE filters rows. UPDATE and DELETE without a WHERE clause affect every row, so they must be written carefully.',
      notes: [
        'DDL: CREATE, ALTER, DROP. DML: SELECT, INSERT, UPDATE, DELETE.',
        'SELECT column_list FROM table WHERE condition;',
        'SELECT * returns all columns — avoid it in production queries.',
        'UPDATE/DELETE without WHERE affects every row.',
        'String literals use single quotes: WHERE name = \'Asha\'.',
      ],
      code: {
        language: 'sql',
        snippet:
          'INSERT INTO student (student_id, full_name, email)\nVALUES (3, \'Meera Iyer\', \'meera@example.edu\');\n\nSELECT full_name, email\nFROM student\nWHERE student_id = 3;\n\nUPDATE student\nSET email = \'meera.iyer@example.edu\'\nWHERE student_id = 3;\n\nDELETE FROM student\nWHERE student_id = 3;',
      },
      exercise:
        'Create a table book(book_id, title, author, year, available). Insert five books, select all books published after 2015, mark one book as unavailable with UPDATE, and delete books older than 1990. Write each statement and predict its effect before running it in an SQL playground such as SQLite.',
      questions: [
        ['Which SQL statement retrieves data from a table?', ['GET', 'SELECT', 'FETCH', 'EXTRACT'], 1, 'SELECT is the DML statement used for querying data.'],
        ['Which category does CREATE TABLE belong to?', ['Data Definition Language (DDL)', 'Data Manipulation Language (DML)', 'Data Control Language (DCL)', 'Transaction Control Language (TCL)'], 0, 'CREATE, ALTER and DROP define database structure and are DDL.'],
        ['What happens when you run DELETE FROM student; with no WHERE clause?', ['Nothing happens', 'Only the first row is deleted', 'The table structure is dropped', 'Every row in the table is deleted'], 3, 'Without WHERE, DELETE removes all rows (the table itself remains).'],
        ['Which statement changes existing rows?', ['INSERT', 'ALTER', 'UPDATE', 'MODIFY ROW'], 2, 'UPDATE ... SET ... WHERE ... changes values in existing rows.'],
        ['How should a text value be written in a SQL condition?', ['WHERE name = "Asha" is the only valid form', 'WHERE name = \'Asha\'', 'WHERE name = Asha', 'WHERE name == Asha'], 1, 'Standard SQL uses single quotes for string literals; double quotes denote identifiers.'],
      ],
    },
    {
      id: 'db-filtering',
      name: 'Filtering & Sorting',
      description: 'WHERE conditions, LIKE, IN, BETWEEN, NULL handling and ORDER BY.',
      difficulty: 2,
      importance: 80,
      minutes: 45,
      prerequisites: ['db-sql'],
      explanation:
        'The WHERE clause filters rows using comparison and logical operators. BETWEEN tests inclusive ranges, IN tests membership in a list, and LIKE matches patterns where % stands for any sequence of characters and _ for exactly one. NULL represents a missing value and must be tested with IS NULL — comparisons such as = NULL are never true. ORDER BY sorts results ascending (ASC, default) or descending (DESC), and LIMIT restricts the number of rows returned.',
      notes: [
        'BETWEEN a AND b is inclusive of both ends.',
        'LIKE \'A%\' = starts with A; \'_a%\' = second letter a.',
        'Use IS NULL / IS NOT NULL — never = NULL.',
        'ORDER BY col DESC sorts high to low; default is ASC.',
        'LIMIT n returns only the first n rows (syntax varies by DBMS).',
      ],
      code: {
        language: 'sql',
        snippet:
          'SELECT full_name, score\nFROM result\nWHERE score BETWEEN 40 AND 60\n  AND course_code IN (\'DB101\', \'DS201\')\n  AND full_name LIKE \'A%\'\nORDER BY score DESC, full_name ASC\nLIMIT 10;\n\n-- Students who have not submitted an email address\nSELECT full_name FROM student WHERE email IS NULL;',
      },
      exercise:
        'Using a result(student, course, score, submitted_on) table, write queries for: the top five scores in DB101, all students whose names contain "an", results submitted in March 2025, and rows with a missing score.',
      questions: [
        ['Which condition correctly finds rows where email is missing?', ['WHERE email = NULL', 'WHERE email IS NULL', 'WHERE email == NULL', 'WHERE email = \'\''], 1, 'NULL is not equal to anything, including NULL; use IS NULL.'],
        ['Is the range in score BETWEEN 40 AND 60 inclusive?', ['Yes, 40 and 60 are included', 'No, both ends are excluded', 'Only 40 is included', 'Only 60 is included'], 0, 'BETWEEN includes both boundary values.'],
        ['Which pattern matches names that start with "Ra"?', ['LIKE \'%Ra\'', 'LIKE \'_Ra%\'', 'LIKE \'Ra_\'', 'LIKE \'Ra%\''], 3, '% matches any sequence of characters after "Ra".'],
        ['How do you sort results from highest to lowest score?', ['ORDER BY score ASC', 'SORT score DOWN', 'ORDER BY score DESC', 'GROUP BY score DESC'], 2, 'DESC sorts in descending order.'],
        ['What does WHERE course IN (\'DB101\', \'DS201\') do?', ['Selects rows whose course is DB101 or DS201', 'Selects rows with both courses', 'Creates two new courses', 'Sorts by course'], 0, 'IN tests membership in the listed values.'],
      ],
    },
    {
      id: 'db-joins',
      name: 'Joins',
      description: 'INNER, LEFT, RIGHT and FULL joins, join conditions and self joins.',
      difficulty: 4,
      importance: 95,
      minutes: 90,
      prerequisites: ['db-filtering'],
      explanation:
        'Joins combine rows from two or more tables based on related columns. An INNER JOIN returns only rows with matching values in both tables. A LEFT JOIN returns all rows from the left table and the matching rows from the right, filling non-matches with NULL; RIGHT JOIN is the mirror image, and FULL OUTER JOIN keeps unmatched rows from both. Forgetting the join condition produces a Cartesian product — every row paired with every other row.',
      notes: [
        'INNER JOIN: only matching rows.',
        'LEFT JOIN: all left rows + matches (NULL where none).',
        'FULL OUTER JOIN: all rows from both sides.',
        'Missing ON condition → Cartesian product (rows × rows).',
        'LEFT JOIN ... WHERE right.id IS NULL finds rows without a match.',
      ],
      code: {
        language: 'sql',
        snippet:
          '-- Students with their enrolled course titles\nSELECT s.full_name, c.title\nFROM student AS s\nINNER JOIN enrolment AS e ON e.student_id = s.student_id\nINNER JOIN course AS c ON c.course_id = e.course_id;\n\n-- Students who are not enrolled in any course\nSELECT s.full_name\nFROM student AS s\nLEFT JOIN enrolment AS e ON e.student_id = s.student_id\nWHERE e.student_id IS NULL;',
      },
      exercise:
        'With tables student, course and enrolment, write queries to list (1) every enrolment with student name and course title, (2) courses with no students, and (3) the number of courses each student takes, including students with zero courses.',
      questions: [
        ['Which join returns only rows with matching values in both tables?', ['LEFT JOIN', 'FULL OUTER JOIN', 'INNER JOIN', 'CROSS JOIN'], 2, 'INNER JOIN keeps only rows that satisfy the join condition on both sides.'],
        ['What does a LEFT JOIN return for left-table rows that have no match?', ['They are removed', 'The left row with NULLs in the right table’s columns', 'An error', 'Duplicate rows'], 1, 'LEFT JOIN preserves every left row, filling missing right values with NULL.'],
        ['What happens if you join two tables without a join condition?', ['A Cartesian product of all row combinations', 'An empty result', 'Only the first table is returned', 'The DBMS guesses the condition'], 0, 'Without a condition every row of A is paired with every row of B.'],
        ['How can you find students who are not enrolled in any course?', ['INNER JOIN enrolment and filter on NULL', 'Use ORDER BY enrolment', 'Use DISTINCT student', 'LEFT JOIN enrolment and keep rows where enrolment.student_id IS NULL'], 3, 'Unmatched rows from a LEFT JOIN have NULLs in the right table’s columns.'],
        ['Which join keeps unmatched rows from both tables?', ['INNER JOIN', 'LEFT JOIN', 'SELF JOIN', 'FULL OUTER JOIN'], 3, 'FULL OUTER JOIN combines the effects of LEFT and RIGHT joins.'],
      ],
    },
    {
      id: 'db-aggregation',
      name: 'Aggregation & Grouping',
      description: 'COUNT, SUM, AVG, MIN, MAX, GROUP BY and HAVING.',
      difficulty: 3,
      importance: 85,
      minutes: 75,
      prerequisites: ['db-filtering'],
      explanation:
        'Aggregate functions summarise many rows into one value: COUNT, SUM, AVG, MIN and MAX. GROUP BY splits rows into groups and computes aggregates per group. WHERE filters individual rows before grouping, while HAVING filters groups after aggregation. Every column in the SELECT list must either appear in GROUP BY or be inside an aggregate function. COUNT(*) counts rows, whereas COUNT(column) ignores NULLs.',
      notes: [
        'Aggregates: COUNT, SUM, AVG, MIN, MAX.',
        'WHERE filters rows before grouping; HAVING filters groups after.',
        'Non-aggregated SELECT columns must appear in GROUP BY.',
        'COUNT(*) counts rows; COUNT(col) skips NULLs.',
        'Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.',
      ],
      code: {
        language: 'sql',
        snippet:
          'SELECT course_code,\n       COUNT(*)            AS attempts,\n       ROUND(AVG(score),1) AS average_score,\n       MAX(score)          AS best\nFROM result\nWHERE submitted_on >= \'2025-01-01\'\nGROUP BY course_code\nHAVING AVG(score) < 60\nORDER BY average_score;',
      },
      exercise:
        'Using a result table, find for each student the number of assessments taken and their average score, show only students with at least three assessments, and sort by average descending. Then explain why the condition "at least three" cannot go in WHERE.',
      questions: [
        ['Which clause filters groups after aggregation?', ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], 1, 'HAVING is evaluated after GROUP BY and can use aggregate functions.'],
        ['What does COUNT(email) count?', ['All rows including NULL emails', 'Distinct emails only', 'Rows where email is not NULL', 'The length of each email'], 2, 'COUNT(column) ignores NULL values; COUNT(*) counts every row.'],
        ['Which function returns the average of a column?', ['AVG()', 'MEAN()', 'MEDIAN()', 'TOTAL()'], 0, 'AVG computes the arithmetic mean of non-NULL values.'],
        ['Why does SELECT course, student, AVG(score) FROM result GROUP BY course fail in standard SQL?', ['AVG cannot be used with GROUP BY', 'course must be aggregated', 'GROUP BY must come before FROM', 'student is neither grouped nor aggregated'], 3, 'Each output row represents a group, so ungrouped columns must be aggregated.'],
        ['In which order are these clauses logically evaluated?', ['SELECT → WHERE → GROUP BY', 'WHERE → GROUP BY → HAVING', 'HAVING → WHERE → GROUP BY', 'GROUP BY → WHERE → HAVING'], 1, 'Rows are filtered (WHERE), grouped (GROUP BY) and then groups are filtered (HAVING).'],
      ],
    },
    {
      id: 'db-normalization',
      name: 'Normalization',
      description: 'Functional dependencies, anomalies and 1NF, 2NF, 3NF and BCNF.',
      difficulty: 4,
      importance: 85,
      minutes: 90,
      prerequisites: ['db-er', 'db-relational'],
      explanation:
        'Normalisation organises tables to reduce redundancy and avoid update, insertion and deletion anomalies. It relies on functional dependencies (X → Y means X determines Y). First normal form (1NF) requires atomic values with no repeating groups. Second normal form (2NF) removes partial dependencies on part of a composite key. Third normal form (3NF) removes transitive dependencies, where a non-key attribute depends on another non-key attribute. BCNF requires every determinant to be a candidate key.',
      notes: [
        'Anomalies: update, insertion, deletion.',
        '1NF: atomic values, no repeating groups.',
        '2NF: 1NF + no partial dependency on part of a composite key.',
        '3NF: 2NF + no transitive dependency (non-key → non-key).',
        'BCNF: every determinant is a candidate key.',
      ],
      code: {
        language: 'sql',
        snippet:
          '-- Unnormalised: enrolment(student_id, student_name, course_id, course_title, lecturer, lecturer_office)\n-- student_id -> student_name             (partial dependency)\n-- course_id  -> course_title, lecturer   (partial dependency)\n-- lecturer   -> lecturer_office          (transitive dependency)\n\n-- 3NF decomposition\nCREATE TABLE student  (student_id INT PRIMARY KEY, student_name VARCHAR(100));\nCREATE TABLE lecturer (lecturer VARCHAR(100) PRIMARY KEY, lecturer_office VARCHAR(20));\nCREATE TABLE course   (course_id INT PRIMARY KEY, course_title VARCHAR(100),\n                       lecturer VARCHAR(100) REFERENCES lecturer(lecturer));\nCREATE TABLE enrolment(student_id INT REFERENCES student, course_id INT REFERENCES course,\n                       PRIMARY KEY (student_id, course_id));',
      },
      exercise:
        'Normalise Order(order_id, customer_name, customer_phone, product_ids, product_names, quantity) to 3NF. List the functional dependencies you identify, the anomaly each step removes, and the final tables with their keys.',
      questions: [
        ['What is the main goal of normalisation?', ['To make queries use more joins', 'To reduce redundancy and prevent anomalies', 'To encrypt the data', 'To increase storage usage'], 1, 'Normalisation eliminates redundant data that causes update, insertion and deletion anomalies.'],
        ['A table storing several phone numbers in one column, separated by commas, violates which normal form?', ['1NF', '2NF', '3NF', 'BCNF'], 0, '1NF requires atomic (indivisible) values in every column.'],
        ['In a table with key (student_id, course_id), student_name depends only on student_id. Which normal form is violated?', ['1NF', '3NF', 'BCNF only', '2NF'], 3, 'A non-key attribute depending on part of a composite key is a partial dependency, violating 2NF.'],
        ['What is a transitive dependency?', ['A dependency on the whole primary key', 'A non-key attribute depending on another non-key attribute', 'A dependency between two tables', 'A key that changes over time'], 1, 'For example course_id → lecturer → lecturer_office; 3NF removes it.'],
        ['What does BCNF require?', ['Every determinant is a candidate key', 'Every table has exactly two columns', 'No foreign keys are used', 'All values are numeric'], 0, 'Boyce–Codd normal form strengthens 3NF: any attribute set that determines another must be a candidate key.'],
      ],
    },
    {
      id: 'db-indexing',
      name: 'Indexing',
      description: 'B-tree indexes, query performance, composite indexes and trade-offs.',
      difficulty: 4,
      importance: 70,
      minutes: 60,
      prerequisites: ['db-joins'],
      explanation:
        'An index is an auxiliary data structure — most commonly a B-tree — that lets the DBMS locate rows without scanning the whole table. Indexes speed up WHERE filters, joins and ORDER BY on the indexed columns, but they consume storage and slow down INSERT, UPDATE and DELETE because the index must be maintained. A composite index on (a, b) can serve queries that filter on a, or on a and b, but generally not on b alone (the leftmost-prefix rule).',
      notes: [
        'Without an index, queries may require a full table scan — O(n).',
        'B-tree lookups are O(log n) and support range queries.',
        'Indexes speed reads but slow writes and use storage.',
        'Composite index (a, b): useful for a or (a, b) — leftmost prefix.',
        'Primary keys are indexed automatically in most DBMSs.',
      ],
      code: {
        language: 'sql',
        snippet:
          'CREATE INDEX idx_result_student ON result(student_id);\nCREATE INDEX idx_result_course_date ON result(course_code, submitted_on);\n\n-- Can use idx_result_course_date (leftmost column present)\nSELECT * FROM result WHERE course_code = \'DB101\' AND submitted_on > \'2025-03-01\';\n\n-- Cannot efficiently use it (leftmost column missing)\nSELECT * FROM result WHERE submitted_on > \'2025-03-01\';\n\n-- Inspect the plan (PostgreSQL / SQLite)\nEXPLAIN SELECT * FROM result WHERE student_id = 42;',
      },
      exercise:
        'For a result table with one million rows, propose indexes for these queries: results of one student, results of one course in a date range, and the ten most recent results overall. Justify each index and name one write-heavy scenario where you would avoid adding more indexes.',
      questions: [
        ['What is the main benefit of an index?', ['It reduces table storage', 'It speeds up data retrieval on indexed columns', 'It enforces foreign keys', 'It speeds up all INSERT statements'], 1, 'Indexes let the DBMS find matching rows without scanning every row.'],
        ['What is a cost of adding many indexes?', ['Reads become slower', 'Tables cannot be joined', 'Writes become slower and storage use increases', 'Primary keys are disabled'], 2, 'Every insert, update and delete must also update each affected index.'],
        ['Which data structure do most relational databases use for general-purpose indexes?', ['B-tree', 'Linked list', 'Stack', 'Queue'], 0, 'Balanced B-trees provide logarithmic lookups and ordered range scans.'],
        ['A composite index exists on (course_code, submitted_on). Which query benefits most?', ['WHERE submitted_on > \'2025-01-01\'', 'WHERE score > 50', 'WHERE student_name LIKE \'%a\'', 'WHERE course_code = \'DB101\' AND submitted_on > \'2025-01-01\''], 3, 'The leftmost-prefix rule means the index is used when its first column is constrained.'],
        ['What does a full table scan mean?', ['Reading every row to answer a query', 'Backing up the table', 'Scanning only the index', 'Checking table permissions'], 0, 'Without a usable index, the DBMS must examine all rows.'],
      ],
    },
    {
      id: 'db-transactions',
      name: 'Transactions & ACID',
      description: 'Atomicity, consistency, isolation, durability, COMMIT and ROLLBACK.',
      difficulty: 4,
      importance: 80,
      minutes: 75,
      prerequisites: ['db-sql'],
      explanation:
        'A transaction is a sequence of operations treated as a single logical unit of work. ACID properties guarantee reliability: Atomicity (all or nothing), Consistency (moves the database between valid states), Isolation (concurrent transactions do not interfere) and Durability (committed changes survive failures). COMMIT makes changes permanent and ROLLBACK undoes them. Isolation levels trade strictness for concurrency and determine which anomalies, such as dirty or non-repeatable reads, can occur.',
      notes: [
        'Atomicity: all operations succeed or none take effect.',
        'Consistency: constraints hold before and after the transaction.',
        'Isolation: concurrent transactions appear to run separately.',
        'Durability: committed data survives crashes (write-ahead logging).',
        'BEGIN … COMMIT makes changes permanent; ROLLBACK cancels them.',
      ],
      code: {
        language: 'sql',
        snippet:
          '-- Transfer 500 from account 1 to account 2\nBEGIN;\nUPDATE account SET balance = balance - 500 WHERE account_id = 1;\nUPDATE account SET balance = balance + 500 WHERE account_id = 2;\n\n-- If either update failed or balance went negative:\n-- ROLLBACK;\n\nCOMMIT;  -- both changes become permanent together',
      },
      exercise:
        'Describe what could go wrong in a fee-payment system if recording a payment and updating the student’s outstanding balance were not in one transaction. Write the transaction in SQL and explain which ACID property each part of your solution relies on.',
      questions: [
        ['Which ACID property guarantees "all or nothing"?', ['Consistency', 'Isolation', 'Durability', 'Atomicity'], 3, 'Atomicity ensures partial transactions are never left in the database.'],
        ['What does ROLLBACK do?', ['Makes changes permanent', 'Undoes the changes of the current transaction', 'Deletes the table', 'Restarts the server'], 1, 'ROLLBACK reverts all uncommitted changes in the transaction.'],
        ['Which property ensures committed data survives a power failure?', ['Durability', 'Atomicity', 'Isolation', 'Normalization'], 0, 'Durability is typically implemented with write-ahead logs persisted to stable storage.'],
        ['What does isolation protect against?', ['Disk failures', 'Invalid SQL syntax', 'Interference between concurrently executing transactions', 'Duplicate primary keys'], 2, 'Isolation controls how and when changes from one transaction become visible to others.'],
        ['A "dirty read" occurs when a transaction…', ['reads data that another transaction has not yet committed', 'reads an index instead of a table', 'reads deleted rows from a backup', 'reads too many rows'], 0, 'Reading uncommitted data is a dirty read; it is prevented at READ COMMITTED and stricter levels.'],
      ],
    },
  ],
};
