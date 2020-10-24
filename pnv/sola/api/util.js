function Logger(text) {
    if (LoggerTag == "true"){
        console.log(text);
    }
}

export default Object.freeze({
    Logger
})
