const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

const VILLAGERS_TABLE = process.env.VILLAGERS_TABLE;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/', function(req, res) {
    res.send('goodbye world')
});

// GET villager 
app.get('/villager/:villagerId', function (req, res) {
    const params = {
        TableName: VILLAGERS_TABLE,
        Key: {
            villagerId: req.params.villagerId,
        },
    }

    dynamoDB.get(params, (error, result) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Could not get villager'});
        }
        if (result.Item) {
            const { villagerId, name } = result.Item;
            res.json({ villagerId, name });
        } else {
            res.status(404).json({ error: "Villager not found"});
        }
    })
});

// CREATE villager
app.post('/villager', function (req, res) {
    const { villagerId, name } = req.body;
    if (typeof villagerId !== 'string') {
        res.status(400).json({ error: '"villagerId" must be a string'});
    } else if (typeof name !== 'string') {
        res.status(400).json({ error: '"name" must be a string' });
    }

    const params = {
        TableName: VILLAGERS_TABLE,
        Item: {
            villagerId: villagerId,
            name: name,
        },
    };

    dynamoDB.put(params, (error) => {
        if (error) {
            console.log(error);
            res.status(400).json({ error: 'Cound not create villager' });
        }
        res.json({ villagerId, name });
    });
})

module.exports.handler = serverless(app);
