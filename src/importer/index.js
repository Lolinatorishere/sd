// Import necessary modules
const fs = require('fs');
const path = require('path');
const axios = require("axios")
const knex = require('./knex')

async function fetchAllData(apiUrl) {
    let offset = 0;
    const limit = 10; // Define the limit of records to fetch per request

    const url = `${apiUrl}?$order=id&$limit=${limit}&$offset=${offset}`;
    try {
        let response = await axios.get(url)

        console.log(response.data);
        for (let i = 0; i < response.data.length; i++) {
            console.log(response.data[i].id)
        }
    } catch (error) {
        console.error("error Fetching from Api:", error)
        throw error
    }

}// HelloWorld module
const HelloWorld = {
    say: function () {
        console.log("Hello, World!!");
    }
};

// JSONObserver module
const JSONObserver = {
    list: function () {
        console.log("Listing all available JSON files!");
        try {
            const files = fs.readdirSync("/data");
            files.filter(file => file.endsWith(".json")).forEach(this.processFile);
        } catch (error) {
            console.log(`Error accessing /data: ${error}`);
        }
    },

    processFile: function (fileName) {
        console.log(`Processing file: ${fileName}`);
        const filePath = path.join("/data", fileName);
        const content = fs.readFileSync(filePath, 'utf8');
        JSONObserver.parse(content);
    },

    parse: function (content) {
        console.log(`JSON Content of the file: \n${content}`);
        try {
            const items = JSON.parse(content).map(item => ({
                name: item.name[0],
                description: item.description[0]
            }));

            console.log(items);

        } catch (err) {
            console.error(`Error parsing JSON: ${err}`);
            return;
        }
    }
};

// Application Module
const ImporterApplication = {
    start: function () {
        HelloWorld.say();
        JSONObserver.list();
        let apiUrl = "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
        fetchAllData(apiUrl);
        // Start a minimal supervision tree (Simulated as there's no real equivalent in Node.js)
        console.log("Application started");
    }
};

// Start the application
ImporterApplication.start();
