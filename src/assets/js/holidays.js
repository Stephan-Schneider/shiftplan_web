import axios from "axios";

/**
 * Klasse für die Kommunikation mit der 'feiertage-api.de' zum Abrufen öffentlicher Feiertage
 */
class PublicHolidayHandler {
    constructor(baseUrl, year, state) {
        this._baseUrl = baseUrl;
        this._year = year;
        this._state = state; // Bundesland
    }

    createRequestUrl() {
        let requestUrl = `${this._baseUrl}?jahr=${this._year}&nur_land=${this._state}`;
        console.log(`Feiertage angefragt mit URL: ${requestUrl}`);
        return requestUrl;
    }

    /**
     * Transformiert die aus dem GET-Request erhaltenen JSON-Daten in einen Array in folgendem Format:
     * pubHolidays = [{name: 'Name des Feiertags', date: Datum im ISO-Format'}, ...]
     *
     * Die responseData werden von der 'Feiertag-API' wie folgt zurückgegeben:
     *
     * `"Neujahrstag": {
     *         "datum": "2024-01-01",
     *         "hinweis": ""
     *     },     *
     *     "Karfreitag": {
     *         "datum": "2024-03-29",
     *         "hinweis": ""
     *     },`
     *
     * @param responseData {Object}: Das von Axios zurückgegebene Javascript-Objekt
     * @returns {*[]}: ein Array mit allen Feiertagen als Feiertage-Objekte (siehe oben)
     */
    processResponse(responseData) {
        const pubHolidays = [];
        for (const property in responseData) {
            let pubHoliday = {
                name: property,
                date: responseData[property].datum
            };
            pubHolidays.push(pubHoliday);
        }
        return pubHolidays;
    }

    requestPublicHolidays() {
        return axios.get(this.createRequestUrl())
            .then(response => {
                console.log(response);
                if (response.data) {
                    return this.processResponse(response.data);
                }
                return [];
            })
            .catch(function (error) {
                console.log(error);
                return {errorMessage: error};
        });
    }
}

/**
 * Klasse für die Kommunikation mit der 'digidates.de - API' zum Abrufen öffentlicher Feiertage
 */
class PublicHolidaysDigiDatesAPIHandler extends PublicHolidayHandler{
    constructor(baseUrl, year, state) {
        super(baseUrl, year, state);
    }

    createRequestUrl() {
        let requestUrl = `${this._baseUrl}?year=${this._year}&region=de-${this._state.toLowerCase()}`;
        console.log(`Feiertage angefragt mit URL: ${requestUrl}`);
        return requestUrl;
    }

    /**
     * Transformiert die aus dem GET-Request erhaltenen JSON-Daten in einen Array in folgendem Format:
     * pubHolidays = [{name: 'Name des Feiertags', date: Datum im ISO-Format'}, ...]
     *
     * Die responseData werden von der 'DigiDates-API' wie folgt zurückgegeben:
     *
     * `{
     *     "2024-01-01": "Neujahr",
     *     "2024-03-29": "Karfreitag",
     *     "2024-04-01": "Ostermontag"
     *  }`
     *
     * @param responseData {Object}: Das von Axios zurückgegebene Javascript-Objekt
     * @returns {*[]}: ein Array mit allen Feiertagen als Feiertage-Objekte (siehe oben)
     */
    processResponse(responseData) {
        const pubHolidays = [];
        for (const property in responseData) {
            let pubHoliday = {
                name: responseData[property],
                date: property
            }
            pubHolidays.push(pubHoliday);
        }
        return pubHolidays;
    }
}

const feiertage_api_url = "https://feiertage-api.de/api/";
const digiDates_api_url = "https://digidates.de/api/v1/germanpublicholidays";

function getPublicHolidayHandler(api, year, state) {
    if (api === "Feiertage_API") {
        return new PublicHolidayHandler(feiertage_api_url, year, state);
    } else if (api === "DigiDates") {
        return new PublicHolidaysDigiDatesAPIHandler(digiDates_api_url, year, state);
    }
}

export { getPublicHolidayHandler, PublicHolidayHandler, PublicHolidaysDigiDatesAPIHandler };

