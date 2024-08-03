import { defineStore } from "pinia";
import {getPublicHolidayHandler} from "@/assets/js/holidays.js";
import {getData} from "@/assets/js/requests.js";

export const useValidityStore = defineStore("validity", {
    state: () => {
        return {
            year: new Date().getFullYear(),
            monthFrom: 1,
            monthTo: 12,
            publicHolidays: [],
            error: null
        }
    },
    getters: {
        sortedHolidays: (state) => {
            // noinspection JSUnresolvedVariable
            return state.publicHolidays
                .sort((ph1, ph2) => new Date(ph1.date).getTime() - new Date(ph2.date).getTime());
        }
    },
    actions: {
        isUnique(holidayName) {
            // noinspection JSUnresolvedVariable
            return !this.publicHolidays.some(elem => elem.name.toLowerCase() === holidayName.toLowerCase());
        },
        addHD(holiday) {
            // noinspection JSUnresolvedVariable
            console.log(`Feiertag ${holiday} wird hinzugefügt. Länge vorher: ${this.publicHolidays.length}`)
            // noinspection JSUnresolvedVariable
            this.publicHolidays.push(holiday);
            // noinspection JSUnresolvedVariable
            console.log(`Länge nach push-OP: ${this.publicHolidays.length}`)
        },
        removeHD(index) {
            // noinspection JSUnresolvedVariable
            this.publicHolidays.splice(index, 1);
        },
        removeAllHD() {
            // noinspection JSUnresolvedVariable
            this.publicHolidays.splice(0, this.publicHolidays.length);
        },
        async getPublicHolidays(api, region) {
            const handler =
                getPublicHolidayHandler(api, this.year, region);
            handler.requestPublicHolidays()
                .then(result => {
                    console.log(result);
                    if (result.errorMessage) {
                        this.error = result;
                        return;
                    }
                    this.publicHolidays = result;
                });
        },
        async loadValidityConfig(){
            const result = await getData("/create", "validity");
            if (result.errorMessage) {
                this.error = result.errorMessage;
            } else {
                this.year = result.year ? result.year : new Date().getFullYear();
                this.monthFrom  = result.startDate ? result.startDate : 1;
                this.monthTo = result.endDate ? result.endDate : 12;
                this.publicHolidays = Array.isArray(result.publicHolidays) ? [...result.publicHolidays] : [];
            }
        }
    }
})