import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const ID_LENGTH = import.meta.env.VITE_ID_LENGTH;
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const axios_instance = axios.create({
    baseURL: BASE_URL,
    responseType: "json",
    responseEncoding: "utf-8",
    timeout: 0 // kein Timeout
});

const initData = {
    validity: {
        year: new Date().getFullYear(),
        startDate: 1,
        endDate: 12,
        boundaryStrict: true,
        publicHolidays: []
    },
    policy: {
        lateshiftPeriod: 4,
        maxHoDaysPerMonth: 8,
        weeklyHoCreditsPerEmployee: 2,
        maxHoSlotsPerDay: 2,
        maxSuccessiveHoDays: 2,
        minDistanceBetweenHoBlocks: 2,
        noLateshiftOn: []

    },
    employees: {
        employeeList: []
    },
}

let dataCache = {
    validity: {},
    policy: {},
    employees: {}

}

function hasCachedData() {
    return Object.keys(dataCache.validity).length > 0 && Object.keys(dataCache.policy).length > 0 &&
        Object.keys(dataCache.employees).length > 0;
}

export function getCachedData() {
    return dataCache;
}

export function invalidateCache() {
    dataCache.validity = {};
    dataCache.policy = {};
    dataCache.employees = {};
}

function createRandomId() {
    console.log(`ID-LENGTH: ${ID_LENGTH}`)
    let result = "";
    for (let i = 0; i < ID_LENGTH; i++) {
        result += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
    }
    console.log(`Generierte USER-ID: ${result}`)
    return result;
}

export async function authenticate(url, auth) {
    try {
        axios_instance.defaults.headers.common["X-Auth-ID"] = createRandomId();
        const res = await axios_instance(url, {auth});
        return res.status === 200;
    } catch (error) {
        return false;
    }
}

export function getData(url, section) {
    if (hasCachedData()) {
        console.log(`Daten für den Abschnitt ${section} werden aus dem Cache zurückgegeben ...`);
        return dataCache[section];
    }
    return axios_instance.get(url)
        .then(response => {
            console.log(response);
            if (response.data && isSuccessStatus(response.status)) {
                dataCache.validity = response.data.validity === undefined ? initData.validity : response.data.validity;
                dataCache.policy = response.data.policy === undefined ? initData.policy : response.data.policy;
                dataCache.employees = response.data.employees === undefined ? initData.employees : response.data.employees;
                return response.data[section];
            }
            // Falls keine Daten geladen wurden, die Default-Daten im Cache speichern und zurückgeben.
            dataCache = initData
            return dataCache[section];
        })
        .catch(function (error) {
           return {errorMessage: createErrorMessage(error)}
        }
    );
}

export function getStafflist(url) {
    return axios_instance.get(url)
        .then(response => {
            console.log(response);
            if (response.data && isSuccessStatus(response.status)) {
                return response.data;
            }
            return null;
        })
        .catch(error => {
            console.log(error);
            return {errorMessage: createErrorMessage(error)};
        })
}

export function postData(url, data) {
    return axios_instance.post(url, data)
        .then(response => {
            console.log(response);
            if (response.data && isSuccessStatus(response.status)) {
                return response.data;
            }
            return null;
        })
        .catch(error => {
            console.log(error);
            return {errorMessage: createErrorMessage(error)};
        });
}

export function putData(url) {
    return axios_instance.put(url)
        .then(response => {
            console.log(response);
            if (response.data && isSuccessStatus(response.status)) {
                return response.data;
            }
            return null;
        })
        .catch(error => {
            console.log(error);
            return {errorMessage: createErrorMessage(error)};
        })
}

function isSuccessStatus(statusCode) {
    return statusCode >= 200 && statusCode < 300;
}

function createErrorMessage(error) {
    let errorMessage;
    if (error.response) {
        errorMessage = error.response.status + " - " + error.response.data;
    } else if (error.request) {
        errorMessage = "Die Anfrage konnte nicht gesendet werden:";
    } else {
        errorMessage = error.message;
    }
    return errorMessage;
}

