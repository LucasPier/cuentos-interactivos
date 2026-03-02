import os
import json
import re
import argparse

def main():
    parser = argparse.ArgumentParser(description="Compara las escenas y desafíos declarados en historia.json contra historia.md y los archivos JSON físicos.")
    parser.add_argument("--dir", required=True, help="Ruta absoluta al directorio de la historia (ej: d:/.../historias/el-misterio-del-bosque-encantado)")
    args = parser.parse_args()

    dir_base = args.dir
    historia_json_path = os.path.join(dir_base, "historia.json")
    historia_md_path = os.path.join(dir_base, "historia.md")
    dir_escenas = os.path.join(dir_base, "datos", "escenas")
    dir_desafios = os.path.join(dir_base, "datos", "desafios")

    if not os.path.exists(historia_json_path) or not os.path.exists(historia_md_path):
        print(f"Error: No se encontró {historia_json_path} o {historia_md_path}.")
        return

    # Leer historia.json
    with open(historia_json_path, "r", encoding="utf-8") as f:
        data_json = json.load(f)
        escenas_json = set(data_json.get("escenas", []))
        desafios_json = set(data_json.get("desafios", []))

    # Leer historia.md
    with open(historia_md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    escenas_md = set()
    for line in md_content.split("\n"):
        match_escena = re.match(r"### \*\*ESCENA: `(.+)`\*\*", line)
        if match_escena:
            escenas_md.add(match_escena.group(1).strip())

    escenas_archivos = set()
    if os.path.exists(dir_escenas):
        for f in os.listdir(dir_escenas):
            if f.endswith(".json"):
                escenas_archivos.add(f.replace(".json", ""))

    desafios_archivos = set()
    if os.path.exists(dir_desafios):
        for f in os.listdir(dir_desafios):
            if f.endswith(".json"):
                desafios_archivos.add(f.replace(".json", ""))

    diferencias = False

    # 1. Escenas en historia.json vs historia.md
    faltan_en_md = escenas_json - escenas_md
    faltan_en_json = escenas_md - escenas_json

    if faltan_en_md:
        print(f"❌ Escenas en historia.json pero que NO están documentadas en historia.md: {faltan_en_md}")
        diferencias = True
    if faltan_en_json:
        print(f"❌ Escenas documentadas en historia.md pero que NO están en historia.json: {faltan_en_json}")
        diferencias = True

    # 2. Escenas en historia.json vs archivos reales
    if os.path.exists(dir_escenas):
        faltan_archivos_esc = escenas_json - escenas_archivos
        sobran_archivos_esc = escenas_archivos - escenas_json

        if faltan_archivos_esc:
            print(f"❌ Escenas en historia.json pero sin archivo JSON en datos/escenas/: {faltan_archivos_esc}")
            diferencias = True
        if sobran_archivos_esc:
            print(f"❌ Archivos JSON en datos/escenas/ que NO están en historia.json: {sobran_archivos_esc}")
            diferencias = True

    # 3. Desafíos en historia.json vs archivos reales
    if os.path.exists(dir_desafios):
        faltan_archivos_des = desafios_json - desafios_archivos
        sobran_archivos_des = desafios_archivos - desafios_json

        if faltan_archivos_des:
            print(f"❌ Desafíos en historia.json pero sin archivo en datos/desafios/ (si corresponde): {faltan_archivos_des}")
            diferencias = True
        if sobran_archivos_des:
            print(f"❌ Archivos JSON en datos/desafios/ que NO están en historia.json: {sobran_archivos_des}")
            diferencias = True

    if not diferencias:
        print("✅ Todo correcto: Las escenas y desafíos en historia.json coinciden con historia.md y los archivos físicos.")
    else:
        print("\n⚠️ Se encontraron discrepancias que deben ser corregidas.")

if __name__ == "__main__":
    main()
