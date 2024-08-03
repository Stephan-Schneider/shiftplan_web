import {expect, test} from "@jest/globals";
import {getPublicHolidayHandler, PublicHolidayHandler, PublicHolidaysDigiDatesAPIHandler} from "../src/assets/js/holidays.js"

let serverResponse = `{
    "Neujahrstag": {
        "datum": "2024-01-01",
        "hinweis": ""
    },
    "Heilige Drei K\u00f6nige": {
        "datum": "2024-01-06",
        "hinweis": ""
    },
    "Karfreitag": {
        "datum": "2024-03-29",
        "hinweis": ""
    },
    "Ostermontag": {
        "datum": "2024-04-01",
        "hinweis": ""
    },
    "Tag der Arbeit": {
        "datum": "2024-05-01",
        "hinweis": ""
    },
    "Christi Himmelfahrt": {
        "datum": "2024-05-09",
        "hinweis": ""
    },
    "Pfingstmontag": {
        "datum": "2024-05-20",
        "hinweis": ""
    },
    "Fronleichnam": {
        "datum": "2024-05-30",
        "hinweis": ""
    }
}`;

let serverResponseDigiDates = `{
    "2024-01-01": "Neujahr",
    "2024-03-29": "Karfreitag",
    "2024-04-01": "Ostermontag",
    "2024-05-01": "Tag der Arbeit",
    "2024-05-09": "Christi Himmelfahrt",
    "2024-05-20": "Pfingstmontag",
    "2024-10-03": "Tag der Deutschen Einheit",
    "2024-12-25": "1. Weihnachtstag",
    "2024-12-26": "2. Weihnachtstag"
}`;

test("getData PublicHolidayHandler instance", () => {
    expect(getPublicHolidayHandler("Feiertage_API", 2024, "HE")).toBeInstanceOf(PublicHolidayHandler)
});

test("getData PublicHolidaysDigiDatesAPIHandler", () => {
    expect(getPublicHolidayHandler("DigiDates", 2024, "BW")).toBeInstanceOf(PublicHolidaysDigiDatesAPIHandler)
});

test("tests the correct URL creation for Feiertage-API", () => {
    const phHandler = getPublicHolidayHandler("Feiertage_API", 2024, "HH");
    expect(phHandler.createRequestUrl()).toEqual("https://feiertage-api.de/api/?jahr=2024&nur_land=HH");
});

test("tests the correct URL creation for DigiDates-API", () => {
    const phHandler = getPublicHolidayHandler("DigiDates", 2024,"SL");
    expect(phHandler.createRequestUrl()).toEqual("https://digidates.de/api/v1/germanpublicholidays?year=2024&region=de-sl");
})

test("getData response from Feiertage-API", () => {
    const phHandler = getPublicHolidayHandler("Feiertage_API", 2024, "HE");
    phHandler.requestPublicHolidays().then(result => {
        expect(result).toBeInstanceOf(Array);
    })
});

test("test processResponse with Feiertage_API", () => {
    const input = JSON.parse(serverResponse);
    const phHandler = getPublicHolidayHandler("Feiertage_API", 2024, "BW");
    const result = phHandler.processResponse(input);
    expect(result).toHaveLength(8);
    expect(result[0].name).toEqual("Neujahrstag");
    expect(result[0].date).toEqual("2024-01-01");
});

test("test processResponse with DigiDates", () => {
    const input = JSON.parse(serverResponseDigiDates);
    const phHandler = getPublicHolidayHandler("DigiDates", 2024,"HE");
    const result = phHandler.processResponse(input);
    expect(result).toHaveLength(9);
    expect(result[0].name).toEqual("Neujahr");
    expect(result[0].date).toEqual("2024-01-01");
});

