import re


# =========================================================
# SKILL TAXONOMY
# =========================================================

SKILLS = {

    # -----------------------------------------------------
    # PROGRAMMING LANGUAGES
    # -----------------------------------------------------

    "Python": {
        "category": "Language",
        "aliases": ["python", "python3"],
    },

    "JavaScript": {
        "category": "Language",
        "aliases": ["javascript", "js", "es6"],
    },

    "TypeScript": {
        "category": "Language",
        "aliases": ["typescript"],
    },

    "Java": {
        "category": "Language",
        "aliases": ["java"],
    },

    "C": {
        "category": "Language",
        "aliases": ["C"],
        "case_sensitive": True,
        "special": "single_letter_language",
    },

    "C++": {
        "category": "Language",
        "aliases": ["C++"],
        "case_sensitive": True,
    },

    "C#": {
        "category": "Language",
        "aliases": ["C#"],
        "case_sensitive": True,
    },

    "Go": {
        "category": "Language",
        "aliases": ["golang"],
    },

    "Rust": {
        "category": "Language",
        "aliases": ["rust"],
    },

    "SQL": {
        "category": "Language",
        "aliases": ["sql"],
    },

    "Kotlin": {
        "category": "Language",
        "aliases": ["kotlin"],
    },

    "Swift": {
        "category": "Language",
        "aliases": ["swift"],
    },

    "PHP": {
        "category": "Language",
        "aliases": ["php"],
    },


    # -----------------------------------------------------
    # FRONTEND
    # -----------------------------------------------------

    "React": {
        "category": "Frontend",
        "aliases": ["react", "react.js", "reactjs"],
    },

    "Vue": {
        "category": "Frontend",
        "aliases": ["vue", "vue.js", "vuejs"],
    },

    "Angular": {
        "category": "Frontend",
        "aliases": ["angular", "angularjs"],
    },

    "HTML/CSS": {
        "category": "Frontend",
        "aliases": ["html/css"],
    },

    "HTML": {
        "category": "Frontend",
        "aliases": ["html"],
    },

    "CSS": {
        "category": "Frontend",
        "aliases": ["css"],
    },

    "Tailwind CSS": {
        "category": "Frontend",
        "aliases": ["tailwind", "tailwindcss"],
    },

    "Next.js": {
        "category": "Frontend",
        "aliases": ["next.js", "nextjs"],
    },

    "Redux": {
        "category": "Frontend",
        "aliases": ["redux"],
    },


    # -----------------------------------------------------
    # BACKEND
    # -----------------------------------------------------

    "Node.js": {
        "category": "Backend",
        "aliases": ["node.js", "nodejs", "node"],
    },

    "FastAPI": {
        "category": "Backend",
        "aliases": ["fastapi"],
    },

    "Django": {
        "category": "Backend",
        "aliases": ["django"],
    },

    "Flask": {
        "category": "Backend",
        "aliases": ["flask"],
    },

    "Spring Boot": {
        "category": "Backend",
        "aliases": ["spring boot", "springboot"],
    },

    "Express": {
        "category": "Backend",
        "aliases": ["express.js", "expressjs"],
    },

    ".NET": {
        "category": "Backend",
        "aliases": [".net", "dotnet", "asp.net"],
    },

    "GraphQL": {
        "category": "Backend",
        "aliases": ["graphql"],
    },

    "REST APIs": {
        "category": "Backend",
        "aliases": [
            "rest api",
            "rest apis",
            "restful",
        ],
    },

    "Microservices": {
        "category": "Backend",
        "aliases": [
            "microservices",
            "microservice",
        ],
    },


    # -----------------------------------------------------
    # DATABASES
    # -----------------------------------------------------

    "PostgreSQL": {
        "category": "Database",
        "aliases": ["postgresql", "postgres"],
    },

    "MySQL": {
        "category": "Database",
        "aliases": ["mysql"],
    },

    "MongoDB": {
        "category": "Database",
        "aliases": ["mongodb", "mongo"],
    },

    "Redis": {
        "category": "Database",
        "aliases": ["redis"],
    },

    "SQLite": {
        "category": "Database",
        "aliases": ["sqlite"],
    },

    "NoSQL": {
        "category": "Database",
        "aliases": ["nosql"],
    },


    # -----------------------------------------------------
    # CLOUD / DEVOPS
    # -----------------------------------------------------

    "AWS": {
        "category": "Cloud/DevOps",
        "aliases": ["aws"],
        "case_sensitive": True,
    },

    "Azure": {
        "category": "Cloud/DevOps",
        "aliases": ["azure"],
    },

    "GCP": {
        "category": "Cloud/DevOps",
        "aliases": ["gcp"],
        "case_sensitive": True,
    },

    "Docker": {
        "category": "Cloud/DevOps",
        "aliases": ["docker"],
    },

    "Kubernetes": {
        "category": "Cloud/DevOps",
        "aliases": [
            "kubernetes",
            "k8s",
        ],
    },

    "Terraform": {
        "category": "Cloud/DevOps",
        "aliases": ["terraform"],
    },

    "CI/CD": {
        "category": "Cloud/DevOps",
        "aliases": [
            "ci/cd",
            "cicd",
        ],
    },

    "Linux": {
        "category": "Cloud/DevOps",
        "aliases": [
            "linux",
            "unix",
        ],
    },

    "Git": {
        "category": "Cloud/DevOps",
        "aliases": ["git"],
        "special": "git",
    },


    # -----------------------------------------------------
    # DATA / ML
    # -----------------------------------------------------

    "Machine Learning": {
        "category": "Data/ML",
        "aliases": ["machine learning"],
    },

    "Deep Learning": {
        "category": "Data/ML",
        "aliases": ["deep learning"],
    },

    "TensorFlow": {
        "category": "Data/ML",
        "aliases": ["tensorflow"],
    },

    "PyTorch": {
        "category": "Data/ML",
        "aliases": ["pytorch"],
    },

    "Pandas": {
        "category": "Data/ML",
        "aliases": ["pandas"],
    },

    "NumPy": {
        "category": "Data/ML",
        "aliases": ["numpy"],
    },

    "Scikit-learn": {
        "category": "Data/ML",
        "aliases": [
            "scikit-learn",
            "sklearn",
        ],
    },

    "NLP": {
        "category": "Data/ML",
        "aliases": [
            "nlp",
            "natural language processing",
        ],
    },

    "Spark": {
        "category": "Data/ML",
        "aliases": [
            "spark",
            "pyspark",
        ],
    },

    "Kafka": {
        "category": "Data/ML",
        "aliases": ["kafka"],
    },

    "Airflow": {
        "category": "Data/ML",
        "aliases": ["airflow"],
    },

    "Tableau": {
        "category": "Data/ML",
        "aliases": ["tableau"],
    },

    "Power BI": {
        "category": "Data/ML",
        "aliases": [
            "power bi",
            "powerbi",
        ],
    },

    "Excel": {
        "category": "Data/ML",
        "aliases": [
            "Excel",
            "Microsoft Excel",
        ],
        "case_sensitive": True,
        "exclude_after": [
            r"\s+at\b",
            r"\s+in\b",
        ],
    },


    # -----------------------------------------------------
    # EMBEDDED SYSTEMS
    # -----------------------------------------------------

    "ESP32": {
        "category": "Embedded Systems",
        "aliases": ["esp32"],
    },

    "ESP32-CAM": {
        "category": "Embedded Systems",
        "aliases": [
            "esp32-cam",
            "esp32 cam",
        ],
    },

    "Arduino": {
        "category": "Embedded Systems",
        "aliases": ["arduino"],
    },

    "8051 Microcontroller": {
        "category": "Embedded Systems",
        "aliases": [
            "8051 microcontroller",
        ],
    },

    "ARM Architecture": {
        "category": "Embedded Systems",
        "aliases": [
            "arm architecture",
        ],
    },

    "Embedded Systems": {
        "category": "Embedded Systems",
        "aliases": [
            "embedded systems",
            "embedded system",
        ],
    },


    # -----------------------------------------------------
    # PRACTICES / CONCEPTS
    # -----------------------------------------------------

    "Agile": {
        "category": "Practices",
        "aliases": [
            "agile",
            "scrum",
        ],
    },

    "System Design": {
        "category": "Practices",
        "aliases": [
            "system design",
        ],
    },

    "Unit Testing": {
        "category": "Practices",
        "aliases": [
            "unit testing",
            "unit tests",
            "pytest",
            "jest",
        ],
    },

    "Data Structures": {
        "category": "Practices",
        "aliases": [
            "data structures",
        ],
    },

    "Algorithms": {
        "category": "Practices",
        "aliases": [
            "algorithms",
        ],
    },
}


# =========================================================
# REGEX BUILDER
# =========================================================

def _build_pattern(
    alias,
    case_sensitive=False,
    exclude_after=None,
    special=None,
):
    """
    Build a safe regex pattern for one skill alias.
    """

    flags = (
        0
        if case_sensitive
        else re.IGNORECASE
    )

    escaped_alias = re.escape(alias)

    # -----------------------------------------------------
    # C LANGUAGE
    # -----------------------------------------------------
    #
    # C is only one character, so it needs stricter
    # protection from words such as:
    #
    # CSS
    # Cloud
    # Communication
    #
    # We require C to be surrounded by non-letter/digit
    # characters.
    # -----------------------------------------------------

    if special == "single_letter_language":
        pattern = (
            r"(?<![A-Za-z0-9_+#])"
            + escaped_alias
            + r"(?![A-Za-z0-9_+#])"
        )

        return re.compile(
            pattern,
            flags,
        )

    # -----------------------------------------------------
    # NORMAL SKILLS
    # -----------------------------------------------------

    pattern = (
        r"(?<![A-Za-z0-9_+#.])"
        + escaped_alias
        + r"(?![A-Za-z0-9_+#])"
    )

    # -----------------------------------------------------
    # OPTIONAL EXCLUSIONS
    # -----------------------------------------------------

    if exclude_after:
        exclusions = "|".join(
            exclude_after
        )

        pattern = (
            r"(?<![A-Za-z0-9_+#.])"
            + escaped_alias
            + r"(?![A-Za-z0-9_+#])"
            + r"(?!"
            + exclusions
            + r")"
        )

    return re.compile(
        pattern,
        flags,
    )


# =========================================================
# COMPILE ALL SKILL PATTERNS
# =========================================================

_COMPILED = {}

for skill, info in SKILLS.items():

    patterns = []

    for alias in info["aliases"]:

        pattern = _build_pattern(
            alias=alias,
            case_sensitive=info.get(
                "case_sensitive",
                False,
            ),
            exclude_after=info.get(
                "exclude_after"
            ),
            special=info.get(
                "special"
            ),
        )

        patterns.append(pattern)

    _COMPILED[skill] = patterns


# =========================================================
# SKILL EXTRACTION
# =========================================================

def extract_skills(text):
    """
    Detect skills from resume text.

    Returns:
        set[str]
    """

    if not text:
        return set()

    found = set()

    for skill, patterns in _COMPILED.items():

        for pattern in patterns:

            if pattern.search(text):
                found.add(skill)
                break

    return found

