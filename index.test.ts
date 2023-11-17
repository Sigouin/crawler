import {
    readDirectoryFiles,
    parseAppDependencies, 
    sortDependencies,
    generateNewPackageFiles,
    createNewPackageFiles,
    SharedDeps
} from "."

describe('Node package.json Combiner', () => {
  const START_FOLDER = './mock-mono-repo';
  const TARGET_FILE = 'package.json';
  const rootPath = `${START_FOLDER}/${TARGET_FILE}`;

  let filesToParse: Array<string> = [];
  let shared: SharedDeps;
  let sortedDeps;
  let generated;
  let created;

  beforeAll(() => {
    filesToParse = readDirectoryFiles(START_FOLDER, TARGET_FILE);
    shared = parseAppDependencies(filesToParse);
    sortedDeps = sortDependencies(shared);
    generated = generateNewPackageFiles(sortedDeps, rootPath);
    created = createNewPackageFiles(generated);
  })

  describe('readDirectoryFiles', () => { 
    test('retrieves 4 file paths', () =>{
      expect(filesToParse.sort()).toEqual([
          `${START_FOLDER}/apps/app1/${TARGET_FILE}`,
          `${START_FOLDER}/apps/app2/${TARGET_FILE}`,
          `${START_FOLDER}/apps/app3/${TARGET_FILE}`,
      ].sort())
    })
  })

  describe('parseAppDependencies', () => {
    test('should create shared dependencies list as expected', () => {
      expect(shared).toEqual({
        dependencyC: {
          [`./mock-mono-repo/apps/app1/${TARGET_FILE}`]: '12.1.4',
          [`./mock-mono-repo/apps/app3/${TARGET_FILE}`]: '~12.21.4'
        },
        dependencyG: {
          [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '^0.5.0',
          [`./mock-mono-repo/apps/app1/${TARGET_FILE}`]: '^0.5.0'
        },
        dependencyE: {
          [`./mock-mono-repo/apps/app1/${TARGET_FILE}`]: '18.0.0',
          [`./mock-mono-repo/apps/app3/${TARGET_FILE}`]: '8.0.0'
        },
        dependencyH: { [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '^2.4.4' },
        dependencyD: { [`./mock-mono-repo/apps/app3/${TARGET_FILE}`]: '11.0.0' },
        dependencyI: {
          [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '8.14.0',
          [`./mock-mono-repo/apps/app3/${TARGET_FILE}`]: '~3.12.0'
        },
        dependencyJ: {
          [`./mock-mono-repo/apps/app1/${TARGET_FILE}`]: '12.1.4',
          [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '12.1.4'
        },
        dependencyL: {
          [`./mock-mono-repo/apps/app1/${TARGET_FILE}`]: '^3.0.23',
          [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '^3.0.0'
        },
        dependencyK: { [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '^9.4.12' },
        dependencyZ: {
          [`./mock-mono-repo/apps/app3/${TARGET_FILE}`]: '1.1.1',
          [`./mock-mono-repo/apps/app1/${TARGET_FILE}`]: '1.1.1',
          [`./mock-mono-repo/apps/app2/${TARGET_FILE}`]: '1.1.1'
        }
      })
    })
  }) 

  describe('sortDependencies', () => {
    test('should be able to sort out dependencies with a single version across apps', () => {
      expect(sortedDeps).toEqual({
        "toAddToRoot": {
            "dependencyD": "11.0.0",
            "dependencyG": "^0.5.0",
            "dependencyH": "^2.4.4",
            "dependencyJ": "12.1.4",
            "dependencyK": "^9.4.12",
            "dependencyZ": "1.1.1"
        },
        "toRemoveFromApp": {
            "./mock-mono-repo/apps/app1/package.json": [
                "dependencyJ"
            ],
            "./mock-mono-repo/apps/app2/package.json": [
                "dependencyG",
                "dependencyH",
                "dependencyK"
            ],
            "./mock-mono-repo/apps/app3/package.json": [
                "dependencyD",
                "dependencyZ"
            ]
        }
      })
    })
  })

  describe('generateNewPackageFiles', () => {
    test('generates package contents as expected', () => {
      expect(generated).toEqual([
        {
          './mock-mono-repo/package.json': {
            exports: 'IAMTHEROOT',
            type: 'module',
            scripts: [Object],
            dependencies: [Object]
          }
        },
        {
          './mock-mono-repo/apps/app3/package.json': {
            exports: 'APP3-package.json',
            type: 'module',
            scripts: [Object],
            dependencies: [Object]
          }
        },
        {
          './mock-mono-repo/apps/app2/package.json': {
            exports: 'APP2-package.json',
            type: 'module',
            scripts: [Object],
            dependencies: [Object]
          }
        },
        {
          './mock-mono-repo/apps/app1/package.json': {
            exports: 'APP1-package.json',
            type: 'module',
            scripts: [Object],
            dependencies: [Object]
          }
        },
      ])
    })
  })

  describe('createNewPackageFiles', () => {
    test('WRITE FILES!!!', () => {
      expect(created).toEqual('Done!')
    });
  })
})