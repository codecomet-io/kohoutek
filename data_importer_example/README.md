Lookie into index.ts for how to use the thing.

In a shell:

```

// a. retrieve the files
    let buff = readFileSync("../data_importer/mocks/simple-debian/llb.proto")
    let trace = readFileSync("../data_importer/mocks/simple-debian/success-fragment.json")

// b. have them be transformed into something usable
    let [aPipeline, tasks] = await Pantry(buff, trace, "{}")

// c. 

```