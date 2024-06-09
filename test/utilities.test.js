import {expect, test} from "@jest/globals";
import {
    arrayEquals,
    objectEquals,
    getNextId,
    syncBackupsOnDeletion,
    syncBackupsOnCreation,
    difference, syncBackupsOnUpdate, employeeConfigEquals
} from "../src/assets/js/utilities.js";

const objA = {
    propString: "blubber",
    propNum: 100,
    propArray: ["one", "two", "three"],
    propObject: {
        supPropString: "blabla",
        subPropNumber: 101,
        subPropArray: [1,2,3]
    }
}

const objB = {
    propNum: 100,
    propArray: ["one", "two", "three"],
    propString: "blubber",
    propObject: {
        subPropArray: [1,2,3],
        supPropString: "blabla",
        subPropNumber: 201
    }
}

const employees = [
    {
        id: "ID-1",
        name: "Hans",
        backups: ["ID-2", "ID-4", "ID-5"] // deleted: ID-3, added: ID-4, ID-5 // Vorher: ["ID-2", "ID-3"]
    },
    {
        id: "ID-3",
        name: "Franz",
        backups: ["ID-1", "ID-2"]
    },
    {
        id: "ID-2",
        name: "Otto",
        backups: ["ID-1", "ID-3", "ID-5"]
    },
    {
        id: "ID-4",
        name: "Willi",
        backups: ["ID-2", "ID-5"]
    },
    {
        id: "ID-5",
        name: "Baldur",
        backups: ["ID-2", "ID-4"]
    }
]

test("test arrayEquals. should be true", () => {
    expect(arrayEquals(["One", "Two", "Three"], ["ONE", "TWO", "THREE"])).toBeTruthy();
});

test("test arrayEquals. should be false", () => {
    /*
    Getestet mit:
        - Arrays unterschiedlicher Länge
        - Arrays mit gleicher Länge, aber unterschiedlichen String-Werten
        - 1 Array, 1 String (falscher datentyp)
     */
    expect(arrayEquals(["One", "Two", "Three"], "One")).toBeFalsy();
});

test("tests equality of two objects. should be equal", () => {
    // Getestet mit einfachen Datentypen, Arrays und verschachtelten Objekten
    expect(objectEquals(objA, objB)).toBeTruthy();
});

test("are not equal due to different keys or number of keys / values, different arrays", () => {
    /*
    Getestet mit:
        - unterschiedlichen Arrays (Anzahl der Elemente, verschiedene Werte)
        - unterschiedlichen Properties
        - unterschiedlichen Werten (primitive Datentypen)
        - unterschiedlichen verschachtelten Objekten
     */
    expect(objectEquals(objA, objB)).toBeFalsy();
});

test("test getNextId", () => {
    expect(getNextId(employees)).toEqual("ID-5");
});

test("test getNextId init-test", () => {
    const employees = [];
    expect(getNextId(employees)).toEqual("ID-1");
});

test("test syncBackupsOnDeletion", () => {
    const spliced = employees.toSpliced(0,1);
    expect(syncBackupsOnDeletion(employees[0], spliced)).toHaveLength(3);
});

test("test syncBackupsOnCreation", () => {
    const newEmp = {
        id: "ID-5",
        name: "Holger",
        backups: ["ID-1", "ID-2"]
    };
    const employeeList = syncBackupsOnCreation(newEmp, employees);

    const firstBackup = employeeList.filter(emp => emp.id === "ID-2")[0];
    expect(firstBackup.backups).toContain("ID-5");

    const fourthBackup = employeeList.filter(emp => emp.id === "ID-4")[0];
    expect(fourthBackup.backups).not.toContain("ID-5");
});

test("find out which added, which deleted", () => {
    const oldB = ["ID-1", "ID-2", "ID-3", "ID-5", "ID-6"];
    const newB = ["ID-1", "ID-2", "ID-4", "ID-7"];

    const deleted = difference(oldB, newB);
    expect(deleted.has("ID-3")).toBeTruthy();
    expect(deleted.has("ID-5")).toBeTruthy();
    expect(deleted.has("ID-6")).toBeTruthy();

    const added = difference(newB, oldB);
    expect(added.has("ID-4")).toBeTruthy();
    expect(added.has("ID-7")).toBeTruthy();
});

test("syncBackupsOnUpdate", () => {
    const empId = "ID-1";
    const deleted = ["ID-3"];
    const added = ["ID-4", "ID-5"];
    syncBackupsOnUpdate(empId, deleted, added, employees);
    expect(employees[1].backups).not.toContain(empId);
    expect(employees[3].backups).toContain(empId);
    expect(employees[4].backups).toContain(empId);
});

test("test employeeConfigEquals", () => {
    let employeesCopy = JSON.parse(JSON.stringify(employees));
    let resTruthy = employeeConfigEquals(employees, employeesCopy);
    expect(resTruthy).toBeTruthy();

    //employeesCopy[0].name = "Fritz";
    //employeesCopy[1].backups.push("ID-5");
    //employeesCopy.splice(employeesCopy.length -1, 1);
    employeesCopy.push({id: "ID-7", name: "Kevin", backups: ["ID-1", "ID-3"]});
    let res = employeeConfigEquals(employees, employeesCopy);
    expect(res).toBeFalsy();
});