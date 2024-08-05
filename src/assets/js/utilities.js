/**
 * Gibt die (nicht symmetrische) Differenzmenge von iterableA zu IterableB zurück
 *
 * @param iterableA {Array} Array aus dem die Differenz zu B gebildet wird
 * @param iterableB {Array} Iterable B
 * @returns {Set<any>} die Differenz von A zu B
 */
export function difference(iterableA, iterableB) {
    const _difference = new Set(iterableA);
    for (const elem of iterableB) {
        if (_difference.has(elem)) {
            _difference.delete(elem);
        }
    }
    return _difference;
}

/**
 * Prüft ob 2 Arrays gleich sind, d.h.:
 *      - beide Parameter müssen dem Datentyp Array entsprechen
 *      - beide Arrays müssen die gleiche Länge haben
 *      - alle Werte an derselben Position x müssen identisch sein (Überprüfung mit strikter Gleichheit (===))
 *
 * Einschränkungen: Die Elemente der Arrays müssen primitive Datentypen sein. Die Überprüfung liefert keine
 * korrekten Ergebnisse, wenn die Arrays Objekte enthalten oder mehr-dimensionale Arrays sind
 *
 * String - Werte werden case-insensitive verglichen
 *
 * @param a {Array}: Vergleichswert - sollte ein Array sein
 * @param b {Array}: Vergleichswert - sollte ein Array sein
 * @returns {false|*} true, wenn die übergebenen Arrays gleich sind, ansonsten false
 */
export function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => {
            let val2 = b[index]
            if (typeof val === "string" && typeof val2 === "string") {
                return val.toLowerCase() === val2.toLowerCase();
            }
            return val === val2;
        });
}

/**
 * Überprüft, ob 2 Objekte gleich sind
 *
 * Einschränkungen: Die Vergleichs-Objekte können Arrays und in beliebiger Tiefe verschachtelte Objekte enthalten.
 * Arrays können jedoch nur primitive Datentypen enthalten (siehe arrayEquals)
 * Der Datentyp 'Function' wird beim Vergleich nicht berücksichtigt.
 *
 * String - Werte werden case-insensitive verglichen
 *
 * @param a {Object}: Vergleichs-Objekt
 * @param b {Object}: Vergleichs-Objekt
 * @returns {*|boolean} true, wenn beide übergebenen Objekte gleich sind, ansonsten false
 */
export function objectEquals(a, b) {
    let isEqual;
    const objAKeys = Object.keys(a).sort();
    const objBKeys = Object.keys(b).sort();

    if (objAKeys.length !== objBKeys.length) {
        return false;
    }

    for (let [idx, prop] of objAKeys.entries()) {
        if (prop !== objBKeys[idx]) {
            return false;
        }
        let val1 = a[prop];
        let val2 = b[prop];
        if (Array.isArray(val1)) {
            isEqual = arrayEquals(val1, val2);
            if (!isEqual) return false;
        } else if (typeof val1 === "object") {
            isEqual = objectEquals(val1, val2);
            if (!isEqual) return false;
        } else {
            if (typeof val1 === "string" && typeof val2 === "string") {
                isEqual = val1.toLowerCase() === val2.toLowerCase();
            } else {
                isEqual = val1 === val2;
            }
            if (!isEqual) return false;
        }
    }
    return isEqual;
}

export function getAllBackupIds(employeeList) {
    let idSet = new Set();
    for (let employee of employeeList) {
        if (employee.backups && employee.backups.length > 0) {
            employee.backups.forEach(item => idSet.add(item));
        }
    }
    return Array.of(...idSet)
}

/**
 * Prüft, ob zwei Mitarbeiter-Listen gleich sind.
 *
 * @param loadedEmployees {Array}: die bestehende, über das Netzwerk vom Server geladene Angestellten-Liste
 * @param processedEmployees {Array}: die (eventuell) durch die App modifizierte Angestellten-Liste
 * @returns {boolean} true: wenn beide Listen gleich sind, false falls Änderungen vorgenommen wurden und die beiden
 *                    Listen nicht gleich sind.
 */
export function employeeConfigEquals(loadedEmployees, processedEmployees) {
    if (loadedEmployees.length !== processedEmployees.length) return false;

    const sortFunc = (empA, empB) => {
        const idOrderA = parseInt(empA.id.split("-")[1]);
        const idOrderB = parseInt(empB.id.split("-")[1]);
        return idOrderA - idOrderB;
    }

    const sameOrder = (idsA, idsB) => {
        const joinedA = idsA.join('');
        const joinedB = idsB.join('');
        return joinedA === joinedB;
    }

    // Die Reihenfolge der Auflistung der einzelnen Mitarbeiter kann vom Benutzer geändert werden. Die
    // Reihenfolge, in welcher die Mitarbeiter in shiftplan.json oder shiftplan.xml aufgeführt sind, spiegelt
    // sich dann im erstellten Schichtplan.
    const isSameOrder =
        sameOrder(loadedEmployees.map(emp => emp.id), processedEmployees.map(emp => emp.id));
    if (!isSameOrder) return false;

    const sortedA = loadedEmployees.toSorted(sortFunc);
    const sortedB = processedEmployees.toSorted(sortFunc);

    for (let i= 0; i < sortedA.length; i++) {
        let empA = sortedA[i];
        let empB = sortedB[i]; // sicherer Zugriff, da beide Arrays gleich lang (s.o.)
        if (empA.id !== empB.id) return false;

        let isEqual = objectEquals(empA, empB)
        if (!isEqual) return false;
    }
    return true;
}

/**
 * Ermittelt die ID für einen neuen Mitarbeiter
 *
 * Die Mitarbeiter-IDs werden, ab 1 beginnend, fortlaufend für jeden weiteren Mitarbeiter hochgezählt und mit dem
 * Prefix "ID-" in einen String konvertiert. Das gültige Format einer Mitarbeiter-ID lautet daher ID-1, ID-N
 *
 * @param employees {Array}: Liste der bereits existierenden Mitarbeiter
 * @returns {string} die ID für einen neu anzulegenden Mitarbeiter
 */
export function getNextId(employees) {
    if (employees.length === 0) {
        return "ID-1";
    }
    let idList = employees.map(employee => employee.id);
    let idNumbers = idList.map(idStr => parseInt(idStr.split("-")[1])).toSorted();
    let highestNo = idNumbers[idNumbers.length -1] +1;
    return "ID-" + highestNo;
}

/**
 * Entfernt den gelöschten MA aus den Backup-Listen der verbleibenden Mitarbeiter
 *
 * @param deletedEmployee {Object}: der gelöschte Mitarbeiter
 * @param employeeList {Array}: Liste der verbleibenden Mitarbeiter (der gelöschte MA sollte vor Übergabe bereits
 *                              aus der Liste entfernt worden sein)
 * @returns {Array}: die Mitarbeiter-Liste mit den aktualisierten Backup-Listen
 */
export function syncBackupsOnDeletion(deletedEmployee, employeeList) {
    const staleEmployeeId = deletedEmployee.id;
    for (const employee of employeeList) {
        employee.backups = employee.backups.filter(backup => backup !== staleEmployeeId);
    }
    return employeeList;
}

/**
 * Stellt symmetrische Backup-Beziehungen her, indem den Backups des neu kreierten MA's die ID dieses
 * Mitarbeiters hinzugefügt wird. Somit gilt:
 *  MA-neu → Backup MA-B
 *  MA-B → Backup MA-neu
 *
 * @param addedEmployee {Object}: der neu erstellte oder aktualisierte Mitarbeiter
 * @param employeeList {Array}: Liste der bereits existierenden Mitarbeiter
 * @returns {Array} die Mitarbeiter-Liste mit den aktualisierten Backup-Listen
 */
export function syncBackupsOnCreation(addedEmployee, employeeList) {
    const newEmployeeId = addedEmployee.id;
    const backupsOfAddedEmployee = employeeList.filter(employee => addedEmployee.backups.includes(employee.id));
    backupsOfAddedEmployee.forEach(employeeInList => employeeInList.backups.push(newEmployeeId));
    return employeeList;
}

/**
 * Stellt symmetrische Backup-Beziehungen nach dem Update der Backup-Liste eines Mitarbeiters her.
 * Ein Update der Backup-Liste kann sowohl aus dem Hinzufügen neuer Backups als auch aus dem Entfernen von
 * Backups aus der Liste resultieren.
 *
 * @param updatedEmployeeId {string}: die ID des aktualisierten MA's
 * @param deleted {Array}: Liste der entfernten Backup-IDs
 * @param added {Array}: Liste der hinzugefügten Backup-Ids
 * @param employeeList {Array}: Liste aller Mitarbeiter
 */
export function syncBackupsOnUpdate(updatedEmployeeId, deleted, added, employeeList) {
    syncBackupOnUpdateDeletion(updatedEmployeeId, deleted, employeeList);
    syncBackupOnUpdateAddition(updatedEmployeeId, added, employeeList);
}

function syncBackupOnUpdateDeletion(updatedEmployeeId, deleted, employeeList) {
    for (const backupId of deleted) {
        const backupEmployee = employeeList.find(employee => employee.id === backupId);
        if (backupEmployee === undefined) continue;
        backupEmployee.backups = backupEmployee.backups.filter(bId => bId !== updatedEmployeeId);
    }
}

function syncBackupOnUpdateAddition(updatedEmployeeId, added, employeeList) {
    for (const backupId of added) {
        const backupEmployee = employeeList.find(employee => employee.id === backupId);
        if (backupEmployee === undefined) continue;
        if (!backupEmployee.backups.includes(updatedEmployeeId)) {
            backupEmployee.backups.push(updatedEmployeeId);
        }
    }
}