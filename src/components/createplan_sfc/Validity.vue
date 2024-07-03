<script>
import {getPublicHolidays} from "@/assets/js/holidays.js";

export default {
    name: "Validity",
    emits: ["updateConfig"],
    props: {
        config: Object,
        required: true
    },
    data() {
        return {
            year: this.config.year === undefined ? new Date().getFullYear() : this.config.year,
            monthFrom: this.config.startDate === undefined ? 1 : this.config.startDate,
            monthTo: this.config.endDate === undefined ? 12 : this.config.endDate,
            publicHolidays: this.config.publicHolidays === undefined ? [] : [...this.config.publicHolidays],
            holidayName: "",
            holidayDate: null,
            monthOptions: [
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ],
            holidayNameHasError: false,
            holidayDateHasError: false,
            api: "Feiertage_API",
            region: "HE",
            //configChanged: false
        }
    },
    methods: {
        addHoliday() {
            if (this.holidayName === "") {
                this.holidayNameHasError = true;
                return;
            }
            this.holidayNameHasError = false;
            if (this.holidayDate === null || this.holidayDate === undefined || this.holidayDate === "") {
                this.holidayDateHasError = true;
                return;
            }
            this.holidayDateHasError = false;
            // Sicher stellen, dass das Jahr des eingegebenen Datums mit dem für den Schichtplan ausgewähltem
            // Jahr übereinstimmt (es ist also nicht möglich, z.B. einen Feiertag im Jahr 2025 manuell einzugeben,
            // wenn ein Schichtplan für 2024 erstellt wird).
            let hd = this.year + "-" + this.holidayDate.substring(this.holidayDate.indexOf("-") +1);
            if (!this.publicHolidays.some(elem => elem.name.toLowerCase() === this.holidayName.toLowerCase())) {
                this.publicHolidays.push({name: this.holidayName, date: hd});
            }
            this.holidayName = "";
            this.holidayDate = null;
        },
        removeHoliday(index) {
            this.publicHolidays.splice(index, 1);
        },
        removeAllHolidays() {
            this.publicHolidays.splice(0, this.publicHolidays.length);
        },
        resetHolidayInputFields() {
            this.holidayName = "";
            this.holidayDate = null;
        },
        getPublicHolidaysFromAPI() {
            const handler = getPublicHolidays(this.api, this.year, this.region);
            handler.requestPublicHolidays().then(result => {
                console.log(result);
                if (result.errorMessage) {
                    // Handle error
                }
                this.publicHolidays = result;
            })
        },
        updateConfig() {
            this.$emit("updateConfig", {
                section: "Validity",
                year: this.year,
                startDate: this.monthFrom,
                endDate: this.monthTo,
                publicHolidays: this.publicHolidays
            });
        }
    },
    computed: {
        currentYear() {
            return new Date().getFullYear();
        },
        sortedHolidays() {
            return this.publicHolidays.sort(
                (ph1, ph2) => new Date(ph1.date).getTime() - new Date(ph2.date).getTime());
        }
    },
    mounted() {
        console.log(`Validity (this.config) in Validity#mounted: ${JSON.stringify(this.config)}`);
    }
}
</script>

<template>
    <div class="row mt-4 p-2 border border-dark">
        <div class="col-2">
            <label for="year" class="form-label">Schichtplan für Jahr</label>
            <input id="year" type="number" class="form-control form-control-sm" v-bind:min="currentYear" v-model="year">
        </div>
        <div class="col-2">
            <label for="month-from" class="form-label">von (Monat)</label>
            <select id="month-from" v-model="monthFrom">
                <option disabled value="">Start-Monat auswählen</option>
                <option v-for="(month, index) in monthOptions" :key="month" :value="index +1">
                    {{ month }}
                </option>
            </select>
        </div>
        <div class="col-2">
            <label for="month-to" class="form-label">bis (Monat)</label>
            <select id="month-to" v-model="monthTo">
                <option disabled value="">Letzter Monat inklusive</option>
                <option v-for="(month, index) in monthOptions" :key="month" :value="index +1">
                    {{ month }}
                </option>
            </select>
        </div>
    </div>

    <div class="row">
        <div class="col-6">
            <form>
                <div class="row g-1 mt-4">
                    <div class="col-2">
                        <label for="holiday-name" class="col-form-label">Feiertag:</label>
                    </div>
                    <div class="col-6">
                        <input
                            type="text"
                            id="holiday-name"
                            class="form-control form-control-sm"
                            :class="{'invalid': holidayNameHasError}"
                            v-model.lazy.trim="holidayName"
                        >
                    </div>
                </div>
                <div class="row g-1 mt-1">
                    <div class="col-2">
                        <label for="holiday-date" class="col-form-label">Datum:</label>
                    </div>
                    <div class="col-6">
                        <input
                            type="date"
                            id="holiday-date"
                            class="form-control form-control-sm"
                            :class="{'invalid': holidayDateHasError}"
                            v-model="holidayDate">
                    </div>
                </div>
                <div class="row mt-1 g-1 border-bottom border-dark">
                    <div class="col-8 btn-group">
                        <button type="button" @click="addHoliday" class="btn btn-sm btn-primary m-2">Hinzufügen</button>
                        <button type="button" @click="removeAllHolidays" class="btn btn-sm btn-primary m-2">Alle Löschen</button>
                        <input type="reset" class="btn btn-sm btn-primary m-2" @click.prevent="resetHolidayInputFields">
                    </div>
                </div>
            </form>
            <div class="row mt-4">
                <p class="api-header">Feiertage aus dem Internet erhalten:</p>
                <div class="col-4">
                    <label for="holiday-api">Api's</label>
                    <select id="holiday-api" class="form-select form-select-sm" v-model="api">
                        <option disabled>API auswählen</option>
                        <option value="DigiDates">DigiDates API</option>
                        <option value="Feiertage_API" selected>Feiertage API</option>
                    </select>
                </div>
                <div class="col-4">
                    <label for="bl">Bundesland</label>
                    <select id="bl" class="form-select form-select-sm" v-model="region">
                        <option value="" disabled>Bundesland auswählen</option>
                        <option value="BW">Baden-Württemberg</option>
                        <option value="BY">Bayern</option>
                        <option value="BE">Berlin</option>
                        <option value="BB">Brandenburg</option>
                        <option value="HB">Bremen</option>
                        <option value="HH">Hamburg</option>
                        <option value="HE" selected>Hessen</option>
                        <option value="MV">Mecklenburg-Vorpommern</option>
                        <option value="NI">Niedersachsen</option>
                        <option value="NW">Nordrhein-Westfalen</option>
                        <option value="RP">Rheinland-Pfalz</option>
                        <option value="SL">Saarland</option>
                        <option value="SN">Sachsen</option>
                        <option value="ST">Sachsen-Anhalt</option>
                        <option value="SH">Schleswig-Holstein</option>
                        <option value="TH">Thüringen</option>
                    </select>
                </div>
            </div>
            <div class="row mt-1 g-1">
                <div class="col-8 btn-group">
                    <button
                        type="button"
                        class="btn btn-sm btn-primary m-2"
                        @click="getPublicHolidaysFromAPI"
                    >Go</button>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-success m-2"
                        @click="updateConfig"
                    >Änderungen bestätigen</button>
                </div>
            </div>
        </div>
        <div class="col-4">
            <div class="row mt-4">
                <p class="ph-header mb-0">Öffentliche Feiertage in {{ year }}</p>
                <div class="scroll-box mt-0">
                    <ul>
                        <li v-for="(item, index) in sortedHolidays" :key="index">
                            <button type="button"
                                    @click="removeHoliday(index)"
                                    class="btn btn-outline-danger mr-1"
                                    style="--bs-btn-padding-y: 0.15rem; --bs-btn-padding-x: 0.2rem; --bs-btn-font-size: .75rem"
                            >Löschen</button>
                            &nbsp<span>{{ item.name }}: {{ item.date}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
div.scroll-box {
    height: 250px;
    overflow-y: auto;
    padding: 3px;
    border: 1px solid black;
}
p.api-header {
    font-size: smaller;
    font-weight: bold;
    text-align: left;
}
p.ph-header {
    font-size: smaller;
    font-weight: bold;
    text-align: center;
}
.invalid {
    border: 1px solid darkred;
}

</style>