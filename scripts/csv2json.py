import csv
import json
from pathlib import Path

INPUT_CSV = "directorio.csv"
OUTPUT_JSON = "../directorio.json"


def is_section_row(row):
    if not row or not row[0]:
        return False

    non_empty = [cell.strip() for cell in row if cell.strip()]
    return len(non_empty) == 1 and row[0].strip().isupper()


def is_header_row(row):
    return row and "NOMBRE" in row


def normalize(value):
    value = value.strip()
    return value if value else None


sections = []
current_section = None

with open(INPUT_CSV, newline="", encoding="latin-1") as csvfile:
    reader = csv.reader(csvfile, delimiter=";")

    for row in reader:
        # Normalize row length
        row = row + [""] * (6 - len(row))
        row = [cell.strip() for cell in row]

        # Skip empty rows
        if not any(row):
            continue

        # Skip month / decorative rows
        if row[0].startswith("Mayo"):
            continue

        # Skip column header row
        if is_header_row(row):
            continue

        # Section detection
        if is_section_row(row):
            current_section = {"name": row[0].title(), "contacts": []}
            sections.append(current_section)
            continue

        # Data rows require an active section
        if not current_section:
            continue

        _, name, extension, cubicle, position, email = row

        # Skip rows without a name
        if not name:
            continue

        contact = {
            "name": name,
            "position": normalize(position),
            "extension": normalize(extension),
            "cubicle": normalize(cubicle),
            "email": normalize(email),
        }

        current_section["contacts"].append(contact)

output = {
    "updatedAt": "2025-05",
    "organization": "CRIT Hidalgo",
    "sections": sections,
}

Path(OUTPUT_JSON).write_text(
    json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8"
)

print(f"JSON file generated: {OUTPUT_JSON}")
