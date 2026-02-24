import os
import json
import re
import argparse

def main():
    parser = argparse.ArgumentParser(description="Compara los textos narrativos de los JSON de escenas con historia.md.")
    parser.add_argument("--dir", required=True, help="Ruta absoluta al directorio de la historia (ej: d:/.../historias/el-misterio-del-bosque-encantado)")
    args = parser.parse_args()

    dir_base = args.dir
    dir_escenas = os.path.join(dir_base, "datos", "escenas")
    historia_md = os.path.join(dir_base, "historia.md")

    if not os.path.exists(dir_escenas) or not os.path.exists(historia_md):
        print(f"Error: No se encontró {dir_escenas} o {historia_md}.")
        return

    with open(historia_md, "r", encoding="utf-8") as f:
        md_content = f.read()

    escenas = {}
    for filename in os.listdir(dir_escenas):
        if filename.endswith(".json"):
            with open(os.path.join(dir_escenas, filename), "r", encoding="utf-8") as f:
                data = json.load(f)
                escenas[data["id"]] = data

    md_escenas = {}
    current_escena = None
    current_texto = []
    in_texto = False

    for line in md_content.split("\n"):
        match_escena = re.match(r"### \*\*ESCENA: `(.+)`\*\*", line)
        if match_escena:
            current_escena = match_escena.group(1)
            md_escenas[current_escena] = ""
            in_texto = False
            continue
        
        if current_escena:
            if line.strip() == "*   **TEXTO:**":
                in_texto = True
                current_texto = []
                continue
            elif in_texto and line.startswith("*   **"):
                in_texto = False
                md_escenas[current_escena] = "\n".join(current_texto).strip()
                continue
            
            if in_texto:
                # quitar el "> " inicial
                if line.strip().startswith("> "):
                    current_texto.append(line.strip()[2:])
                elif line.strip().startswith(">"):
                    current_texto.append(line.strip()[1:])

    if in_texto and current_escena:
        md_escenas[current_escena] = "\n".join(current_texto).strip()

    diffs_found = False
    for esc_id, data in escenas.items():
        json_text = data.get("texto", "")
        md_text = md_escenas.get(esc_id, "")
        
        if json_text.strip() != md_text.strip():
            diffs_found = True
            print(f"----- DIFF EN ESCENA: {esc_id} -----")
            print("JSON DICE:")
            print(repr(json_text))
            print("MD DICE:")
            print(repr(md_text))
            print()

    if not diffs_found:
        print("✅ Todo correcto: Los textos narrativos de JSON y MD coinciden perfectamente.")
    else:
        print("❌ Se encontraron diferencias (ver arriba).")

if __name__ == "__main__":
    main()
