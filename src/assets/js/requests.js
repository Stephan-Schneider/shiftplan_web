import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axios_instance = axios.create({
    baseURL: BASE_URL,
    responseType: "json",
    responseEncoding: "utf-8",
    timeout: 3500
});

export function getData(url) {
    return axios_instance.get(url)
        .then(response => {
            console.log(response);
            if (response.data && !(response.data === "")) {
                return response.data;
            }
            // Falls keine Daten geladen wurden, ein Rumpf-Objekt anlegen, das die Attribute der ersten Ordnung
            // enthält. Den Attributen werden leere Objekte als Wert zugewiesen.
            return {
                validity: {},
                policy: {},
                employees: {}
            };
        })
        .catch(function (error) {
           return {errorMessage: createErrorMessage(error)}
        }
    );
}

export function postData(url, data) {

}

export function putData(url) {

}

function createErrorMessage(error) {
    let errorMessage = "";
    if (error.response) {
        errorMessage = error.response.status + " - " + error.response.data;
    } else if (error.request) {
        errorMessage = "Die Anfrage konnte nicht gesendet werden: " + error.request;
    } else {
        errorMessage = error.message;
    }
    return errorMessage;
}

