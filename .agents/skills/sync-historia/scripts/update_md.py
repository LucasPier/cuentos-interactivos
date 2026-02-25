import os
import json
import re
import argparse
import shutil

def main():
    parser = argparse.ArgumentParser(description="Actualiza el texto narrativo de historia.md utilizando los valores de los JSON de escenas.")
    parser.add_argument("--dir", required=True, help="Ruta absoluta al directorio de la historia (ej: d:/.../historias/el-misterio-del-bosque-encantado)")
    parser.add_argument("--in-place", action="store_true", help="Sobreescribe historia.md directamente en lugar de crear historia_nueva.md")
    args = parser.parse_args()

    dir_base = args.dir
    dir_escenas = os.path.join(dir_base, "datos", "escenas")
    historia_md = os.path.join(dir_base, "historia.md")

    if not os.path.exists(dir_escenas) or not os.path.exists(historia_md):
        print(f"Error: No se encontró {dir_escenas} o {historia_md}.")
        return

    output_md = historia_md if args.in_place else os.path.join(dir_base, "historia_nueva.md")
    
    # Manejar backup por seguridad
    if args.in_place:
        shutil.copy2(historia_md, historia_md + ".bak")
        print(f"Backup creado en {historia_md}.bak")

    with open(historia_md, "r", encoding="utf-8") as f:
        lines = f.readlines()

    escenas = {}
    for filename in os.listdir(dir_escenas):
        if filename.endswith(".json"):
            with open(os.path.join(dir_escenas, filename), "r", encoding="utf-8") as f:
                data = json.load(f)
                escenas[data["id"]] = data

    new_lines = []
    current_escena = None
    in_texto = False

    i = 0
    while i < len(lines):
        line = lines[i]
        
        match_escena = re.match(r"### \*\*ESCENA: `(.+)`\*\*", line)
        if match_escena:
            current_escena = match_escena.group(1)
            new_lines.append(line)
            in_texto = False
            i += 1
            continue
        
        if current_escena:
            if line.strip() == "*   **TEXTO:**":
                new_lines.append(line)
                in_texto = True
                
                # Escribir el nuevo texto del JSON
                json_text = escenas[current_escena].get("texto", "")
                if json_text:
                    for t_line in json_text.split("\n"):
                        new_lines.append(f"    > {t_line}\n")
                
                # Saltar lineas originales del texto en md
                i += 1
                while i < len(lines) and lines[i].strip().startswith(">"):
                    i += 1
                continue
                
            elif in_texto and line.startswith("*   **"):
                in_texto = False
            
        new_lines.append(line)
        i += 1

    with open(output_md, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

    print(f"✅ Archivo guardado correctamente en {output_md}")
    if not args.in_place:
        print("Para aplicar los cambios definitivos puedes renombrarlo manualmente o correr el script con --in-place.")

if __name__ == "__main__":
    main()
