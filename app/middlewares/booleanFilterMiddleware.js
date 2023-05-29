const explodeQuery = ({content}) => ([
        {
            "content": {
                ...content,
                value: ["true"]
            },
            "op": "in"
        },
        {
            "content": {
                ...content,
                value: ["false"]
            },
            "op": "in"
        },
    ]
)


const handleContent = (content) => (content.map((contentElement) => {
        if (contentElement.content.constructor === Array) {
            contentElement = handleContent(contentElement.content)
        } else if (contentElement.content.constructor === Object && contentElement.op === 'all' && !!contentElement.content.value && contentElement.content.value.includes("true") && contentElement.content.value.includes("false")) {
            contentElement.content = explodeQuery(contentElement)
            contentElement.op = 'and'
        }
        return contentElement
    })
)

export default (req, res, next) => {
    const stringifiedBody = JSON.stringify(req.body)
    if (stringifiedBody.includes(JSON.stringify(["true", "false"])) || stringifiedBody.includes(JSON.stringify(["false", "true"]))) {
        handleContent(req.body.variables.sqon.content)
    }


    next()
}