import { readdirSync, readFileSync, lstatSync, writeFileSync, rmSync, mkdirSync, existsSync, readFile } from "fs";
import path from 'path'

const UPDATED_FOLDER = 'UPDATED';
const IGNORED_DIRECTORIES = ['node_modules', UPDATED_FOLDER];
const START_FOLDER = './mock-mono-repo';
const TARGET_FILE = '.package.json';
const rootPath = `${START_FOLDER}/${TARGET_FILE}`;
const UPDATED_ROOT = './UPDATED';

export interface SharedDeps {
    [key: string]: {[key:string]: string[]};
}

export interface SortInstructions {
    toAddToRoot: any;
    toRemoveFromApp: any;
}

interface AppFile {
    file: string;
    dependencies: {[key:string]:string};
}

export function readDirectoryFiles(currentFolder, targetFile) {
    const rootFile = `${currentFolder}/${targetFile}`

    function crawlDirectories(folder) {
        const matches: Array<string> = [];
        const results = readdirSync(folder, "utf8");

        results.forEach(result => {
            const resultData = lstatSync(path.resolve(folder, result));
            const currentPath = `${folder}/${result}`

            if(
                resultData.isFile()
                && result === targetFile
                && currentPath !== rootFile
            ) {
                return matches.push(currentPath)
            }

            if(
                resultData.isDirectory() && !IGNORED_DIRECTORIES.includes(result)
            ){
                return matches.push(...crawlDirectories(currentPath))
            }
        })
        return matches
    }
    return crawlDirectories(currentFolder);
}

export function parseAppDependencies(filesToParse: string[]): SharedDeps {
    const appFiles: Array<AppFile> = filesToParse.map((file) => ({
        file,
        dependencies: JSON.parse(readFileSync(file, 'utf-8')).dependencies
    }))
    const shared: SharedDeps = {}

    let thereAreStillMorePackagesFam = true;
    let i = 0;

    while( thereAreStillMorePackagesFam ){
        let areThereMoreDeps = false;

        appFiles.forEach(({file, dependencies}) => {
            const thisDep = Object.keys(dependencies)[i];

            
        })
    }
}

export function sortDependencies()

export function generateNewPackageFiles()

export function createNewPackageFiles()