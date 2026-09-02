type TestProgress = {
    overall: number,
    passed: number,
    failed: number,
    classIdentifier: string,
    methodIdentifier: string,
    children: TestProgress[]
}
