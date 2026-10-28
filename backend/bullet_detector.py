import re


WEAK_OPENERS = [
    r"^worked on\b",
    r"^helped\b",
    r"^assisted\b",
    r"^responsible for\b",
    r"^participated in\b",
    r"^involved in\b",
    r"^handled\b",
    r"^did\b",
]

VAGUE_PHRASES = [
    r"\bvarious\b",
    r"\bthings\b",
    r"\betc\.?\b",
    r"\bgood knowledge\b",
    r"\bgood understanding\b",
    r"\bstrong knowledge\b",
    r"\bfamiliar with\b",
]

ACTION_VERBS = [
    r"\bdeveloped\b",
    r"\bbuilt\b",
    r"\bdesigned\b",
    r"\bimplemented\b",
    r"\bcreated\b",
    r"\boptimized\b",
    r"\bautomated\b",
    r"\bimproved\b",
    r"\bled\b",
    r"\bengineered\b",
    r"\banalyzed\b",
    r"\bdeployed\b",
    r"\bconfigured\b",
    r"\bintegrated\b",
    r"\btested\b",
    r"\bdeveloped\b",
]


def has_metric(text):
    patterns = [
        r"\b\d+%?\b",
        r"\b\d+\+?\b",
        r"\$\s?\d+",
        r"\b\d+\s*(ms|sec|seconds|minutes|hours|days|weeks|months)\b",
    ]

    return any(re.search(pattern, text, re.IGNORECASE) for pattern in patterns)


def analyze_bullet(text):
    text = text.strip()

    findings = []

    if not text:
        findings.append(
            {
                "type": "empty",
                "message": "Bullet is empty.",
            }
        )
        return findings

    for pattern in WEAK_OPENERS:
        if re.search(pattern, text, re.IGNORECASE):
            findings.append(
                {
                    "type": "weak_opener",
                    "message": "Starts with a weak or passive phrase.",
                }
            )
            break

    for pattern in VAGUE_PHRASES:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            findings.append(
                {
                    "type": "vague_language",
                    "message": f'Contains vague wording: "{match.group(0)}".',
                }
            )

    if not has_metric(text):
        findings.append(
            {
                "type": "missing_metric",
                "message": "No measurable result, scale, quantity, or time value detected.",
            }
        )

    has_action_verb = any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in ACTION_VERBS
    )

    if not has_action_verb:
        findings.append(
            {
                "type": "missing_action",
                "message": "No strong action verb detected.",
            }
        )

    if len(text) < 35:
        findings.append(
            {
                "type": "too_short",
                "message": "Bullet may be too short to show meaningful impact.",
            }
        )

    return findings