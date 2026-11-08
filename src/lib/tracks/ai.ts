import type { Lesson } from "@/lib/track-types";

/** AI foundations: the ideas behind modern AI, explained with Python. */
export const AI_LESSONS: Lesson[] = [
  {
    id: "ai-examples",
    unit: "How AI learns",
    title: "Examples, not rules",
    icon: "🤖",
    summary: "Why models learn from data",
    arcade: {
      instruction: "Shoot the one thing supervised learning needs.",
      targets: ["Labelled examples", "A faster GPU", "Random noise", "More rules"],
      answer: 0,
    },
    explanation: [
      "Traditional programs follow rules a human wrote. Many AI systems work the other way around: you show them many examples, and they find patterns in the data.",
      "In supervised learning each example comes with the answer we want, called a label. During training the model makes guesses, compares them with the label, and nudges its internal numbers to be less wrong next time.",
    ],
    example: {
      code: 'examples = [\n    ("I love this", "positive"),\n    ("This is awful", "negative"),\n]\nprint(examples[1][1])',
      output: "negative",
    },
    challenge: {
      kind: "choice",
      prompt: "What does a supervised learning model need in order to learn?",
      code: 'training_data = [("I love this", "positive"), ("This is awful", "negative")]',
      options: [
        "Only the inputs, with no answers",
        "A faster computer",
        "Examples paired with the correct answers",
        "A list of hand-written rules for every sentence",
      ],
      answer: 2,
      explanation:
        "Supervised learning is driven by labelled examples. The label is the target the model learns to predict; without it, the model has nothing to compare its guesses against.",
    },
    xp: 25,
    minutes: 3,
  },
  {
    id: "ai-labels",
    unit: "How AI learns",
    title: "Features and labels",
    icon: "🏷️",
    summary: "Separate the clues from the answer",
    arcade: {
      instruction: "Shoot the label in this training row.",
      targets: ["apple", "size = 3", "colour = red", "weight = 3"],
      answer: 0,
    },
    explanation: [
      "A training row has two parts. Features are the clues the model is allowed to use, such as size or colour. The label is the answer you want it to produce, such as “apple”.",
      "Keeping them separate matters. If a feature secretly contains the answer, the model can look brilliant during training and then fail on new data. That mistake is called leakage.",
    ],
    example: {
      code: 'row = {"size": 3, "colour": "red"}\nlabel = "apple"\nprint(row["colour"])',
      output: "red",
    },
    challenge: {
      kind: "choice",
      prompt: "In a training example, what is the label?",
      code: 'features = {"size": 3, "colour": "red"}\nlabel = "apple"',
      options: [
        "The input the model is given",
        "The answer the model should learn to predict",
        "The name of the person who collected the data",
        "A random number used to speed things up",
      ],
      answer: 1,
      explanation:
        "Features are the inputs; the label is the target output. Here size and colour are features, and “apple” is the label the model should predict from them.",
    },
    xp: 30,
    minutes: 3,
  },
  {
    id: "ai-epochs",
    unit: "How AI learns",
    title: "One pass at a time",
    icon: "📈",
    summary: "Understand epochs and gradual improvement",
    arcade: {
      instruction: "Shoot the name for one full pass over the data.",
      targets: ["Epoch", "Token", "Prompt", "Pixel"],
      answer: 0,
    },
    explanation: [
      "Training usually makes several passes over the same dataset. One full pass is called an epoch. Each pass lets the model adjust its numbers a little more.",
      "More passes are not automatically better. Too many and the model can memorise the training examples, which is called overfitting. Good evaluation uses fresh data the model has never seen.",
    ],
    example: {
      code: 'for epoch in range(3):\n    print("learn from every example")',
      output: "learn from every example\nlearn from every example\nlearn from every example",
    },
    challenge: {
      kind: "choice",
      prompt: "Why train for more than one epoch?",
      options: [
        "To make the program run slower",
        "To delete examples the model finds confusing",
        "AI learns perfectly in a single pass",
        "Each pass lets the model adjust its numbers a little more",
      ],
      answer: 3,
      explanation:
        "An epoch is one full pass over the training data. Repeating the passes gives the model more chances to reduce its error — but too many epochs can cause overfitting, so more is not always better.",
    },
    xp: 30,
    minutes: 4,
  },
  {
    id: "ai-tokens",
    unit: "Tokens & models",
    title: "Chunks of text",
    icon: "🔤",
    summary: "How language models read your words",
    arcade: {
      instruction: "Shoot a chunk of text the model reads.",
      targets: ["Token", "Pixel", "Bytecode", "Kernel"],
      answer: 0,
    },
    explanation: [
      "A language model does not read whole sentences at once. Text is split into tokens — small chunks, often words or pieces of words — and each token becomes a number the model can process.",
      "A simple split() gives word-like tokens. Real tokenizers break unusual words into smaller pieces, which is why models can handle new words they have never seen exactly before.",
    ],
    example: {
      code: 'text = "clay code"\ntokens = text.split()\nprint(len(tokens))',
      output: "2",
    },
    challenge: {
      kind: "choice",
      prompt: "What is a token in a language model?",
      options: [
        "A secret password for the API",
        "A chunk of text the model reads and represents as a number",
        "A type of graphics card",
        "A Python list",
      ],
      answer: 1,
      explanation:
        "Tokens are the units a language model works with. Words are split into tokens, each token maps to a numeric ID, and the model predicts the next token again and again to produce text.",
    },
    xp: 30,
    minutes: 3,
  },
  {
    id: "ai-embeddings",
    unit: "Tokens & models",
    title: "Meaning as numbers",
    icon: "🧮",
    summary: "Compare items with embeddings",
    arcade: {
      instruction: "Shoot the highest similarity score.",
      targets: ["0.2", "0.9", "0.4", "0.1"],
      answer: 1,
    },
    explanation: [
      "An embedding turns an item — a word, a sentence, an image — into a list of numbers that captures meaning. Items with similar meaning end up with similar numbers.",
      "To find the closest match, compare numbers with a similarity score. The highest score wins. That is how semantic search and recommendation features find relevant results even when the wording differs.",
    ],
    example: {
      code: "scores = [0.2, 0.9, 0.4]\nbest = scores.index(max(scores))\nprint(best)",
      output: "1",
    },
    challenge: {
      kind: "choice",
      prompt: "What does this code find?",
      code: "scores = [0.2, 0.9, 0.4]\nbest = scores.index(max(scores))\nprint(best)",
      options: [
        "The position of the highest similarity score",
        "The smallest number in the list",
        "The average of all three scores",
        "The length of the list",
      ],
      answer: 0,
      explanation:
        "max(scores) finds 0.9, and .index() returns where it lives — position 1. In a real embedding search, that position points to the most similar item.",
    },
    xp: 35,
    minutes: 4,
  },
  {
    id: "ai-messages",
    unit: "Tokens & models",
    title: "Set the behaviour",
    icon: "💬",
    summary: "Order a system and user message",
    arcade: {
      instruction: "Shoot the role that sets the assistant's behaviour.",
      targets: ["system", "user", "assistant", "tool"],
      answer: 0,
    },
    explanation: [
      "Chat models receive a list of messages, each with a role. A system message sets the model's behaviour and boundaries. A user message contains the actual request.",
      "Put the system message first so the instructions are in place before the request arrives. The model then answers with the conversation, including both messages, as context.",
    ],
    example: {
      code: 'messages = [\n    {"role": "system", "content": "You are a patient tutor."},\n    {"role": "user", "content": "Explain a for loop."},\n]',
      output: "The model answers as a patient tutor",
    },
    challenge: {
      kind: "order",
      prompt: "Put the lines in order to set behaviour before asking a question.",
      lines: [
        "messages = []",
        'messages.append({"role": "system", "content": "You are a patient tutor."})',
        'messages.append({"role": "user", "content": "Explain a for loop."})',
        'print(messages[0]["role"])',
      ],
      explanation:
        "Start the list, add the system instruction first, then the user's request, and finally inspect the first role. System-first ordering is how you set the assistant's behaviour before it handles the question.",
    },
    xp: 35,
    minutes: 4,
  },
  {
    id: "ai-verify",
    unit: "Building responsibly",
    title: "Confidence is not proof",
    icon: "🕵️",
    summary: "Check AI answers before trusting them",
    arcade: {
      instruction: "Shoot the responsible next move.",
      targets: ["Verify the claim", "Share it fast", "Trust confidence", "Ask again"],
      answer: 0,
    },
    explanation: [
      "Language models predict likely text, not guaranteed facts. They can produce a confident-sounding claim that is simply wrong — a hallucination.",
      "Responsible AI use means checking important claims against a reliable source, keeping humans in the loop for consequential decisions, and being honest about what the model helped with.",
    ],
    example: {
      code: 'answer = "The moon is made of clay"\nsources = []\nprint(len(sources) == 0)',
      output: "True",
    },
    challenge: {
      kind: "choice",
      prompt:
        "An AI assistant states a confident fact that you cannot verify. What is the responsible next step?",
      options: [
        "Share it right away because it sounded confident",
        "Assume confidence means correctness",
        "Check a trustworthy source before relying on it",
        "Ask the same model again and trust the answer",
      ],
      answer: 2,
      explanation:
        "Fluent, confident wording is not evidence. Verify important claims against a reliable source, and treat the model's output as a draft rather than a fact. Asking the same model again is not independent verification.",
    },
    xp: 40,
    minutes: 4,
  },
];
