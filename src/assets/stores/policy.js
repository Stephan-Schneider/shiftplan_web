import {defineStore} from "pinia";
import {getData} from "@/assets/js/requests.js";

export const usePolicyStore = defineStore("policy", {
    state: () => {
        return {
            lateshiftPeriod: 4,
            noLateshiftOn: [],
            maxHoSlots: 2,
            maxHoPerMonth: 8,
            maxHoPerWeekEmployee: 2,
            maxSuccessiveHoDays: 2,
            minDistanceBetweenHoBlocks: 2,
            error: null
        }
    },
    actions: {
        async loadPolicyConfig() {
            const result = await getData("/create", "policy");
            if (result.errorMessage) {
                this.error = result.errorMessage;
            } else {
                this.lateshiftPeriod = result.lateshiftPeriod ? result.lateshiftPeriod : 4;
                this.noLateshiftOn  = Array.isArray(result.noLateshiftOn) ? [...result.noLateshiftOn] : [];
                this.maxHoSlots = result.maxHoSlotsPerDay ? result.maxHoSlotsPerDay : 2;
                this.maxHoPerMonth = result.maxHoDaysPerMonth ? result.maxHoDaysPerMonth : 8;
                this.maxHoPerWeekEmployee = result.weeklyHoCreditsPerEmployee ? result.weeklyHoCreditsPerEmployee : 2;
                this.maxSuccessiveHoDays = result.maxSuccessiveHoDays ? result.maxSuccessiveHoDays : 2;
                this.minDistanceBetweenHoBlocks = result.minDistanceBetweenHoBlocks ? result.minDistanceBetweenHoBlocks : 2;
            }
        }
    }
})