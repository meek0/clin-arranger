export default (req, res, next) => {
    const stringifiedBody = JSON.stringify(req.body)
    if (stringifiedBody.includes(JSON.stringify(["true", "false"])) || stringifiedBody.includes(JSON.stringify(["false", "true"]))) {
        const {sqon} = req.body.variables
        console.log('should modify query', JSON.stringify(sqon))
        let indexToRemove
        for (let i = 0; i < sqon.content.length; i++) {
            const {content, op} = sqon.content[i]
            if (!!content && !!content.value && content.value.includes("true") && content.value.includes("false") && op === 'all') {
                indexToRemove = i
                sqon.content.push({content: {...content, value: ["true"]}, op: "in"})
                sqon.content.push({content: {...content, value: ["false"]}, op: "in"})
            }
        }
        sqon.content.splice(indexToRemove, 1)
        console.log('modified query', JSON.stringify(sqon))
        req.body.variables.sqon = sqon
    }


    next()
}