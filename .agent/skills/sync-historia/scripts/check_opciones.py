import os
import json
import re
import argparse

def main():
    parser = argparse.ArgumentParser(description="Compara los botones/opciones de los JSON con historia.md.")
    parser.add_argument("--dir", required=True, help="Ruta absoluta al directorio de la historia (ej: d:/.../historias/el-misterio-del-bosque-encantado)")
    args = parser.parse_args()

    dir_base = args.dir
    dir_escenas = os.path.join(dir_base, "datos", "escenas")
    historia_md = os.path.join(dir_base, "historia.md")

    if not os.path.exists(dir_escenas) or not os.path.exists(historia_md):
        print(f"Error: No se encontró {dir_escenas} o {historia_md}.")
        return

    with open(historia_md, "r", encoding="utf-8") as f:
        lines = f.readlines()

    escenas = {}
    for filename in os.listdir(dir_escenas):
        if filename.endswith(".json"):
            with open(os.path.join(dir_escenas, filename), "r", encoding="utf-8") as f:
                data = json.load(f)
                escenas[data["id"]] = data

    current_escena = None
    in_opciones = False
    md_opciones = {}

    for line in lines:
        match_escena = re.match(r"### \*\*ESCENA: `(.+)`\*\*", line)
        if match_escena:
            current_escena = match_escena.group(1)
            in_opciones = False
            md_opciones[current_escena] = []
            continue
        
        if current_escena:
            if line.strip() == "*   **OPCIONES:**":
                in_opciones = True
                continue
            elif line.startswith("### **ESCENA") or line.strip() == "---":
                in_opciones = False
                continue
                
            if in_opciones:
                # Formato: 1.  **Botón 1:** "Salir a explorar" -> Va a `ENCUENTRO_PADRES`.
                match_btn = re.match(r"\s*\d+\.\s+\*\*Botón \d+.*?\*\*\s+\"(.*?)\"", line)
                if match_btn:
                    md_opciones[current_escena].append(match_btn.group(1))

    diffs_found = False
    for esc_id, data in escenas.items():
        if not "opciones" in data: continue
        json_btns = [o.get("texto", "") for o in data["opciones"]]
        md_btns = md_opciones.get(esc_id, [])
        
        if len(json_btns) != len(md_btns):
            diffs_found = True
            print(f"[{esc_id}] Diferente cantidad de opciones: json {len(json_btns)} vs md {len(md_btns)}")
            continue
            
        for i in range(len(json_btns)):
            if json_btns[i].strip() != md_btns[i].strip():
                diffs_found = True
                print(f"[{esc_id}] Opcion {i+1} difiere:\n  JSON: {json_btns[i]}\n  MD:   {md_btns[i]}")

    if not diffs_found:
        print("✅ Todo correcto: Las opciones coinciden.")
    else:
        print("⚠️ Hay discrepancias en las opciones (NOTA: A veces MD incluye información de desafíos que no está en el JSON de la escena, procede con cuidado).")

if __name__ == "__main__":
    main()
