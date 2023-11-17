import { readdirSync, readFileSync, lstatSync, writeFileSync, rmSync, mkdirSync, existsSync } from "fs";
import path from 'path'

const UPDATED_FOLDER = 'UPDATED';
const IGNORED_DIRECTORIES = ['node_modules', UPDATED_FOLDER];
const START_FOLDER = './mock-mono-repo';
const TARGET_FILE = '.package.json';
const rootPath = `${START_FOLDER}/${TARGET_FILE}`;
const UPDATED_ROOT = './UPDATED';

export interface SharedDeps {
    ['key=string']?: {
        ['key=string']: string[]
    };
}

export interface SortInstructions {
    toAddToRoot: any,
    toRemoveFromApp: any
}

interface AppFile {
    file: string,
    dependencies: {
        ['key=string']:string
    };
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

        appFiles.forEach(({ file, dependencies }) => {
            const thisDep = Object.keys(dependencies)[i];

            if(!!thisDep) {
                areThereMoreDeps = true
                
                shared[thisDep] = {
                    ...shared[thisDep],
                    [file]: dependencies[thisDep]
                }
            }   
        })

        if(!areThereMoreDeps) {
            thereAreStillMorePackagesFam = false
        } else {
            i++
        }
    }
    return shared
}

export function sortDependencies(sharedDeps: SharedDeps){
    const sortInstructions: SortInstructions = {
        toAddToRoot: {},
        toRemoveFromApp: {},
    }

    Object.keys(sharedDeps).forEach(dep => {
        const thisDep = sharedDeps[dep];
        const versions = Object.values(thisDep);
        const uniqueVersions = new Set(versions).size;

        if( uniqueVersions === 1){
            const key = Object.keys(thisDep)[0]
            const val = versions[0]

            sortInstructions.toAddToRoot[dep] = val
            sortInstructions.toRemoveFromApp[key] = [
                ...(sortInstructions.toRemoveFromApp[key] || []),
                dep
            ]
        } else {
            // TODO: handle situations where we can consolidate similar versions
        }
    })
    return sortInstructions
}

export function generateNewPackageFiles(sortedDeps: SortInstructions, rootPath?: string) {
    const { toAddToRoot, toRemoveFromApp } = sortedDeps;
    const toWrite = {}

    Object.keys(toRemoveFromApp).forEach(path => {
        const file = JSON.parse(readFileSync(path, 'utf-8'));

        toRemoveFromApp[path].forEach(d => {
            delete file.dependencies[d]
        })

        toWrite[path] = file
    });

    if( rootPath ) {
        const rootFile = JSON.parse(readFileSync(rootPath, 'utf-8'));

        Object.keys(toAddToRoot).forEach(d => {
            rootFile.dependencies[d] = toAddToRoot[d]
        })

        toWrite[rootPath] = rootFile
    }

    return toWrite;
}

export function createNewPackageFiles(generated: any, actuallyChangeFiles?: boolean) {
    if( actuallyChangeFiles ) {
        rmSync(UPDATED_ROOT, { recursive: true, force: true});
        mkdirSync(UPDATED_ROOT);
    }

    Object.keys(generated).forEach(filePath => {
        const reg = new RegExp(`${START_FOLDER}\/((?<path>(\\S+)\/)?${TARGET_FILE})`)
        const {path = ''} = filePath.match(reg)?.groups as { path: string};
        const newPath = `${UPDATED_ROOT}/${path}`

        if( actuallyChangeFiles ) {
            if( newPath && !existsSync(newPath)) mkdirSync(newPath, {recursive: true})

            writeFileSync(`${UPDATED_ROOT}/${path}${TARGET_FILE}`, JSON.stringify(generated[filePath]), 'utf8')
        }
    })
    return 'Done!';
}


const filesToParse = readDirectoryFiles(START_FOLDER, TARGET_FILE);
const shared = parseAppDependencies(filesToParse);
const sortedDeps = sortDependencies(shared);
const generated = generateNewPackageFiles(sortedDeps, rootPath);
createNewPackageFiles(generated, process.argv.includes('actuallyChangeFiles'));