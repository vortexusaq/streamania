import json
import os
import glob
from datetime import datetime

def generate_index():
    print("🔍 Recherche des fichiers anime...")
    
    # Liste pour stocker les noms de fichiers
    anime_files = []
    
    # Chercher tous les fichiers .json dans le dossier actuel
    for file in os.listdir('.'):
        if file.endswith('.json') and file != 'index.json':
            anime_files.append(file)
    
    # Trier par ordre alphabétique
    anime_files.sort()
    
    # Créer l'objet JSON
    index_data = {
        "files": anime_files,
        "lastUpdated": datetime.now().strftime("%Y-%m-%d")
    }
    
    # Écrire dans index.json
    with open('index.json', 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ index.json créé avec succès!")
    print(f"📊 {len(anime_files)} fichiers indexés")
    
    # Afficher la liste
    print("\n📋 Fichiers trouvés :")
    for file in anime_files:
        print(f"  • {file}")

if __name__ == "__main__":
    print("=" * 50)
    print("🎌 GÉNÉRATEUR D'INDEX ANIME")
    print("=" * 50)
    generate_index()