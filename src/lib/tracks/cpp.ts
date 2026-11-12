import type { Lesson } from "@/lib/track-types";

/** C++: seven quests from iostream to a first class. */
export const CPP_LESSONS: Lesson[] = [
  {
    id: "cpp-hello",
    unit: "C++ foundations",
    title: "Hello, streams",
    icon: "⚙️",
    summary: "Print with std::cout",
    explanation: [
      "C++ keeps C's main function and semicolons, but adds a cleaner way to print. The iostream header gives you std::cout, the standard output stream.",
      "The << operator sends a value into that stream. std::endl ends the line. std:: is the namespace where the standard library lives, so it tells the compiler exactly which cout you mean.",
    ],
    example: {
      code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
      output: "Hello, C++!",
    },
    challenge: {
      kind: "choice",
      prompt: "What appears on screen?",
      code: '#include <iostream>\n\nint main() {\n    std::cout << "Ready" << std::endl;\n    return 0;\n}',
      options: ["std::cout", "Ready", "Ready << std::endl", "An error"],
      answer: 1,
      explanation:
        "The text in quotes is pushed into std::cout and printed. std::endl moves to a new line, and the stream syntax itself never appears in the output.",
    },
    xp: 20,
    minutes: 3,
  },
  {
    id: "cpp-strings",
    unit: "C++ foundations",
    title: "Text that behaves",
    icon: "🪢",
    summary: "Use std::string for text",
    explanation: [
      "C++ has a real string type. Include <string> and declare std::string name = \"Ada\"; — you get length, comparison, and joining without managing a char array yourself.",
      "Unlike a C-style char array, std::string knows its own size and grows when needed. That safety is one of the reasons people reach for C++ over plain C.",
    ],
    example: {
      code: '#include <string>\n#include <iostream>\n\nstd::string name = "Ada";\nstd::cout << name;',
      output: "Ada",
    },
    challenge: {
      kind: "blank",
      prompt: "Which type stores a growable piece of text?",
      code: '#include <string>\n\n___ greeting = "hello";',
      options: ["std::string", "int", "char", "text"],
      answer: 0,
      explanation:
        "std::string is the standard library's text type. int holds numbers, char holds a single character, and text is not a C++ type at all.",
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "cpp-input",
    unit: "C++ foundations",
    title: "Point the arrow",
    icon: "⌨️",
    summary: "Read input with std::cin",
    explanation: [
      "std::cin is the standard input stream. The arrow points the other way compared with cout: values flow from the keyboard into your variable.",
      "std::cin >> age waits for the user to type a value and stores it in age. You can chain reads, and each one skips whitespace before the next value.",
    ],
    example: {
      code: "int age;\nstd::cin >> age;\nstd::cout << age + 1;",
      output: "If the user types 12, it prints 13",
    },
    challenge: {
      kind: "blank",
      prompt: "Which operator reads into a variable?",
      code: "int age;\nstd::cin ___ age;",
      options: [">>", "<<", "=", "=="],
      answer: 0,
      explanation:
        ">> points into the variable: data flows from the input stream into age. << is for output, = assigns in code, and == only compares.",
    },
    xp: 30,
    minutes: 3,
  },
  {
    id: "cpp-if",
    unit: "Flow & containers",
    title: "Choose a branch",
    icon: "🔀",
    summary: "Branch with if and else",
    explanation: [
      "C++ conditions work just like C: parentheses around the test, curly braces around each block. Only the branch whose condition is true runs.",
      "The difference you will notice is output: std::cout << \"...\" instead of printf. String comparisons with == also do what you expect for std::string.",
    ],
    example: {
      code: 'int score = 72;\nif (score >= 60) {\n    std::cout << "Pass";\n} else {\n    std::cout << "Retry";\n}',
      output: "Pass",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: 'int energy = 3;\nif (energy > 5) {\n    std::cout << "full";\n} else if (energy > 0) {\n    std::cout << "low";\n} else {\n    std::cout << "empty";\n}',
      options: ["full", "low", "empty", "lowempty"],
      answer: 1,
      explanation:
        "3 is not greater than 5, so the first branch is skipped. It is greater than 0, so the else-if branch prints “low” and the final else never runs.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "cpp-range-for",
    unit: "Flow & containers",
    title: "For every item",
    icon: "🔁",
    summary: "Loop over containers with range-for",
    explanation: [
      "Modern C++ can walk a collection without an index: for (int n : nums) gives n each value in turn.",
      "It reads almost like English — “for every n in nums” — and it works on arrays, vectors, and other containers. You cannot easily skip items or go backwards with it, but for visiting everything it is the neatest option.",
    ],
    example: {
      code: "int nums[] = {1, 2, 3};\nint total = 0;\nfor (int n : nums) {\n    total += n;\n}\nstd::cout << total;",
      output: "6",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this print?",
      code: "int nums[] = {2, 4, 6};\nint total = 0;\nfor (int n : nums) {\n    total += n;\n}\nstd::cout << total;",
      options: ["6", "246", "12", "3"],
      answer: 2,
      explanation:
        "The loop visits 2, 4 and 6, adding each to total. 2 + 4 + 6 = 12. total += n is shorthand for total = total + n.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "cpp-vector",
    unit: "Flow & containers",
    title: "A list that grows",
    icon: "🧺",
    summary: "Collect values in std::vector",
    explanation: [
      "A std::vector is a resizable array. You create it with a type in angle brackets, like std::vector<int>, and add items with push_back().",
      "size() tells you how many items it holds, and square brackets read by index just like an array. Because it manages its own memory, a vector is usually the default choice for a collection in C++.",
    ],
    example: {
      code: "#include <vector>\nstd::vector<int> scores = {10, 20};\nscores.push_back(30);\nstd::cout << scores.size();",
      output: "3",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "std::vector<int> pets;\npets.push_back(1);\npets.push_back(2);\npets.push_back(3);\nstd::cout << pets[2];",
      options: ["2", "3", "1", "An error"],
      answer: 1,
      explanation:
        "After three push_back calls the vector is {1, 2, 3}. Index 2 is the third item, so it prints 3.",
    },
    xp: 35,
    minutes: 4,
  },
  {
    id: "cpp-class",
    unit: "Objects",
    title: "Bundle data and actions",
    icon: "🧩",
    summary: "Write your first class",
    explanation: [
      "A class bundles data with the functions that work on it. The data members and methods are called members of the class.",
      "public: means code outside the class may use what follows. Creating an object — Counter c; — gives it its own copy of value, and c.add(5) runs the method on that object.",
    ],
    example: {
      code: "class Counter {\npublic:\n    int value = 0;\n    void add(int n) {\n        value += n;\n    }\n};\n\nCounter c;\nc.add(5);\nstd::cout << c.value;",
      output: "5",
    },
    challenge: {
      kind: "choice",
      prompt: "What is printed?",
      code: "class Counter {\npublic:\n    int value = 0;\n    void add(int n) {\n        value += n;\n    }\n};\n\nCounter c;\nc.add(2);\nc.add(3);\nstd::cout << c.value;",
      options: ["2", "3", "5", "0"],
      answer: 2,
      explanation:
        "The object starts with value = 0. add(2) makes it 2, then add(3) makes it 5. Methods modify this object's own data, so the final print is 5.",
    },
    xp: 40,
    minutes: 6,
  },
  {
    id: "cpp-code-fizzbuzz",
    unit: "Build it for real",
    title: "FizzBuzz, compiled",
    icon: "🎮",
    summary: "Write a complete C++ program from scratch",
    explanation: [
      "A whole C++ program has an include, a main function, a loop and a set of branches. std::cout sends each piece of text to the output stream, and the newline escape starts a new line.",
      "Test n % 15 first. Otherwise a number such as 15 would match n % 3 and print Fizz before the program ever checks for FizzBuzz.",
    ],
    example: {
      code: `#include <iostream>

int main() {
    for (int n = 1; n <= 15; n++) {
        if (n % 15 == 0) {
            std::cout << "FizzBuzz\\n";
        } else if (n % 3 == 0) {
            std::cout << "Fizz\\n";
        } else if (n % 5 == 0) {
            std::cout << "Buzz\\n";
        } else {
            std::cout << n << "\\n";
        }
    }
    return 0;
}`,
      output:
        "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
    },
    challenge: {
      kind: "code",
      language: "cpp",
      prompt:
        "Write a full C++ program that prints 1 to 15, one per line. Print Fizz for multiples of 3, Buzz for multiples of 5, and FizzBuzz for multiples of both.",
      starter: `#include <iostream>

int main() {
    for (int n = 1; n <= 15; n++) {
        // Print FizzBuzz, Fizz, Buzz, or the number.
    }
    return 0;
}`,
      expectedOutput:
        "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
      explanation:
        "Loop from 1 through 15 and check n % 15 before the single checks. std::cout << value sends the value to the screen, and \\n moves to the next line. The final else handles every ordinary number.",
    },
    xp: 60,
    minutes: 8,
  },
  {
    id: "cpp-code-scores",
    unit: "Build it for real",
    title: "Vector report",
    icon: "📊",
    summary: "Loop, total, divide and format a report",
    explanation: [
      "A std::vector knows its own size, so this report can add every score and divide by scores.size(). A range-for loop visits each int without an index.",
      "static_cast<double>(total) makes the division use decimals instead of integer division. std::fixed with std::setprecision(1) then prints exactly one digit after the point.",
    ],
    example: {
      code: `#include <iomanip>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {10, 20, 30};
    int total = 0;

    for (int score : scores) {
        total += score;
    }

    double average = static_cast<double>(total) / scores.size();
    std::cout << "Total: " << total << "\\n";
    std::cout << std::fixed << std::setprecision(1);
    std::cout << "Average: " << average << "\\n";
    return 0;
}`,
      output: "Total: 60\nAverage: 20.0",
    },
    challenge: {
      kind: "code",
      language: "cpp",
      prompt:
        "Finish the program so it prints exactly “Total: 60”, then “Average: 20.0”.",
      starter: `#include <iomanip>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {10, 20, 30};
    int total = 0;

    // Add every score to total.

    // Print the total, then the average with one decimal.
    return 0;
}`,
      expectedOutput: "Total: 60\nAverage: 20.0",
      explanation:
        "The range-for adds each score to total. Dividing by scores.size() gives the average; the static_cast keeps the decimal part. std::fixed and setprecision(1) make the second line print 20.0 rather than 20.",
    },
    xp: 55,
    minutes: 7,
  },
  {
    id: "cpp-code-counter",
    unit: "Build it for real",
    title: "A counter object",
    icon: "🧩",
    summary: "Use a class from a complete program",
    explanation: [
      "The class definition is only a blueprint. main creates a Counter object, and that object receives its own value member starting at 0.",
      "Each c.add(...) call runs the method on c and changes c.value. Calling add(2) then add(3) accumulates 5, which the final std::cout prints.",
    ],
    example: {
      code: `#include <iostream>

class Counter {
public:
    int value = 0;

    void add(int n) {
        value += n;
    }
};

int main() {
    Counter c;
    c.add(2);
    c.add(3);
    std::cout << "Count: " << c.value << "\\n";
    return 0;
}`,
      output: "Count: 5",
    },
    challenge: {
      kind: "code",
      language: "cpp",
      prompt:
        "Finish main so the program prints exactly “Count: 5”.",
      starter: `#include <iostream>

class Counter {
public:
    int value = 0;

    void add(int n) {
        value += n;
    }
};

int main() {
    Counter c;
    // Add 2, then add 3.
    // Print "Count: " followed by c.value and a newline.
    return 0;
}`,
      expectedOutput: "Count: 5",
      explanation:
        "c starts with value 0. c.add(2) makes it 2 and c.add(3) makes it 5. Methods work on the object they are called on, so printing c.value shows the accumulated total.",
    },
    xp: 55,
    minutes: 7,
  },
];
