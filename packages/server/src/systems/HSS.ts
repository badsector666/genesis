import fs from 'fs';
import path from 'path';


/**
 *List all json files in a directory
 * @param dir
 * @returns jsonFiles
 */
export function  getJsonFiles(dir: string) {
    const files = fs.readdirSync(dir);
    const jsonFiles: string[] = [];

    for (const file of files) {
        if (file.endsWith(".json")) {
            jsonFiles.push(file);
        }
    }

    return jsonFiles;
}

/**
 * Search json files in a directory
 * @param dir
 * @param query
 * @returns jsonFiles
 */
export function searchJsonFiles(dir: string, query: string) {
    const files = fs.readdirSync(dir);
    const jsonFiles: string[] = [];

    for (const file of files) {
        if (file.endsWith(".json") && file.includes(query)) {
            jsonFiles.push(file);
        }
    }

    return jsonFiles;
}

// Le chemin par défault, c'est path.join(__dirname, "..", "json"),
// Ou __dirname est le dossier courant, donc packages\server\src\systems
// Donc le chemin par défault est packages\server\src\json

// Le but, c'est d'utiliser fs pour lister les fichiers dans le dossier json
// ensuite, de voir comment faire une recherche

// Le truc se base en deux parties, ici, c'est la fonction qui prend des arguments classiques
// et dans le dossier /scripts, on aura "score.ts" similaire à generate.ts, le système d'options est
// le même, ça utilise minimist pour prendre des paramètres, je te laisse regarder tout ça
// ET HÉSITE PAS À ME DEMANDER SI TU COMPRENDS PAS UN TRUC