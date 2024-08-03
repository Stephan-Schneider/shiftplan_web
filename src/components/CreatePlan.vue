<script>
import Validity from "@/components/createplan_sfc/Validity.vue";
import Policy from "@/components/createplan_sfc/Policy.vue";
import Employees from "@/components/createplan_sfc/Employees.vue";
import {getCachedData, postData, invalidateCache} from "@/assets/js/requests.js";

import {employeeConfigEquals, objectEquals} from "@/assets/js/utilities.js";

function createLabelMap() {
    let map = new Map();
    map.set("Validity", "Gültigkeit");
    map.set("Policy", "Richtlinien");
    map.set("Employees", "Mitarbeiter");
    return map;
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
            employeesIsUpdate: false,
            message: ""
        }
    },
    methods: {
        updateConfig(partConfig) {
            let shiftPlanConfig = getCachedData();
            const partConfigName = partConfig.section;
            const {section, ...sectionRemoved} = partConfig;
            let configChanged = false;
            if (partConfigName === "Employees") {
                configChanged = !employeeConfigEquals(shiftPlanConfig.employees.employeeList, partConfig.employees);
            } else {
                configChanged = !objectEquals(shiftPlanConfig[partConfigName.toLowerCase()], sectionRemoved);
            }

            if (partConfigName === "Validity" && configChanged) {
                // Die Konfiguration nur abändern + 'updateValidity' hochzählen, wenn Änderungen durchgeführt wurden
                shiftPlanConfig.validity = sectionRemoved;
                this.updatesValidity += 1;
                this.validityIsUpdate = true;
            } else if (partConfigName === "Policy" && configChanged) {
                shiftPlanConfig.policy = sectionRemoved;
                this.updatesPolicy +=1;
                this.policyIsUpdate = true;
            } else if (partConfigName  === "Employees" && configChanged) {
                shiftPlanConfig.employees.employeeList = partConfig.employees;
                this.updatesEmployees +=1;
                this.employeesIsUpdate = true;
            }
            console.log(shiftPlanConfig);
        },
        async saveShiftplan() {
            const result = await postData("/create", getCachedData());
            if (result.errorMessage) {
                this.message = result.errorMessage
            } else {
                this.message = result ?? "Keine Daten vom Server erhalten.";
            }
            if (this.message === "Schichtplan-Datei gespeichert") {
                this.updatesValidity = 0;
                this.validityIsUpdate = false;
                this.updatesPolicy = 0;
                this.policyIsUpdate = false;
                this.updatesEmployees = 0;
                this.employeesIsUpdate = false;
            }
            setTimeout(() => {
                this.message = ""
            }, 10000);
        },
        deleteCache() {
            invalidateCache();
        }
    }
}
</script>

<template>
    <div class="row mt-4">
        <div class="col-2">
            <p
                class="m-2 px-2 py-1 border border-dark"
                :class="[validityIsUpdate ? updateClass : noUpdateClass]"
            >Update Gültigkeit: <span>{{ updatesValidity }}</span></p>
        </div>
        <div class="col-2">
            <p
                class="m-2 px-2 py-1 border border-dark"
                :class="[policyIsUpdate ? updateClass : noUpdateClass]"
            >Update Richtlinien: <span>{{ updatesPolicy }}</span></p>
        </div>
        <div class="col-2">
            <p
                class="m-2 px-2 py-1 border border-dark"
                :class="[employeesIsUpdate ? updateClass : noUpdateClass]"
            >Update Mitarbeiter: <span>{{ updatesEmployees }}</span></p>
        </div>
        <div class="col-2">
            <button
                type="button"
                class="btn btn-outline-primary btn-sm m-2"
                @click="saveShiftplan"
            >Konfiguration speichern</button>
        </div>
        <div class="col-2">
            <button
                type="button"
                class="btn btn-outline-primary btn-sm m-2"
                @click="deleteCache"
            >Cache-Daten löschen</button>
        </div>
    </div>
    <div class="row">
        <p class="feedback" v-if="message">{{ message }}</p>
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
            <component :is="currentTab" @update-config="updateConfig"></component>
        </div>
    </div>
</template>

<style scoped>
p.no-update {
    color: darksalmon;
    font-weight: normal;
    font-size: 0.8em;
}
p.with-update {
    color: #678c43;
    font-weight: bold;
    font-size: 0.8em;
}
p.feedback {
    font-size: 0.9em;
}

</style>