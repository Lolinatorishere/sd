// Import necessary modules
const fs = require('fs');
const path = require('path');
const axios = require("axios")
const knex = require('./knex')
const uuid = require("uuid")

async function fetchAllData(apiUrl, id) {
    let offset = 0;
    if (id !== null) {
        offset = id
    }
    const limit = 10000; // Define the limit of records to fetch per request

    console.log(offset)
    try {
        while (true) {
            let response = await axios.get(`${apiUrl}?$order=id&$limit=${limit}&$offset=${offset}`)
            if (response.data.length === 0) {
                break
            } else {
                if (id != 0) {
                    offset += 10000;
                }
            }
            for (let i = 0; i < response.data.length; i++) {
                let crime = response.data[i]
                let district = await knex('districts')
                    .select('*')
                    .where('district', crime.district)
                    .then(function (response) {
                        return response;
                    });

                console.log("data_length " + district.length)
                console.log(i)
                console.log("crime id" + parseInt(crime.id))
                if (district.length === 0) {
                    await knex('districts')
                        .insert([{ district: crime.district }])
                        .then()

                    district = await knex('districts')
                        .select('*')
                        .where('district', crime.district)
                        .then(function (response) {
                            return response;
                        });
                }
                let idUniqueness = await knex("crimes")
                    .select("api_id")
                    .where("api_id", crime.id)
                    .then(function (response) { return response })
                if (idUniqueness.length !== 0) {
                    continue;
                }

                if (crime.ward == undefined) { crime.ward = 0 }
                if (crime.community_area == undefined) { crime.community_area = 0 }
                if (crime.x_coordinate == undefined) { crime.x_coordinate = 0 }
                if (crime.y_coordinate == undefined) { crime.y_coordinate = 0 }
                if (crime.year == undefined) { crime.year = 0 }
                if (crime.latitude == undefined) { crime.latitude = 0 }
                if (crime.longitude == undefined) { crime.longitude = 0 }
                await knex('crimes')
                    .insert([{
                        api_id: parseInt(crime.id),
                        case_number: crime.case_number,
                        crime_date: crime.date,
                        block: crime.block,
                        iucr: crime.iucr,
                        primary_type: crime.primary_type,
                        description: crime.description,
                        location_description: crime.location_description,
                        arrest: crime.arrest,
                        domestic: crime.domestic,
                        beat: crime.beat,
                        district_id: uuid.parse(district[0].id),
                        ward: parseInt(crime.ward),
                        community_area: parseInt(crime.community_area),
                        fbi_code: crime.fbi_code,
                        x_coordinate: parseInt(crime.x_coordinate),
                        y_coordinate: parseInt(crime.y_coordinate),
                        year: parseInt(crime.year),
                        updated_on: crime.updated_on,
                        latitude: parseFloat(crime.latitude),
                        longitude: parseFloat(crime.longitude)
                    }])
            }
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
    start: async function () {
        HelloWorld.say();
        JSONObserver.list();
        let apiUrl = "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
        let id = await knex('crimes')
            .max("api_id")
            .then(function (response) { return response })

        fetchAllData(apiUrl, id[0].max);
        // Start a minimal supervision tree (Simulated as there's no real equivalent in Node.js)
        console.log("Application started");
    }

};

// Start the application
ImporterApplication.start();
