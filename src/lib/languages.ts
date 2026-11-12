import { runPython } from "@/lib/python";
import type { CodeLanguageId } from "@/lib/track-types";

export type CodeResult = {
  output: string;
  error: string | null;
};

export type Starter = {
  id: string;
  name: string;
  blurb: string;
  code: string;
};

export type CodeLanguage = {
  id: CodeLanguageId;
  name: string;
  filename: string;
  runtime: string;
  starters: Starter[];
};

/** The Convex action that compiles non-Python programs. */
export type RemoteRunner = (args: {
  language: string;
  source: string;
}) => Promise<CodeResult>;

export const CODE_LANGUAGES: CodeLanguage[] = [
  {
    id: "python",
    name: "Python",
    filename: "playground.py",
    runtime: "runs in your browser",
    starters: [
      {
        id: "hello",
        name: "Hello, player",
        blurb: "Variables, f-strings and a loop",
        code: 'name = "player"\nprint(f"Hello, {name}!")\n\nfor n in range(1, 4):\n    print("squish", n)',
      },
      {
        id: "fizzbuzz",
        name: "FizzBuzz",
        blurb: "The classic loop challenge",
        code: 'for n in range(1, 16):\n    if n % 15 == 0:\n        print("FizzBuzz")\n    elif n % 3 == 0:\n        print("Fizz")\n    elif n % 5 == 0:\n        print("Buzz")\n    else:\n        print(n)',
      },
      {
        id: "scores",
        name: "Score report",
        blurb: "Lists, totals and formatting",
        code: 'scores = [10, 20, 30]\ntotal = 0\n\nfor score in scores:\n    total += score\n\naverage = total / len(scores)\nprint(f"Total: {total}")\nprint(f"Average: {average:.1f}")',
      },
      {
        id: "pet",
        name: "Clay pet",
        blurb: "A class with methods",
        code: 'class Pet:\n    def __init__(self, name, energy=3):\n        self.name = name\n        self.energy = energy\n\n    def play(self):\n        self.energy -= 1\n        return f"{self.name} has {self.energy} energy left"\n\npet = Pet("Mochi")\nprint(pet.play())\nprint(pet.play())',
      },
    ],
  },
  {
    id: "c",
    name: "C",
    filename: "main.c",
    runtime: "remote sandbox",
    starters: [
      {
        id: "hello",
        name: "Hello, C",
        blurb: "main, printf and a newline",
        code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, C!\\n");\n    return 0;\n}',
      },
      {
        id: "fizzbuzz",
        name: "FizzBuzz",
        blurb: "A for loop with if / else",
        code: '#include <stdio.h>\n\nint main(void) {\n    for (int n = 1; n <= 15; n++) {\n        if (n % 15 == 0) {\n            printf("FizzBuzz\\n");\n        } else if (n % 3 == 0) {\n            printf("Fizz\\n");\n        } else if (n % 5 == 0) {\n            printf("Buzz\\n");\n        } else {\n            printf("%d\\n", n);\n        }\n    }\n    return 0;\n}',
      },
      {
        id: "scores",
        name: "Array report",
        blurb: "Arrays, loops and formatted numbers",
        code: '#include <stdio.h>\n\nint main(void) {\n    int scores[3] = {10, 20, 30};\n    int total = 0;\n\n    for (int i = 0; i < 3; i++) {\n        total += scores[i];\n    }\n\n    printf("Total: %d\\n", total);\n    printf("Average: %.1f\\n", (double)total / 3);\n    return 0;\n}',
      },
      {
        id: "pointers",
        name: "Pointer power",
        blurb: "Change a value through its address",
        code: '#include <stdio.h>\n\nvoid double_value(int *n) {\n    *n = *n * 2;\n}\n\nint main(void) {\n    int value = 21;\n    double_value(&value);\n    printf("Value: %d\\n", value);\n    return 0;\n}',
      },
    ],
  },
  {
    id: "cpp",
    name: "C++",
    filename: "main.cpp",
    runtime: "remote sandbox",
    starters: [
      {
        id: "hello",
        name: "Hello, streams",
        blurb: "main and std::cout",
        code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
      },
      {
        id: "fizzbuzz",
        name: "FizzBuzz",
        blurb: "A for loop with if / else",
        code: '#include <iostream>\n\nint main() {\n    for (int n = 1; n <= 15; n++) {\n        if (n % 15 == 0) {\n            std::cout << "FizzBuzz\\n";\n        } else if (n % 3 == 0) {\n            std::cout << "Fizz\\n";\n        } else if (n % 5 == 0) {\n            std::cout << "Buzz\\n";\n        } else {\n            std::cout << n << "\\n";\n        }\n    }\n    return 0;\n}',
      },
      {
        id: "scores",
        name: "Vector report",
        blurb: "Vectors, range-for and precision",
        code: '#include <iomanip>\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> scores = {10, 20, 30};\n    int total = 0;\n\n    for (int score : scores) {\n        total += score;\n    }\n\n    double average = static_cast<double>(total) / scores.size();\n    std::cout << "Total: " << total << "\\n";\n    std::cout << std::fixed << std::setprecision(1);\n    std::cout << "Average: " << average << "\\n";\n    return 0;\n}',
      },
      {
        id: "counter",
        name: "Clay counter",
        blurb: "A class with a method",
        code: '#include <iostream>\n\nclass Counter {\npublic:\n    int value = 0;\n\n    void add(int n) {\n        value += n;\n    }\n};\n\nint main() {\n    Counter c;\n    c.add(2);\n    c.add(3);\n    std::cout << "Count: " << c.value << "\\n";\n    return 0;\n}',
      },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    filename: "playground.js",
    runtime: "remote sandbox",
    starters: [
      {
        id: "hello",
        name: "Hello, console",
        blurb: "Template strings and a loop",
        code: 'const name = "player";\nconsole.log(`Hello, ${name}!`);\n\nfor (let n = 1; n <= 3; n++) {\n  console.log("squish", n);\n}',
      },
      {
        id: "fizzbuzz",
        name: "FizzBuzz",
        blurb: "The classic loop challenge",
        code: 'for (let n = 1; n <= 15; n++) {\n  if (n % 15 === 0) console.log("FizzBuzz");\n  else if (n % 3 === 0) console.log("Fizz");\n  else if (n % 5 === 0) console.log("Buzz");\n  else console.log(n);\n}',
      },
      {
        id: "scores",
        name: "Score report",
        blurb: "Arrays, reduce and formatting",
        code: 'const scores = [10, 20, 30];\nconst total = scores.reduce((sum, score) => sum + score, 0);\nconst average = total / scores.length;\n\nconsole.log(`Total: ${total}`);\nconsole.log(`Average: ${average.toFixed(1)}`);',
      },
    ],
  },
  {
    id: "java",
    name: "Java",
    filename: "Main.java",
    runtime: "remote sandbox",
    starters: [
      {
        id: "hello",
        name: "Hello, Java",
        blurb: "A class with a main method",
        code: 'public class Main {\n    public static void main(String[] args) {\n        String name = "player";\n        System.out.println("Hello, " + name + "!");\n\n        for (int n = 1; n <= 3; n++) {\n            System.out.println("squish " + n);\n        }\n    }\n}',
      },
      {
        id: "fizzbuzz",
        name: "FizzBuzz",
        blurb: "Loops and conditional branches",
        code: 'public class Main {\n    public static void main(String[] args) {\n        for (int n = 1; n <= 15; n++) {\n            if (n % 15 == 0) {\n                System.out.println("FizzBuzz");\n            } else if (n % 3 == 0) {\n                System.out.println("Fizz");\n            } else if (n % 5 == 0) {\n                System.out.println("Buzz");\n            } else {\n                System.out.println(n);\n            }\n        }\n    }\n}',
      },
      {
        id: "scores",
        name: "Score report",
        blurb: "Arrays and formatted decimals",
        code: 'public class Main {\n    public static void main(String[] args) {\n        int[] scores = {10, 20, 30};\n        int total = 0;\n\n        for (int score : scores) {\n            total += score;\n        }\n\n        double average = (double) total / scores.length;\n        System.out.println("Total: " + total);\n        System.out.printf("Average: %.1f%n", average);\n    }\n}',
      },
    ],
  },
  {
    id: "go",
    name: "Go",
    filename: "main.go",
    runtime: "remote sandbox",
    starters: [
      {
        id: "hello",
        name: "Hello, Go",
        blurb: "A package, imports and a loop",
        code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tname := "player"\n\tfmt.Printf("Hello, %s!\\n", name)\n\n\tfor n := 1; n <= 3; n++ {\n\t\tfmt.Println("squish", n)\n\t}\n}',
      },
      {
        id: "fizzbuzz",
        name: "FizzBuzz",
        blurb: "Loops and conditional branches",
        code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfor n := 1; n <= 15; n++ {\n\t\tif n%15 == 0 {\n\t\t\tfmt.Println("FizzBuzz")\n\t\t} else if n%3 == 0 {\n\t\t\tfmt.Println("Fizz")\n\t\t} else if n%5 == 0 {\n\t\t\tfmt.Println("Buzz")\n\t\t} else {\n\t\t\tfmt.Println(n)\n\t\t}\n\t}\n}',
      },
      {
        id: "scores",
        name: "Score report",
        blurb: "Slices, loops and formatting",
        code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tscores := []int{10, 20, 30}\n\ttotal := 0\n\n\tfor _, score := range scores {\n\t\ttotal += score\n\t}\n\n\taverage := float64(total) / float64(len(scores))\n\tfmt.Printf("Total: %d\\n", total)\n\tfmt.Printf("Average: %.1f\\n", average)\n}',
      },
    ],
  },
];

export function getLanguage(id: CodeLanguageId): CodeLanguage {
  return CODE_LANGUAGES.find((language) => language.id === id) ?? CODE_LANGUAGES[0];
}

export function languageForTrack(trackId: string): CodeLanguageId {
  if (trackId === "c") return "c";
  if (trackId === "cpp") return "cpp";
  return "python";
}

/** Run Python locally, or send another language to the remote compiler action. */
export function runCode(
  languageId: CodeLanguageId,
  source: string,
  runRemote?: RemoteRunner,
): Promise<CodeResult> {
  if (languageId === "python") return runPython(source);
  if (!runRemote) {
    return Promise.resolve({
      output: "",
      error: "The remote compiler is unavailable. Sign in and try again.",
    });
  }
  return runRemote({ language: languageId, source });
}
