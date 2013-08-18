var config = module.exports;

config["Firestarter-Cluster"] = {
    env: "node",
    rootPath: "../",
    sources: [
    	"index.js"
    ],
    tests: [
        "test/*-test.js"
    ]
};
