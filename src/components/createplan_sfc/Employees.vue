<script>
import {mapState, mapWritableState, mapActions} from "pinia";
import draggable from "vuedraggable";
import {useEmployeesStore} from "@/assets/stores/employees.js";

import {
    getNextId,
    syncBackupsOnDeletion,
    syncBackupsOnCreation,
    difference, syncBackupsOnUpdate
} from "@/assets/js/utilities.js";

export default {
    name: "Employees",
    components: {draggable},
    emits: ["updateConfig"],
    data() {
        return {
            name: "",
            lastName: "",
            email: "",
            participation: "HO_LS",
            color: "#000000",
            backup: "",
            selectedBackups: [],
            selectedEmployeeId: "",
            nameFieldsDisabled: false,
            idMap: new Map()
        }
    },
    methods: {
        ...mapActions(useEmployeesStore, {
            addEmp: "addEmployee",
            findEmployee: "findEmployee",
            loadEmployeeConfig: "loadEmployeeConfig"
        }),
        deleteBackup(evt) {
            if (evt.key === "Delete") {
                let textBox = this.$refs.textarea;
                if (textBox.selectionStart !== undefined) {
                    let startPos = textBox.selectionStart;
                    let endPos = textBox.selectionEnd;
                    let selectedText = textBox.value.substring(startPos, endPos);
                    if (selectedText) {
                        let allDeleted = selectedText.split("\n");
                        this.selectedBackups = this.selectedBackups
                            .filter(deleteCandidate => !allDeleted.includes(deleteCandidate.employee));
                    }
                }
            }
        },
        resolveEmployeeId(empId) {
            return this.idMap.get(empId);
        },
        addEmployee() {
            if (this.selectedEmployeeId !== "") return; // MA existiert schon, kann nur geändert oder gelöscht werden
            if (this.name === "" || this.lastName === "") return; // Name und Nachname sind die einzigen Pflichtfelder

            const employee = {
                id: getNextId(this.employees),
                name: this.name,
                lastName: this.lastName,
                participation: this.participation,
                email: this.email,
                color: this.color,
                backups: this.selectedBackups.map(empObj => empObj.empId)
            }

            this.idMap.set(employee.id, `${employee.name} ${employee.lastName}`)

            if (employee.backups.length > 0) {
                this.employees = syncBackupsOnCreation(employee, this.employees);
            }

            this.addEmp(employee);

            this.resetEmployeeForm();
        },
        updateEmployee() {
            const selectedEmployee = this.findEmployee(this.selectedEmployeeId);
            if (selectedEmployee === null || selectedEmployee === undefined) return;

            if (this.name === "" || this.lastName === "") {
                // Vor- und Nachname eines MA's sind nicht veränderbar. Falls Vor- oder Nachname (aus Versehen)
                // gelöscht wurden, werden sie wieder auf ihren vorherigen Wert zurückgesetzt.
                // Falls tatsächlich eine Namensänderung erforderlich ist, muss der MA neu angelegt werden.
                this.name = selectedEmployee.name;
                this.lastName = selectedEmployee.lastName;
            }

            selectedEmployee.participation = this.participation;
            selectedEmployee.email = this.email;
            selectedEmployee.color = this.color;

            const oldBackupList = selectedEmployee.backups;
            const newBackupList = this.selectedBackups.map(empObj => empObj.empId);
            selectedEmployee.backups = newBackupList;

            const deleted = difference(oldBackupList, newBackupList);
            const added = difference(newBackupList, oldBackupList);
            syncBackupsOnUpdate(selectedEmployee.id, [...deleted], [...added], this.employees);

            this.resetEmployeeForm();
        },
        deleteEmployee() {
            const selectedEmployee = this.findEmployee(this.selectedEmployeeId);
            if (selectedEmployee === null || selectedEmployee === undefined) return;

            // Das reaktive Property 'this.employees' nicht sofort updaten - erst den gelöschten MA aus den
            // Backup-Listen der übrigen MA's entfernen!
            const temp = this.employees.filter(employee => employee.id !== this.selectedEmployeeId);

            // Jetzt updaten - die geänderten Backup-Listen sollten jetzt auch angezeigt werden
            this.employees = syncBackupsOnDeletion(selectedEmployee, temp);

            this.idMap.delete(selectedEmployee.id);

            this.resetEmployeeForm();
        },
        displaySelectedEmployee(employee) {
            this.selectedEmployeeId = employee.id;
            this.nameFieldsDisabled = true;

            this.name = employee.name;
            this.lastName = employee.lastName;
            this.email = employee.email;
            this.participation = employee.participation;
            this.color = employee.color;
            this.selectedBackups = employee.backups.map(buId => {
                return {empId: buId, employee: this.idMap.get(buId)}
            });
        },
        resetEmployeeForm() {
            this.name = "";
            this.lastName = "";
            this.participation = "HO_LS";
            this.email = "";
            this.color = "#000000";
            this.selectedBackups = [];
            this.selectedEmployeeId = "";
            this.nameFieldsDisabled = false;
        },
        updateConfig() {
            this.$emit("updateConfig", {
                section: "Employees",
                employees: this.employees
            });
        }
    },
    computed: {
        ...mapState(useEmployeesStore, ["employees"]),
        ...mapWritableState(useEmployeesStore, ["employees"]),
        selectedBackupsText() {
            return this.selectedBackups.map(empObj => empObj.employee).join("\n");
        }
    },
    watch: {
        backup(empId) {
            if (empId !== "" && empId !== this.selectedEmployeeId) {
                console.log(`newVal: ${empId}`)
                let employee = this.idMap.get(empId);
                console.log(`selected employee: ${employee}`)
                if (employee && !this.selectedBackups.map(empObj => empObj.empId).includes(empId)) {
                    this.selectedBackups.push({empId: empId, employee: employee});
                }
            }
        }
    },
    async created() {
        await this.loadEmployeeConfig();
        if (this.employees && this.employees.length > 0) {
            this.employees.forEach(emp => this.idMap.set(emp.id, `${emp.name} ${emp.lastName}`));
        }
        console.log(`ID-Map: ${this.idMap.size}`);
    }
}
</script>

<template>
    <div class="row mt-2">
        <div class="col-6 bg-light p-2">
            <form>
            <div class="row g-1 mt-4">
                <div class="col-2">
                    <label for="name" class="col-form-label">Vorname:</label>
                </div>
                <div class="col-6">
                    <input
                        type="text"
                        id="name"
                        class="form-control form-control-sm"
                        autocomplete="off"
                        placeholder="Vorname des Mitarbeiters"
                        required
                        :disabled="nameFieldsDisabled"
                        v-model="name"
                    >
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="col-2">
                    <label for="last-name" class="col-form-label">Nachname:</label>
                </div>
                <div class="col-6">
                    <input
                        type="text"
                        id="last-name"
                        class="form-control form-control-sm"
                        autocomplete="off"
                        placeholder="Nachname des Mitarbeiters"
                        required
                        :disabled="nameFieldsDisabled"
                        v-model="lastName"
                    >
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="col-2">
                    <label for="e-mail" class="col-form-label">E-Mail:</label>
                </div>
                <div class="col-6">
                    <input
                        type="email"
                        id="e-mail"
                        class="form-control form-control-sm"
                        autocomplete="off"
                        disabled
                        placeholder="Email (zum Versenden des Schichtplans)"
                        v-model="email"
                    >
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="col-2">
                    <label for="participation" class="col-form-label">Teilnahme:</label>
                </div>
                <div class="col-6" id="participation">
                    <div class="form-check form-check-inline">
                        <input
                            type="radio"
                            name="participation"
                            id="ho"
                            value="HO"
                            class="form-check-input"
                            v-model="participation"
                        >
                        <label for="ho" class="form-check-label small">Home</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input
                            type="radio"
                            name="participation"
                            id="ls"
                            value="LS"
                            class="form-check-input"
                            v-model="participation"
                        >
                        <label for="ls" class="form-check-label small">Spät</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input
                            type="radio"
                            name="participation"
                            id="ho-ls"
                            value="HO_LS"
                            class="form-check-input"
                            v-model="participation"
                        >
                        <label for="ho-ls" class="form-check-label small">Home + Spät</label>
                    </div>
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="col-2">
                    <label for="emp-color" class="col-form-label">Farbe:</label>
                </div>
                <div class="col-6">
                    <input
                        type="color"
                        id="emp-color"
                        v-model="color"
                    >
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="col-2">
                    <label for="backups" class="col-form-label">Backups:</label>
                </div>
                <div class="col-6">
                    <select
                        id="backups"
                        class="form-select form-select-sm"
                        v-model="backup"
                    >
                        <option value="" selected>Backups auswählen</option>
                        <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                                {{ employee.name }} {{ employee.lastName }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="col-8">
                   <textarea
                       ref="textarea"
                       id="backups-selected"
                       class="form-control"
                       rows="3"
                       v-model="selectedBackupsText"
                       @keydown.prevent="deleteBackup($event)"
                   ></textarea>
                </div>
            </div>
            <div class="row g-1 mt-1">
                <div class="btn-group btn-group-sm gx-2">
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        @click="addEmployee"
                    >Hinzufügen</button>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        @click="updateEmployee"
                    >Ändern</button>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        @click="deleteEmployee"
                    >Löschen</button>
                    <button
                        type="reset"
                        class="btn btn-sm btn-outline-primary"
                        @click.prevent="resetEmployeeForm"
                    >Reset</button>
                </div>
            </div>
            </form>
            <div class="row g-1 mt-1">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-success"
                     @click="updateConfig"
                >Änderungen bestätigen</button>
            </div>
        </div>
        <div class="col-4">
            <p class="fw-bold text-decoration-underline">Konfigurierte Mitarbeiter und Mitarbeiterinnen</p>
            <div class="scroll-box">
                <draggable :list="employees" item-key="id" tag="ul">
                    <template #item="{element}">
                        <li>
                            <a
                                href="#"
                                @click.prevent="displaySelectedEmployee(element)"
                            >{{ element.name }} {{ element.lastName }}</a>
                            <ul>
                                <template v-for="(backup, index) in element.backups">
                                    <li>
                                        <span class="fst-italic">Backup {{ index +1 }}:</span>
                                        {{ resolveEmployeeId(backup) }}
                                    </li>
                                </template>
                            </ul>
                        </li>
                    </template>
                </draggable>
            </div>
        </div>
    </div>
</template>

<style scoped>
#backups-selected {
    resize: none;
}
input:valid {
    border: 1px solid #678c43;
}
input:invalid {
    border: 1px solid red;
}

div.scroll-box {
    height: 400px;
    overflow-y: auto;
    padding: 3px;
    border: 1px solid black;
}

ul {
    list-style-type: square;
}

div > ul > li {
    border-bottom: 1px solid #ddd;
    margin: 2px 5px 2px 2px;
}

div > ul > li::marker {
    color: blue;
}

a {
    color: black;
    text-decoration: none;
    font-weight: bolder;
}

a:hover {
    text-decoration: underline;
}

label.small {
    font-size: 0.8em;
}

</style>