import {defineStore} from "pinia";
import {getData} from "@/assets/js/requests.js";

export const useEmployeesStore = defineStore("employees", {
    state: () => {
        return {
            employees: []
        }
    },
    actions: {
        addEmployee(employee) {
            this.employees.push(employee);
        },
        findEmployee(employeeId) {
            return this.employees.find(employee => employee.id === employeeId);
        },
        async loadEmployeeConfig() {
            const result = await getData("/create", "employees");
            if (result.errorMessage) {
                this.error = result.errorMessage;
            } else {
                this.employees = deepCopyOfEmployeeList(result);
            }
        }
    }
})

function deepCopyOfEmployeeList(employeeConfig) {
    if (employeeConfig === undefined || employeeConfig === null) {
        return [];
    } else if (employeeConfig.employeeList === undefined || employeeConfig.employeeList === null) {
        return [];
    } else if (!Array.isArray(employeeConfig.employeeList)) {
        return [];
    } else {
        return JSON.parse(JSON.stringify(employeeConfig.employeeList));
    }
}