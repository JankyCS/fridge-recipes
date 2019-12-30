var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema
(
    {
        firstname: { type: String, required: true },
        lastname: { type: String, required: false },
        username: { type: String, required: true },
        password: { type: String, required: true },
        fridge:[{type:String}]
    }
);

module.exports=mongoose.model("User",UserSchema);