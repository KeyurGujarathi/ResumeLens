import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   CAREER-SPECIFIC PLACEMENT DATA
========================================================= */

const PREP_BY_CAREER = {
  "Software / IT": {
    topics: [
      "Data Structures",
      "Algorithms",
      "SQL",
      "Object-Oriented Programming",
      "JavaScript",
      "System Design",
      "Git",
      "Problem Solving",
    ],

    questions: [
      {
        question:
          "Which data structure follows the Last-In, First-Out (LIFO) principle?",
        options: [
          "Queue",
          "Stack",
          "Linked List",
          "Heap",
        ],
        answer: 1,
        explanation:
          "A stack follows LIFO because the most recently inserted element is removed first.",
      },
      {
        question:
          "What is the average time complexity of binary search on a sorted array?",
        options: [
          "O(n)",
          "O(n²)",
          "O(log n)",
          "O(1)",
        ],
        answer: 2,
        explanation:
          "Binary search repeatedly divides the search space into half, giving O(log n) average complexity.",
      },
      {
        question:
          "Which SQL clause is used to filter grouped results?",
        options: [
          "WHERE",
          "ORDER BY",
          "GROUP BY",
          "HAVING",
        ],
        answer: 3,
        explanation:
          "HAVING filters groups after GROUP BY has been applied.",
      },
      {
        question:
          "Which OOP concept allows one interface to represent different underlying forms?",
        options: [
          "Encapsulation",
          "Inheritance",
          "Polymorphism",
          "Compilation",
        ],
        answer: 2,
        explanation:
          "Polymorphism allows the same interface or method call to behave differently depending on the object.",
      },
      {
        question: "Which data structure uses FIFO order?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        answer: 1,
        explanation: "A queue removes the earliest inserted item first, following First-In, First-Out.",
      },
      {
        question: "What is the time complexity of accessing an array element by index?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        answer: 0,
        explanation: "Arrays support direct index access in constant time.",
      },
      {
        question: "Which algorithm is commonly used to traverse a graph level by level?",
        options: ["DFS", "Binary search", "BFS", "Merge sort"],
        answer: 2,
        explanation: "Breadth-first search explores a graph level by level using a queue.",
      },
      {
        question: "What does a primary key do in a relational database?",
        options: ["Allows duplicate rows", "Uniquely identifies each row", "Encrypts a table", "Sorts every query automatically"],
        answer: 1,
        explanation: "A primary key uniquely identifies each record in a table.",
      },
      {
        question: "Which SQL command modifies existing rows?",
        options: ["INSERT", "CREATE", "UPDATE", "SELECT"],
        answer: 2,
        explanation: "UPDATE changes values in existing rows.",
      },
      {
        question: "What is encapsulation in OOP?",
        options: ["Combining data and methods behind a controlled interface", "Copying a class", "Running many threads", "Sorting objects"],
        answer: 0,
        explanation: "Encapsulation bundles data with methods and controls access to internal state.",
      },
      {
        question: "Which Git command creates a local copy of a remote repository?",
        options: ["git push", "git clone", "git merge", "git status"],
        answer: 1,
        explanation: "git clone downloads a repository and creates a local working copy.",
      },
      {
        question: "What does HTTP status code 404 mean?",
        options: ["Success", "Unauthorized", "Resource not found", "Server timeout"],
        answer: 2,
        explanation: "404 indicates that the requested resource could not be found.",
      },
      {
        question: "Which structure is commonly used for function-call management?",
        options: ["Stack", "Queue", "Hash table only", "Graph"],
        answer: 0,
        explanation: "Function calls and return addresses are commonly managed with a call stack.",
      },
      {
        question: "What is the purpose of an API?",
        options: ["To define how software components communicate", "To store only images", "To replace an operating system", "To compile hardware"],
        answer: 0,
        explanation: "An API defines a contract through which software components exchange data or request actions.",
      },
      {
        question: "Which sorting algorithm has O(n log n) worst-case time complexity?",
        options: ["Bubble sort", "Selection sort", "Merge sort", "Linear search"],
        answer: 2,
        explanation: "Merge sort divides the data and merges sorted halves in O(n log n) time.",
      },
      {
        question: "What does normalization help reduce in a relational database?",
        options: ["Data redundancy", "Network bandwidth always", "CPU clock speed", "Number of users"],
        answer: 0,
        explanation: "Normalization organizes tables to reduce unnecessary duplication and update anomalies.",
      },
      {
        question: "What is a race condition?",
        options: ["A guaranteed fast algorithm", "An outcome that depends on timing of concurrent operations", "A database index", "A compiler warning only"],
        answer: 1,
        explanation: "Race conditions occur when concurrent operations access shared state and timing affects the result.",
      },
      {
        question: "Which JavaScript declaration is block-scoped and can be reassigned?",
        options: ["const", "let", "import", "static"],
        answer: 1,
        explanation: "let is block-scoped and allows reassignment.",
      },
      {
        question: "Why are unit tests used?",
        options: ["To test small units of code independently", "To replace all integration tests", "To deploy automatically", "To design database schemas"],
        answer: 0,
        explanation: "Unit tests verify individual functions or components in isolation.",
      },
      {
        question: "What does Big-O notation describe?",
        options: ["Exact runtime in seconds", "How resource use grows with input size", "The programming language version", "Memory address format"],
        answer: 1,
        explanation: "Big-O describes an asymptotic upper bound on growth as input size increases.",
      },
    ],
  },

  "Embedded / IoT / Robotics": {
    topics: [
      "C / C++",
      "Microcontrollers",
      "Embedded Systems",
      "UART / SPI / I2C",
      "Sensors",
      "RTOS",
      "PWM and Motor Control",
      "IoT Communication",
    ],

    questions: [
      {
        question:
          "Which device is generally designed to contain CPU, memory, and peripherals on one chip?",
        options: [
          "Microcontroller",
          "Hard Disk",
          "Monitor",
          "Router",
        ],
        answer: 0,
        explanation:
          "A microcontroller integrates processing, memory, and peripheral interfaces on a single chip.",
      },
      {
        question:
          "Which communication protocol normally uses SDA and SCL lines?",
        options: [
          "UART",
          "SPI",
          "I2C",
          "CAN only",
        ],
        answer: 2,
        explanation:
          "I2C uses two main signal lines: SDA for data and SCL for clock.",
      },
      {
        question:
          "What does PWM primarily control in a DC motor application?",
        options: [
          "Motor speed",
          "Sensor address",
          "UART baud rate",
          "Flash memory size",
        ],
        answer: 0,
        explanation:
          "PWM changes the effective average voltage delivered to the motor, allowing speed control.",
      },
      {
        question:
          "What is the main purpose of an RTOS in an embedded system?",
        options: [
          "Design a PCB automatically",
          "Provide predictable task scheduling",
          "Increase battery voltage",
          "Replace all hardware peripherals",
        ],
        answer: 1,
        explanation:
          "An RTOS provides scheduling and timing mechanisms useful for predictable real-time task execution.",
      },
      {
        question: "Which C keyword makes a variable accessible to code outside its file when appropriate?",
        options: ["static", "extern", "volatile", "register"],
        answer: 1,
        explanation: "extern declares an object or function defined elsewhere.",
      },
      {
        question: "Why is volatile useful for memory-mapped hardware registers?",
        options: ["It encrypts data", "It discourages the compiler from caching assumed-stable values", "It allocates heap memory", "It increases CPU voltage"],
        answer: 1,
        explanation: "volatile tells the compiler that a value may change outside normal program flow.",
      },
      {
        question: "Which interface typically uses MOSI, MISO, SCLK, and chip select?",
        options: ["I2C", "UART", "SPI", "PWM"],
        answer: 2,
        explanation: "SPI commonly uses MOSI, MISO, a clock, and one or more chip-select signals.",
      },
      {
        question: "What does UART stand for?",
        options: ["Universal Asynchronous Receiver/Transmitter", "Unified Analog Register Transfer", "Universal Address Routing Table", "User Application Response Timer"],
        answer: 0,
        explanation: "UART means Universal Asynchronous Receiver/Transmitter.",
      },
      {
        question: "What is an interrupt used for?",
        options: ["To notify the CPU of an event needing attention", "To permanently stop the processor", "To increase sensor voltage", "To format flash memory"],
        answer: 0,
        explanation: "Interrupts let the processor respond to events without continuously polling for them.",
      },
      {
        question: "What does an embedded watchdog timer help detect?",
        options: ["A stalled or unresponsive program", "Low source-code readability", "Incorrect PCB color", "A missing variable name"],
        answer: 0,
        explanation: "A watchdog can reset or flag a system if software fails to service it in time.",
      },
      {
        question: "What is debouncing used for with a push button?",
        options: ["Preventing multiple false transitions from one press", "Increasing motor speed", "Changing ADC resolution", "Encrypting wireless packets"],
        answer: 0,
        explanation: "Mechanical contacts can bounce, so debouncing filters rapid unwanted transitions.",
      },
      {
        question: "What does an ADC resolution of 12 bits provide?",
        options: ["12 possible values", "4096 possible quantization levels", "12 volts maximum always", "12 analog input pins"],
        answer: 1,
        explanation: "A 12-bit converter represents 2^12, or 4096, discrete levels.",
      },
      {
        question: "What does PWM duty cycle represent?",
        options: ["The fraction of a period the signal is HIGH", "The motor shaft diameter", "The number of I2C devices", "The sensor address"],
        answer: 0,
        explanation: "Duty cycle is the percentage of each PWM period spent in the active state.",
      },
      {
        question: "Why should a motor driver be used instead of powering a DC motor directly from an ESP32 GPIO?",
        options: ["GPIO pins cannot safely supply typical motor current", "GPIO pins have no logic levels", "Motors require Wi-Fi", "Drivers remove the need for power"],
        answer: 0,
        explanation: "Motors draw more current and create electrical noise, so a suitable driver protects the controller.",
      },
      {
        question: "Which network protocol is commonly used for lightweight publish/subscribe IoT messaging?",
        options: ["FTP", "MQTT", "SMTP", "HTML"],
        answer: 1,
        explanation: "MQTT is a lightweight publish/subscribe protocol widely used in IoT systems.",
      },
      {
        question: "What does FreeRTOS task priority influence?",
        options: ["Which ready task is scheduled first under its scheduling rules", "Sensor calibration units", "Flash chip size", "UART wire colors"],
        answer: 0,
        explanation: "Task priority influences scheduling decisions among ready tasks.",
      },
      {
        question: "What is the purpose of a pull-down resistor?",
        options: ["Hold an input LOW when otherwise floating", "Convert digital to analog", "Increase Wi-Fi range", "Measure temperature"],
        answer: 0,
        explanation: "A pull-down resistor provides a defined LOW logic level when the input is not driven.",
      },
      {
        question: "What is a common benefit of using a state machine in embedded firmware?",
        options: ["It makes system states and transitions explicit", "It removes all timing requirements", "It replaces sensors", "It guarantees zero bugs"],
        answer: 0,
        explanation: "A state machine structures behavior into defined states and transitions, making control logic easier to reason about.",
      },
      {
        question: "What is I2C clock stretching?",
        options: ["A slave holds SCL low to delay the bus", "A master changes an address", "A sensor increases clock frequency", "A UART parity mode"],
        answer: 0,
        explanation: "A device can hold SCL low to indicate it needs more time before the transfer continues.",
      },
      {
        question: "Why should sensor grounds and controller ground usually be common in a low-voltage circuit?",
        options: ["To provide a shared voltage reference", "To double the supply voltage", "To remove all electrical noise", "To increase ADC bit depth"],
        answer: 0,
        explanation: "A common reference lets signal voltages be interpreted consistently between connected devices.",
      },
    ],
  },

  "Electronics / Hardware": {
    topics: [
      "Analog Electronics",
      "Digital Electronics",
      "Microcontrollers",
      "PCB Design",
      "Sensors",
      "Communication",
      "Circuit Analysis",
      "Oscilloscope",
    ],

    questions: [
      {
        question:
          "What is the main function of a pull-up resistor?",
        options: [
          "Force a digital input toward logic HIGH when otherwise floating",
          "Convert AC into DC",
          "Increase clock frequency",
          "Store program memory",
        ],
        answer: 0,
        explanation:
          "A pull-up resistor provides a default HIGH logic level for an input when no other signal is driving it.",
      },
      {
        question:
          "Which instrument is commonly used to observe voltage waveforms over time?",
        options: [
          "Multimeter only",
          "Oscilloscope",
          "Soldering iron",
          "Logic gate",
        ],
        answer: 1,
        explanation:
          "An oscilloscope displays electrical waveforms and lets you inspect voltage changes over time.",
      },
      {
        question:
          "An ADC converts which type of signal into digital data?",
        options: [
          "Digital to analog",
          "Analog to digital",
          "Current to resistance",
          "Frequency to voltage only",
        ],
        answer: 1,
        explanation:
          "An ADC, or analog-to-digital converter, samples an analog signal and represents it digitally.",
      },
      {
        question:
          "Which logic gate produces HIGH only when both inputs are HIGH?",
        options: [
          "OR",
          "XOR",
          "AND",
          "NOT",
        ],
        answer: 2,
        explanation:
          "An AND gate produces HIGH only when all of its required inputs are HIGH.",
      },
      {
        question: "What is Ohm’s law?",
        options: ["V = IR", "P = I/R", "V = I + R", "R = VI"],
        answer: 0,
        explanation: "Ohm’s law relates voltage, current, and resistance as V = I × R.",
      },
      {
        question: "What is the unit of capacitance?",
        options: ["Ohm", "Henry", "Farad", "Tesla"],
        answer: 2,
        explanation: "Capacitance is measured in farads.",
      },
      {
        question: "In a series circuit, which quantity is the same through ideal components?",
        options: ["Voltage", "Current", "Resistance", "Power"],
        answer: 1,
        explanation: "The same current flows through every element in a simple series path.",
      },
      {
        question: "What does a low-pass filter do?",
        options: ["Passes lower frequencies and attenuates higher frequencies", "Passes only DC voltage perfectly in all cases", "Amplifies every frequency equally", "Converts AC to digital"],
        answer: 0,
        explanation: "A low-pass filter allows frequencies below its cutoff to pass more readily.",
      },
      {
        question: "Which semiconductor device is commonly used for switching and amplification?",
        options: ["Resistor", "Transistor", "Fuse", "Inductor"],
        answer: 1,
        explanation: "Transistors are widely used as electronic switches and amplifying devices.",
      },
      {
        question: "What is the purpose of a rectifier?",
        options: ["Convert AC to pulsating DC", "Convert light to sound", "Store digital data", "Increase resistance only"],
        answer: 0,
        explanation: "A rectifier uses devices such as diodes to convert AC into unidirectional current.",
      },
      {
        question: "What does a Zener diode commonly provide in reverse breakdown?",
        options: ["Voltage reference or regulation", "Magnetic storage", "Mechanical motion", "Clock generation only"],
        answer: 0,
        explanation: "A Zener diode can maintain an approximately specified voltage over a suitable current range.",
      },
      {
        question: "What is the Boolean output of XOR when both inputs are equal?",
        options: ["HIGH", "LOW", "Floating always", "Analog"],
        answer: 1,
        explanation: "XOR is HIGH when inputs differ, so equal inputs produce LOW.",
      },
      {
        question: "What does flip-flop setup time specify?",
        options: ["How long data must be stable before the active clock edge", "The time to boot a computer", "The time to solder a pin", "The number of logic inputs"],
        answer: 0,
        explanation: "Setup time is the minimum data-stability interval before the triggering clock edge.",
      },
      {
        question: "What does PCB stand for?",
        options: ["Printed Circuit Board", "Power Control Battery", "Programmed Current Bus", "Parallel Component Block"],
        answer: 0,
        explanation: "PCB stands for Printed Circuit Board.",
      },
      {
        question: "Why is decoupling capacitance placed near an IC power pin?",
        options: ["To reduce local supply noise and provide transient current", "To increase the IC package size", "To store firmware", "To replace every regulator"],
        answer: 0,
        explanation: "A nearby capacitor supplies short bursts of current and helps suppress supply disturbances.",
      },
      {
        question: "Which instrument measures current in a circuit?",
        options: ["Ammeter", "Oscilloscope probe only", "Thermistor", "Function generator"],
        answer: 0,
        explanation: "An ammeter measures electric current and is connected appropriately in series.",
      },
      {
        question: "What is the unit of inductance?",
        options: ["Farad", "Henry", "Ohm", "Watt"],
        answer: 1,
        explanation: "Inductance is measured in henries.",
      },
      {
        question: "What does a common-emitter BJT amplifier provide?",
        options: ["Voltage gain with typically inverted output phase", "Only optical isolation", "Digital storage", "AC-to-DC conversion"],
        answer: 0,
        explanation: "A common-emitter stage commonly provides voltage gain and a 180-degree phase inversion.",
      },
      {
        question: "What does Nyquist sampling guidance say for a band-limited signal?",
        options: ["Sample above twice the highest signal frequency", "Sample once per minute", "Sample below the lowest frequency", "Sampling rate does not matter"],
        answer: 0,
        explanation: "The sampling rate should exceed twice the highest frequency component to avoid aliasing under ideal assumptions.",
      },
      {
        question: "What is the main purpose of electrical grounding in a circuit?",
        options: ["Provide a reference and, where designed, a fault-current path", "Increase signal frequency", "Guarantee no shock under all conditions", "Replace insulation"],
        answer: 0,
        explanation: "Grounding provides a defined reference and may provide a protective path depending on the system design.",
      },
    ],
  },

  "AI / ML / Data": {
    topics: [
      "Python",
      "Machine Learning",
      "Statistics",
      "Pandas and NumPy",
      "SQL",
      "Model Evaluation",
      "Data Cleaning",
      "Feature Engineering",
    ],

    questions: [
      {
        question:
          "What is overfitting in machine learning?",
        options: [
          "The model performs well only on unseen data",
          "The model memorizes training data and generalizes poorly",
          "The model has too little training data by definition",
          "The model cannot learn any pattern",
        ],
        answer: 1,
        explanation:
          "An overfit model learns the training data too closely and therefore performs poorly on new data.",
      },
      {
        question:
          "Which task is an example of classification?",
        options: [
          "Predicting house price",
          "Predicting rainfall amount",
          "Predicting whether an email is spam",
          "Predicting stock price",
        ],
        answer: 2,
        explanation:
          "Spam detection assigns an input to a category, such as spam or not spam.",
      },
      {
        question:
          "Why is feature scaling sometimes useful?",
        options: [
          "It removes all missing values automatically",
          "It puts numeric features on comparable scales",
          "It always increases dataset size",
          "It replaces model training",
        ],
        answer: 1,
        explanation:
          "Scaling prevents features with large numeric ranges from dominating algorithms that depend on feature magnitude.",
      },
      {
        question:
          "Which Python library is commonly used for tabular data manipulation?",
        options: [
          "Pandas",
          "Flask",
          "FastAPI",
          "React",
        ],
        answer: 0,
        explanation:
          "Pandas provides DataFrame-based tools for cleaning, transforming, analyzing, and working with tabular data.",
      },
      {
        question: "Which learning approach uses labeled input-output examples?",
        options: ["Unsupervised learning", "Supervised learning", "Reinforcement learning only", "Random search"],
        answer: 1,
        explanation: "Supervised learning trains from examples paired with target labels or values.",
      },
      {
        question: "Which metric is the fraction of predicted positives that are truly positive?",
        options: ["Recall", "Precision", "Accuracy only", "Mean squared error"],
        answer: 1,
        explanation: "Precision equals true positives divided by all predicted positives.",
      },
      {
        question: "What is recall?",
        options: ["True positives divided by actual positives", "True negatives divided by all predictions", "Average prediction error in units squared", "Number of model parameters"],
        answer: 0,
        explanation: "Recall measures the proportion of actual positive cases correctly identified.",
      },
      {
        question: "Why split data into training and test sets?",
        options: ["To evaluate generalization on held-out data", "To make every model perfect", "To remove the need for labels", "To increase the number of features automatically"],
        answer: 0,
        explanation: "Held-out test data estimates performance on examples not used for training.",
      },
      {
        question: "Which method is commonly used to handle missing numeric values?",
        options: ["Imputation", "One-hot encoding only", "Tokenization", "Shuffling column names"],
        answer: 0,
        explanation: "Imputation fills missing values using a chosen strategy, such as a median or model-based estimate.",
      },
      {
        question: "What is a confusion matrix used for?",
        options: ["Summarizing classification predictions against true labels", "Sorting numeric columns", "Compressing images", "Choosing database passwords"],
        answer: 0,
        explanation: "A confusion matrix counts true and false positives and negatives for classification.",
      },
      {
        question: "Which task is regression?",
        options: ["Classifying a photo as cat or dog", "Predicting a continuous house price", "Detecting spam categories", "Grouping customers without labels"],
        answer: 1,
        explanation: "Regression predicts a continuous numeric target such as price.",
      },
      {
        question: "What is a common purpose of cross-validation?",
        options: ["Estimate model performance across multiple data splits", "Guarantee the model has no bias", "Replace feature engineering", "Convert labels into images"],
        answer: 0,
        explanation: "Cross-validation evaluates a model across multiple folds to reduce dependence on one split.",
      },
      {
        question: "What does a very high correlation between two features sometimes indicate?",
        options: ["Potential redundancy or multicollinearity", "Proof of causation", "A perfect model", "Missing target labels"],
        answer: 0,
        explanation: "Highly correlated predictors may contain overlapping information and can affect some models.",
      },
      {
        question: "Which library is widely used for numerical arrays in Python?",
        options: ["NumPy", "Django", "BeautifulSoup", "React"],
        answer: 0,
        explanation: "NumPy provides efficient multidimensional arrays and numerical operations.",
      },
      {
        question: "What is gradient descent used for?",
        options: ["Updating model parameters to reduce a loss function", "Cleaning HTML tags only", "Creating database tables", "Sampling audio hardware"],
        answer: 0,
        explanation: "Gradient descent adjusts parameters in the direction that reduces the objective locally.",
      },
      {
        question: "What is a label in a supervised dataset?",
        options: ["The target value the model learns to predict", "A file extension", "A feature scaling method", "A database index"],
        answer: 0,
        explanation: "A label is the known target output associated with a training example.",
      },
      {
        question: "Why can data leakage make evaluation misleading?",
        options: ["Information unavailable at prediction time leaks into training or evaluation", "It always decreases accuracy", "It removes all features", "It guarantees unbiased results"],
        answer: 0,
        explanation: "Leakage lets a model access information it would not legitimately have when making real predictions.",
      },
      {
        question: "What does one-hot encoding do?",
        options: ["Represent categories using binary indicator columns", "Scale every value to a mean of zero", "Delete categorical data", "Train a neural network"],
        answer: 0,
        explanation: "One-hot encoding maps each category to a separate indicator feature.",
      },
      {
        question: "Which plot is often useful for viewing the distribution of a numeric variable?",
        options: ["Histogram", "Pie chart for every raw value", "Network diagram", "Gantt chart"],
        answer: 0,
        explanation: "A histogram groups numeric values into bins to show their distribution.",
      },
      {
        question: "What is an epoch in model training?",
        options: ["One complete pass through the training dataset", "One individual feature", "A type of SQL join", "A missing data value"],
        answer: 0,
        explanation: "An epoch is one complete pass through the training examples during training.",
      },
    ],
  },

  "Cloud / DevOps": {
    topics: [
      "Linux",
      "Git",
      "Docker",
      "CI/CD",
      "AWS / Azure / GCP",
      "Kubernetes",
      "Networking",
      "Microservices",
    ],

    questions: [
      {
        question:
          "What problem does Docker primarily help solve?",
        options: [
          "Making applications dependent on one developer's machine",
          "Packaging applications with their dependencies consistently",
          "Replacing every database",
          "Writing frontend HTML automatically",
        ],
        answer: 1,
        explanation:
          "Docker packages an application and its dependencies into a portable container environment.",
      },
      {
        question:
          "What is a key purpose of CI/CD?",
        options: [
          "Automate testing and delivery workflows",
          "Increase monitor size",
          "Replace source control",
          "Remove all production monitoring",
        ],
        answer: 0,
        explanation:
          "CI/CD helps automate integration, testing, delivery, and deployment activities.",
      },
      {
        question:
          "Which command displays the current working directory in Linux?",
        options: [
          "pwd",
          "cd",
          "ls",
          "mkdir",
        ],
        answer: 0,
        explanation:
          "pwd prints the present working directory.",
      },
      {
        question:
          "What is Kubernetes primarily used for?",
        options: [
          "Editing images",
          "Managing containerized workloads",
          "Writing SQL queries",
          "Designing PCBs",
        ],
        answer: 1,
        explanation:
          "Kubernetes orchestrates containerized workloads, including deployment, scaling, and service management.",
      },
      {
        question: "Which Linux command lists files and directories?",
        options: ["ls", "pwd", "grep", "chmod"],
        answer: 0,
        explanation: "ls lists directory contents.",
      },
      {
        question: "Which Git command records staged changes in repository history?",
        options: ["git fetch", "git commit", "git pull", "git diff"],
        answer: 1,
        explanation: "git commit creates a new commit from staged changes.",
      },
      {
        question: "What is the main purpose of a Docker image?",
        options: ["A packaged template used to create containers", "A running virtual machine only", "A source-control branch", "A network cable"],
        answer: 0,
        explanation: "A Docker image packages filesystem layers and configuration used to create containers.",
      },
      {
        question: "What is horizontal scaling?",
        options: ["Adding more instances to share workload", "Adding more RAM to one server only", "Compressing source code", "Turning off monitoring"],
        answer: 0,
        explanation: "Horizontal scaling adds instances or machines to distribute the workload.",
      },
      {
        question: "What does a load balancer do?",
        options: ["Distributes incoming requests across available targets", "Stores source code commits", "Compiles every container", "Encrypts files automatically"],
        answer: 0,
        explanation: "A load balancer routes requests among servers or service instances.",
      },
      {
        question: "Which service model provides virtual machines, networks, and storage resources?",
        options: ["IaaS", "SaaS only", "FaaS only", "HTML"],
        answer: 0,
        explanation: "Infrastructure as a Service offers fundamental computing resources such as virtual machines and networking.",
      },
      {
        question: "What does CI usually stand for in CI/CD?",
        options: ["Continuous Integration", "Central Internet", "Code Installation", "Container Isolation"],
        answer: 0,
        explanation: "Continuous Integration frequently merges changes and runs automated checks.",
      },
      {
        question: "Why are environment variables used for configuration?",
        options: ["To separate configuration from source code", "To make passwords safe to commit publicly", "To replace all logs", "To compile code faster always"],
        answer: 0,
        explanation: "Environment variables allow configuration to vary between environments without hardcoding values.",
      },
      {
        question: "What is the role of a Kubernetes Deployment?",
        options: ["Manage replicated application Pods and rollout updates", "Create a programming language", "Replace every container image", "Manage desktop windows"],
        answer: 0,
        explanation: "A Deployment manages desired replicas and supports controlled rollout and rollback of Pods.",
      },
      {
        question: "What is infrastructure as code?",
        options: ["Managing infrastructure through versionable configuration files", "Drawing network diagrams by hand only", "Writing code directly into RAM", "A manual backup method"],
        answer: 0,
        explanation: "Infrastructure as code defines and provisions infrastructure through machine-readable configuration.",
      },
      {
        question: "Which protocol secures ordinary web traffic?",
        options: ["HTTPS", "FTP without TLS", "Telnet", "HTTP without encryption"],
        answer: 0,
        explanation: "HTTPS uses TLS to protect HTTP communication in transit.",
      },
      {
        question: "What is a log aggregation system used for?",
        options: ["Collecting and searching logs from multiple services", "Compiling JavaScript only", "Assigning IP addresses manually", "Replacing application metrics"],
        answer: 0,
        explanation: "Centralized log aggregation helps investigate events across multiple machines and services.",
      },
      {
        question: "What is a health check in a deployment environment?",
        options: ["A test that indicates whether an application instance is functioning", "A code formatting rule", "A password rotation schedule", "A container image name"],
        answer: 0,
        explanation: "Health checks help systems detect whether an instance is ready or needs recovery.",
      },
      {
        question: "What does DNS translate in typical use?",
        options: ["Domain names to IP addresses and related records", "Source code into machine code", "SQL into JSON", "Containers into virtual machines"],
        answer: 0,
        explanation: "DNS resolves domain names to records such as IP addresses.",
      },
      {
        question: "Why use a secrets manager?",
        options: ["Store and control access to credentials and sensitive configuration", "Store public CSS files only", "Increase CPU clock speed", "Replace authentication"],
        answer: 0,
        explanation: "Secrets managers centralize sensitive values and support access control and rotation.",
      },
      {
        question: "What is blue-green deployment?",
        options: ["Switch traffic between two production-like environments", "Deploy only on Mondays", "Run two databases without backups", "Delete the previous release before testing"],
        answer: 0,
        explanation: "Blue-green deployment switches traffic between old and new environments to reduce release downtime.",
      },
    ],
  },
};

const DEFAULT_PREP = {
  topics: [
    "Communication Skills",
    "Problem Solving",
    "Core Engineering Concepts",
    "Projects",
    "Resume Discussion",
    "Aptitude",
    "Basic Programming",
    "Interview Practice",
  ],

  questions: [
    {
      question:
        "Which approach is generally best when explaining a project in an interview?",
      options: [
        "Only describe the project title",
        "Explain the problem, approach, technology, and result",
        "Avoid discussing challenges",
        "Read the code line by line",
      ],
      answer: 1,
      explanation:
        "A strong project explanation connects the problem, your approach, technologies used, your contribution, and the result.",
    },
    {
      question:
        "What is usually most useful when answering a behavioral interview question?",
      options: [
        "A completely unrelated story",
        "A structured real example",
        "Only one-word answers",
        "Avoiding the question",
      ],
      answer: 1,
      explanation:
        "A concrete and structured example gives the interviewer evidence of how you handled a situation.",
    },
    {
      question:
        "Which is most useful before a technical placement interview?",
      options: [
        "Knowing nothing about your own projects",
        "Reviewing your resume and core technical fundamentals",
        "Memorizing only company slogans",
        "Avoiding practice",
      ],
      answer: 1,
      explanation:
        "Interview preparation should combine resume familiarity, fundamentals, project understanding, and practice.",
    },
    {
      question:
        "What is a good way to answer a technical question you genuinely do not know?",
      options: [
        "Invent an answer confidently",
        "Say you do not know and explain what you do know",
        "Leave immediately",
        "Change the subject",
      ],
      answer: 1,
      explanation:
        "Being honest while explaining related knowledge demonstrates professionalism and reasoning ability.",
    },
      {
        question: "Which part of a resume should be tailored to a specific job?",
        options: ["Relevant skills and experience", "Every section must be identical", "Only the page color", "The file name alone"],
        answer: 0,
        explanation: "Tailoring relevant skills, projects, and achievements makes the resume more aligned with the role.",
      },
      {
        question: "What is the STAR method used for?",
        options: ["Structuring behavioral interview answers", "Debugging a network cable", "Writing SQL joins", "Designing a PCB"],
        answer: 0,
        explanation: "STAR stands for Situation, Task, Action, and Result.",
      },
      {
        question: "What should you do before a technical interview?",
        options: ["Review core concepts and be ready to explain your projects", "Memorize only the company logo", "Avoid reading your resume", "Skip sleep to study all night"],
        answer: 0,
        explanation: "Reviewing fundamentals and your own project decisions prepares you for follow-up questions.",
      },
      {
        question: "What is a useful way to discuss a project challenge?",
        options: ["Explain the issue, your actions, and the outcome", "Blame teammates without details", "Hide the challenge", "Describe only the project title"],
        answer: 0,
        explanation: "A clear challenge story shows problem-solving, ownership, and what you learned.",
      },
      {
        question: "Which behavior demonstrates active listening?",
        options: ["Clarifying the question before answering if needed", "Interrupting every sentence", "Changing the topic", "Giving an unrelated answer"],
        answer: 0,
        explanation: "Clarifying and responding to the actual question demonstrates attention and communication.",
      },
      {
        question: "What is the best response when you do not know an answer?",
        options: ["Be honest and explain related knowledge or how you would investigate", "Invent technical facts", "Argue with the interviewer", "Stay silent without explanation"],
        answer: 0,
        explanation: "Honesty combined with reasoning is better than presenting invented information.",
      },
      {
        question: "What should a strong resume bullet emphasize?",
        options: ["Action, contribution, and measurable result where possible", "Only personal opinions", "Long paragraphs without outcomes", "Unrelated hobbies only"],
        answer: 0,
        explanation: "Effective bullets communicate what you did and the impact, ideally with measurable evidence.",
      },
      {
        question: "Why should you research a company before an interview?",
        options: ["To connect your interests and skills to its work and role", "To memorize every employee name", "To avoid role-specific questions", "To replace technical preparation"],
        answer: 0,
        explanation: "Research helps you explain why the role fits and ask informed questions.",
      },
      {
        question: "What is constructive feedback intended to do?",
        options: ["Help improve performance or outcomes", "Prove someone is always wrong", "Stop all discussion", "Replace project testing"],
        answer: 0,
        explanation: "Constructive feedback identifies improvements in a specific and useful way.",
      },
      {
        question: "What should you do if an interviewer’s question is unclear?",
        options: ["Politely ask for clarification", "Guess wildly without checking", "Ignore the question", "End the interview"],
        answer: 0,
        explanation: "Clarifying the question helps ensure your answer addresses the interviewer’s intent.",
      },
      {
        question: "Why is teamwork important in engineering projects?",
        options: ["Many projects require coordinated skills and shared problem-solving", "It removes the need for individual accountability", "It guarantees no conflicts", "It replaces documentation"],
        answer: 0,
        explanation: "Engineering projects often depend on collaboration across tasks and expertise.",
      },
      {
        question: "What is a good way to demonstrate ownership of a project?",
        options: ["Clearly describe your own contribution and decisions", "Claim work you did not do", "Avoid discussing implementation", "Only name the tools"],
        answer: 0,
        explanation: "Explaining your specific work and decisions gives the interviewer a reliable view of your contribution.",
      },
      {
        question: "What should you do after receiving a rejection?",
        options: ["Reflect on feedback and continue improving", "Stop applying permanently", "Assume every interviewer was unfair", "Delete all projects"],
        answer: 0,
        explanation: "Reflection can identify improvements while keeping the job search moving.",
      },
      {
        question: "Which is a useful question to ask an interviewer?",
        options: ["What would success look like in this role during the first few months?", "Can I skip all responsibilities?", "How soon can I leave each day?", "Can you answer every exam question for me?"],
        answer: 0,
        explanation: "Asking about success expectations shows interest in contributing effectively.",
      },
      {
        question: "Why practice explaining a technical concept aloud?",
        options: ["It improves clarity and reveals gaps in understanding", "It makes accuracy unnecessary", "It replaces practical experience completely", "It guarantees every answer is short"],
        answer: 0,
        explanation: "Speaking practice helps organize ideas and discover concepts that need more revision.",
      },
      {
        question: "What should you check before submitting a resume?",
        options: ["Spelling, contact details, relevance, and formatting", "Only the background color", "Whether it has as many pages as possible", "Only the file icon"],
        answer: 0,
        explanation: "A final review catches errors and ensures the document is relevant and readable.",
      },
  ],
};

// Add consistent difficulty labels to each question bank.
const applyQuestionDifficulty = (prep) => {
  prep.questions = prep.questions.map((question, index) => ({
    ...question,
    difficulty:
      index < 7 ? "Easy" : index < 14 ? "Medium" : "Hard",
  }));
};

Object.values(PREP_BY_CAREER).forEach(applyQuestionDifficulty);
applyQuestionDifficulty(DEFAULT_PREP);

/* =========================================================
   SMALL REUSABLE CARD
========================================================= */

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   PLACEMENT PREPARATION
========================================================= */

function PlacementPreparation() {
  const navigate = useNavigate();

  const [topicProgress, setTopicProgress] =
    useState({});

  const [questionProgress, setQuestionProgress] =
    useState({});

  const [selectedAnswers, setSelectedAnswers] =
    useState({});

  const [submittedAnswers, setSubmittedAnswers] =
    useState({});

  const [progressLoaded, setProgressLoaded] =
    useState(false);

  const [quizLoaded, setQuizLoaded] =
    useState(false);

  /* -------------------------------------------------------
     CAREER PROFILE
  ------------------------------------------------------- */

  const careerProfile = useMemo(() => {
    const saved = localStorage.getItem(
      "resumelens_career_profile"
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  /* -------------------------------------------------------
     RESUME ANALYSIS
  ------------------------------------------------------- */

  const resumeAnalysis = useMemo(() => {
    const saved = localStorage.getItem(
      "resumelens_resume_analysis"
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  /* -------------------------------------------------------
     RESUME SKILLS
  ------------------------------------------------------- */

  const resumeSkills = useMemo(() => {
    const saved = localStorage.getItem(
      "resumelens_resume_skills"
    );

    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }, []);

  /* -------------------------------------------------------
     SKILL GAP
  ------------------------------------------------------- */

  const skillGap = useMemo(() => {
    const saved = localStorage.getItem(
      "careerSkillGap"
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  /* -------------------------------------------------------
     COMPANY FIT
  ------------------------------------------------------- */

  const companyFit = useMemo(() => {
    const saved = localStorage.getItem(
      "resumelens_company_fit"
    );

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  /* -------------------------------------------------------
     CAREER DATA
  ------------------------------------------------------- */

  const careerInterests = Array.isArray(
    careerProfile?.career_interests
  )
    ? careerProfile.career_interests
    : [];

  const primaryCareer =
    careerInterests[0] ||
    "General Engineering";

  const primaryPrep =
    PREP_BY_CAREER[primaryCareer] ||
    DEFAULT_PREP;

  const progressKey =
    `resumelens_placement_progress_${primaryCareer}`;

  const quizKey =
    `resumelens_placement_quiz_${primaryCareer}`;

  /* -------------------------------------------------------
     RESUME SCORE
  ------------------------------------------------------- */

  const resumeScore =
    typeof resumeAnalysis?.resume_score ===
    "object"
      ? resumeAnalysis?.resume_score
          ?.overall_score
      : resumeAnalysis?.resume_score;

  /* -------------------------------------------------------
     SKILL GAP COUNT
  ------------------------------------------------------- */

  const careerTracks =
    Array.isArray(
      skillGap?.career_tracks
    )
      ? skillGap.career_tracks
      : [];

  const uniqueMissingSkills =
    Array.from(
      new Set(
        careerTracks.flatMap(
          (track) =>
            Array.isArray(
              track.missing_skills
            )
              ? track.missing_skills
                  .map(
                    (item) =>
                      item.skill
                  )
                  .filter(Boolean)
              : []
        )
      )
    );

  const totalGaps =
    uniqueMissingSkills.length;

  /* -------------------------------------------------------
     LOAD TOPIC / QUESTION PROGRESS
  ------------------------------------------------------- */

  useEffect(() => {
    const saved = localStorage.getItem(
      progressKey
    );

    if (!saved) {
      setTopicProgress({});
      setQuestionProgress({});
      setProgressLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      setTopicProgress(
        parsed?.topics || {}
      );

      setQuestionProgress(
        parsed?.questions || {}
      );
    } catch (error) {
      console.error(
        "Placement progress parsing failed:",
        error
      );

      setTopicProgress({});
      setQuestionProgress({});
    }

    setProgressLoaded(true);
  }, [progressKey]);

  /* -------------------------------------------------------
     LOAD QUIZ PROGRESS
  ------------------------------------------------------- */

  useEffect(() => {
    setQuizLoaded(false);
    const saved = localStorage.getItem(quizKey);

    if (!saved) {
      setSelectedAnswers({});
      setSubmittedAnswers({});
      setQuizLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      setSelectedAnswers(parsed?.selected || {});
      setSubmittedAnswers(parsed?.submitted || {});
    } catch (error) {
      console.error("Placement quiz parsing failed:", error);
      setSelectedAnswers({});
      setSubmittedAnswers({});
    }

    setQuizLoaded(true);
  }, [quizKey]);

  /* -------------------------------------------------------
     SAVE TOPIC / QUESTION PROGRESS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!progressLoaded) {
      return;
    }

    localStorage.setItem(
      progressKey,
      JSON.stringify({
        topics: topicProgress,
        questions: questionProgress,
      })
    );
  }, [
    topicProgress,
    questionProgress,
    progressKey,
    progressLoaded,
  ]);

  /* -------------------------------------------------------
     SAVE QUIZ PROGRESS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!quizLoaded) {
      return;
    }

    localStorage.setItem(
      quizKey,
      JSON.stringify({
        selected: selectedAnswers,
        submitted: submittedAnswers,
      })
    );
  }, [selectedAnswers, submittedAnswers, quizKey, quizLoaded]);

  /* -------------------------------------------------------
     TOPIC TOGGLE
  ------------------------------------------------------- */

  const toggleTopic = (topic) => {
    setTopicProgress((current) => ({
      ...current,
      [topic]: !current[topic],
    }));
  };

  /* -------------------------------------------------------
     QUESTION PRACTICE TOGGLE
  ------------------------------------------------------- */

  const toggleQuestion = (questionText) => {
    setQuestionProgress(
      (current) => ({
        ...current,
        [questionText]:
          !current[questionText],
      })
    );
  };

  /* -------------------------------------------------------
     SELECT ANSWER
  ------------------------------------------------------- */

  const selectAnswer = (
    questionText,
    answerIndex
  ) => {
    setSelectedAnswers(
      (current) => ({
        ...current,
        [questionText]:
          answerIndex,
      })
    );

    setSubmittedAnswers(
      (current) => {
        const next = {
          ...current,
        };

        delete next[questionText];

        return next;
      }
    );
  };

  /* -------------------------------------------------------
     SUBMIT ANSWER
  ------------------------------------------------------- */

  const submitAnswer = (
    question
  ) => {
    if (
      selectedAnswers[
        question.question
      ] === undefined
    ) {
      return;
    }

    setSubmittedAnswers(
      (current) => ({
        ...current,
        [question.question]:
          selectedAnswers[
            question.question
          ] === question.answer,
      })
    );
  };

  /* -------------------------------------------------------
     RESET EVERYTHING
  ------------------------------------------------------- */

  const resetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    localStorage.removeItem(quizKey);
  };

  const resetPracticeProgress = () => {
    setTopicProgress({});
    setQuestionProgress({});
    setSelectedAnswers({});
    setSubmittedAnswers({});

    localStorage.removeItem(
      progressKey
    );

    localStorage.removeItem(
      quizKey
    );
  };

  /* -------------------------------------------------------
     TOPIC / QUESTION COUNTS
  ------------------------------------------------------- */

  const completedTopics =
    primaryPrep.topics.filter(
      (topic) =>
        topicProgress[topic]
    ).length;

  const completedQuestions =
    primaryPrep.questions.filter(
      (question) =>
        questionProgress[
          question.question
        ]
    ).length;

  const totalPracticeItems =
    primaryPrep.topics.length +
    primaryPrep.questions.length;

  const completedPracticeItems =
    completedTopics +
    completedQuestions;

  const preparationProgress =
    totalPracticeItems > 0
      ? Math.round(
          (completedPracticeItems /
            totalPracticeItems) *
            100
        )
      : 0;

  /* -------------------------------------------------------
     QUIZ COUNTS
  ------------------------------------------------------- */

  const answeredQuestions =
    primaryPrep.questions.filter(
      (question) =>
        submittedAnswers[
          question.question
        ] !== undefined
    ).length;

  const correctAnswers =
    primaryPrep.questions.filter(
      (question) =>
        submittedAnswers[
          question.question
        ] === true
    ).length;

  const quizScore =
    answeredQuestions > 0
      ? Math.round(
          (correctAnswers /
            answeredQuestions) *
            100
        )
      : 0;

  /* -------------------------------------------------------
     READINESS
  ------------------------------------------------------- */

  const readinessItems = [
    {
      label: "Resume analyzed",
      completed:
        Boolean(resumeAnalysis),
    },
    {
      label: "Career direction selected",
      completed:
        careerInterests.length > 0,
    },
    {
      label: "Skill gap analyzed",
      completed:
        Boolean(skillGap),
    },
    {
      label: "Company fit explored",
      completed:
        Boolean(companyFit),
    },
  ];

  const completedItems =
    readinessItems.filter(
      (item) => item.completed
    ).length;

  const profileCompletion =
    Math.round(
      (completedItems /
        readinessItems.length) *
        100
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            ResumeLens
          </p>

          <h1 className="mt-3 text-4xl font-bold">
            Placement Preparation
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Prepare for placements using your
            resume, selected career direction,
            skill gaps, and technical practice.
          </p>
        </div>

        {/* PREPARATION PROFILE */}

        <Card className="mt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-medium text-cyan-400">
                Your Preparation Profile
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                {careerProfile?.branch ||
                  "Engineering Student"}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {careerInterests.length > 0 ? (
                  careerInterests.map(
                    (interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300"
                      >
                        {interest}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-sm text-slate-500">
                    Career direction not selected yet.
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-7 py-5 text-center">
              <p className="text-xs uppercase tracking-widest text-cyan-300">
                Career Profile Completion
              </p>

              <p className="mt-2 text-4xl font-bold text-cyan-400">
                {profileCompletion}%
              </p>
            </div>

          </div>
        </Card>

        {/* SUMMARY CARDS */}

        <div className="mt-6 grid gap-4 md:grid-cols-4">

          <Card>
            <p className="text-sm text-slate-400">
              Resume Score
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {resumeScore ?? "—"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Current resume quality score
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">
              Skills Detected
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
              {resumeSkills.length}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Skills identified from your resume
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">
              Career Skill Gaps
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-400">
              {totalGaps || "—"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Unique skills to consider strengthening
            </p>
          </Card>

          <Card>
            <p className="text-sm text-slate-400">
              Quiz Score
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {answeredQuestions > 0
                ? `${quizScore}%`
                : "—"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Based on submitted practice answers
            </p>
          </Card>

        </div>

        {/* REAL PREPARATION PROGRESS */}

        <section className="mt-8">
          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm font-medium text-cyan-400">
                  Preparation Progress
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {preparationProgress}%
                  {" "}Complete
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {completedTopics} of{" "}
                  {primaryPrep.topics.length}{" "}
                  technical topics completed and{" "}
                  {completedQuestions} of{" "}
                  {primaryPrep.questions.length}{" "}
                  interview questions practiced.
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-cyan-400">
                  {completedPracticeItems}
                </p>

                <p className="text-xs text-slate-500">
                  of {totalPracticeItems} practice items
                </p>
              </div>

            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                style={{
                  width: `${preparationProgress}%`,
                }}
              />
            </div>
          </Card>
        </section>

        {/* TECHNICAL PREPARATION */}

        <section className="mt-8">

          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-400">
              Technical Preparation
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Focus on {primaryCareer}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Mark each topic as complete after
              revising the fundamentals and practicing
              enough questions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {primaryPrep.topics.map(
              (topic, index) => {
                const completed =
                  Boolean(
                    topicProgress[topic]
                  );

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() =>
                      toggleTopic(topic)
                    }
                    className={`rounded-2xl border p-5 text-left transition ${
                      completed
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-slate-800 bg-slate-900/70 hover:border-cyan-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">

                      <span
                        className={`text-xs font-semibold ${
                          completed
                            ? "text-emerald-400"
                            : "text-cyan-400"
                        }`}
                      >
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          completed
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {completed
                          ? "Completed"
                          : "Prepare"}
                      </span>

                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      {topic}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Revise the fundamentals,
                      practice questions, and connect
                      the topic to one of your projects.
                    </p>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* INTERVIEW QUIZ */}

        <section className="mt-10">

          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-400">
              Technical Interview Practice
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Test your preparation
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Answer career-specific questions,
              submit your response, and review the
              explanation immediately.
            </p>
          </div>

          <Card className="mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">Quiz summary</p>
                <p className="mt-1 text-xl font-semibold text-white">
                  {answeredQuestions} / {primaryPrep.questions.length} answered
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Correct: {correctAnswers} · Incorrect: {answeredQuestions - correctAnswers} · Score: {answeredQuestions > 0 ? `${quizScore}%` : "Not scored yet"}
                </p>
              </div>
              <button
                type="button"
                onClick={resetQuiz}
                disabled={answeredQuestions === 0 && Object.keys(selectedAnswers).length === 0}
                className="rounded-xl border border-cyan-500/30 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Retake Quiz
              </button>
            </div>
          </Card>

          <div className="space-y-6">

            {primaryPrep.questions.map(
              (question, index) => {
                const selected =
                  selectedAnswers[
                    question.question
                  ];

                const submitted =
                  submittedAnswers[
                    question.question
                  ];

                const hasSubmitted =
                  submitted !== undefined;

                return (
                  <Card
                    key={question.question}
                  >
                    <div className="flex items-start gap-4">

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-400">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-base font-semibold leading-7 text-white">
                            {question.question}
                          </p>
                          <span
                            className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                              question.difficulty === "Easy"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : question.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-300"
                                  : "bg-rose-500/10 text-rose-300"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">

                          {question.options.map(
                            (
                              option,
                              optionIndex
                            ) => {
                              const isSelected =
                                selected ===
                                optionIndex;

                              const isCorrect =
                                question.answer ===
                                optionIndex;

                              let optionClass =
                                "border-slate-800 bg-slate-950 hover:border-cyan-500/40";

                              if (
                                hasSubmitted &&
                                isCorrect
                              ) {
                                optionClass =
                                  "border-emerald-500/40 bg-emerald-500/10";
                              } else if (
                                hasSubmitted &&
                                isSelected &&
                                !isCorrect
                              ) {
                                optionClass =
                                  "border-red-500/40 bg-red-500/10";
                              } else if (
                                isSelected
                              ) {
                                optionClass =
                                  "border-cyan-500/50 bg-cyan-500/10";
                              }

                              return (
                                <button
                                  key={option}
                                  type="button"
                                  disabled={
                                    hasSubmitted
                                  }
                                  onClick={() =>
                                    selectAnswer(
                                      question.question,
                                      optionIndex
                                    )
                                  }
                                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${optionClass}`}
                                >
                                  <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                      isSelected
                                        ? "bg-cyan-500 text-slate-950"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {String.fromCharCode(
                                      65 +
                                        optionIndex
                                    )}
                                  </span>

                                  <span className="text-sm text-slate-300">
                                    {option}
                                  </span>
                                </button>
                              );
                            }
                          )}

                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <button
                            type="button"
                            onClick={() =>
                              submitAnswer(
                                question
                              )
                            }
                            disabled={
                              selected ===
                                undefined ||
                              hasSubmitted
                            }
                            className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Submit Answer
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleQuestion(
                                question.question
                              )
                            }
                            className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                              questionProgress[
                                question.question
                              ]
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-slate-700 text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            {questionProgress[
                              question.question
                            ]
                              ? "Practiced"
                              : "Mark Practiced"}
                          </button>

                        </div>

                        {hasSubmitted && (
                          <div
                            className={`mt-5 rounded-2xl border p-5 ${
                              submitted
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-red-500/30 bg-red-500/5"
                            }`}
                          >
                            <p
                              className={`text-sm font-semibold ${
                                submitted
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {submitted
                                ? "Correct answer"
                                : "Incorrect answer"}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              {question.explanation}
                            </p>

                            {!submitted && (
                              <p className="mt-3 text-sm text-slate-400">
                                Correct answer:{" "}
                                <span className="font-semibold text-emerald-400">
                                  {
                                    question.options[
                                      question.answer
                                    ]
                                  }
                                </span>
                              </p>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  </Card>
                );
              }
            )}

          </div>

        </section>

        {/* PLACEMENT CHECKLIST */}

        <section className="mt-10">

          <div className="mb-4">
            <p className="text-sm font-medium text-cyan-400">
              Placement Checklist
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Complete these foundations
            </h2>
          </div>

          <div className="space-y-3">

            {readinessItems.map(
              (item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <span className="text-sm text-slate-300">
                    {item.label}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.completed
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    {item.completed
                      ? "Ready"
                      : "Not started"}
                  </span>
                </div>
              )
            )}

          </div>

          <p className="mt-4 text-sm text-slate-500">
            {completedItems} of{" "}
            {readinessItems.length} career
            foundations completed.
          </p>

        </section>

        {/* RESET */}

        <section className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300">
          <button
            type="button"
            onClick={resetPracticeProgress}
            className="text-sm text-slate-500 transition hover:text-red-400"
          >
            
            Reset practice progress
            
          </button>
        </section>

        {/* NEXT ACTIONS */}

        <section className="mt-6 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <p className="text-sm font-medium text-cyan-400">
            Continue Building Your Profile
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Turn your analysis into preparation
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            ResumeLens connects your resume,
            career direction, skill gaps, company fit,
            roadmap, and placement preparation into one
            continuous journey.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/resume-improvement"
                )
              }
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Improve Resume
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/skill-gap")
              }
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Review Skill Gap
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/career-roadmap"
                )
              }
              className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Open Career Roadmap
            </button>

          </div>

        </section>

      </div>
    </main>
  );
}

export default PlacementPreparation;