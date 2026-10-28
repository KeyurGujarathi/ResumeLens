# Career domain taxonomy for ResumeLens.
#
# This file is intentionally kept separate from the API code.
# The goal is to have one central place for:
# 1. Career domains
# 2. Job-title keywords
# 3. Skill keywords
#
# The job-classification layer uses these rules to assign
# one or more career domains to each JobPosting.


CAREER_DOMAINS = {
    "Software / IT": {
        "description": "Software development, web development, backend, frontend, and general IT roles.",
        "job_title_keywords": [
            "software engineer",
            "software developer",
            "web developer",
            "frontend engineer",
            "frontend developer",
            "backend engineer",
            "backend developer",
            "full stack engineer",
            "full stack developer",
            "full-stack engineer",
            "full-stack developer",
            "application developer",
            "application engineer",
            "software development engineer",
            "sde",
            "developer",
            "programmer",
            "web engineer",
        ],
        "skills": [
            "Python",
            "Java",
            "C",
            "C++",
            "C#",
            "JavaScript",
            "TypeScript",
            "React",
            "Vue",
            "Angular",
            "HTML",
            "CSS",
            "Tailwind CSS",
            "Next.js",
            "Redux",
            "Node.js",
            "FastAPI",
            "Django",
            "Flask",
            "Spring Boot",
            "Express",
            ".NET",
            "GraphQL",
            "REST APIs",
            "Microservices",
            "SQL",
            "PostgreSQL",
            "MySQL",
            "MongoDB",
            "Redis",
            "SQLite",
            "Git",
            "Data Structures",
            "Algorithms",
            "System Design",
            "Unit Testing",
        ],
    },

    "AI / ML / Data": {
        "description": "Artificial intelligence, machine learning, data science, analytics, and data engineering roles.",
        "job_title_keywords": [
            "machine learning engineer",
            "ml engineer",
            "ai engineer",
            "artificial intelligence engineer",
            "data scientist",
            "data analyst",
            "data engineer",
            "machine learning scientist",
            "research scientist",
            "computer vision engineer",
            "nlp engineer",
            "deep learning engineer",
            "analytics engineer",
        ],
        "skills": [
            "Python",
            "Machine Learning",
            "Deep Learning",
            "TensorFlow",
            "PyTorch",
            "Pandas",
            "NumPy",
            "Scikit-learn",
            "NLP",
            "Spark",
            "Kafka",
            "Airflow",
            "SQL",
            "Tableau",
            "Power BI",
        ],
    },

    "Cloud / DevOps": {
        "description": "Cloud infrastructure, deployment, automation, platform engineering, and DevOps roles.",
        "job_title_keywords": [
            "devops engineer",
            "devops developer",
            "cloud engineer",
            "cloud developer",
            "cloud architect",
            "site reliability engineer",
            "sre",
            "platform engineer",
            "infrastructure engineer",
            "cloud operations engineer",
            "release engineer",
            "build engineer",
        ],
        "skills": [
            "AWS",
            "Azure",
            "GCP",
            "Google Cloud",
            "Docker",
            "Kubernetes",
            "Terraform",
            "CI/CD",
            "Linux",
            "Git",
            "Python",
            "Shell",
            "Microservices",
        ],
    },

    "Embedded / IoT / Robotics": {
        "description": "Embedded systems, firmware, microcontrollers, IoT, robotics, and connected devices.",
        "job_title_keywords": [
    "embedded engineer",
    "embedded systems engineer",
    "embedded software engineer",
    "embedded developer",
    "firmware engineer",
    "firmware developer",
    "iot engineer",
    "iot developer",
    "robotics engineer",
    "robotics software engineer",
    "robotics developer",
    "embedded firmware engineer",
    "microcontroller engineer",
],
        "skills": [
            "C",
            "C++",
            "ESP32",
            "ESP32-CAM",
            "Arduino",
            "STM32",
            "8051 Microcontroller",
            "ARM Architecture",
            "Embedded Systems",
            "Microcontrollers",
            "RTOS",
            "IoT",
            "Sensors",
            "Motor Drivers",
            "L298N",
            "Microprocessors & Microcontrollers",
        ],
    },

    "Electronics / Hardware": {
        "description": "Electronic hardware design, circuits, PCB development, instrumentation, and hardware systems.",
        "job_title_keywords": [
    "hardware engineer",
    "hardware systems engineer",
    "hardware design engineer",
    "electronics engineer",
    "electronics design engineer",
    "electrical hardware engineer",
    "pcb design engineer",
    "electronics hardware engineer",
    "circuit design engineer",
    "electronics test engineer",
    "hardware validation engineer",
    "network hardware engineer",
],
        "skills": [
            "C",
            "C++",
            "ESP32",
            "Arduino",
            "STM32",
            "8051 Microcontroller",
            "ARM Architecture",
            "Microcontrollers",
            "Sensors",
            "PCB",
            "Circuit Design",
            "Analog Electronics",
            "Digital Electronics",
            "Oscilloscope",
            "Altium",
            "KiCad",
            "Microprocessors & Microcontrollers",
            "Signals & Systems",
            "Communication",
        ],
    },

    "VLSI / Semiconductor": {
        "description": "Digital design, RTL, FPGA, ASIC, verification, semiconductor, and VLSI roles.",
        "job_title_keywords": [
            "vlsi engineer",
            "vlsi design engineer",
            "rtl design engineer",
            "rtl engineer",
            "asic engineer",
            "asic design engineer",
            "fpga engineer",
            "fpga design engineer",
            "design verification engineer",
            "verification engineer",
            "physical design engineer",
            "semiconductor engineer",
            "chip design engineer",
            "digital design engineer",
        ],
        "skills": [
            "Verilog",
            "SystemVerilog",
            "VLSI",
            "RTL",
            "ASIC",
            "FPGA",
            "Cadence",
            "Synopsys",
            "Digital Design",
            "Digital Electronics",
            "C",
            "C++",
        ],
    },

    "Electrical / Core": {
        "description": "Electrical engineering, power systems, machines, controls, and electrical core roles.",
        "job_title_keywords": [
            "electrical engineer",
            "electrical design engineer",
            "power systems engineer",
            "power electronics engineer",
            "control systems engineer",
            "controls engineer",
            "electrical maintenance engineer",
            "electrical project engineer",
            "electrical systems engineer",
        ],
        "skills": [
            "C",
            "C++",
            "MATLAB",
            "Simulink",
            "Circuit Design",
            "Digital Electronics",
            "Analog Electronics",
            "Power Electronics",
            "Control Systems",
            "Sensors",
            "Microcontrollers",
        ],
    },

    "Mechanical / Core": {
        "description": "Mechanical design, manufacturing, CAD, materials, thermal systems, and mechanical core roles.",
        "job_title_keywords": [
            "mechanical engineer",
            "mechanical design engineer",
            "design engineer",
            "manufacturing engineer",
            "production engineer",
            "automotive engineer",
            "automotive design engineer",
            "cad engineer",
            "product design engineer",
            "mechanical systems engineer",
            "thermal engineer",
            "maintenance engineer",
        ],
        "skills": [
            "SolidWorks",
            "CATIA",
            "ANSYS",
            "AutoCAD",
            "GD&T",
            "CNC",
            "Manufacturing",
            "Thermodynamics",
            "Fluid Mechanics",
            "Mechanical Design",
            "CAD",
        ],
    },

    "Civil / Core": {
        "description": "Civil engineering, structural engineering, construction, infrastructure, and site roles.",
        "job_title_keywords": [
            "civil engineer",
            "structural engineer",
            "construction engineer",
            "site engineer",
            "civil design engineer",
            "structural design engineer",
            "transportation engineer",
            "geotechnical engineer",
            "water resources engineer",
        ],
        "skills": [
            "AutoCAD",
            "STAAD Pro",
            "Revit",
            "Civil 3D",
            "Structural Design",
            "Surveying",
            "Construction",
            "Geotechnical Engineering",
            "Concrete Technology",
        ],
    },
}


def get_career_domains():
    """
    Return the complete career-domain taxonomy.
    """
    return CAREER_DOMAINS


def get_domain_names():
    """
    Return only the available career-domain names.
    """
    return list(CAREER_DOMAINS.keys())


def get_domain(domain_name):
    """
    Return one domain definition.

    Returns None if the domain does not exist.
    """
    return CAREER_DOMAINS.get(domain_name)


def get_domain_skills(domain_name):
    """
    Return the skills associated with a career domain.
    """
    domain = CAREER_DOMAINS.get(domain_name)

    if not domain:
        return []

    return domain["skills"]


def get_domain_job_title_keywords(domain_name):
    """
    Return the job-title keywords associated with a career domain.
    """
    domain = CAREER_DOMAINS.get(domain_name)

    if not domain:
        return []

    return domain["job_title_keywords"]