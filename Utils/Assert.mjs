function AssertType(v, type, allowUndefined = false) {
    if (allowUndefined && v === undefined)
        return true;
    if (!(v instanceof type)) {
        throw new Error(`${(v?.constructor?.name ?? typeof v)} is not of type ${type.name ?? typeof type}`);
    }
    return true;
}

export {
    AssertType,
}