# This is how we want sortDependences to return data
```
{
  toAddToRoot: {
    'dependencyJ': '12.1.4'
  },
  toRemoveFromApp: {
    './mock-mono-repo/apps/app1/dummypackage.json': [ 'dependencyC','dependencyJ' ],
    './mock-mono-repo/apps/app2/dummypackage.json': [ 'dependencyJ' ]
    './mock-mono-repo/apps/app3/dummypackage.json': {}
  }
}
```