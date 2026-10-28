import httpx

TOKENS = [
    "coinbase",
    "gitlab",
    "reddit",
    "pinterest",
    "robinhood",
    "instacart",
    "asana",
    "mongodb",
    "elastic",
    "okta",
    "lyft",
]


def probe(token):
    url = f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs"
    try:
                response = httpx.get(url, timeout=60)
    except httpx.HTTPError as error:
        return f"network error: {error}"

    if response.status_code == 404:
        return "404 (no Greenhouse board under this name)"
    if response.status_code != 200:
        return f"unexpected status {response.status_code}"

    jobs = response.json().get("jobs", [])
    return f"{len(jobs)} jobs"


for token in TOKENS:
    print(f"{token:12} -> {probe(token)}")