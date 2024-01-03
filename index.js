const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const corsOptions = {
	origin: '*',
	credentials: true,
	optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ytasiev.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		await client.connect();

		const contactsCollection = client
			.db('neutron-ltd')
			.collection('contacts');
		const favoriteContactsCollection = client
			.db('neutron-ltd')
			.collection('favorites');

		app.get('/contacts', async (req, res) => {
			const result = await contactsCollection.find().toArray();
			res.send(result);
		});

		app.post('/contacts', async (req, res) => {
			const addedContacts = req.body;
			const result = await contactsCollection.insertOne(addedContacts);
			res.send(result);
		});

		app.post('/favorites/:id', async (req, res) => {
			const addedContacts = req.body;
			const result = await favoriteContactsCollection.insertOne(
				addedContacts
			);
			res.send(result);
		});
		app.get('/favorites', async (req, res) => {
			const result = await favoriteContactsCollection.find().toArray();
			res.send(result);
		});

		app.put('/contacts/:id', async (req, res) => {
			const id = req.params.id;
			console.log(id);
			const contacts = req.body;
			const filter = { _id: new ObjectId(id) };
			options = { upsert: true };
			const updatedDoc = {
				$set: {
					name: contacts.name,
					email: contacts.email,
					phone: contacts.phone,
					address: contacts.address,
					image: contacts.image,
				},
			};
			console.log(updatedDoc);
			const result = await contactsCollection.updateOne(
				filter,
				updatedDoc,
				options
			);
			res.send(result);
		});

		app.delete('/contacts/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await contactsCollection.deleteOne(query);
			res.send(result);
		});

		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Neutron LTD is running');
});

app.listen(port, () => {
	console.log(`Neutron LTD server is running on port ${port}`);
});
