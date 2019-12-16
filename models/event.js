const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const eventSchema = new Schema({
	title: {
		type: String,
		required: true,
		default: "Default Titile",
		createIndexes: true
	},
	description: {
		type: String,
		required: true,
		default: "Default Description"
	},
	price: {
		type: Number,
		required: true,
		default: 5.0
	},
	date: {
		type: Date,
		required: true,
		default: Date.now()
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}
});

const Event = mongoose.model("Event", eventSchema, "Events");

module.exports = Event;
