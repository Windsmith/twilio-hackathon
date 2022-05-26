const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv').config();

const twilio = require('twilio')(process.env.ACCOUNT_SID,process.env.AUTH_TOKEN)
const app = express();
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname + "/../", './index.html'));
})

const messageStates = {
    0: "",
    1: "Hi there! I'm *Stewie*, your friendly neighbourhood chatbot. Having car troubles?",
    2: "Before we begin, bring the car to a stop. *Make sure it is stationary*.\n\nPlease select the option that you're having trouble with: \n1. Overheating\n2. Engine misfire(unusual rhythm)\n3. Vibration\n4. Electronic trouble\n5. I don't know Stewie, connect me to a professional!",
    2.1: "Hmm, alright. I am searching my resources to find you a professional. In the meanwhile, I will help you run a basic analogy to provide you better help.\n\n Turn off the engine and let the car cool down for around *10-15 minutes*.\n\nLooking at the gauges, what are you having trouble with?\n1. Engine temperature\n2. Transmission temperature",
    2.11: "After you’ve allowed the car to cool down,\n1. pull up the *bonnet* cautiously \n2. check if the *engine coolant reservoir cap* is hot with your hand.\n\nHow is the temperature of the reservoir cap?\n1. Cool\n2. Warm\n3. Hot",
    2.111: "Let it cool down for another *10 mins* and recheck. \n\nHow is the temperature of the reservoir cap?\n1. Cool\n2. Warm\n3. Hot",
    2.112: "Good, we can work with that. Please try and undo the coolant cap. \n\nNOTE: If you feel *pressure under the cap*, please tighten it back and wait for another *5-10 minutes* before undoing the cap.\n\nSelect one of the two options: \n1. Proceed\n2. I don't know Stewie, I think I need professional help!",
    2.1121: "Is the coolant level low? \n1. Yes\n2. No",
    2.11211: "Fill it up with water until maximum and refill your coolant at the earliest. \nDo you need anymore help? \n1. Yes \n2. No"
}

const professionalNumbers = {
    1: "+971 123456789"
}

const users = {};

let message;//Also keeps track of chat state.

app.post('/stewie', (request, response) => {

    if (users[request.body.From] == null) 
    {
        users[request.body.From] = messageStates[0];
        message = messageStates[0]
    }
    else{
        message = users[request.body.From]
    }

    setTimeout(() => {
        users[request.body.From] = messageStates[0]
    }, 1000 * 60 * 5)

    response.type('xml');

    let body = request.body.Body.toLowerCase();

    if (message == messageStates[0]) 
    { 
        message = messageStates[1]
        users[request.body.From] = messageStates[1]
        response.send(
            `
            <Response>
                <Message>
                ${message}
                </Message>
            </Response>
            `
        )
    }
    else if (message == messageStates[1])
    {
        if (body.includes("yes") || body.includes("yeah") || body.includes("ye"))
        {
            message = messageStates[2]
            users[request.body.From] = messageStates[2]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
        else
        {
            message = messageStates[0]
            users[request.body.From] = messageStates[0]
            response.send(
                `
                <Response>
                    <Message>
                    Great. You are good to get back on the road! \n\nDrive safe!
                    </Message>
                </Response>
                `
            )
        }
        
    }
    else if (message == messageStates[2])
    {
        if (body.includes("1") || body.includes("overheating") || body.includes("over heating"))
        {
            message = messageStates[2.1]
            users[request.body.From] = messageStates[2.1]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
        else if(body.includes("5") || body.includes("connect me to a professional"))
        {
            message = messageStates[0]
            users[request.body.From] = messageStates[0]
            response.send(
                `
                <Response>
                    <Message>
                    Our professional mechanic will get in touch with you soon. \n Here's their number: ${professionalNumbers[1]}
                    </Message>
                </Response>
                `
            )
            twilio.calls.create({
                to: "",
                from: process.env.TWILIO_NUM,
                twiml: 
                `
                <Response>
                    <Say>We will connect you to an available mechanic</Say>
                </Response>
                `
            })
        }
        else
        {
            message = messageStates[2]
            users[request.body.From] = messageStates[2]
            response.send(
                `
                <Response>
                    <Message>
                    The bot is still under development. Check again later. \n
${message.substring(71)}
                    </Message>
                </Response>
                `
            )
        }
    }
    else if (message == messageStates[2.1])
    {
        if (body.includes("1") || body.includes("engine temperature") || body.includes("engine"))
        {
            message = messageStates[2.11]
            users[request.body.From] = messageStates[2.11]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
        else 
        {
            message = messageStates[2]
            users[request.body.From] = messageStates[2]
            response.send(
                `
                <Response>
                    <Message>
                    The bot is still under development. Check again later. \n
${message.substring(71)}
                    </Message>
                </Response>
                `
            )
        }
    }
    else if (message == messageStates[2.11] || message == messageStates[2.111])
    {
        if (body.includes("1") || body.includes("cool") || body.includes("2") || body.includes("warm"))
        {
            message = messageStates[2.112]
            users[request.body.From] = messageStates[2.112]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
        else if (body.includes("3") || body.includes("hot")) 
        {
            message = messageStates[2.111]
            users[request.body.From] = messageStates[2.111]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
    }
    else if (message == messageStates[2.112])
    {
        if (body.includes("1") || body.includes("proceed"))
        {
            message = messageStates[2.1121]
            users[request.body.From] = messageStates[2.1121]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
        else if (body.includes("2") || body.includes("get help"))
        {
            //professional contact
            message = messageStates[0]
            users[request.body.From] = messageStates[0]
            response.send(
                `
                <Response>
                    <Message>
                    Our professional mechanic will get in touch with you soon. \n Here's their number: ${professionalNumbers[1]}
                    </Message>
                </Response>
                `
            )
            twilio.calls.create({
                to: "",
                from: process.env.TWILIO_NUM,
                twiml: 
                `
                <Response>
                    <Say>We will connect you to an available mechanic</Say>
                </Response>
                `
            })
        }
    }
    else if (message == messageStates[2.1121])
    {
        if (body.includes("1") || body.includes("yes"))
        {
            message = messageStates[2.11211]
            users[request.body.From] = messageStates[2.11211]
            response.send(
                `
                <Response>
                    <Message>
                    ${message}
                    </Message>
                </Response>
                `
            )
        }
        else {
            message = messageStates[0]
            users[request.body.From] = messageStates[0]
            response.send(
                `
                <Response>
                    <Message>
                    Great. You are good to get back on the road! \n\nDrive safe!
                    </Message>
                </Response>
                `
            )
        }
    }
    else if (message == messageStates[2.11211])
    {
        if (body.includes("1") || body.includes("yes"))
        {
            // professional help
            message = messageStates[0]
            users[request.body.From] = messageStates[0]
            response.send(
                `
                <Response>
                    <Message>
                    Our professional mechanic will get in touch with you soon. \n Here's their number: ${professionalNumbers[1]}
                    </Message>
                </Response>
                `
            )
            twilio.calls.create({
                to: "",
                from: process.env.TWILIO_NUM,
                twiml: 
                `
                <Response>
                    <Say>We will connect you to an available mechanic</Say>
                </Response>
                `
            })

        }
        else 
        {
            message = messageStates[0]
            users[request.body.From] = messageStates[0]
            response.send(
                `
                <Response>
                    <Message>
                    Great. You are good to get back on the road! \n\nDrive Safe!
                    </Message>
                </Response>
                `
            )
        }
    }
    
})

app.listen(3000);