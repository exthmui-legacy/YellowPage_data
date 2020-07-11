const Joi = require("joi");

let paramSchema = Joi.object().keys({
    name: Joi.string().required(),
    avatar: Joi.string().uri({
        scheme: [
            "http",
            "https"
        ]
    }).allow(""),
    phone: Joi.array().items(
        Joi.object().keys({
            number: Joi.string().regex(/^[+0-9][0-9]+$/).required(),
            label: Joi.string().allow("").required()
        })
    ).allow({}).required(),
    address: Joi.array().items(
        Joi.object().keys({
                data: Joi.string().required(),
                label: Joi.string().allow("").required()
            }
        )
    ),
    website: Joi.array().items(
        Joi.object().keys({
                url: Joi.string().uri({
                    scheme: [
                        "http",
                        "https"
                    ]
                }).required(),
                label: Joi.string().allow("").required()
            }
        )
    )
})

const option = {
    allowUnknown: false
}

exports.validate = {
    validateData: (obj) => {
        return Joi.validate(obj, paramSchema, option)
    }
}