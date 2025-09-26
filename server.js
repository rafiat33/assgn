// const express = require('express')
// require('./config/database')
// const useRouter = require('./routes/userRouter')
// const Port = 6574;
// const app = express()

// app.use(express.json())

// app.listen(Port,()=>{
//     console.log(`server is running on ${Port}`)
// })

const express = require('express');
require('./config/database');
const useRouter = require('./routes/userRouter');

const Port = 6574;
const app = express();


app.use(express.json());

// ✅ Mount your routes here
app.use(useRouter);

app.listen(Port, () => {
    console.log(`server is running on ${Port}`);
});
