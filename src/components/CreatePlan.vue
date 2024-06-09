<script>
import Validity from "@/components/createplan_sfc/Validity.vue";
import Policy from "@/components/createplan_sfc/Policy.vue";
import Employees from "@/components/createplan_sfc/Employees.vue";

import {employeeConfigEquals, objectEquals} from "@/assets/js/utilities.js";

function createLabelMap() {
    let map = new Map();
    map.set("Validity", "Gültigkeit");
    map.set("Policy", "Richtlinien");
    map.set("Employees", "Mitarbeiter");
    return map;
}

function loadConfig() {
    /*
    In fertigen Zustand wird die Konfiguration durch einen Ajax-Aufruf geladen. Wenn beim Laden der Konfiguration ein
    Problem auftritt, im catch - Block ein Rumpf-Konfigurations-Objekt erstellen und zurückgeben:
        {
            validity: {},
            policy: {},
            employees: []
        }
     */
    return {
            validity: {
                year: 2025,
                startDate: 6,
                endDate: 12,
                publicHolidays: [
                    {
                        name: "Neujahr",
                        date: "2024-01-01"
                    },
                    {
                        name: "Karfreitag",
                        date: "2024-03-29"
                    },
                    {
                        name: "Ostermontag",
                        date: "2024-04-01"
                    }
                ]
            },
            policy: {
                lateshiftPeriod: 4,
                maxHoDaysPerMonth: 10,
                weeklyHoCreditsPerEmployee: 3,
                maxHoSlotsPerDay: 3,
                maxSuccessiveHoDays: 2,
                minDistanceBetweenHoBlocks: 2,
                noLateshiftOn: [
                    "MONDAY", "TUESDAY"
                ]
            },
            employees: [
                {
                    id: "ID-1",
                    name: "Rudi",
                    lastName: "Ratlos",
                    participation: "HO_LS",
                    email: "rudi.ratlos@gmx.de",
                    color: "#88ddff",
                    backups: ["ID-2", "ID-3"]
                },
                {
                    id: "ID-2",
                    name: "Tommi",
                    lastName: "Tulpe",
                    participation: "HO_LS",
                    email: "tommi.tulpe@gmx.de",
                    color: "#00ffaa",
                    backups: ["ID-1", "ID-3"]
                },
                {
                    id: "ID-3",
                    name: "Hola",
                    lastName: "Hurtig",
                    participation: "HO",
                    email: "hola.hurtig@gmx.de",
                    color: "#003399",
                    backups: ["ID-1", "ID-2"]
                },
                {
                    id: "ID-4",
                    name: "Mia",
                    lastName: "Maus",
                    participation: "LS",
                    email: "mia.maus@gmx.de",
                    color: "#ee3333",
                    backups: []
                },
            ]
        }
}

export default {
    name: "CreatePlan",
    components: {
        Validity,
        Policy,
        Employees
    },
    data() {
        return {
            currentTab: "Validity",
            tabs: ["Validity", "Policy", "Employees"],
            tabLabelMap: createLabelMap(),
            shiftPlanConfig: null,
            updatesValidity: 0,
            updatesPolicy: 0,
            updatesEmployees: 0,
            updateClass: 'with-update',
            noUpdateClass: "no-update",
            validityIsUpdate: false,
            policyIsUpdate: false,
            employeesIsUpdate: false

        }
    },
    methods: {
        updateConfig(partConfig) {
            const partConfigName = partConfig.section;
            const {section, ...sectionRemoved} = partConfig;
            let configChanged = false;
            if (partConfigName === "Employees") {
                configChanged = !employeeConfigEquals(this.shiftPlanConfig.employees, partConfig.employees);
            } else {
                configChanged = !objectEquals(this.shiftPlanConfig[partConfigName.toLowerCase()], sectionRemoved);
            }

            if (partConfigName === "Validity" && configChanged) {
                // Die Konfiguration nur abändern + 'updateValidity' hochzählen, wenn Änderungen durchgeführt wurden
                this.shiftPlanConfig.validity = sectionRemoved;
                this.updatesValidity += 1;
                this.validityIsUpdate = true;
            } else if (partConfigName === "Policy" && configChanged) {
                this.shiftPlanConfig.policy = sectionRemoved;
                this.updatesPolicy +=1;
                this.policyIsUpdate = true;
            } else if (partConfigName  === "Employees" && configChanged) {
                this.shiftPlanConfig.employees = partConfig.employees;
                this.updatesEmployees +=1;
                this.employeesIsUpdate = true;
            }
            console.log(this.shiftPlanConfig);
        }
    },
    computed: {
        currentConfig() {
            if (this.shiftPlanConfig === null) {
                this.shiftPlanConfig = loadConfig();
            }

            if (this.currentTab === "Validity") {
                return this.shiftPlanConfig.validity;
            } else if (this.currentTab === "Policy") {
                return this.shiftPlanConfig.policy;
            } else if (this.currentTab === "Employees") {
                return  this.shiftPlanConfig.employees;
            }
        }
    }
}
</script>

<template>
    <div class="row mt-4">
        <div class="col-2">
            <button type="button" class="btn btn-primary btn-sm m-2">Konfiguration speichern</button>
        </div>
        <div class="col-3">
            <p
                class="m-2 px-2 py-1 border border-dark"
                :class="[validityIsUpdate ? updateClass : noUpdateClass]"
            >Update Gültigkeit: <span>{{ updatesValidity }}</span></p>
        </div>
        <div class="col-3">
            <p
                class="m-2 px-2 py-1 border border-dark"
                :class="[policyIsUpdate ? updateClass : noUpdateClass]"
            >Update Richtlinien: <span>{{ updatesPolicy }}</span></p>
        </div>
        <div class="col-3">
            <p
                class="m-2 px-2 py-1 border border-dark"
                :class="[employeesIsUpdate ? updateClass : noUpdateClass]"
            >Update Mitarbeiter: <span>{{ updatesEmployees }}</span></p>
        </div>
    </div>
    <div class="row mt-4">
        <div class="col-6">
            <ul class="nav nav-tabs">
                <li class="nav-item"
                    v-for="tab in tabs"
                    :key="tab"
                    >
                    <a
                        href="#"
                        :class="['nav-link', {active: currentTab === tab}]"
                        @click.prevent="currentTab = tab"
                    >{{ tabLabelMap.get(tab) }}</a>
                </li>
            </ul>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <component :is="currentTab" :config="currentConfig" @update-config="updateConfig"></component>
        </div>
    </div>
</template>

<style scoped>
p.no-update {
    color: darksalmon;
    font-weight: normal;
}
p.with-update {
    color: #678c43;
    font-weight: bold;
}

</style>