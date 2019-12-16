const express = require("express");
const bodyParser = require("body-parser");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const PORT = 3000;

const app = express();

app.use(bodyParser.json());

app.use(
	"/graphql",
	graphqlHTTP({
		schema: buildSchema(`
    type RootQuery {
        events: [Event!]!
    }
    
    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    input UserInput {
        email: String!
        password: String!
    }

    type RootMutation {
        createEvent(eventInput: EventInput): Event
        createUser(userInput: UserInput): User
    }
    
    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type User {
        _id: ID!
        email: String!
        password: String
    }

    schema {
        query: RootQuery 
        mutation: RootMutation
    }`),
		rootValue: {
			events: () => {
				// Events is of Type Event with _id, title, description, price and date.
				return Event.find()
					.then(async events => {
						return events.map(async event => {
							return { ...event._doc, _id: event.id };
						});
					})
					.catch(async err => {
						console.log(`Find event error: ${err}`);
						throw err;
					});
			},
			createEvent: args => {
				// Takes in args from EventInput and pushes the object below into the
				// initialized events array.
				const event = new Event({
					title: args.eventInput.title,
					description: args.eventInput.description,
					price: +args.eventInput.price,
					date: new Date(args.eventInput.date),
					creator: "5df6c81f24b6fe79503d098c"
				});
				let createdEvent;
				return event
					.save()
					.then(async result => {
						createEvent = result._doc;
						return User.findById("5df6c81f24b6fe79503d098c");
						console.log(`Save Result: ${result}`);
						return { ...result._doc, _id: event.id };
					})
					.then(async user => {
						if (user) {
							throw new Error("User exists already");
						}
						user.createdEvents.push(event);
						return user.save();
					})
					.then(async result => {
						return { ...createdEvents };
					})
					.catch(async err => {
						console.log(`Save Error: ${err}`);
						throw err;
					});
			},
			createUser: args => {
				return User.findOne({ email: args.userInput.email })
					.then(async user => {
						if (user) {
							throw new Error("User exists already");
						}
						return bcrypt.hash(args.userInput.password, 12);
					})
					.then(async hashedPassword => {
						const user = new User({
							email: args.userInput.email,
							password: hashedPassword
						});
						return user.save();
					})
					.then(async result => {
						return { ...result._doc, password: null, _id: result.id };
					})
					.catch(async err => {
						console.log(`bcyrpt hash error: ${err}`);
						throw err;
					});
			}
		},
		graphiql: true
	})
);

mongoose
	.connect(
		`mongodb+srv://${process.env.MongoUser}:${process.env.MongoPassword}@reactgraphql-tyjbe.azure.mongodb.net/${process.env.MongoDB}?retryWrites=true&w=majority`,
		{ useNewUrlParser: true, useUnifiedTopology: true }
	)
	.then(async () => {
		console.log("MongoDB connected");
	})
	.then(async () => {
		app.listen(PORT, () => {
			console.log(`App is listening on http://localhost:${PORT}`);
		});
	})
	.catch(err => {
		console.log(`Error: ${err}`);
	});
